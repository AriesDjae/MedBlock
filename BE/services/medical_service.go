package services

import (
	"context"
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

func CreateMedicalRecord(record models.MedicalRecord) (string, error) {
	// Deprecated: use SaveAndReturnHash which persists when possible
	return SaveAndReturnHash(record)
}

// SaveAndReturnHash stores the record in Firestore (if configured) and in-memory fallback.
func SaveAndReturnHash(record models.MedicalRecord) (string, error) {
	record.Timestamp = time.Now().Unix()

	rawData := record.PatientAddress + record.DoctorAddress + record.Diagnosis + record.Treatment
	hash := utils.HashMedicalData(rawData)

	// append to in-memory store
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
		})
		if err != nil {
			utils.Logger.WithField("error", err).Warn("failed to persist record to firestore; continuing with in-memory store")
		} else {
			utils.Logger.WithField("hash", hash).Info("persisted record to firestore")
		}
	} else {
		utils.Logger.WithField("hash", hash).Info("stored record in-memory (firestore not configured)")
	}

	return hash, nil
}

func GetAllMedicalRecords() []models.MedicalRecord {
	utils.Logger.WithField("count", len(inMemoryStore)).Info("GetAllMedicalRecords")
	return inMemoryStore
}
