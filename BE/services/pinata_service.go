package services

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"time"

	"be/utils"
)

func UploadToPinata(filename string, data []byte) (string, error) {
	utils.Logger.WithFields(map[string]interface{}{
		"filename": filename,
		"size":     len(data),
	}).Info("pinata: starting upload to Pinata")

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	part, err := writer.CreateFormFile("file", filename)
	if err != nil {
		utils.Logger.WithField("error", err).Error("pinata: failed create form file")
		return "", errors.New("pinata: failed to create form file: " + err.Error())
	}

	bytesWritten, err := part.Write(data)
	if err != nil {
		utils.Logger.WithField("error", err).Error("pinata: failed write file part")
		return "", errors.New("pinata: failed to write file data: " + err.Error())
	}
	utils.Logger.WithField("bytes_written", bytesWritten).Info("pinata: file data written to multipart")

	if err := writer.Close(); err != nil {
		utils.Logger.WithField("error", err).Error("pinata: failed close multipart writer")
		return "", errors.New("pinata: failed to close multipart writer: " + err.Error())
	}

	req, err := http.NewRequest(
		"POST",
		"https://api.pinata.cloud/pinning/pinFileToIPFS",
		body,
	)
	if err != nil {
		utils.Logger.WithField("error", err).Error("pinata: failed to create request")
		return "", errors.New("pinata: failed to create HTTP request: " + err.Error())
	}

	contentType := writer.FormDataContentType()
	req.Header.Set("Content-Type", contentType)
	utils.Logger.WithField("content_type", contentType).Info("pinata: set content type")

	// Support both uppercase and lowercase env keys (some deployments use lowercase)
	apiKey := utils.GetEnv("PINATA_API_KEY", utils.GetEnv("pinata_api_key", ""))
	secret := utils.GetEnv("PINATA_SECRET_API_KEY", utils.GetEnv("pinata_api_secret", ""))
	jwt := utils.GetEnv("PINATA_JWT", utils.GetEnv("pinata_jwt", ""))

	utils.Logger.WithFields(map[string]interface{}{
		"has_api_key": apiKey != "",
		"has_secret":  secret != "",
		"has_jwt":     jwt != "",
	}).Info("pinata: checking credentials")

	// Prefer JWT if available (Authorization: Bearer <jwt>)
	if jwt != "" {
		req.Header.Set("Authorization", "Bearer "+jwt)
		utils.Logger.Info("pinata: using JWT authentication")
	} else {
		if apiKey == "" || secret == "" {
			utils.Logger.WithFields(map[string]interface{}{
				"apiKey": apiKey != "",
				"secret": secret != "",
			}).Error("pinata: missing API credentials")
			return "", errors.New("pinata credentials not configured - set PINATA_API_KEY and PINATA_SECRET_API_KEY or PINATA_JWT in .env")
		}
		req.Header.Set("pinata_api_key", apiKey)
		req.Header.Set("pinata_secret_api_key", secret)
		utils.Logger.Info("pinata: using API key authentication")
	}

	fmt.Printf("Pinata: Sending request - File: %s, Size: %d bytes\n", filename, len(data))
	utils.Logger.WithFields(map[string]interface{}{
		"filename":    filename,
		"data_size":   len(data),
		"body_size":   body.Len(),
		"url":         req.URL.String(),
	}).Info("pinata: sending pin request to Pinata API")

	client := &http.Client{Timeout: 60 * time.Second}
	fmt.Println("Pinata: Making HTTP request to Pinata API...")
	resp, err := client.Do(req)
	if err != nil {
		fmt.Printf("Pinata ERROR: HTTP request failed - %s\n", err.Error())
		utils.Logger.WithField("error", err).Error("pinata: HTTP request failed")
		return "", errors.New("pinata: HTTP request failed: " + err.Error())
	}
	defer resp.Body.Close()

	fmt.Printf("Pinata: Response status: %s\n", resp.Status)
	bodyBytes, readErr := io.ReadAll(resp.Body)
	if readErr != nil {
		fmt.Printf("Pinata WARN: Failed to read response body - %s\n", readErr.Error())
		utils.Logger.WithField("error", readErr).Warn("pinata: failed to read response body")
	}

	fmt.Printf("Pinata: Response body length: %d bytes\n", len(bodyBytes))
	utils.Logger.WithFields(map[string]interface{}{
		"status_code": resp.StatusCode,
		"body_size":   len(bodyBytes),
		"body":        string(bodyBytes),
	}).Info("pinata: received response from Pinata")

	// Check HTTP status code first
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		fmt.Printf("Pinata ERROR: Non-2xx response - Status: %d, Body: %s\n", resp.StatusCode, string(bodyBytes))
		utils.Logger.WithFields(map[string]interface{}{
			"status": resp.StatusCode,
			"body":   string(bodyBytes),
		}).Error("pinata: non-2xx response from Pinata API")
		return "", errors.New("pinata: API returned " + resp.Status + " - " + string(bodyBytes))
	}

	var res map[string]interface{}
	if err := json.Unmarshal(bodyBytes, &res); err != nil {
		fmt.Printf("Pinata ERROR: Failed to decode JSON - %s\n", err.Error())
		utils.Logger.WithFields(map[string]interface{}{
			"error":     err.Error(),
			"body":      string(bodyBytes),
		}).Error("pinata: failed to decode JSON response")
		return "", errors.New("pinata: failed to decode response: " + err.Error() + " - body: " + string(bodyBytes))
	}

	fmt.Printf("Pinata: Response parsed: %+v\n", res)
	utils.Logger.WithField("response", res).Info("pinata: parsed response")

	if h, ok := res["IpfsHash"].(string); ok && h != "" {
		fmt.Printf("Pinata SUCCESS! IPFS Hash: %s\n", h)
		utils.Logger.WithFields(map[string]interface{}{
			"ipfs_hash": h,
			"filename":  filename,
		}).Info("pinata: file pinned successfully")
		return h, nil
	}

	// Check for PinHash (alternative field name)
	if h, ok := res["PinHash"].(string); ok && h != "" {
		fmt.Printf("Pinata SUCCESS! IPFS Hash (PinHash): %s\n", h)
		utils.Logger.WithFields(map[string]interface{}{
			"ipfs_hash": h,
			"filename":  filename,
		}).Info("pinata: file pinned successfully (PinHash)")
		return h, nil
	}

	fmt.Printf("Pinata ERROR: No hash found in response: %+v\n", res)
	utils.Logger.WithField("response", res).Error("pinata: unexpected response - no hash found")
	return "", errors.New("pinata: missing IpfsHash/PinHash in response: " + string(bodyBytes))
}

func FetchFromIPFS(hash string) ([]byte, error) {
	utils.Logger.WithField("hash", hash).Info("ipfs: fetching from gateway")
	resp, err := http.Get("https://gateway.pinata.cloud/ipfs/" + hash)
	if err != nil {
		utils.Logger.WithField("error", err).Error("ipfs: get failed")
		return nil, err
	}
	defer resp.Body.Close()

	data, err := io.ReadAll(resp.Body)
	if err != nil {
		utils.Logger.WithField("error", err).Error("ipfs: read failed")
		return nil, err
	}

	utils.Logger.WithField("hash", hash).Info("ipfs: fetched data")
	return data, nil
}
