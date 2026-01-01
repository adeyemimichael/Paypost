import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PrivyProvider, usePrivy } from '@privy-io/react-auth';
import { ToastContainer } from 'react-toastify';
import { useUserStore } from './stores/userStore';
import { usePostStore } from './stores/postStore';
import { privyService } from './services/privyService';
import { realMovementService } from './services/realMovementService';
import Navbar from './components/Navbar';
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
  const { setUser, loadUserRole } = useUserStore();
  const { initialize: initializePostStore } = usePostStore();
  const privy = usePrivy();

  useEffect(() => {
    // Initialize services
    realMovementService.initialize();
    loadUserRole();
    
    // Initialize post store (will check Supabase availability)
    initializePostStore();
    
    // Initialize Privy service when component mounts
    if (privy) {
      privyService.initialize(privy);
      
      // Set user if already authenticated
      if (privy.ready && privy.authenticated && privy.user) {
        setUser({
          ...privy.user,
          wallet: privy.user.wallet
        });
      }
    }
  }, [privy?.ready, privy?.authenticated, privy?.user?.id, loadUserRole, initializePostStore]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
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
        
        {/* Transaction Mode Toggle - Only show in development */}
        {import.meta.env.DEV && <TransactionModeToggle />}
        
        {/* Wallet Debug Info - Only show in development */}
        {import.meta.env.DEV && <WalletDebugInfo />}
      </div>
    </Router>
  );
};

const App = () => {
  const privyAppId = import.meta.env.VITE_PRIVY_APP_ID;

  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        loginMethods: ['email', 'google', 'twitter'],
        appearance: {
          theme: 'light',
          accentColor: '#6366f1',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
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
        // Remove Solana configuration to fix warnings
        externalWallets: {
          coinbaseWallet: {
            // Only include supported chains
            connectionOptions: {
              appName: 'PayPost',
            },
          },
        },
      }}
    >
      <AppContent />
    </PrivyProvider>
  );
};

export default App;