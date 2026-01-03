import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  Home, 
  FileText, 
  Users, 
  Plus, 
  Wallet,
  LogOut,
  User,
  ChevronDown,
  Info,
  HelpCircle
} from 'lucide-react';
import { usePayPostWallet } from '../hooks/usePayPostWallet';
import { useUserStore } from '../stores/newUserStore';
import { notify } from '../utils/notify';
import Button from './Button';
import WalletBalance from './WalletBalance';

const Navbar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  
  const {
    isConnected,
    walletAddress,
    balance,
    user,
    connectWallet,
    disconnectWallet,
    isLoading,
    getWalletType
  } = usePayPostWallet();
  
  const { 
    userRole, 
    setUserRole, 
    setUser, 
    setBalance,
    isCreator,
    requiresDatabaseRegistration 
  } = useUserStore();

  // Sync wallet state with user store
  useEffect(() => {
    if (isConnected && user) {
      setUser(user);
      setBalance(balance);
    } else {
      setUser(null);
      setBalance(0);
    }
  }, [isConnected, user, balance, setUser, setBalance]);

  const handleConnect = async (method = 'auto') => {
    if (isLoading) return;
    
    try {
      await connectWallet(method);
      
      // Show role selection modal for new users
      if (!userRole) {
        setShowRoleModal(true);
      }
    } catch (error) {
      console.error('Connection failed:', error);
      notify.error(`Failed to connect: ${error.message}`);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
      setUserRole(null);
      setShowUserMenu(false);
    } catch (error) {
      console.error('Disconnect failed:', error);
      notify.error('Failed to disconnect wallet');
    }
  };

  const handleRoleSelect = async (role) => {
    try {
      setUserRole(role);
      setShowRoleModal(false);
      
      // Register user in database if creator
      if (role === 'creator' && walletAddress) {
        await registerUserInDatabase(role);
      }
      
      notify.success(`Welcome as a ${role}!`);
    } catch (error) {
      console.error('Role selection failed:', error);
      notify.error('Failed to set user role');
    }
  };

  const registerUserInDatabase = async (role) => {
    try {
      const { supabaseService } = await import('../services/supabaseService');
      
      const initialized = await supabaseService.initialize();
      if (!initialized) {
        throw new Error('Database service not available');
      }
      
      const dbUser = await supabaseService.getOrCreateUser(
        walletAddress,
        user?.email || `${walletAddress.slice(0, 8)}@paypost.xyz`,
        role,
        user?.id
      );
      
      if (dbUser) {
        // Update user with database info
        setUser({
          ...user,
          dbId: dbUser.id,
          dbUser
        });
        console.log('✅ User registered in database:', dbUser.id);
      }
    } catch (error) {
      console.error('❌ Database registration failed:', error);
      if (role === 'creator') {
        notify.error('Database registration failed. Some features may be limited.');
      }
    }
  };

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Feed', href: '/feed', icon: FileText },
    { name: 'Creators', href: '/creators', icon: Users },
    { name: 'About', href: '/about', icon: Info },
    { name: 'FAQ', href: '/faq', icon: HelpCircle },
  ];

  const creatorNavigation = [
    { name: 'Create Survey', href: '/create-survey', icon: Plus },
  ];

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getWalletTypeDisplay = () => {
    const type = getWalletType();
    return type === 'privy' ? 'Privy' : type === 'native' ? 'Native' : 'Unknown';
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and primary navigation */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
              >
                PayPost
              </motion.div>
            </Link>

            {/* Desktop navigation */}
            <div className="hidden md:ml-8 md:flex md:space-x-4">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
                      ${isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }
                    `}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}

              {/* Creator-only navigation */}
              {isCreator() && creatorNavigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
                      ${isActive
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }
                    `}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right side - Wallet and user menu */}
          <div className="flex items-center space-x-4">
            {/* Wallet Balance */}
            {isConnected && (
              <WalletBalance 
                className="hidden sm:flex"
                showLabel={false}
                size="sm"
              />
            )}

            {/* Connect/User Menu */}
            {!isConnected ? (
              <div className="flex space-x-2">
                <Button
                  onClick={() => handleConnect('privy')}
                  loading={isLoading}
                  size="sm"
                  className="hidden sm:flex"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
                </Button>
                <Button
                  onClick={() => handleConnect()}
                  loading={isLoading}
                  size="sm"
                  className="sm:hidden"
                >
                  <Wallet className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium text-gray-900">
                      {formatAddress(walletAddress)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {userRole || 'No role'} • {getWalletTypeDisplay()}
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>

                {/* User dropdown menu */}
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                    >
                      {/* User info */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="text-sm font-medium text-gray-900">
                          {formatAddress(walletAddress)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Balance: {balance.toFixed(4)} MOVE
                        </div>
                        <div className="text-xs text-gray-500">
                          Role: {userRole || 'Not set'} • Type: {getWalletTypeDisplay()}
                        </div>
                      </div>

                      {/* Registration warning */}
                      {requiresDatabaseRegistration() && (
                        <div className="px-4 py-2 bg-yellow-50 border-b border-yellow-100">
                          <div className="text-xs text-yellow-800">
                            ⚠️ Database registration required for creators
                          </div>
                        </div>
                      )}

                      {/* Role selection */}
                      {!userRole && (
                        <button
                          onClick={() => setShowRoleModal(true)}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <User className="w-4 h-4 inline mr-2" />
                          Select Role
                        </button>
                      )}

                      {/* Disconnect */}
                      <button
                        onClick={handleDisconnect}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4 inline mr-2" />
                        Disconnect
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-200"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`
                      flex items-center px-3 py-2 rounded-md text-base font-medium
                      ${isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }
                    `}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}

              {isCreator() && creatorNavigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`
                      flex items-center px-3 py-2 rounded-md text-base font-medium
                      ${isActive
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }
                    `}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* Mobile wallet info */}
            {isConnected && (
              <div className="px-4 py-3 border-t border-gray-200">
                <WalletBalance size="sm" />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Role Selection Modal */}
      <AnimatePresence>
        {showRoleModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-25"
                onClick={() => setShowRoleModal(false)}
              />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6"
              >
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Choose Your Role
                  </h3>
                  <p className="text-sm text-gray-600">
                    Select how you want to use PayPost
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => handleRoleSelect('reader')}
                    className="w-full p-4 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900">Participant</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Complete surveys and earn MOVE tokens
                    </div>
                  </button>

                  <button
                    onClick={() => handleRoleSelect('creator')}
                    className="w-full p-4 text-left border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900">Creator</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Create surveys and gather insights
                    </div>
                  </button>
                </div>

                <button
                  onClick={() => setShowRoleModal(false)}
                  className="mt-4 w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Skip for now
                </button>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;