import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PrivyProvider } from '@privy-io/react-auth';
import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react';
import { ToastContainer } from 'react-toastify';
import { useUserStore } from './stores/newUserStore';
import { usePostStore } from './stores/postStore';
import { realMovementService } from './services/realMovementService';
import NewNavbar from './components/NewNavbar';
import TransactionModeToggle from './components/TransactionModeToggle';
import WalletDebugInfo from './components/WalletDebugInfo';
import Home from './pages/Home';
import FeedPage from './pages/FeedPage';
import CreatorsPage from './pages/CreatorsPage';
import CreatorApplicationPage from './pages/CreatorApplicationPage';
import CreateSurveyPage from './pages/CreateSurveyPage';
import AboutPage from './pages/AboutPage';
import HowItWorksPage from './pages/HowItWorksPage';
import FAQPage from './pages/FAQPage';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

const AppContent = () => {
  const { loadUserRole } = useUserStore();
  const { initialize: initializePostStore } = usePostStore();

  useEffect(() => {
    // Initialize services
    realMovementService.initialize();
    loadUserRole();
    
    // Initialize post store (will check Supabase availability)
    initializePostStore();
  }, [loadUserRole, initializePostStore]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <NewNavbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/creators" element={<CreatorsPage />} />
            <Route path="/apply-creator" element={<CreatorApplicationPage />} />
            <Route path="/create-survey" element={<CreateSurveyPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        
        {/* Development Tools */}
        {import.meta.env.DEV && (
          <>
            <TransactionModeToggle />
            <WalletDebugInfo />
          </>
        )}
      </div>
    </Router>
  );
};

const App = () => {
  const privyAppId = import.meta.env.VITE_PRIVY_APP_ID;

  // Wallet adapters for native Movement wallets
  const wallets = [];

  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        // Enable email, Google, and wallet login methods
        loginMethods: ['email', 'google', 'wallet'],
        appearance: {
          theme: 'light',
          accentColor: '#6366f1',
          walletList: ['metamask', 'coinbase_wallet', 'wallet_connect'],
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          requireUserPasswordOnCreate: false,
        },
        // Configure supported chains for Movement
        supportedChains: [
          {
            id: 250,
            name: 'Movement Testnet',
            network: 'movement-testnet',
            nativeCurrency: {
              name: 'MOVE',
              symbol: 'MOVE',
              decimals: 8,
            },
            rpcUrls: {
              default: {
                http: ['https://testnet.movementnetwork.xyz/v1'],
              },
            },
            blockExplorers: {
              default: {
                name: 'Movement Explorer',
                url: 'https://explorer.movementnetwork.xyz',
              },
            },
            testnet: true,
          },
        ],
        // Configure external wallets
        externalWallets: {
          coinbaseWallet: {
            connectionOptions: {
              appName: 'PayPost',
            },
          },
          walletConnect: {
            connectionOptions: {
              projectId: 'paypost-movement-integration',
            },
          },
        },
      }}
    >
      <AptosWalletAdapterProvider 
        wallets={wallets}
        autoConnect={true}
        onError={(error) => {
          console.warn('Wallet adapter error:', error);
        }}
      >
        <AppContent />
      </AptosWalletAdapterProvider>
    </PrivyProvider>
  );
};

export default App;