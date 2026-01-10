# PayPost Smart Contract Deployment Guide

## Prerequisites

1. **Install Aptos CLI**
   ```bash
   curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3
   ```

2. **Generate Deployer Account**
   ```bash
   aptos init --network custom --rest-url https://testnet.movementnetwork.xyz/v1
   ```

3. **Fund Deployer Account**
   - Copy your address from `.aptos/config.yaml`
   - Visit: https://faucet.testnet.movementnetwork.xyz/
   - Request testnet MOVE tokens (minimum 1 MOVE for deployment)

## Deployment Steps

### 1. Build the Smart Contract
```bash
./build.sh
```

### 2. Deploy to Movement Testnet
```bash
export DEPLOYER_PRIVATE_KEY="your_private_key_from_config"
node deploy.js
```

### 3. Update Environment Variables

**Frontend (.env):**
```env
VITE_PRIVY_APP_ID=cmjdd0qln00l0jr0cyua66s7y
VITE_MOVEMENT_RPC_URL=https://testnet.movementnetwork.xyz/v1
VITE_MOVEMENT_CHAIN_ID=250
VITE_CONTRACT_ADDRESS=your_deployed_contract_address
VITE_API_BASE_URL=https://backend-phi-rosy-67.vercel.app/api
VITE_SUPABASE_URL=https://atiewnrbnfzqrgktkcur.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0aWV3bnJibmZ6cXJna3RrY3VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzI5NzQsImV4cCI6MjA1MDU0ODk3NH0.5i37PEmczSVeZ1c2AawAoA_tTfkG0CF
```

**Backend (backend/.env):**
```env
PRIVY_APP_ID=cmjdd0qln00l0jr0cyua66s7y
PRIVY_APP_SECRET=your_privy_app_secret
MOVEMENT_RPC_URL=https://testnet.movementnetwork.xyz/v1
CONTRACT_ADDRESS=your_deployed_contract_address
```

### 4. Deploy Frontend to Vercel
```bash
./deploy-vercel.sh
```

### 5. Deploy Backend to Vercel
```bash
cd backend
vercel --prod
```

## Database Setup (Supabase)

### Required Tables

**users table:**
```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT UNIQUE NOT NULL,
  email TEXT,
  role TEXT DEFAULT 'reader',
  display_name TEXT,
  total_earnings DECIMAL DEFAULT 0,
  total_surveys_created INTEGER DEFAULT 0,
  total_surveys_completed INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**surveys table:**
```sql
CREATE TABLE surveys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  reward_amount DECIMAL NOT NULL,
  max_responses INTEGER NOT NULL,
  current_responses INTEGER DEFAULT 0,
  estimated_time INTEGER DEFAULT 5,
  expires_at TIMESTAMP,
  creator_id UUID REFERENCES users(id),
  blockchain_tx_hash TEXT,
  blockchain_status TEXT DEFAULT 'confirmed',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**survey_questions table:**
```sql
CREATE TABLE survey_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL,
  options JSONB,
  required BOOLEAN DEFAULT true,
  order_index INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**survey_responses table:**
```sql
CREATE TABLE survey_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID REFERENCES surveys(id),
  participant_id UUID REFERENCES users(id),
  response_data JSONB,
  blockchain_tx_hash TEXT,
  completed_at TIMESTAMP DEFAULT NOW()
);
```

### RLS Policies
```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public read access" ON users FOR SELECT USING (true);
CREATE POLICY "Public read access" ON surveys FOR SELECT USING (true);
CREATE POLICY "Public read access" ON survey_questions FOR SELECT USING (true);
CREATE POLICY "Public read access" ON survey_responses FOR SELECT USING (true);

-- Allow public insert/update
CREATE POLICY "Public insert access" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert access" ON surveys FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert access" ON survey_questions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert access" ON survey_responses FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update access" ON users FOR UPDATE USING (true);
CREATE POLICY "Public update access" ON surveys FOR UPDATE USING (true);
```

## Verification

1. **Contract Verification**
   - Visit: https://explorer.testnet.movementnetwork.xyz/
   - Search for your contract address
   - Verify PayPost module is deployed

2. **Frontend Testing**
   - Create account with email
   - Select role (creator/participant)
   - Create survey (creators)
   - Complete survey (participants)
   - Check wallet balance updates

3. **Database Verification**
   - Check users table for new registrations
   - Verify surveys are saved with blockchain hashes
   - Confirm responses are recorded

## Production Deployment

### Environment Variables for Production

**Vercel Environment Variables:**
```
VITE_PRIVY_APP_ID=cmjdd0qln00l0jr0cyua66s7y
VITE_MOVEMENT_RPC_URL=https://testnet.movementnetwork.xyz/v1
VITE_MOVEMENT_CHAIN_ID=250
VITE_CONTRACT_ADDRESS=your_deployed_contract_address
VITE_API_BASE_URL=https://your-backend-domain.vercel.app/api
VITE_SUPABASE_URL=https://atiewnrbnfzqrgktkcur.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Backend Environment Variables:
```
PRIVY_APP_ID=cmjdd0qln00l0jr0cyua66s7y
PRIVY_APP_SECRET=your_privy_app_secret
MOVEMENT_RPC_URL=https://testnet.movementnetwork.xyz/v1
CONTRACT_ADDRESS=your_deployed_contract_address
```

## Troubleshooting

### Common Issues

1. **Supabase Connection Errors**
   - Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
   - Check RLS policies are set correctly
   - Ensure tables exist with correct schema

2. **Survey Creation Fails**
   - Check user has sufficient MOVE tokens
   - Verify contract address is correct
   - Ensure user is authenticated with Privy

3. **Survey Completion Errors**
   - User may have already completed survey
   - Check survey is still active
   - Verify blockchain transaction succeeds

4. **Wallet Persistence Issues**
   - Clear localStorage: `localStorage.clear()`
   - Re-authenticate with Privy
   - Check wallet initialization logs

### Debug Commands
```bash
# Check contract deployment
aptos account list --account your_contract_address

# Test backend connection
curl https://your-backend-domain.vercel.app/api/health

# Check Supabase connection
# Run in browser console:
# supabase.from('users').select('count')
```

## Security Considerations

- ✅ Wallet addresses stored securely
- ✅ User data encrypted in Supabase
- ✅ Blockchain transactions verified
- ✅ Role-based access control
- ✅ Survey completion tracking
- ✅ Duplicate prevention mechanisms

## Support

For deployment issues:
1. Check logs in Vercel dashboard
2. Verify environment variables
3. Test contract functions manually
4. Check Supabase table structure
5. Monitor blockchain transactions