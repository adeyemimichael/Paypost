import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PrivyProvider, usePrivy } from '@privy-io/react-auth';
import { ToastContainer } from 'react-toastify';
import { useUserStore } from './stores/userStore';
import { useThemeStore } from './stores/themeStore';
import { privyService } from './services/privyService';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import FeedPage from './pages/FeedPage';
import CreatorsPage from './pages/CreatorsPage';
import CreatorApplicationPage from './pages/CreatorApplicationPage';
import HowItWorksPage from './pages/HowItWorksPage';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

const AppContent = () => {
  const { setUser } = useUserStore();
  const { initializeTheme } = useThemeStore();
  const privy = usePrivy();

  useEffect(() => {
    // Initialize theme on app start
    initializeTheme();
  }, [initializeTheme]);

  useEffect(() => {
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
  }, [privy?.ready, privy?.authenticated, privy?.user?.id]); // Fixed dependencies

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
            <Route path="/how-it-works" element={<HowItWorksPage />} />
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
      onSuccess={(user) => {
        console.log('User authenticated:', user);
      }}
      config={{
        loginMethods: ['email', 'google', 'twitter'],
        appearance: {
          theme: 'light',
          accentColor: '#6366f1',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
      }}
    >
      <AppContent />
    </PrivyProvider>
  );
};

export default App;