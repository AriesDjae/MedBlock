MedBlock – Blockchain-Based Medical Record System

MedBlock adalah aplikasi manajemen data medis berbasis blockchain yang dirancang untuk menjaga keamanan, integritas, dan transparansi informasi kesehatan. Dengan desain antarmuka modern berbasis JavaScript serta backend yang kuat, MedBlock menghubungkan pasien dan dokter dalam ekosistem digital yang aman, efisien, dan terdesentralisasi.

Aplikasi ini memanfaatkan smart contract Solidity untuk memastikan setiap data medis tersimpan secara permanen, tidak dapat dimanipulasi, dan dapat ditelusuri seperti eksplorasi blockchain pada Ethereum.

🚀 Fitur Utama
🏠 Landing Page

Halaman berdesain modern sebagai pintu masuk ke platform, menjelaskan fungsi dan manfaat MedBlock dalam ekosistem kesehatan digital.

🩺 Pencatatan Data Pasien (Dokter)

Dokter dapat:

Mencatat data medis pasien

Memperbarui informasi kesehatan

Mengirimkan data ke blockchain melalui smart contract

Melihat riwayat medis pasien dalam format yang aman & terstruktur

🔗 Explorer Blockchain Data Medis

Halaman mirip blockchain explorer (seperti Etherscan) untuk:

Melihat transaksi blockchain

Memeriksa hash data medis

Menelusuri blok, alamat, dan catatan on-chain

👥 Dua Jenis Pengguna

Pasien: melihat rekam medis mereka secara aman

Dokter: menginput dan mengelola data medis
Semua interaksi dilindungi oleh smart contract berbasis Ethereum/Polygon atau testnet.

🧩 Teknologi yang Digunakan
Frontend

JavaScript modern (React.js / Next.js / Vue.js)

TailwindCSS / Material UI

Web3Modal / MetaMask Integration

Backend

Node.js (Express / NestJS)

Ethers.js untuk komunikasi dengan blockchain

MongoDB / PostgreSQL (opsional untuk data off-chain)

Blockchain

Solidity Smart Contract

Hardhat / Foundry

Ethereum Testnet (Sepolia / Polygon Mumbai)

🏗️ Struktur Proyek
medblock/
│
├── frontend/           # UI modern (React/Next.js)
│   ├── pages/
│   ├── components/
│   └── styles/
│
├── backend/            # Node.js API server
│   ├── src/
│   └── routes/
│
├── contracts/          # Smart contract Solidity
│   ├── MedBlock.sol
│   └── scripts/
│
├── test/               # Pengujian smart contract
│
└── README.md

📦 Cara Instalasi & Menjalankan Project
1. Clone Repository
git clone https://github.com/username/medblock.git
cd medblock

2. Instal Dependency

Frontend:

cd frontend
npm install


Backend:

cd backend
npm install


Contracts:

cd contracts
npm install

3. Jalankan Local Blockchain (Hardhat)
npx hardhat node

4. Deploy Smart Contract
npx hardhat run scripts/deploy.js --network localhost

5. Jalankan Backend
npm run dev

6. Jalankan Frontend
npm run dev

🔒 Keamanan

Data medis tersimpan on-chain menggunakan hash untuk menjaga privasi

Menggunakan wallet signature authentication untuk memastikan validitas pengguna

Smart contract memastikan data tidak dapat diubah atau dihapus

🗺️ Roadmap

 Menambahkan izin akses granular (doctor authorization)

 Menambahkan enkripsi end-to-end

 Integrasi IPFS untuk penyimpanan file medis

 Pengembangan Mobile App (React Native)
