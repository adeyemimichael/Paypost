import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PrivyProvider, usePrivy } from '@privy-io/react-auth';
import { ToastContainer } from 'react-toastify';
import { useUserStore } from './stores/userStore';
import { usePostStore } from './stores/postStore';
import { useWalletStore } from './stores/walletStore';
import NewNavbar from './components/NewNavbar';
import RoleSelectionModal from './components/RoleSelectionModal';
import Home from './pages/Home';
import FeedPage from './pages/FeedPage';
import CreatorsPage from './pages/CreatorsPage';
import CreatorApplicationPage from './pages/CreatorApplicationPage';
import CreateSurveyPage from './pages/CreateSurveyPage';
import CreatorDashboard from './components/CreatorDashboard';
import StatusPage from './pages/StatusPage';
import TestPage from './pages/TestPage';
import WalletStatusPage from './pages/WalletStatusPage';
import AboutPage from './pages/AboutPage';
import HowItWorksPage from './pages/HowItWorksPage';
import FAQPage from './pages/FAQPage';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

const AppContent = () => {
  const { authenticated, ready, user } = usePrivy();
  const { loadUserRole, userRole, setUserRole } = useUserStore();
  const { initialize: initializePostStore } = usePostStore();
  const { initializeWallet } = useWalletStore();
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [pendingLogin, setPendingLogin] = useState(false);

  useEffect(() => {
    if (ready) {
      // Initialize services
      loadUserRole();
      
      // Initialize post store (will check Supabase availability)
      initializePostStore();
    }
  }, [ready, loadUserRole, initializePostStore]);

  // Initialize wallet and refresh post store when user authenticates
  useEffect(() => {
    if (authenticated && ready && user?.id) {
      console.log('🔄 User authenticated, initializing wallet...');
      
      // Check for pending role selection
      const pendingRole = localStorage.getItem('paypost_pending_role');
      const userEmail = user.email?.address;
      
      console.log('📋 User authentication data:', {
        userId: user.id,
        email: !!userEmail,
        pendingRole,
        currentRole: userRole
      });
      
      // Initialize wallet with user data
      initializeWallet(user.id, userEmail, pendingRole || userRole).then((wallet) => {
        if (wallet?.address) {
          console.log('✅ Wallet initialized, refreshing post store');
          // Reinitialize post store with user address
          initializePostStore(wallet.address);
        }
        
        // Handle pending role after wallet initialization
        if (pendingRole && !userRole) {
          console.log('🔄 Setting pending role:', pendingRole);
          setUserRole(pendingRole);
          localStorage.removeItem('paypost_pending_role');
          localStorage.removeItem('paypost_role_selection_timestamp');
        }
      }).catch(error => {
        console.error('❌ Failed to initialize wallet:', error);
      });
    }
  }, [authenticated, ready, user?.id, user?.email?.address, initializeWallet, initializePostStore, userRole, setUserRole]);

  // Handle role selection flow
  useEffect(() => {
    // Check for pending role first
    const pendingRole = localStorage.getItem('paypost_pending_role');
    const roleTimestamp = localStorage.getItem('paypost_role_selection_timestamp');
    
    // Clear old pending roles (older than 1 hour)
    if (roleTimestamp) {
      const timestamp = new Date(roleTimestamp);
      const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
      if (timestamp < hourAgo) {
        localStorage.removeItem('paypost_pending_role');
        localStorage.removeItem('paypost_role_selection_timestamp');
      }
    }
    
    // Show role modal if user is authenticated but has no role and no pending role
    if (authenticated && !userRole && !pendingRole && !pendingLogin) {
      console.log('🔄 Showing role selection modal');
      setShowRoleModal(true);
    } else {
      setShowRoleModal(false);
    }
  }, [authenticated, userRole, pendingLogin]);

  const handleRoleSelection = (selectedRole) => {
    console.log('🔄 Handling role selection:', selectedRole);
    setUserRole(selectedRole);
    setShowRoleModal(false);
    setPendingLogin(false);
    
    // Clear any pending role data
    localStorage.removeItem('paypost_pending_role');
    localStorage.removeItem('paypost_role_selection_timestamp');
  };

  const handlePreLoginRoleSelection = (selectedRole) => {
    console.log('🔄 Handling pre-login role selection:', selectedRole);
    // Store the selected role temporarily
    localStorage.setItem('paypost_pending_role', selectedRole);
    localStorage.setItem('paypost_role_selection_timestamp', new Date().toISOString());
    setPendingLogin(true);
    setShowRoleModal(false);
  };

  // Check for pending role after login (backup mechanism)
  useEffect(() => {
    if (authenticated && pendingLogin) {
      const pendingRole = localStorage.getItem('paypost_pending_role');
      if (pendingRole && !userRole) {
        console.log('🔄 Processing pending role after login:', pendingRole);
        setUserRole(pendingRole);
        localStorage.removeItem('paypost_pending_role');
        localStorage.removeItem('paypost_role_selection_timestamp');
      }
      setPendingLogin(false);
    }
  }, [authenticated, pendingLogin, setUserRole, userRole]);

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
            <Route path="/creator-dashboard" element={<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><CreatorDashboard /></div>} />
            <Route path="/apply-creator" element={<CreatorApplicationPage />} />
            <Route path="/create-survey" element={<CreateSurveyPage />} />
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
        // Simple email and social login only - Privy handles wallet creation
        loginMethods: ['email', 'google'],
        appearance: {
          theme: 'light',
          accentColor: '#6366f1',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          requireUserPasswordOnCreate: false,
        },
      }}
    >
      <AppContent />
    </PrivyProvider>
  );
};

export default App;