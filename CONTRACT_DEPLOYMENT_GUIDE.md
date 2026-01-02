# Smart Contract Deployment Guide

## Current Status
✅ **Contract compiles successfully**  
❌ **Contract not deployed to Movement testnet**  
🔧 **App configured for real transactions but needs contract deployment**

## Quick Deployment Steps

### 1. Initialize Movement CLI (if not done)
```bash
cd src/smart-contracts
movement init --network testnet
```

### 2. Fund Your Account
- Get MOVE tokens from the Movement testnet faucet
- Visit: https://faucet.movementnetwork.xyz/
- Or use CLI: `movement account fund-with-faucet --account <your-address>`

### 3. Deploy the Contract
```bash
cd src/smart-contracts
movement move publish --named-addresses PayPost=<your-wallet-address>
```

### 4. Update Environment Variables
After successful deployment, update `.env` with your deployed contract address:
```
VITE_CONTRACT_ADDRESS=<your-deployed-contract-address>
```

## Alternative: Use Existing Deployed Contract

If you have MOVE tokens and want to deploy immediately:

### Option A: Deploy with Nightly Wallet
1. Connect Nightly wallet to Movement testnet
2. Ensure you have MOVE tokens for gas fees
3. Use Movement CLI with your wallet's private key

### Option B: Use Pre-deployed Contract (if available)
If there's already a deployed contract, update the address in `.env`

## Current Configuration

**Contract Address (configured but not deployed):**
```
0xa74c3b75410a0681f854cfe2b869a3cd6b959d7dbe551aef4781c6a3ff3aa8dd
```

**Movement Testnet RPC:**
```
https://testnet.movementnetwork.xyz/v1
```

## What Works Without Contract Deployment

✅ **Database Operations:**
- User registration
- Survey creation in Supabase
- Survey responses in Supabase
- Like functionality

✅ **Wallet Integration:**
- Nightly/Petra/Martian wallet connection
- Balance display from blockchain
- Real wallet addresses

❌ **Blockchain Operations (require contract):**
- Real MOVE token transfers for survey rewards
- On-chain survey creation
- On-chain survey completion
- Smart contract interactions

## Testing Without Contract

The app will work in "database-only" mode:
1. Users can connect wallets
2. Creators can create surveys (stored in Supabase only)
3. Participants can complete surveys (no real MOVE rewards)
4. All data stored in Supabase database
5. Wallet balances show real blockchain amounts

## Next Steps

1. **Deploy the contract** using the steps above
2. **Update the contract address** in `.env`
3. **Test end-to-end flow** with real MOVE transactions
4. **Verify all contract functions** work as expected

## Troubleshooting

### Faucet Issues
If the faucet fails:
- Try the web faucet: https://faucet.movementnetwork.xyz/
- Ask in Movement Discord for testnet tokens
- Use a different wallet address

### Deployment Errors
- Ensure you have sufficient MOVE tokens for gas
- Check that the contract compiles: `movement move compile`
- Verify network connectivity to Movement testnet

### Contract Address Issues
- After deployment, the contract address will be your wallet address
- Update both `.env` and `Move.toml` if needed
- Restart the development server after updating `.env`

## Success Indicators

✅ Contract deployment successful when:
- `movement move publish` completes without errors
- Contract functions can be called via CLI
- App logs show "Contract connection test successful"
- Real MOVE transfers work in the app