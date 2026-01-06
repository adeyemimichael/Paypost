import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { usePrivy } from '@privy-io/react-auth';
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
  HelpCircle,
  Coins
} from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import { useMovementWallet } from '../hooks/useMovementWallet';
import { notify } from '../utils/notify';
import Button from './Button';

const Navbar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const { login, logout, authenticated, user: privyUser } = usePrivy();
  const { aptosWallet, isCreating: isCreatingWallet } = useMovementWallet();
  
  const { 
    userRole, 
    setUserRole, 
    setUser, 
    isCreator,
    loadUserRole,
    balance,
    fetchBalance,
    updateBalance
  } = useUserStore();

  // Load user role and balance on mount/auth change
  useEffect(() => {
    if (authenticated && privyUser) {
      // Use the Aptos wallet from our custom hook if available
      if (aptosWallet) {
        console.log("Using Aptos Wallet:", aptosWallet.address);
        const userWithAptos = {
          ...privyUser,
          wallet: aptosWallet
        };
        setUser(userWithAptos);
      } else {
        setUser(privyUser);
      }

      loadUserRole();
      fetchBalance();
    } else {
      setUser(null);
    }
  }, [authenticated, privyUser, aptosWallet, setUser, loadUserRole, fetchBalance]);

  const handleConnect = async () => {
    try {
      login();
    } catch (error) {
      console.error('Connection failed:', error);
      notify.error(`Failed to connect: ${error.message}`);
    }
  };

  const handleDisconnect = async () => {
    try {
      await logout();
      setUserRole(null);
      setShowUserMenu(false);
    } catch (error) {
      console.error('Disconnect failed:', error);
      notify.error('Failed to disconnect wallet');
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

  const participantNavigation = [
    // Removed dashboard - will be accessible through profile menu later
  ];

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Helper to get display identifier (email or wallet)
  const getUserIdentifier = () => {
    if (privyUser?.email?.address) return privyUser.email.address;
    if (privyUser?.wallet?.address) return formatAddress(privyUser.wallet.address);
    return 'User';
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
            {/* Balance Display */}
            {authenticated && (
              <div className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg px-3 py-2 border border-green-200">
                <Wallet className="w-4 h-4 text-green-600" />
                <span className="font-bold text-green-700">
                  {balance.toFixed(2)} MOVE
                </span>
              </div>
            )}

            {/* Connect/User Menu */}
            {!authenticated ? (
              <Button
                onClick={handleConnect}
                size="sm"
              >
                <Wallet className="w-4 h-4 mr-2" />
                Login
              </Button>
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
                      {getUserIdentifier()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {userRole || 'No role'} • {balance.toFixed(2)} MOVE
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
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {getUserIdentifier()}
                        </div>
                        
                        {/* Explicit Wallet Address Display */}
                        {privyUser?.wallet ? (
                          <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200">
                            <div className="text-xs text-gray-500 mb-1">Wallet Address</div>
                            <div className="flex items-center justify-between">
                              <code className="text-xs text-gray-700 truncate mr-2">
                                {formatAddress(privyUser.wallet.address)}
                              </code>
                              <button 
                                onClick={() => {
                                  navigator.clipboard.writeText(privyUser.wallet.address);
                                  notify.success('Address copied!');
                                }}
                                className="text-blue-600 hover:text-blue-700 text-xs font-medium"
                              >
                                Copy
                              </button>
                            </div>
                            {privyUser.wallet.chainType && (
                              <div className="text-[10px] text-gray-400 mt-1 uppercase">
                                Type: {privyUser.wallet.chainType}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200">
                            <div className="text-xs text-gray-600">
                              Wallet will be created automatically on login
                            </div>
                          </div>
                        )}

                        <div className="text-xs text-gray-500 mt-2">
                          Balance: {balance.toFixed(2)} MOVE
                        </div>
                        <div className="text-xs text-gray-500">
                          Role: {userRole || 'Not set'}
                        </div>
                      </div>

                      {/* Disconnect */}
                      {isCreator() && (
                        <button
                          onClick={() => {
                            const currentBalance = balance;
                            updateBalance(currentBalance + 100);
                            notify.success('Added 100 MOVE tokens!');
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 border-b border-gray-100"
                        >
                          <Coins className="w-4 h-4 inline mr-2" />
                          Get 100 MOVE (Faucet)
                        </button>
                      )}
                      
                      <button
                        onClick={handleDisconnect}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4 inline mr-2" />
                        Logout
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

            {/* Mobile balance info */}
            {authenticated && (
              <div className="px-4 py-3 border-t border-gray-200">
                <div className="flex items-center space-x-2 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg px-3 py-2 border border-green-200">
                  <Wallet className="w-4 h-4 text-green-600" />
                  <span className="font-bold text-green-700">
                    {balance.toFixed(2)} MOVE
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;