package services

import (
	"context"
	"encoding/json"
	"time"

	"be/config"
	"be/models"
	"be/utils"
)

// Simple in-memory store for development (fallback)
var inMemoryStore []models.MedicalRecord

func init() {
	inMemoryStore = make([]models.MedicalRecord, 0)
}

func CreateMedicalRecord(record models.MedicalRecord) (string, string, error) {
	// Deprecated: use SaveAndReturnHash which persists when possible
	return SaveAndReturnHash(record)
}

// SaveAndReturnHash stores the record in Firestore (if configured) and in-memory fallback.
func SaveAndReturnHash(record models.MedicalRecord) (string, string, error) {
	record.Timestamp = time.Now().Unix()

	rawData := record.PatientAddress + record.DoctorAddress + record.Diagnosis + record.Treatment
	hash := utils.HashMedicalData(rawData)

	// Pin the record to IPFS (encrypt then upload) and store returned hash
	var ipfsHash string
	if ipfsData, err := json.Marshal(record); err == nil {
		utils.Logger.WithField("hash", hash).Info("medical: pinning record to IPFS")
		if h, err := EncryptAndUpload(ipfsData, "medical_record.json"); err != nil {
			utils.Logger.WithField("error", err).Warn("medical: failed to pin record to Pinata")
		} else {
			ipfsHash = h
			record.IpfsHash = ipfsHash
			utils.Logger.WithField("ipfs", ipfsHash).Info("medical: record pinned")
		}
	} else {
		utils.Logger.WithField("error", err).Warn("medical: failed marshal record for pinning")
	}

	// append to in-memory store after ipfsHash is populated
	inMemoryStore = append(inMemoryStore, record)

	// persist to Firestore when available
	if config.FirestoreClient != nil {
		ctx := context.Background()
		_, _, err := config.FirestoreClient.Collection("rekam_medis").Add(ctx, map[string]interface{}{
			"patient_address": record.PatientAddress,
			"doctor_address":  record.DoctorAddress,
			"diagnosis":       record.Diagnosis,
			"treatment":       record.Treatment,
			"timestamp":       record.Timestamp,
			"hash":            hash,
			"ipfs_hash":       record.IpfsHash,
		})
		if err != nil {
			utils.Logger.WithField("error", err).Warn("failed to persist record to firestore; continuing with in-memory store")
		} else {
			utils.Logger.WithField("hash", hash).Info("persisted record to firestore")
		}
	} else {
		utils.Logger.WithField("hash", hash).Info("stored record in-memory (firestore not configured)")
	}

	return hash, ipfsHash, nil
}

func GetAllMedicalRecords() []models.MedicalRecord {
	utils.Logger.WithField("count", len(inMemoryStore)).Info("GetAllMedicalRecords")
	return inMemoryStore
}
