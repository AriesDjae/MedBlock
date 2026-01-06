package services

import (
	"crypto/sha256"

	"be/utils"
)

func EncryptAndUpload(data []byte, filename string) (string, error) {
	// Use ENCRYPTION_KEY env if provided, otherwise derive a 32-byte key from a default secret
	keyStr := utils.GetEnv("ENCRYPTION_KEY", "")
	if keyStr == "" {
		keyStr = "medblock-default-encryption-key"
	}
	sum := sha256.Sum256([]byte(keyStr))
	key := sum[:]

	encrypted, err := utils.EncryptAES(data, key)
	if err != nil {
		return "", err
	}

	return UploadToPinata(filename, encrypted)
}
