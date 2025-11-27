
# 🤖 SYNERGY.AI

### Autonomous DeFi Agents with Sovereign Identity

[![Katana Network](https://img.shields.io/badge/Chain-Katana%20Network-purple?style=for-the-badge)](https://katana.network)
[![Solidity](https://img.shields.io/badge/Solidity-^0.8.20-363636?style=for-the-badge&logo=solidity)](https://soliditylang.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

<img src="https://raw.githubusercontent.com/goat-dev8/SYNERGY.AI/main/docs/banner.png" alt="SYNERGY.AI Banner" width="800"/>

**Deploy your own sovereign AI agent to execute DeFi strategies autonomously on Katana Network**

[🌐 Live Demo]([https://synergy.ai](https://privy-flow.vercel.app/)) · [📖 Documentation](https://docs.synergy.ai) · [🐦 Twitter](https://twitter.com/synergyai)

---

</div>

## 🎯 Overview

**SYNERGY.AI** is a next-generation DeFi platform that allows users to deploy **autonomous AI agents** that execute trading strategies on their behalf. Each agent is cryptographically linked to a verified human identity using zero-knowledge proofs, ensuring accountability while preserving privacy.

### 🌟 Key Features

| Feature | Description |
|---------|-------------|
| 🆔 **Sovereign Identity** | ZK-proof identity verification using Privado ID (Polygon ID) |
| 🤖 **Autonomous Agents** | AI-powered trading agents with customizable strategies |
| 🔐 **Trust Scores** | On-chain reputation system for agents |
| ⚡ **Real-Time Execution** | Automated strategy execution based on market conditions |
| 🌐 **Katana Native** | Built specifically for Katana Network's high-performance infrastructure |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SYNERGY.AI PLATFORM                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐    │
│  │   Frontend      │    │  Agent Backend   │    │  Smart Contracts    │    │
│  │   (React)       │◄──►│  (Express + TS)  │◄──►│  (Solidity)         │    │
│  │                 │    │                  │    │                     │    │
│  │ • Dashboard     │    │ • REST API       │    │ • AgentRegistry     │    │
│  │ • Identity      │    │ • Strategy Exec  │    │ • AgentWallet       │    │
│  │ • Agent Mgmt    │    │ • Price Feeds    │    │ • Trust System      │    │
│  │ • Activity Feed │    │ • Identity Auth  │    │                     │    │
│  └─────────────────┘    └──────────────────┘    └─────────────────────┘    │
│           │                      │                        │                 │
│           │                      │                        │                 │
│           ▼                      ▼                        ▼                 │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                        KATANA NETWORK (Chain ID: 747474)              │  │
│  │                        https://rpc.katana.network                     │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
synergyai/
├── 📂 contracts/                 # Solidity smart contracts
│   ├── contracts/
│   │   ├── SovereignAgentRegistry.sol   # Human-Agent mapping & trust
│   │   ├── SovereignAgentWallet.sol     # Smart account for agents
│   │   └── MockContract.sol             # Testing utilities
│   ├── scripts/                  # Deployment scripts
│   ├── test/                     # Contract tests
│   └── hardhat.config.ts
│
├── 📂 agent/                     # Backend agent service
│   ├── src/
│   │   ├── index.ts              # Express server & API endpoints
│   │   ├── config.ts             # Environment configuration
│   │   ├── services/
│   │   │   ├── registryClient.ts # Blockchain interactions
│   │   │   └── goatClient.ts     # GOAT SDK integration
│   │   └── strategies/
│   │       └── simpleEthDipBuyer.ts  # ETH dip buying strategy
│   └── package.json
│
├── 📂 front/                     # React frontend application
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx     # Command center
│   │   │   ├── Identity.tsx      # Identity verification
│   │   │   ├── Agents.tsx        # Agent deployment & management
│   │   │   ├── Activity.tsx      # Transaction history
│   │   │   └── Liquidity.tsx     # Pool management
│   │   ├── components/
│   │   │   ├── ui/               # shadcn/ui components
│   │   │   └── layout/           # App layout components
│   │   ├── hooks/
│   │   │   ├── useBlockchain.ts  # Blockchain data hooks
│   │   │   └── useIdentity.ts    # Identity verification hooks
│   │   └── lib/
│   │       ├── api.ts            # API client
│   │       └── utils.ts          # Utilities
│   └── package.json
│
├── .gitignore
├── .env.example
├── package.json
└── README.md
```

---

## 🔗 Smart Contracts

### Deployed Contracts (Katana Mainnet)

| Contract | Address | Description |
|----------|---------|-------------|
| **SovereignAgentRegistry** | `0xcF28F960aA85b051D030374B1ACd14668abaAf3e` | Maps humans to agents, manages trust scores |
| **SovereignAgentWallet** | *Deployed per user* | Smart account wallet for agent operations |

### SovereignAgentRegistry

The core registry contract that maintains the relationship between verified humans and their autonomous agents.

```solidity
// Key functions
function registerAgent(address human, address agentWallet, uint256 trustScore) external onlyOwner;
function updateTrustScore(address agentWallet, uint256 newScore) external onlyOwner;
function agentOf(address human) external view returns (address);
function trustScore(address agent) external view returns (uint256);
function isVerified(address human) external view returns (bool);

// Events
event AgentRegistered(address indexed human, address indexed agentWallet, uint256 trustScore, uint256 timestamp);
event TrustScoreUpdated(address indexed agentWallet, uint256 oldScore, uint256 newScore, uint256 timestamp);
```

### SovereignAgentWallet

A smart account wallet that enables autonomous agents to execute transactions on behalf of users.

```solidity
// Execute single transaction
function execute(address target, uint256 value, bytes calldata data) external onlyOperator;

// Execute batch transactions
function executeBatch(address[] targets, uint256[] values, bytes[] datas) external onlyOperator;

// Owner controls
function setOperator(address newOperator) external onlyOwner;
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18.x or higher
- **npm** or **bun** package manager
- **Git**
- MetaMask or compatible Web3 wallet

### 1. Clone the Repository

```bash
git clone https://github.com/goat-dev8/SYNERGY.AI.git
cd SYNERGY.AI
```

### 2. Install Dependencies

```bash
# Root dependencies (if any)
npm install

# Contracts
cd contracts && npm install

# Agent Backend
cd ../agent && npm install

# Frontend
cd ../front && npm install
```

### 3. Configure Environment Variables

Create `.env` files in each directory:

**contracts/.env**
```env
PRIVATE_KEY=your_deployer_private_key
KATANA_RPC_URL=https://rpc.katana.network
```

**agent/.env**
```env
PORT=3001
NODE_ENV=development
KATANA_RPC_URL=https://rpc.katana.network
KATANA_CHAIN_ID=747474
AGENT_PRIVATE_KEY=your_agent_private_key

# Contract Addresses
REGISTRY_CONTRACT_ADDRESS=0xcF28F960aA85b051D030374B1ACd14668abaAf3e

# Token Addresses (Katana)
WETH_TOKEN_ADDRESS=0x9893989433e7a383Cb313953e4c2365107dc19a7
VBUSDC_TOKEN_ADDRESS=0x203A662b0BD271A6ed5a60EdFbd04bFce608FD36
KAT_TOKEN_ADDRESS=0x7F1f4b4b29f5058fA32CC7a97141b8D7e5ABDC2d

# DEX
SUSHI_ROUTER_ADDRESS=0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506

# External APIs
OPENAI_API_KEY=your_openai_key
PRICE_FEED_URL=https://api.coingecko.com/api/v3/simple/price

# Identity Verification (for ngrok tunneling)
BACKEND_URL=https://your-ngrok-url.ngrok-free.app
CORS_ORIGIN=http://localhost:8080
```

**front/.env** *(if needed)*
```env
VITE_API_URL=http://localhost:3001
```

### 4. Deploy Contracts (Optional)

If you need to deploy your own contracts:

```bash
cd contracts

# Compile contracts
npm run compile

# Deploy to Katana
npm run deploy:registry
npm run deploy:wallet
```

### 5. Start the Backend

```bash
cd agent
npm run dev
```

The backend will start on `http://localhost:3001`

### 6. Start the Frontend

```bash
cd front
npm run dev
```

The frontend will start on `http://localhost:8080`

---

## 🎮 Usage Guide

### 1. Connect Wallet

1. Navigate to the app
2. Click "Connect Wallet"
3. Select Katana Network in MetaMask

### 2. Verify Identity

1. Go to **Identity** page
2. Click "Start Verification"
3. Sign the message with your wallet
4. Your identity is now verified on-chain!

### 3. Deploy Agent

1. Go to **Agents** page
2. Enter a name for your agent
3. Select a strategy preset
4. Adjust risk level
5. Click "Deploy Agent"
6. Sign the transaction

### 4. Run Strategies

Once your agent is deployed:

1. Click "Run Strategy" on your agent card
2. The agent will analyze market conditions
3. If conditions are met, it executes the strategy
4. View results in the Activity feed

---

## 📡 API Reference

### Health Check
```http
GET /health
```

### Identity Verification
```http
POST /identity/start
Content-Type: application/json

{
  "walletAddress": "0x..."
}
```

```http
POST /identity/complete
Content-Type: application/json

{
  "walletAddress": "0x...",
  "signature": "0x...",
  "message": "SynergyAI Identity Verification..."
}
```

### Agents
```http
GET /agents
GET /agents/human/:humanAddress
GET /agents/:address/portfolio
POST /agents/:address/strategies/eth-dip-buyer/run
```

### Metrics & Activity
```http
GET /metrics/wave3
GET /activity
```

---

## 🧪 Testing

### Smart Contracts

```bash
cd contracts
npm run test
```

### Backend

```bash
cd agent
npm run test
```

---

## 🔒 Security

### Best Practices Implemented

- ✅ Private keys never stored in code
- ✅ Environment variables for all secrets
- ✅ Signature verification for all identity operations
- ✅ OnlyOwner modifiers on registry functions
- ✅ Trust score bounds checking (0-10000)
- ✅ Input validation on all endpoints

### Security Considerations

- Agent private keys are held by the backend service
- Users sign messages to authorize actions (never private keys)
- All on-chain operations are auditable
- Trust scores provide reputation-based security

---

## 🗺️ Roadmap

### Phase 1: Foundation ✅
- [x] Smart contract development
- [x] Identity verification system
- [x] Agent registration & deployment
- [x] Basic strategy execution

### Phase 2: Enhancement 🚧
- [ ] Multi-strategy support
- [ ] Advanced AI decision making
- [ ] Cross-chain capabilities
- [ ] Decentralized price oracles

### Phase 3: Decentralization
- [ ] DAO governance
- [ ] Community strategy marketplace
- [ ] Permissionless agent deployment
- [ ] Staking & rewards system

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Katana Network](https://katana.network) - High-performance blockchain infrastructure
- [Privado ID](https://www.privado.id/) - Zero-knowledge identity verification
- [OpenZeppelin](https://openzeppelin.com/) - Secure smart contract libraries
- [RainbowKit](https://rainbowkit.com/) - Web3 wallet connection
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components

---

<div align="center">

**Built with ❤️ for the DeFi Revolution**

[⬆ Back to Top](#-synergyai)

</div>
