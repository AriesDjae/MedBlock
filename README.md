# 🏥 MedBlock
## Blockchain-Based Medical Record System

MedBlock adalah sistem pencatatan rekam medis berbasis blockchain yang dirancang untuk menjaga keamanan, integritas, dan transparansi data kesehatan.  
Aplikasi ini menghubungkan dokter dan pasien melalui smart contract sehingga data medis tidak dapat dimanipulasi dan mudah ditelusuri.

---

## 🚀 Teknologi yang Digunakan

### 🔗 Blockchain
- Solidity – Smart Contract
- Ethereum / Sepolia Testnet
- Hardhat
- Ethers.js

### 🖥 Backend (BE)
- Golang
- Gin Framework
- REST API
- PostgreSQL / MySQL
- JWT Authentication

### 🌐 Frontend (FE)
- JavaScript
- React.js / Next.js
- Web3.js / Ethers.js
- Tailwind CSS

---

## 📁 Struktur Folder Project

```text
MedBlock/
├── backend/
│   ├── cmd/
│   │   └── main.go
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── go.mod
│
├── contracts/
│   ├── MedicalRecord.sol
│   └── deploy.js
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── hardhat.config.js
├── .env
└── README.md
```
## ✨ Fitur Utama
### 👨‍⚕️ Dokter
- Menambahkan rekam medis pasien
- Update data medis
- Melihat histori rekam medis
- Data tersimpan permanen di blockchain

### 🧑‍🦱 Pasien
- Melihat data medis pribadi
- Kontrol akses data
- Transparansi histori perubahan

## 🔐 Keamanan
- Data hash tersimpan di blockchain
- Hak akses berbasis wallet
- Tidak bisa diubah tanpa izin

🧠 Arsitektur Sistem
```text
Frontend (React / JS)
        |
        | REST API + Web3
        |
Backend (Golang - Gin)
        |
        | Smart Contract Call
        |
Blockchain (Ethereum)
```
## ⚙️ Cara Menjalankan Project
### Clone Repository
```bash
Copy code
git clone https://github.com/username/MedBlock.git
cd MedBlock
```
### Smart Contract
```bash
Copy code
npm install
npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy.js --network sepolia
```
### Backend (Golang)
```bash
Copy code
cd backend
go mod tidy
go run cmd/main.go
```
### Frontend
```bash
Copy code
cd frontend
npm install
npm run dev
```
## 📌 Catatan Penting
- Blockchain tidak menyimpan data mentah
- Blockchain hanya menyimpan hash / reference
- Data asli disimpan di database backend
- Smart contract sebagai ledger kepercayaan

## 🛣 Roadmap
- IPFS integration
- Role-based access control
- Audit smart contract
- Docker deployment
- CI/CD pipeline

👨‍💻 Author
1. AriesDjae
2. Tyasprabas
3. Andin
4. Aqim
