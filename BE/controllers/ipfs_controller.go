package controllers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"be/services"
	"be/utils"

	"github.com/gin-gonic/gin"
)

func UploadToIPFS(c *gin.Context) {
	// FORCE LOGGING - Pastikan ini muncul di console
	fmt.Println("========================================")
	fmt.Println("IPFS UPLOAD ENDPOINT CALLED!")
	fmt.Println("========================================")
	
	utils.Logger.Info("========================================")
	utils.Logger.Info("IPFS UPLOAD ENDPOINT CALLED!")
	utils.Logger.Info("========================================")
	
	// Log headers untuk debugging
	utils.Logger.WithFields(map[string]interface{}{
		"content-type": c.GetHeader("Content-Type"),
		"x-message":    c.GetHeader("X-Message"),
		"x-signature":  c.GetHeader("X-Signature") != "",
		"method":       c.Request.Method,
		"path":         c.Request.URL.Path,
	}).Info("ipfs: request headers")

	fmt.Printf("Content-Type: %s\n", c.GetHeader("Content-Type"))
	
	wallet := c.GetString("wallet_address")
	fmt.Printf("Wallet: %s\n", wallet)
	utils.Logger.WithField("wallet", wallet).Info("ipfs: upload request received from wallet")

	file, err := c.FormFile("file")
	if err != nil {
		utils.Logger.WithFields(map[string]interface{}{
			"error":        err.Error(),
			"wallet":       wallet,
			"content-type": c.GetHeader("Content-Type"),
		}).Error("ipfs: upload missing file - FormFile error")
		c.JSON(400, gin.H{
			"error":     "file required: " + err.Error(),
			"message":   "Make sure to send file as multipart/form-data",
			"content_type": c.GetHeader("Content-Type"),
		})
		return
	}

	utils.Logger.WithField("filename", file.Filename).Info("ipfs: file received from form")

	f, err := file.Open()
	if err != nil {
		utils.Logger.WithFields(map[string]interface{}{
			"error":    err.Error(),
			"filename": file.Filename,
		}).Error("ipfs: failed to open file")
		c.JSON(500, gin.H{"error": "failed to open file: " + err.Error()})
		return
	}
	defer f.Close()

	data, err := io.ReadAll(f)
	if err != nil {
		utils.Logger.WithFields(map[string]interface{}{
			"error":    err.Error(),
			"filename": file.Filename,
		}).Error("ipfs: failed to read file")
		c.JSON(500, gin.H{"error": "failed to read file: " + err.Error()})
		return
	}

	fmt.Printf("File read: %s, size: %d bytes\n", file.Filename, len(data))
	utils.Logger.WithFields(map[string]interface{}{
		"filename": file.Filename,
		"size":     len(data),
		"wallet":   wallet,
	}).Info("ipfs: file read successfully, starting encryption and upload")

	fmt.Println("Starting encryption and upload to Pinata...")
	cipherData, err := services.EncryptAndUpload(data, file.Filename)
	if err != nil {
		fmt.Printf("ERROR: Upload failed - %s\n", err.Error())
		utils.Logger.WithFields(map[string]interface{}{
			"error":    err.Error(),
			"wallet":   wallet,
			"filename": file.Filename,
			"size":     len(data),
		}).Error("ipfs: encrypt/upload failed")
		c.JSON(500, gin.H{
			"error":   "failed to upload to IPFS: " + err.Error(),
			"message": "Check Pinata credentials and network connection",
		})
		return
	}

	fmt.Printf("SUCCESS! IPFS Hash: %s\n", cipherData)
	fmt.Println("========================================")
	utils.Logger.WithFields(map[string]interface{}{
		"ipfsHash": cipherData,
		"wallet":   wallet,
		"filename": file.Filename,
	}).Info("ipfs: file uploaded successfully to Pinata")

	c.JSON(200, gin.H{
		"ipfsHash": cipherData,
		"message":  "File uploaded successfully to IPFS Pinata",
		"filename": file.Filename,
	})
}

// UploadJSONToIPFS uploads JSON data directly to IPFS via Pinata
func UploadJSONToIPFS(c *gin.Context) {
	utils.Logger.Info("========================================")
	utils.Logger.Info("JSON TO IPFS UPLOAD ENDPOINT CALLED!")
	utils.Logger.Info("========================================")

	wallet := c.GetString("wallet_address")
	utils.Logger.WithField("wallet", wallet).Info("ipfs: json upload request received from wallet")

	var jsonData map[string]interface{}
	if err := c.ShouldBindJSON(&jsonData); err != nil {
		utils.Logger.WithField("error", err.Error()).Error("ipfs: json upload failed to bind JSON")
		c.JSON(400, gin.H{
			"error": "Invalid JSON data: " + err.Error(),
		})
		return
	}

	// Convert to JSON bytes
	jsonBytes, err := json.Marshal(jsonData)
	if err != nil {
		utils.Logger.WithField("error", err.Error()).Error("ipfs: json marshal failed")
		c.JSON(500, gin.H{"error": "Failed to marshal JSON: " + err.Error()})
		return
	}

	filename := "medical_record.json"
	utils.Logger.WithFields(map[string]interface{}{
		"filename": filename,
		"size":     len(jsonBytes),
		"wallet":   wallet,
	}).Info("ipfs: json data prepared, starting encryption and upload")

	fmt.Println("Starting encryption and upload to Pinata...")
	cipherData, err := services.EncryptAndUpload(jsonBytes, filename)
	if err != nil {
		fmt.Printf("ERROR: JSON Upload failed - %s\n", err.Error())
		utils.Logger.WithFields(map[string]interface{}{
			"error":  err.Error(),
			"wallet": wallet,
		}).Error("ipfs: json encrypt/upload failed")
		c.JSON(500, gin.H{
			"error":   "failed to upload JSON to IPFS: " + err.Error(),
			"message": "Check Pinata credentials and network connection",
		})
		return
	}

	fmt.Printf("SUCCESS! IPFS Hash: %s\n", cipherData)
	fmt.Println("========================================")
	utils.Logger.WithFields(map[string]interface{}{
		"ipfsHash": cipherData,
		"wallet":   wallet,
	}).Info("ipfs: json uploaded successfully to Pinata")

	c.JSON(200, gin.H{
		"ipfsHash": cipherData,
		"message":  "JSON data uploaded successfully to IPFS Pinata",
		"size":     len(jsonBytes),
	})
}

func GetFromIPFS(c *gin.Context) {
	hash := c.Param("hash")
	utils.Logger.WithField("hash", hash).Info("ipfs: get request")

	data, err := services.FetchFromIPFS(hash)
	if err != nil {
		utils.Logger.WithField("error", err).Error("ipfs: fetch failed")
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.Data(http.StatusOK, "application/octet-stream", data)
}
