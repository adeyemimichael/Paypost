# Real Transactions Implementation Guide

## 🚀 Current Status

✅ **COMPLETED:**
- Real wallet signing integration with Privy
- Transaction mode toggle (simulation vs real)
- Movement blockchain configuration
- Smart contract integration
- Error handling and user feedback

⚠️ **TESTING REQUIRED:**
- Real wallet signing with Movement network
- Actual token transfers
- Transaction confirmation flow

## 🔧 How to Test Real Transactions

### Step 1: Enable Real Transaction Mode

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Look for the Transaction Mode Toggle** in the bottom-right corner (only visible in development)

3. **Click "Enable Real Transactions"** and confirm the warning

### Step 2: Test Survey Creation (Real Funding)

1. **Connect your wallet** with sufficient MOVE tokens
2. **Go to Create Survey page**
3. **Fill out survey details** (start with small amounts like 0.1 MOVE per response)
4. **Submit the survey** - this will:
   - Sign a real transaction with your wallet
   - Lock actual MOVE tokens in the smart contract
   - Create the survey on blockchain

### Step 3: Test Survey Completion (Real Rewards)

1. **Switch to a different wallet** (participant)
2. **Complete the survey**
3. **Submit responses** - this will:
   - Sign a real transaction
   - Automatically receive MOVE tokens as reward
   - Update your wallet balance

## 🔍 What Happens in Real Mode

### Survey Creation Flow:
```
1. User fills survey form
2. System calculates total cost (rewards + 2.5% fee)
3. Privy wallet signs transaction
4. Smart contract locks MOVE tokens
5. Survey becomes active on blockchain
6. UI updates with real survey data
```

### Survey Completion Flow:
```
1. User submits survey responses
2. System creates response hash
3. Privy wallet signs completion transaction
4. Smart contract verifies and pays reward
5. MOVE tokens transferred to participant
6. UI updates with new balance
```

## 🛠️ Troubleshooting

### Common Issues:

1. **"Wallet cannot sign transactions"**
   - Reconnect your wallet
   - Make sure you're using Privy embedded wallet
   - Check if wallet is properly initialized

2. **"Insufficient balance"**
   - Check your MOVE token balance
   - Make sure you have enough for gas fees
   - Reduce survey reward amounts for testing

3. **"Transaction failed on blockchain"**
   - Check Movement network status
   - Verify smart contract is deployed
   - Check transaction hash in explorer

### Debug Steps:

1. **Check browser console** for detailed error messages
2. **Verify wallet connection** in Privy dashboard
3. **Check transaction status** in Movement explorer
4. **Switch back to simulation mode** if needed for testing

## 📊 Monitoring Real Transactions

### Transaction Tracking:
- All real transactions show actual hash (not simulated)
- Success notifications include transaction hash
- Failed transactions show specific error messages
- Balance updates reflect real blockchain state

### Verification:
- Check Movement blockchain explorer for transactions
- Verify smart contract state changes
- Confirm token transfers in wallet

## 🚨 Important Notes

### Security:
- Start with small amounts for testing
- Use testnet MOVE tokens only
- Never share private keys or seed phrases
- Test thoroughly before mainnet deployment

### Performance:
- Real transactions take 2-5 seconds to confirm
- Network congestion may cause delays
- Gas fees are minimal on Movement network
- Failed transactions still consume gas

## 🎯 Next Steps

1. **Test with small amounts** first
2. **Verify all flows work** end-to-end
3. **Check balance updates** are accurate
4. **Test error scenarios** (insufficient funds, etc.)
5. **Deploy to production** when ready

## 🔄 Switching Back to Simulation

If you need to switch back to simulation mode:
1. Click the Transaction Mode Toggle
2. Select "Switch to Simulation"
3. All transactions will be simulated again
4. No real tokens will be used

---

**Your system is now ready for real blockchain transactions! 🚀**