# 🚀 PayPaglu – Web3 Remittance App (Sepolia Network)

PayPaglu is a decentralized peer-to-peer remittance application built on Ethereum.  
It enables users to send crypto payments using **usernames or phone numbers**, manage **family vaults**, and track **on-chain transaction history** — all through a modern React + TypeScript frontend.

Deployed for testing on the **Sepolia Testnet**.

---

## 📌 Overview

Traditional crypto transfers require wallet addresses — long, error-prone, and non-human-readable.

PayPaglu abstracts this complexity by allowing:
- Username-based transfers
- Phone-number-based transfers
- Shared family vault management
- On-chain transaction tracking

This project demonstrates full-stack Web3 integration:
- Smart Contract (Solidity)
- Web3 Context (ethers.js)
- Modern React UI (Vite + Tailwind)
- Wallet integration

---

## 🧱 Architecture

### 1️⃣ Smart Contract Layer (`/contract/PayPaglu.sol`)

Core responsibilities:
- User registration (username + phone)
- Username/phone to wallet mapping
- P2P fund transfers
- Family vault creation & management
- On-chain transaction logging
- Reentrancy protection (OpenZeppelin `ReentrancyGuard`)

### 2️⃣ Frontend Layer (`/src`)

Built with:
- React 18
- TypeScript
- Vite
- Tailwind CSS
- ethers v6
- React Router v7

Provides:
- Wallet connection
- Registration flow
- Send & receive interface
- Vault dashboard
- Transaction history UI

---

## ✨ Features

### 🔐 1. User Registration
- Register with:
  - Username
  - Phone Number
- Maps both to wallet address on-chain.

### 💸 2. Send Money
- Send ETH using:
  - Username
  - Phone Number
- Transaction recorded on-chain.

### 📥 3. Receive Money
- Generate QR codes for wallet address.
- Share address easily.

### 👨‍👩‍👧‍👦 4. Family Vault
- Create shared vault.
- Add members.
- Deposit funds.
- Withdraw funds (authorized members only).
- Vault maintains internal balance logic.

### 📜 5. Transaction History
Each transaction records:
- Sender
- Receiver
- Amount
- Gas used
- Timestamp
- Method:
  - `send`
  - `vault_deposit`
  - `vault_withdraw`

---

## 📂 Project Structure


PayPaglu---Sepolia-net-master/
│
├── contract/
│ ├── PayPaglu.sol
│ └── ABI.json
│
├── public/
│ ├── PayPaglu.png
│ └── PayPagluApp.png
│
├── src/
│ ├── components/
│ │ ├── ConnectWallet.jsx
│ │ ├── Header.tsx
│ │ ├── Navigation.tsx
│ │ └── RegistrationModal.tsx
│ │
│ ├── context/
│ │ └── Web3Context.tsx
│ │
│ ├── pages/
│ │ ├── Dashboard.tsx
│ │ ├── SendMoney.tsx
│ │ ├── ReceiveMoney.tsx
│ │ ├── FamilyVault.tsx
│ │ ├── TransactionHistory.tsx
│ │ └── Background.tsx
│ │
│ └── types/
│ └── index.ts
│
├── index.html
├── vite.config.ts
├── tailwind.config.js
└── package.json


---

## 🛠 Tech Stack

### Smart Contract
- Solidity ^0.8.0
- OpenZeppelin (ReentrancyGuard)

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- ethers.js v6
- React Router
- lucide-react
- react-hot-toast
- qrcode

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone <repository-url>
cd PayPaglu---Sepolia-net-master
2️⃣ Install Dependencies
npm install
3️⃣ Run Development Server
npm run dev
4️⃣ Build for Production
npm run build
```
🔗 Smart Contract Deployment

To deploy:

Compile using Hardhat or Remix.

Deploy on Sepolia Testnet.

Update:

Contract address in frontend

ABI.json if modified

Make sure:

MetaMask is connected to Sepolia.

Test ETH is available.

🧠 Smart Contract Design Notes
Key Mappings

usernameToAddress

phoneToAddress

addressToUser

userTransactions

userToVault

Security

ReentrancyGuard for withdrawal functions.

Explicit membership validation in vault logic.

Limitations

Username uniqueness depends on string mapping.

Phone number format not normalized.

No off-chain validation layer.

No upgradeability pattern implemented.

🚧 Potential Improvements

ENS-style username resolution.

Phone number hashing for privacy.

Meta-transactions (gas abstraction).

ERC20 token support.

Multi-sig vault withdrawals.

On-chain event indexing via The Graph.

Backend indexing service for faster transaction history.

Proper production deployment scripts (Hardhat config missing).

🎯 Purpose of This Project

This project demonstrates:

Practical Web3 architecture

Smart contract + React integration

UX abstraction over raw wallet transfers

On-chain state management

Secure Solidity patterns

It is suitable for:

Hackathons

Web3 portfolio projects

Smart contract learning

DeFi UX experimentation

📄 License

MIT License

👤 Author

Developed as a Web3 remittance solution prototype for Sepolia testnet experimentation.


If you want, I can now:
- Rewrite this as a **strong GitHub portfolio-grade README**
- Or turn it into a **hackathon submission README**
- Or aggressively optimize it for recruiter impact**
