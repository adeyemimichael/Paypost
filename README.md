````text

paypost/
├─ public/
│  ├─ index.html
│  ├─ favicon.ico
│  └─ assets/             # Logos, images, icons
│
├─ src/
│  ├─ assets/             # Static files (images, fonts)
│  ├─ components/         # Reusable UI + notifications
│  │  ├─ Button.jsx
│  │  ├─ Card.jsx
│  │  ├─ Navbar.jsx       # optional toast for wallet status
│  │  ├─ Feed.jsx
│  │  ├─ PostCard.jsx     # toast for unlock notifications
│  │  ├─ TipModal.jsx     # toast for tip success/error
│  │  └─ Loader.jsx
│  │
│  ├─ pages/              # App pages / routes
│  │  ├─ Home.jsx
│  │  ├─ FeedPage.jsx
│  │  ├─ PostDetail.jsx
│  │  ├─ WalletSetup.jsx
│  │  └─ Profile.jsx
│  │
│  ├─ stores/             # Zustand state management
│  │  ├─ userStore.js
│  │  ├─ walletStore.js
│  │  └─ postStore.js
│  │
│  ├─ hooks/              # Custom hooks
│  │  ├─ useWallet.js
│  │  └─ usePosts.js
│  │
│  ├─ services/           # SDK & blockchain integration
│  │  ├─ privyService.js      # wallet login & auth
│  │  └─ movementService.js   # calls smart contract functions
│  │
│  ├─ smart-contracts/    # On-chain logic
│  │  └─ PayPost.move
│  │
│  ├─ utils/              # Helpers & notifications
│  │  ├─ api.js
│  │  ├─ formatters.js
│  │  └─ notify.js        # centralized toast notifications
│  │
│  ├─ animations/         # Framer Motion variants
│  │  └─ fadeIn.js
│  │
│  ├─ App.jsx
│  ├─ index.jsx
│  └─ tailwind.css
│
├─ .env                   # API keys + testnet URLs
├─ package.json
└─ README.md
