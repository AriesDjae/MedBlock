package models

// User adalah placeholder model untuk pengembangan selanjutnya.
// Tambahkan field sesuai kebutuhan bisnis (misal: Name, Wallet, Role, dll).
type User struct {
	ID     string `json:"id" firestore:"id"`
	Wallet string `json:"wallet" firestore:"wallet"`
	Role   string `json:"role" firestore:"role"`
	Name   string `json:"name" firestore:"name"`
	CreatedAt interface{} `json:"created_at" firestore:"created_at"`
}
