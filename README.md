# PayPost
**Decentralized survey rewards platform with instant MOVE token payments on the Movement Blockchain.**

## Overview

PayPost is a blockchain-powered survey platform that enables instant rewards for survey participation without intermediaries. Built on the **Movement blockchain** (Aptos-compatible), it leverages **Privy** for seamless social login (Email, Google) and wallet creation, making Web3 survey rewards accessible to everyone. The platform provides instant payments, automated survey management, and transparent on-chain reward distribution.

## Core Features

- **Seamless Onboarding** – Login with Email or Google via **Privy** (no extension required), or connect an existing Aptos wallet (Petra, Nightly).
- **Instant Rewards** – Earn MOVE tokens immediately upon survey completion.
- **Creator Dashboard** – Create surveys, set rewards, and track responses.
- **Secure Escrow** – Survey funds are locked in smart contracts until completion.
- **Automatic Verification** – User profiles linked to verified identities.
- **Supabase Integration** – User data and survey responses stored securely.
- **Transparent History** – All transactions and rewards are immutable on the Movement blockchain.
- **Role-Based Access** – Separate experiences for survey creators and participants.

## Real Use Case: Alice Earns from Surveys

Alice (new to crypto) logs in with her **Google account**. PayPost automatically creates a secure wallet for her. She browses available surveys and finds one offering 0.5 MOVE tokens. She completes the survey in 3 minutes. The smart contract automatically:

- Verifies her completion
- Transfers 0.5 MOVE tokens to her wallet
- Updates her earnings dashboard
- Records the completion on-chain

All transparent, secure, and instant—no middlemen, no delays.

## How It Works

1. **Users register** via email/Google login with automatic wallet creation.
2. **Creators fund surveys** with MOVE tokens and set reward amounts.
3. **Participants complete surveys** and earn tokens instantly.
4. **Smart contracts execute**:
   - Verify survey completion
   - Transfer rewards to participants
   - Track all transactions on-chain

## User Types

- **Survey Creators**: Create surveys, set rewards, analyze responses.
- **Participants**: Complete surveys, earn MOVE tokens, track earnings.
- **Admins**: Manage platform, resolve disputes, ensure integrity.

## Tech Stack

| Layer                  | Technology                                                                |
| ---------------------- | ------------------------------------------------------------------------- |
| **Blockchain**         | Movement Blockchain (Move Language)                                       |
| **Frontend**           | React.js, TailwindCSS, Vite                                              |
| **Authentication**     | **Privy** (Email, Google, Wallet)                                         |
| **Database**           | **Supabase** (PostgreSQL)                                                |
| **Backend**            | Node.js, Express.js                                                      |
| **Blockchain SDK**     | `@aptos-labs/ts-sdk`, Movement SDK                                       |
| **State Management**   | Zustand                                                                   |
| **Styling**            | Tailwind CSS, Framer Motion                                              |

## Getting Started

**Prerequisites:**
- [Node.js](https://nodejs.org/) (v18+)
- [Privy App ID](https://dashboard.privy.io/)
- [Supabase Account](https://supabase.com/)

**Installation & Running:**

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/paypost.git
cd paypost
```

2. **Install frontend dependencies:**
```bash
npm install
```

3. **Install backend dependencies:**
```bash
cd backend
npm install
cd ..
```

4. **Set up environment variables:**

Create a `.env` file in the root directory:
```env
VITE_PRIVY_APP_ID=your_privy_app_id
VITE_MOVEMENT_RPC_URL=https://testnet.movementnetwork.xyz/v1
VITE_MOVEMENT_CHAIN_ID=250
VITE_CONTRACT_ADDRESS=your_deployed_contract_address
VITE_API_BASE_URL=http://localhost:3001/api
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Create a `backend/.env` file:
```env
PRIVY_APP_ID=your_privy_app_id
PRIVY_APP_SECRET=your_privy_app_secret
MOVEMENT_RPC_URL=https://testnet.movementnetwork.xyz/v1
CONTRACT_ADDRESS=your_deployed_contract_address
```

5. **Set up Supabase Database:**

Run these SQL commands in your Supabase SQL editor:

```sql
-- Users table
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

-- Surveys table
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

-- Survey responses table
CREATE TABLE survey_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID REFERENCES surveys(id),
  participant_id UUID REFERENCES users(id),
  response_data JSONB,
  blockchain_tx_hash TEXT,
  completed_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS and create policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public access" ON users FOR ALL USING (true);
CREATE POLICY "Public access" ON surveys FOR ALL USING (true);
CREATE POLICY "Public access" ON survey_responses FOR ALL USING (true);
```

6. **Deploy Smart Contract (Optional):**
```bash
# Build the contract
./build.sh

# Deploy to Movement testnet
export DEPLOYER_PRIVATE_KEY="your_private_key"
node deploy.js
```

7. **Run the application:**

Start the backend:
```bash
cd backend
npm start
```

Start the frontend (in another terminal):
```bash
npm run dev
```

8. **Open in Browser:**
Navigate to `http://localhost:5173`

## Project Structure

```
paypost/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── NewNavbar.jsx
│   │   ├── PostCard.jsx
│   │   ├── SurveyModal.jsx
│   │   ├── CreatorDashboard.jsx
│   │   └── RoleSelectionModal.jsx
│   ├── pages/              # Application pages
│   │   ├── Home.jsx
│   │   ├── CreateSurveyPage.jsx
│   │   ├── CreatorApplicationPage.jsx
│   │   └── StatusPage.jsx
│   ├── stores/             # Zustand state management
│   │   ├── userStore.js
│   │   ├── walletStore.js
│   │   └── postStore.js
│   ├── services/           # API and blockchain services
│   │   ├── movementService.js
│   │   ├── walletService.js
│   │   └── supabaseService.js
│   ├── hooks/              # Custom React hooks
│   │   └── useMovementWallet.js
│   └── utils/              # Utility functions
├── backend/                # Express.js backend
│   ├── server.js
│   └── services/
│       └── transactionService.js
├── sources/                # Move smart contracts
│   └── PayPost.move
├── Move.toml
├── package.json
└── README.md
```

## Smart Contract Functions

### Core Functions
- `create_and_fund_survey()` - Create survey and lock reward tokens
- `complete_survey()` - Complete survey and receive rewards
- `close_survey()` - Close survey and return unused funds

### View Functions
- `get_survey()` - Get survey details
- `get_all_surveys()` - Get all active surveys
- `has_completed_survey()` - Check if user completed survey
- `get_user_earnings()` - Get user's total earnings

## User Flows

### Participant Experience
1. **Login**: Email/Google login via Privy
2. **Role Selection**: Choose "Participant" role
3. **Browse Surveys**: View available surveys with rewards
4. **Complete Survey**: Answer questions and earn MOVE tokens
5. **Track Earnings**: Monitor total earnings and completed surveys

### Creator Experience
1. **Login**: Email/Google login via Privy
2. **Role Selection**: Choose "Creator" role
3. **Create Survey**: Design survey with questions and set rewards
4. **Fund Survey**: Deposit MOVE tokens for participant rewards
5. **Monitor Results**: Track responses and analyze data

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Movement Labs for blockchain infrastructure
- Privy for embedded wallet solutions
- Supabase for database services
- React and Tailwind CSS communities

---

**PayPost** - Turning opinions into earnings with Web3 survey rewards 🚀

Built on Movement Blockchain – The future of decentralized survey rewards.