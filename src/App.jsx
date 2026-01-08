import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PrivyProvider, usePrivy } from '@privy-io/react-auth';
import { ToastContainer } from 'react-toastify';
import { useUserStore } from './stores/userStore';
import { usePostStore } from './stores/postStore';
import { walletService } from './services/walletService';
import NewNavbar from './components/NewNavbar';
import RoleSelectionModal from './components/RoleSelectionModal';
import Home from './pages/Home';
import FeedPage from './pages/FeedPage';
import CreatorsPage from './pages/CreatorsPage';
import CreatorApplicationPage from './pages/CreatorApplicationPage';
import CreateSurveyPage from './pages/CreateSurveyPage';
import StatusPage from './pages/StatusPage';
import TestPage from './pages/TestPage';
import AboutPage from './pages/AboutPage';
import HowItWorksPage from './pages/HowItWorksPage';
import FAQPage from './pages/FAQPage';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

const AppContent = () => {
  const { authenticated, ready, user } = usePrivy();
  const { loadUserRole, userRole, setUserRole } = useUserStore();
  const { initialize: initializePostStore } = usePostStore();
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [pendingLogin, setPendingLogin] = useState(false);
  const [walletSetupComplete, setWalletSetupComplete] = useState(false);

  useEffect(() => {
    if (ready) {
      // Initialize services
      loadUserRole();
      
      // Initialize post store (will check Supabase availability)
      initializePostStore();
    }
  }, [ready, loadUserRole, initializePostStore]);

  // Auto-create Aptos wallet when user authenticates
  useEffect(() => {
    const setupAptosWallet = async () => {
      if (authenticated && ready && user?.id && !walletSetupComplete) {
        try {
          console.log('Setting up Aptos wallet for user:', user.id);
          const aptosWallet = await walletService.ensureAptosWallet(user.id);
          console.log('Aptos wallet ready:', aptosWallet);
          setWalletSetupComplete(true);
        } catch (error) {
          console.error('Failed to setup Aptos wallet:', error);
          // Don't block the app if wallet creation fails
          setWalletSetupComplete(true);
        }
      }
    };

    setupAptosWallet();
  }, [authenticated, ready, user?.id, walletSetupComplete]);

  // Handle role selection flow
  useEffect(() => {
    // If user is authenticated but has no role, show role selection
    if (authenticated && !userRole && !pendingLogin) {
      setShowRoleModal(true);
    } else {
      setShowRoleModal(false);
    }
  }, [authenticated, userRole, pendingLogin]);

  const handleRoleSelection = (selectedRole) => {
    setUserRole(selectedRole);
    setShowRoleModal(false);
    setPendingLogin(false);
  };

  const handlePreLoginRoleSelection = (selectedRole) => {
    // Store the selected role temporarily
    localStorage.setItem('paypost_pending_role', selectedRole);
    setPendingLogin(true);
    setShowRoleModal(false);
  };

  // Check for pending role after login
  useEffect(() => {
    if (authenticated && pendingLogin) {
      const pendingRole = localStorage.getItem('paypost_pending_role');
      if (pendingRole) {
        setUserRole(pendingRole);
        localStorage.removeItem('paypost_pending_role');
      }
      setPendingLogin(false);
    }
  }, [authenticated, pendingLogin, setUserRole]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading PayPost...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <NewNavbar />
        <main>
          <Routes>
            <Route path="/" element={<Home onRoleSelect={handlePreLoginRoleSelection} />} />
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/creators" element={<CreatorsPage />} />
            <Route path="/apply-creator" element={<CreatorApplicationPage />} />
            <Route path="/create-survey" element={<CreateSurveyPage />} />
            <Route path="/status" element={<StatusPage />} />
            <Route path="/test" element={<TestPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        
        {/* Role Selection Modal - shown after login if no role is set */}
        <RoleSelectionModal 
          isOpen={showRoleModal} 
          onClose={() => setShowRoleModal(false)}
          onRoleSelect={handleRoleSelection}
        />
        
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
        // Enable email and Google login
        loginMethods: ['email', 'google'],
        appearance: {
          theme: 'light',
          accentColor: '#6366f1',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          requireUserPasswordOnCreate: false,
        },
        // Google OAuth configuration (optional customization)
        oauth: {
          google: {
            // You can customize Google OAuth here if needed
          }
        }
      }}
    >
      <AppContent />
    </PrivyProvider>
  );
};

export default App;