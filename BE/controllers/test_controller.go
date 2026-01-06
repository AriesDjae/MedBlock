package controllers

import (
	"io"
	"net/http"

	"github.com/gin-gonic/gin"

	"be/services"
	"be/utils"
)

// TestPinataCredentials menguji apakah credentials Pinata valid
func TestPinataCredentials(c *gin.Context) {
	apiKey := utils.GetEnv("PINATA_API_KEY", utils.GetEnv("pinata_api_key", ""))
	secret := utils.GetEnv("PINATA_SECRET_API_KEY", utils.GetEnv("pinata_api_secret", ""))
	jwt := utils.GetEnv("PINATA_JWT", utils.GetEnv("pinata_jwt", ""))

	status := gin.H{
		"has_api_key": apiKey != "",
		"has_secret":  secret != "",
		"has_jwt":     jwt != "",
		"env_file":    ".env",
	}

	// Test upload dengan file kecil
	testData := []byte("test file content for Pinata")
	hash, err := services.EncryptAndUpload(testData, "test.txt")
	
	if err != nil {
		status["test_upload"] = "FAILED"
		status["test_error"] = err.Error()
		c.JSON(http.StatusOK, status)
		return
	}

	status["test_upload"] = "SUCCESS"
	status["test_hash"] = hash
	c.JSON(http.StatusOK, status)
}

// TestIPFSUpload endpoint untuk test upload tanpa auth
func TestIPFSUpload(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(400, gin.H{
			"error":  "file required: " + err.Error(),
			"detail": "Send file as multipart/form-data with field name 'file'",
		})
		return
	}

	f, err := file.Open()
	if err != nil {
		c.JSON(500, gin.H{"error": "failed to open file: " + err.Error()})
		return
	}
	defer f.Close()

	data, err := io.ReadAll(f)
	if err != nil {
		c.JSON(500, gin.H{"error": "failed to read file: " + err.Error()})
		return
	}

	hash, err := services.EncryptAndUpload(data, file.Filename)
	if err != nil {
		c.JSON(500, gin.H{
			"error":   err.Error(),
			"message": "Upload to Pinata failed",
		})
		return
	}

	c.JSON(200, gin.H{
		"success": true,
		"ipfsHash": hash,
		"filename": file.Filename,
		"size":     len(data),
	})
}
