# PayPost - Web3 Survey Rewards Platform

PayPost is a mobile-first Web 2.5 consumer application built on Movement blockchain that rewards users for participating in surveys and polls. Share your opinions and earn MOVE tokens instantly!

## 🚀 Features

- **Earn by Participating**: Complete surveys and polls to earn MOVE tokens
- **Instant Rewards**: Get paid immediately upon survey completion
- **Creator Tipping**: Support survey creators and researchers with direct tips
- **Seamless Onboarding**: No crypto knowledge required - embedded wallets via Privy
- **Mobile-First Design**: Optimized for mobile and desktop experiences
- **Low Gas Fees**: Built on Movement blockchain for cost-effective transactions

## 🛠 Tech Stack

### Frontend
- **React.js** with Vite for fast development
- **Tailwind CSS** for utility-first styling
- **Framer Motion** for smooth animations
- **Zustand** for state management
- **React Router** for navigation
- **React Toastify** for notifications

### Blockchain & Web3
- **Movement Testnet** for blockchain infrastructure
- **Move Smart Contracts** for secure payment logic
- **Privy SDK** for embedded wallet management
- **Movement SDK** for blockchain interactions

## 📁 Project Structure

```
paypost/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Navbar.jsx
│   │   ├── Feed.jsx
│   │   ├── PostCard.jsx
│   │   ├── TipModal.jsx
│   │   └── Loader.jsx
│   ├── pages/              # Main application pages
│   │   ├── Home.jsx
│   │   └── FeedPage.jsx
│   ├── stores/             # Zustand state management
│   │   ├── userStore.js
│   │   └── postStore.js
│   ├── services/           # Blockchain & API services
│   │   ├── privyService.js
│   │   └── movementService.js
│   ├── smart-contracts/    # Move smart contracts
│   │   └── PayPost.move
│   ├── utils/              # Utility functions
│   │   ├── notify.js
│   │   └── formatters.js
│   ├── animations/         # Framer Motion animations
│   │   └── fadeIn.js
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Movement wallet or testnet access

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd paypost
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   VITE_PRIVY_APP_ID=your_privy_app_id_here
   VITE_MOVEMENT_RPC_URL=https://testnet.movementlabs.xyz
   VITE_MOVEMENT_CHAIN_ID=177
   VITE_CONTRACT_ADDRESS=0x1234567890abcdef
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Open in Browser**
   Navigate to `http://localhost:5173`

## 🎯 User Flows

### Participant Experience
1. **Browse Surveys**: View available surveys and polls with reward amounts
2. **Connect Wallet**: One-click wallet creation via Privy (email/social login)
3. **Complete Surveys**: Answer questions and earn MOVE tokens instantly
4. **Track Earnings**: Monitor total earnings and completed surveys
5. **Tip Creators**: Send direct tips to support survey creators

### Creator/Researcher Experience
1. **Create Surveys**: Design surveys with custom questions and reward amounts
2. **Set Parameters**: Define max responses, duration, and reward per completion
3. **Fund Rewards**: Deposit MOVE tokens to pay participants
4. **Analyze Results**: Access aggregated survey responses and insights

## 🔧 Smart Contract Functions

### Core Functions
- `create_survey()` - Create new survey with rewards
- `complete_survey()` - Participate in survey and earn rewards
- `tip_creator()` - Send tips to survey creators
- `has_completed_survey()` - Check if user completed survey

### View Functions
- `get_survey()` - Retrieve survey details
- `get_survey_reward()` - Get survey reward amount
- `get_user_completed_surveys()` - List user's completed surveys
- `get_user_earnings()` - Get user's total earnings
- `get_platform_stats()` - Get platform-wide statistics

## 🎨 Design Principles

### User Experience
- **No Wallet Popups**: Seamless embedded wallet experience
- **Instant Feedback**: Real-time transaction status updates
- **Mobile-First**: Optimized for mobile consumption
- **Progressive Enhancement**: Works without wallet connection

### Security
- **On-Chain Verification**: All payments verified by smart contract
- **Replay Protection**: Prevents double-spending attacks
- **Secure Storage**: Private keys managed by Privy infrastructure

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy Smart Contract
```bash
# Deploy to Movement testnet
movement move publish --package-dir src/smart-contracts
```

### Environment Variables for Production
```env
VITE_PRIVY_APP_ID=prod_privy_app_id
VITE_MOVEMENT_RPC_URL=https://mainnet.movementlabs.xyz
VITE_MOVEMENT_CHAIN_ID=177
VITE_CONTRACT_ADDRESS=deployed_contract_address
```

## 📱 Demo Flow

### For Judges/Users
1. **Visit Homepage**: See landing page explaining survey rewards concept
2. **Browse Feed**: View available surveys with reward amounts and time estimates
3. **Connect Wallet**: One-click setup with email/social login
4. **Complete Survey**: Answer questions and earn 0.5 MOVE instantly
5. **View Dashboard**: Check total earnings and completed surveys
6. **Tip Creator**: Send 0.2 MOVE tip to support survey creator

### Key Demo Points
- **2-minute setup**: From landing to first unlock
- **30-second understanding**: Clear value proposition
- **Immediate trust**: Professional UI and smooth UX

## 🔍 Technical Highlights

### Blockchain Integration
- **Movement SDK**: Direct blockchain interaction layer
- **Gas Optimization**: Efficient smart contract design
- **Event Emission**: Real-time transaction tracking

### State Management
- **Zustand Stores**: Lightweight, performant state management
- **Optimistic Updates**: Immediate UI feedback
- **Error Handling**: Comprehensive error states and recovery

### Performance
- **Code Splitting**: Lazy-loaded components
- **Image Optimization**: Responsive image loading
- **Animation Performance**: Hardware-accelerated animations

## 🎯 Hackathon Readiness

### Deliverables ✅
- [x] Working deployed application
- [x] Movement testnet smart contract
- [x] Comprehensive README with setup instructions
- [x] Live demo URL
- [x] Clear pitch explanation

### Judge Experience
- **2-minute demo**: Complete user flow demonstration
- **30-second pitch**: Clear problem and solution explanation
- **Immediate trust**: Professional, production-ready feel

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Movement Labs for blockchain infrastructure
- Privy for embedded wallet solutions
- React and Tailwind CSS communities
- All contributors and testers

---

**PayPost** - Turning opinions into earnings with Web3 survey rewards 🚀

## 💡 Survey Rewards Concept Explained

### The Problem
Traditional survey platforms:
- Pay users very little (pennies) for their time
- Have complex payout systems with high minimums
- Don't provide instant gratification
- Lack transparency in reward distribution

### Our Solution
PayPost revolutionizes survey participation by:
- **Instant Rewards**: Earn MOVE tokens immediately upon completion
- **Fair Compensation**: Researchers set competitive reward amounts
- **Transparent Blockchain**: All rewards tracked on-chain
- **Low Barriers**: No minimum payout thresholds
- **Real Value**: Earn cryptocurrency you can use anywhere

### How It Works
1. **Researchers** create surveys and fund them with MOVE tokens
2. **Participants** complete surveys and earn rewards instantly
3. **Smart contracts** ensure automatic, transparent payouts
4. **Community** benefits from valuable research insights

### Value Proposition
- **For Participants**: Turn spare time into crypto earnings
- **For Researchers**: Access engaged, incentivized respondents
- **For Platform**: Create sustainable Web3 economy around data collection

This model creates a win-win ecosystem where quality data collection meets fair compensation, powered by blockchain transparency and instant settlements.