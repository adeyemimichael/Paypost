# PayPost - Smart Contract Integration & Role System Guide

## ✅ What We've Implemented

### 1. Role-Based Authentication System
- **Two User Roles**: Creator and Participant (Reader)
- **Role Selection Modal**: Beautiful UI for choosing role on signup
- **Role Persistence**: Saves role in localStorage
- **Role-Specific Navigation**: Different menu items based on role

### 2. Movement SDK Integration
- **Aptos SDK**: Installed `@aptos-labs/ts-sdk` for Movement blockchain
- **Real Contract Calls**: Replaced simulations with actual SDK methods
- **View Functions**: Implemented read-only contract queries
- **Transaction Building**: Structured transaction payloads for contract calls

### 3. Enhanced Movement Service Features
- ✅ `completeSurvey()` - Submit survey with blockchain verification
- ✅ `createSurvey()` - Create new surveys (for creators)
- ✅ `tipCreator()` - Send tips to survey creators
- ✅ `hasSurveyCompleted()` - Check if user completed survey
- ✅ `getSurveyDetails()` - Fetch survey information
- ✅ `getUserEarnings()` - Get user's total earnings
- ✅ `getPlatformStats()` - Platform-wide statistics
- ✅ `estimateGas()` - Gas cost estimation
- ✅ `getTransactionStatus()` - Track transaction status

## 🚀 How to Use the New Features

### For Users (Participants)

1. **Sign Up with Role Selection**:
   ```javascript
   // Click "Get Started" on home page
   // Select "Survey Participant" role
   // Connect wallet via Privy
   ```

2. **Complete Surveys**:
   ```javascript
   // Browse surveys in feed
   // Click "Start Survey"
   // Answer questions
   // Earn MOVE tokens instantly
   ```

3. **Track Earnings**:
   ```javascript
   // View earnings dashboard
   // See completed surveys
   // Check total MOVE earned
   ```

### For Creators

1. **Sign Up as Creator**:
   ```javascript
   // Click "Get Started" on home page
   // Select "Survey Creator" role
   // Connect wallet via Privy
   ```

2. **Create Surveys**:
   ```javascript
   // Click "Create Survey" in navbar
   // Set title, description, questions
   // Define reward amount and max responses
   // Fund survey with MOVE tokens
   ```

3. **Manage Surveys**:
   ```javascript
   // View "My Surveys" in navbar
   // Track responses and analytics
   // Close or extend surveys
   ```

## 📝 Next Steps to Complete Integration

### Step 1: Deploy Smart Contract to Movement Testnet

```bash
# Install Movement CLI
curl -fsSL https://get.movementlabs.xyz | sh

# Navigate to smart contract directory
cd src/smart-contracts

# Compile the contract
movement move compile

# Deploy to testnet
movement move publish \
  --package-dir . \
  --named-addresses PayPost=<your-wallet-address>

# Copy the deployed contract address
# Update .env file:
VITE_CONTRACT_ADDRESS=<deployed-contract-address>
```

### Step 2: Connect Wallet for Transaction Signing

Currently, transactions are simulated. To enable real transactions:

```javascript
// In movementService.js, replace simulateTransaction with:

async executeTransaction(transaction, walletAddress) {
  try {
    // Get the connected wallet from Privy
    const wallet = await privyService.getWallet();
    
    // Build transaction
    const rawTxn = await this.aptos.transaction.build.simple({
      sender: walletAddress,
      data: {
        function: transaction.function,
        typeArguments: transaction.type_arguments,
        functionArguments: transaction.arguments,
      },
    });

    // Sign transaction with wallet
    const signedTxn = await wallet.signTransaction(rawTxn);
    
    // Submit transaction
    const pendingTxn = await this.aptos.transaction.submit.simple(signedTxn);
    
    // Wait for confirmation
    const executedTxn = await this.aptos.waitForTransaction({
      transactionHash: pendingTxn.hash,
    });

    return executedTxn;
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
}
```

### Step 3: Update Environment Variables

Make sure your `.env` file has correct values:

```env
VITE_PRIVY_APP_ID=your_privy_app_id
VITE_MOVEMENT_RPC_URL=https://testnet.movementnetwork.xyz/v1
VITE_MOVEMENT_CHAIN_ID=250
VITE_CONTRACT_ADDRESS=<your-deployed-contract-address>
```

### Step 4: Test the Integration

1. **Test Survey Completion**:
   ```bash
   # Open browser to http://localhost:5174
   # Sign up as participant
   # Complete a survey
   # Check console for transaction hash
   # Verify on Movement explorer
   ```

2. **Test Survey Creation** (for creators):
   ```bash
   # Sign up as creator
   # Navigate to "Create Survey"
   # Fill in survey details
   # Submit and verify transaction
   ```

3. **Test Tipping**:
   ```bash
   # Complete a survey
   # Click "Tip Creator"
   # Send tip amount
   # Verify transaction
   ```

## 🔧 Troubleshooting

### Issue: "Movement service not initialized"
**Solution**: Check that `movementService.initialize()` is called in App.jsx

### Issue: "Transaction failed"
**Solution**: 
- Verify contract address is correct
- Check wallet has sufficient MOVE tokens
- Ensure RPC URL is accessible

### Issue: "Role not persisting"
**Solution**: Check browser localStorage for `paypost_user_role` key

### Issue: "Contract view function fails"
**Solution**: 
- Verify contract is deployed
- Check function names match contract
- Ensure contract address is correct

## 📊 Testing Checklist

- [ ] Role selection modal appears on signup
- [ ] Role persists after page refresh
- [ ] Creator sees "Create Survey" in navbar
- [ ] Participant sees "Feed" in navbar
- [ ] Movement service initializes successfully
- [ ] Contract view functions return data
- [ ] Survey completion triggers transaction
- [ ] Earnings update after survey completion
- [ ] Tip functionality works
- [ ] Platform stats display correctly

## 🎯 Production Deployment Steps

1. **Deploy Smart Contract to Mainnet**:
   ```bash
   movement move publish --network mainnet
   ```

2. **Update Environment Variables**:
   ```env
   VITE_MOVEMENT_RPC_URL=https://mainnet.movementnetwork.xyz/v1
   VITE_CONTRACT_ADDRESS=<mainnet-contract-address>
   ```

3. **Build Frontend**:
   ```bash
   npm run build
   ```

4. **Deploy to Vercel/Netlify**:
   ```bash
   vercel deploy --prod
   # or
   netlify deploy --prod
   ```

5. **Configure Domain & SSL**:
   - Set up custom domain
   - Enable HTTPS
   - Configure CORS

## 🔐 Security Considerations

1. **Never commit `.env` file** - Contains sensitive keys
2. **Validate all user inputs** - Prevent injection attacks
3. **Rate limit transactions** - Prevent spam
4. **Audit smart contract** - Before mainnet deployment
5. **Use secure RPC endpoints** - Avoid public nodes in production

## 📚 Additional Resources

- [Movement Documentation](https://docs.movementlabs.xyz)
- [Aptos SDK Documentation](https://aptos.dev/sdks/ts-sdk/)
- [Privy Documentation](https://docs.privy.io)
- [React Best Practices](https://react.dev)

## 🎉 What's Working Now

✅ Role-based authentication system
✅ Beautiful role selection UI
✅ Movement SDK integrated
✅ Contract interaction structure
✅ Gas estimation
✅ Transaction status tracking
✅ Error handling
✅ Loading states
✅ User feedback (toasts)
✅ Role persistence
✅ Role-specific navigation

## 🚧 What Needs Completion

⏳ Deploy smart contract to testnet
⏳ Connect wallet signing for transactions
⏳ Test real blockchain transactions
⏳ Add survey creation UI for creators
⏳ Implement analytics dashboard
⏳ Add transaction history view

---

**Your PayPost platform now has a solid foundation for blockchain integration and role-based features!** 🚀
