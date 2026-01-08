# PayPost Setup Instructions

## 🚀 Quick Start

### 1. Backend Setup
```bash
cd backend
npm install
```

### 2. Environment Configuration
Update `backend/.env` with your Privy app secret:
```env
PORT=3001
PRIVY_APP_ID=cmjdd0qln00l0jr0cyua66s7y
PRIVY_APP_SECRET=your_actual_privy_app_secret_here
MOVEMENT_RPC_URL=https://testnet.movementnetwork.xyz/v1
CONTRACT_ADDRESS=0xa74c3b75410a0681f854cfe2b869a3cd6b959d7dbe551aef4781c6a3ff3aa8dd
```

### 3. Start Backend
```bash
cd backend
npm run dev
```

### 4. Start Frontend (in another terminal)
```bash
npm run dev
```

### 5. Test the Setup
Visit: http://localhost:5174/test

## 🔧 Architecture Overview

### Backend (Port 3001)
- **Transaction Service**: Signs transactions with Privy
- **API Endpoints**: 
  - `POST /api/transactions/create-survey`
  - `POST /api/transactions/complete-survey`
  - `GET /api/balance/:address`
  - `GET /api/surveys`

### Frontend (Port 5174)
- **Movement Service**: API client for backend
- **Wallet Hook**: Manages Privy wallet integration
- **Stores**: UI state management only

## 🎯 Next Steps

1. **Get Privy App Secret**: 
   - Go to Privy Dashboard
   - Copy your app secret
   - Update `backend/.env`

2. **Fund Testnet Wallet**:
   - Connect wallet in app
   - Get testnet MOVE tokens from faucet
   - Test survey creation

3. **Deploy Smart Contract** (Optional):
   - Contract is ready in `src/smart-contracts/`
   - Deploy to Movement testnet
   - Update CONTRACT_ADDRESS in backend/.env

## 🔍 Testing

### Test Backend Connection
```bash
curl http://localhost:3001/health
```

### Test Transaction Endpoint
```bash
curl -X POST http://localhost:3001/api/transactions/create-survey \
  -H "Content-Type: application/json" \
  -d '{
    "walletId": "test",
    "publicKey": "test", 
    "address": "test",
    "surveyData": {
      "title": "Test Survey",
      "description": "Test Description", 
      "rewardAmount": 1.0,
      "maxResponses": 10
    }
  }'
```

## 🚨 Troubleshooting

### Backend Won't Start
- Check if port 3001 is available
- Verify all dependencies installed: `npm install`
- Check environment variables are set

### Frontend Errors
- Ensure backend is running on port 3001
- Check browser console for API errors
- Verify Privy configuration

### Transaction Failures
- Check Privy app secret is correct
- Verify wallet has sufficient MOVE tokens
- Check Movement testnet is accessible

## 📁 File Structure

```
paypost/
├── backend/                 # Transaction signing service
│   ├── services/
│   │   └── transactionService.js
│   ├── server.js
│   └── package.json
├── src/
│   ├── services/
│   │   └── movementService.js    # API client
│   ├── hooks/
│   │   └── useMovementWallet.js  # Wallet integration
│   └── stores/                   # UI state only
└── README.md
```

This architecture ensures proper separation of concerns with Privy handling signing and Move handling business logic.