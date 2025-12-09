🩺 MedBlock – Blockchain-Based Medical Record System

MedBlock adalah aplikasi manajemen rekam medis berbasis blockchain yang dirancang untuk memberikan keamanan, integritas, dan transparansi pada data kesehatan. Dengan antarmuka modern berbasis JavaScript dan backend yang kuat, MedBlock menghubungkan pasien dan dokter dalam sistem yang terdesentralisasi, efisien, dan aman.

Aplikasi ini memanfaatkan smart contract Solidity untuk memastikan bahwa setiap data medis tercatat secara permanen, tidak dapat dimodifikasi, dan dapat ditelusuri seperti eksplorasi blockchain pada Ethereum.

🚀 Fitur Utama
🏠 Landing Page

Menampilkan overview aplikasi dengan tampilan modern serta pengenalan terhadap konsep MedBlock dan manfaatnya.

🩺 Pencatatan Data Pasien (Dokter)

Dokter dapat:

Mencatat data medis pasien

Memperbarui informasi kesehatan

Mengirim data ke blockchain melalui smart contract

Melihat riwayat medis pasien secara aman dan terstruktur

🔗 Explorer Blockchain Data Medis

Halaman mirip blockchain explorer seperti Etherscan untuk:

Menelusuri transaksi

Melihat hash dari data medis

Mengamati blok dan aktivitas on-chain

👥 Dua Jenis Pengguna

Pasien: melihat rekam medis yang aman dan tervalidasi

Dokter: menginput, mengelola, dan memperbarui rekam medis

🧩 Teknologi yang Digunakan
Frontend

React.js / Next.js / Vue.js

TailwindCSS / Material UI

Web3Modal & MetaMask Integration

Backend

Node.js (Express / NestJS)

Ethers.js

MongoDB / PostgreSQL (opsional)

Blockchain

Solidity Smart Contract

Hardhat / Foundry

Ethereum Testnet (Sepolia / Polygon Mumbai)

🏗️ Struktur Proyek
medblock/
│
├── frontend/                # UI Modern (React/Next.js)
│   ├── pages/
│   ├── components/
│   └── styles/
│
├── backend/                 # Node.js API Server
│   ├── src/
│   └── routes/
│
├── contracts/               # Smart Contract Solidity
│   ├── MedBlock.sol
│   └── scripts/
│
├── test/                    # Smart Contract Tests
│
└── README.md

📦 Instalasi & Menjalankan Project
1. Clone Repository
git clone https://github.com/username/medblock.git
cd medblock

2. Install Dependencies

Frontend

cd frontend
npm install


Backend

cd backend
npm install


Contracts

cd contracts
npm install

3. Menjalankan Local Blockchain (Hardhat)
npx hardhat node

4. Deploy Smart Contract
npx hardhat run scripts/deploy.js --network localhost

5. Menjalankan Backend
npm run dev

6. Menjalankan Frontend
npm run dev

🔒 Keamanan

Data medis tidak disimpan secara mentah, hanya hash-nya yang disimpan on-chain.

Validasi pengguna menggunakan wallet signature authentication.

Smart contract memastikan data bersifat immutable (tidak bisa diubah/hapus).

🗺️ Roadmap

 Menambahkan izin akses granular (doctor authorization)

 Menambahkan enkripsi end-to-end

 Integrasi IPFS untuk penyimpanan file medis

 Pengembangan aplikasi mobile (React Native)
