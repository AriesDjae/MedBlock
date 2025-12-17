package services

import (
	"log"
	"time"

	"be/models"
	"be/utils"
)

func CreateMedicalRecord(record models.MedicalRecord) (string, error) {
	record.Timestamp = time.Now().Unix()

	rawData := record.PatientAddress +
		record.DoctorAddress +
		record.Diagnosis +
		record.Treatment

	hash := utils.HashMedicalData(rawData)

	// TODO:
	// - Call smart contract
	// - Store hash on blockchain

	log.Println("📦 Medical record hash:", hash)
	return hash, nil
}
