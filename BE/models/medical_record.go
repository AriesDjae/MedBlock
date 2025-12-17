package models

type MedicalRecord struct {
	PatientAddress string `json:"patient_address"`
	DoctorAddress  string `json:"doctor_address"`
	Diagnosis      string `json:"diagnosis"`
	Treatment      string `json:"treatment"`
	Timestamp      int64  `json:"timestamp"`
}
