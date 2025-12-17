# 🏥 MedBlock
## Blockchain-Based Medical Record System

MedBlock adalah sistem pencatatan rekam medis berbasis blockchain yang dirancang untuk menjaga keamanan, integritas, dan transparansi data kesehatan.  
Aplikasi ini menghubungkan dokter dan pasien melalui smart contract sehingga data medis tidak dapat dimanipulasi dan mudah ditelusuri.

---

## 🚀 Teknologi yang Digunakan

### 🔗 Blockchain
- Solidity – Smart Contract
- Ethereum / Sepolia Testnet
- Hardhat – Development & testing smart contract
- Ethers.js – Interaksi blockchain dari frontend

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

```bash
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
