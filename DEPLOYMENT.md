# PayPost Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Privy account (for wallet integration)
- Movement testnet wallet with MOVE tokens

## 📦 Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd paypost

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

## 🔧 Environment Configuration

Create a `.env` file in the root directory:

```env
VITE_PRIVY_APP_ID=your_privy_app_id_here
VITE_MOVEMENT_RPC_URL=https://testnet.movementlabs.xyz
VITE_MOVEMENT_CHAIN_ID=177
VITE_CONTRACT_ADDRESS=your_deployed_contract_address
```

### Getting Privy App ID
1. Visit [Privy Dashboard](https://dashboard.privy.io/)
2. Create a new app
3. Copy your App ID
4. Configure allowed domains (localhost:5173 for development)

## 🏗️ Building for Production

```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

The build output will be in the `dist/` directory.

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Option 2: Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

### Option 3: GitHub Pages
```bash
# Build with base path
npm run build -- --base=/paypost/

# Deploy to gh-pages branch
npm run deploy
```

## 📝 Smart Contract Deployment

### Deploy to Movement Testnet

1. **Install Movement CLI**
```bash
# Follow Movement documentation
curl -fsSL https://get.movementlabs.xyz | sh
```

2. **Compile Contract**
```bash
cd src/smart-contracts
movement move compile
```

3. **Deploy Contract**
```bash
movement move publish \
  --package-dir . \
  --named-addresses PayPost=<your-address>
```

4. **Update Environment**
```bash
# Copy deployed contract address to .env
VITE_CONTRACT_ADDRESS=<deployed-address>
```

## 🧪 Testing

### Run Development Server
```bash
npm run dev
```

### Test Survey Flow
1. Open `http://localhost:5173`
2. Click "Get Started"
3. Connect wallet via Privy
4. Browse available surveys
5. Complete a survey
6. Verify reward in dashboard

### Test Smart Contract
```bash
# Run Move tests
cd src/smart-contracts
movement move test
```

## 🔐 Security Checklist

- [ ] Update `.env` with production values
- [ ] Never commit `.env` file
- [ ] Enable HTTPS in production
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable CSP headers
- [ ] Audit smart contract before mainnet

## 📊 Monitoring

### Analytics Setup
1. Add Google Analytics or Mixpanel
2. Track key metrics:
   - Survey completions
   - Wallet connections
   - Earnings distributed
   - User retention

### Error Tracking
1. Set up Sentry or similar
2. Monitor:
   - Transaction failures
   - Wallet connection errors
   - API errors

## 🎯 Performance Optimization

### Frontend
- Enable code splitting
- Optimize images (use WebP)
- Implement lazy loading
- Cache static assets
- Use CDN for assets

### Smart Contract
- Optimize gas usage
- Batch operations where possible
- Use events for off-chain indexing

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## 📱 Mobile Optimization

- Test on iOS Safari and Chrome
- Verify wallet connection on mobile
- Test survey UX on small screens
- Optimize touch targets (min 44x44px)
- Test offline behavior

## 🐛 Troubleshooting

### Common Issues

**Issue: Privy not loading**
- Check App ID is correct
- Verify domain is whitelisted
- Check browser console for errors

**Issue: Transaction failing**
- Verify wallet has MOVE tokens
- Check contract address is correct
- Ensure RPC URL is accessible

**Issue: Build errors**
- Clear node_modules and reinstall
- Check Node.js version (18+)
- Verify all dependencies installed

## 📞 Support

- Documentation: [Link to docs]
- Discord: [Link to Discord]
- Email: support@paypost.xyz

## 🎉 Launch Checklist

- [ ] Smart contract deployed and verified
- [ ] Frontend deployed to production
- [ ] Environment variables configured
- [ ] Privy integration tested
- [ ] Survey creation tested
- [ ] Reward distribution verified
- [ ] Mobile experience tested
- [ ] Analytics configured
- [ ] Error tracking enabled
- [ ] Documentation updated
- [ ] Social media announced
- [ ] Demo video created

---

**PayPost** - Ready to revolutionize survey rewards! 🚀