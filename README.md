🏥 MedBlock
Blockchain-Based Medical Record System

MedBlock adalah sistem pencatatan rekam medis berbasis blockchain yang dirancang untuk menjaga keamanan, integritas, dan transparansi data kesehatan.
Aplikasi ini menghubungkan dokter dan pasien melalui smart contract sehingga data medis tidak dapat dimanipulasi dan mudah ditelusuri.

🚀 Teknologi yang Digunakan
🔗 Blockchain

Solidity – Smart Contract

Ethereum / Sepolia Testnet

Hardhat – Development & testing smart contract

Ethers.js – Interaksi blockchain dari frontend

🖥 Backend (BE)

Golang

Gin Framework

REST API

PostgreSQL / MySQL

JWT Authentication

🌐 Frontend (FE)

JavaScript

React.js / Next.js

Web3.js / Ethers.js

Tailwind CSS

📁 Struktur Folder Project
MedBlock/
│
├── backend/                 # Backend Golang
│   ├── cmd/
│   │   └── main.go
│   ├── config/
│   │   └── config.go
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── go.mod
│
├── contracts/               # Smart Contract Solidity
│   ├── MedicalRecord.sol
│   └── deploy.js
│
├── frontend/                # Frontend JavaScript
│   ├── src/
│   ├── public/
│   └── package.json
│
├── hardhat.config.js
├── README.md
└── .env

✨ Fitur Utama
👨‍⚕️ Dokter

Menambahkan rekam medis pasien

Update data medis

Melihat histori rekam medis

Data tersimpan permanen di blockchain

🧑‍🦱 Pasien

Melihat data medis pribadi

Kontrol akses data

Transparansi histori perubahan

🔐 Keamanan

Data hash tersimpan di blockchain

Hak akses berbasis wallet

Tidak bisa diubah tanpa izin

🧠 Arsitektur Sistem
Frontend (React / JS)
        |
        | REST API + Web3
        |
Backend (Golang - Gin)
        |
        | Smart Contract Call
        |
Blockchain (Ethereum)

⚙️ Cara Menjalankan Project
1️⃣ Clone Repository
git clone https://github.com/username/MedBlock.git
cd MedBlock

2️⃣ Setup Smart Contract
npm install
npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy.js --network sepolia

3️⃣ Setup Backend (Golang)
cd backend
go mod tidy
go run cmd/main.go

4️⃣ Setup Frontend
cd frontend
npm install
npm run dev

📌 Catatan Penting

Blockchain tidak menyimpan data mentah, hanya hash / reference

Data asli disimpan di database backend

Smart contract berfungsi sebagai ledger kepercayaan

🛣 Roadmap

 IPFS integration

 Role-based access control

 Audit smart contract

 Docker deployment

 CI/CD pipeline

👨‍💻 Author

AriesDjae
Blockchain & Backend Developer
