# ContentPlatform Smart Contract Deployment Guide

## Prerequisites

1. **Install Aptos CLI**
   ```bash
   curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3
   ```

2. **Generate Deployer Account**
   ```bash
   aptos init --network custom --rest-url https://testnet.movementnetwork.xyz/v1
   ```
   This will create a `.aptos/config.yaml` file with your private key.

3. **Fund Deployer Account**
   - Copy your address from the config file
   - Visit: https://faucet.testnet.movementnetwork.xyz/
   - Request testnet MOVE tokens (you'll need at least 1 MOVE for deployment)

## Deployment Steps

### 1. Build the Smart Contract
```bash
./build.sh
```

### 2. Deploy to Movement Testnet
```bash
# Get your private key from .aptos/config.yaml
export DEPLOYER_PRIVATE_KEY="your_private_key_here"

# Deploy the contract
node deploy.js
```

### 3. Update Environment Variables
After successful deployment, update both `.env` files:

**Frontend (.env):**
```env
VITE_CONTRACT_ADDRESS=your_deployed_contract_address
```

**Backend (backend/.env):**
```env
CONTRACT_ADDRESS=your_deployed_contract_address
```

### 4. Restart Services
```bash
# Restart backend
cd backend && npm start

# Restart frontend (in another terminal)
npm run dev
```

## Verification

1. **Check Contract on Explorer**
   - Visit: https://explorer.testnet.movementnetwork.xyz/
   - Search for your contract address
   - Verify the ContentPlatform module is deployed

2. **Test Survey Creation**
   - Create a survey in the app
   - Check that MOVE tokens are deducted from your balance
   - Verify transaction appears on the explorer

## Troubleshooting

### Build Errors
- Ensure Aptos CLI is installed and updated
- Check Move.toml syntax
- Verify all dependencies are correct

### Deployment Errors
- **Insufficient Balance**: Fund your deployer account with more MOVE tokens
- **Network Issues**: Check Movement testnet status
- **Module Exists**: Use a different deployer address

### Transaction Errors
- **Module Not Found**: Contract not deployed or wrong address
- **Insufficient Balance**: User needs more MOVE tokens
- **Invalid Arguments**: Check function parameters

## Contract Functions

### For Creators
- `create_and_fund_survey()` - Creates survey and locks tokens
- Automatically deducts: `reward_amount * max_responses` MOVE tokens

### For Participants  
- `complete_survey()` - Completes survey and receives reward
- Automatically transfers reward to participant

### View Functions
- `get_survey()` - Get survey details
- `get_all_surveys()` - Get all surveys
- `get_user_earnings()` - Get user's total earnings
- `has_completed_survey()` - Check if user completed survey

## Security Features

- ✅ **Automatic Fund Locking**: Tokens locked when survey created
- ✅ **Duplicate Prevention**: Users can't complete same survey twice  
- ✅ **Expiration Handling**: Surveys automatically expire
- ✅ **Balance Verification**: Checks sufficient funds before creation
- ✅ **Event Emission**: All actions logged on-chain

## Next Steps

After deployment:
1. Test survey creation with small amounts
2. Verify token deduction and rewards work
3. Check all transactions on Movement explorer
4. Monitor contract for any issues