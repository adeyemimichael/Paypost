import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PrivyProvider, usePrivy } from '@privy-io/react-auth';
import { ToastContainer } from 'react-toastify';
import { useUserStore } from './stores/userStore';
import { privyService } from './services/privyService';
import { movementService } from './services/movementService';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import FeedPage from './pages/FeedPage';
import CreatorsPage from './pages/CreatorsPage';
import CreatorApplicationPage from './pages/CreatorApplicationPage';
import CreateSurveyPage from './pages/CreateSurveyPage';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

const AppContent = () => {
  const { setUser, loadUserRole } = useUserStore();
  const privy = usePrivy();

  useEffect(() => {
    // Initialize services
    movementService.initialize();
    loadUserRole();
    
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
  }, [privy?.ready, privy?.authenticated, privy?.user?.id, loadUserRole]);

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
            id: 1,
            name: 'Ethereum',
            network: 'homestead',
            nativeCurrency: {
              name: 'Ether',
              symbol: 'ETH',
              decimals: 18,
            },
            rpcUrls: {
              default: {
                http: ['https://eth-mainnet.g.alchemy.com/v2/demo'],
              },
            },
            blockExplorers: {
              default: {
                name: 'Etherscan',
                url: 'https://etherscan.io',
              },
            },
          },
          {
            id: 11155111,
            name: 'Sepolia',
            network: 'sepolia',
            nativeCurrency: {
              name: 'Sepolia Ether',
              symbol: 'SEP',
              decimals: 18,
            },
            rpcUrls: {
              default: {
                http: ['https://eth-sepolia.g.alchemy.com/v2/demo'],
              },
            },
            blockExplorers: {
              default: {
                name: 'Etherscan',
                url: 'https://sepolia.etherscan.io',
              },
            },
            testnet: true,
          },
        ],
      }}
    >
      <AppContent />
    </PrivyProvider>
  );
};

export default App;