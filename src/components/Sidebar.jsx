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
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import { useWalletStore } from '../stores/walletStore';
import { notify } from '../utils/notify';
import Button from './Button';

const Sidebar = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const { login, logout, authenticated, user: privyUser } = usePrivy();
  const { wallet, balance, isLoading, fetchBalance } = useWalletStore();
  
  const { 
    userRole, 
    setUserRole, 
    setUser, 
    isCreator,
    loadUserRole
  } = useUserStore();

  // Load user role on mount/auth change
  useEffect(() => {
    if (authenticated && privyUser) {
      setUser(privyUser);
      loadUserRole();
    } else {
      setUser(null);
    }
  }, [authenticated, privyUser, setUser, loadUserRole]);

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

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getUserIdentifier = () => {
    if (privyUser?.email?.address) return privyUser.email.address;
    if (wallet?.address) return formatAddress(wallet.address);
    return 'User';
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
      >
        {isMobileOpen ? (
          <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
        ) : (
          <Menu className="w-6 h-6 text-gray-600 dark:text-gray-400" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.div
        initial={{ x: -280 }}
        animate={{ 
          x: isMobileOpen || window.innerWidth >= 768 ? 0 : -280 
        }}
        className={`
          fixed left-0 top-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 
          shadow-lg z-50 flex flex-col transition-all duration-300 ease-in-out
          ${isCollapsed && window.innerWidth >= 768 ? 'w-16' : 'w-64'}
          md:relative
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          {(!isCollapsed || window.innerWidth < 768) && (
            <Link to="/" className="flex items-center" onClick={() => setIsMobileOpen(false)}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
              >
                PayPost
              </motion.div>
            </Link>
          )}
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:block p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {/* Main Navigation */}
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`
                  flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800'
                  }
                  ${isCollapsed && window.innerWidth >= 768 ? 'justify-center' : ''}
                `}
                title={isCollapsed && window.innerWidth >= 768 ? item.name : ''}
              >
                <item.icon className={`w-5 h-5 ${isCollapsed && window.innerWidth >= 768 ? '' : 'mr-3'}`} />
                {(!isCollapsed || window.innerWidth < 768) && item.name}
              </Link>
            );
          })}

              {/* Creator Navigation */}
              {isCreator() && (
                <>
                  {(!isCollapsed || window.innerWidth < 768) && (
                    <div className="pt-4 pb-2">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Creator Tools
                      </p>
                    </div>
                  )}
                  {creatorNavigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsMobileOpen(false)}
                        className={`
                          flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200
                          ${isActive
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800'
                          }
                          ${isCollapsed && window.innerWidth >= 768 ? 'justify-center' : ''}
                        `}
                        title={isCollapsed && window.innerWidth >= 768 ? item.name : ''}
                      >
                        <item.icon className={`w-5 h-5 ${isCollapsed && window.innerWidth >= 768 ? '' : 'mr-3'}`} />
                        {(!isCollapsed || window.innerWidth < 768) && item.name}
                      </Link>
                    );
                  })}
                </>
              )}
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-3">
          {/* Balance Display */}
          {authenticated && (!isCollapsed || window.innerWidth < 768) && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/30 dark:to-blue-900/30 rounded-lg p-3 border border-green-200 dark:border-green-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Wallet className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-bold text-green-700 dark:text-green-300">
                    {isLoading ? '...' : `${(balance || 0).toFixed(2)}`} MOVE
                  </span>
                </div>
                <button
                  onClick={() => {
                    console.log('Refreshing balance...');
                    fetchBalance();
                  }}
                  className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 text-xs"
                  title="Refresh balance"
                >
                  🔄
                </button>
              </div>
            </div>
          )}

          {/* User Section */}
          {!authenticated ? (
            <Button
              onClick={handleConnect}
              size="sm"
              className={`w-full ${isCollapsed && window.innerWidth >= 768 ? 'px-2' : ''}`}
            >
              <Wallet className={`w-4 h-4 ${isCollapsed && window.innerWidth >= 768 ? '' : 'mr-2'}`} />
              {(!isCollapsed || window.innerWidth < 768) && 'Login'}
            </Button>
          ) : (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`
                  w-full flex items-center space-x-3 px-3 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 
                  dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors
                  ${isCollapsed && window.innerWidth >= 768 ? 'justify-center' : ''}
                `}
                title={isCollapsed && window.innerWidth >= 768 ? getUserIdentifier() : ''}
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
                {(!isCollapsed || window.innerWidth < 768) && (
                  <>
                    <div className="flex-1 text-left min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {getUserIdentifier()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {userRole || 'No role'}
                      </div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                  </>
                )}
              </button>

              {/* User dropdown menu */}
              <AnimatePresence>
                {showUserMenu && (!isCollapsed || window.innerWidth < 768) && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50"
                  >
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {getUserIdentifier()}
                      </div>
                      
                      {/* Wallet Address Display */}
                      {wallet ? (
                        <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Movement Wallet
                          </div>
                          <div className="flex items-center justify-between">
                            <code className="text-xs text-gray-700 dark:text-gray-300 truncate mr-2">
                              {formatAddress(wallet.address)}
                            </code>
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(wallet.address);
                                notify.success('Address copied!');
                              }}
                              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-xs font-medium"
                            >
                              Copy
                            </button>
                          </div>
                          <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                            ✅ Movement wallet
                          </div>
                        </div>
                      ) : (
                        <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Wallet will be created automatically on login
                          </div>
                        </div>
                      )}

                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Role: {userRole || 'Not set'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Balance: {isLoading ? '...' : `${(balance || 0).toFixed(2)}`} MOVE
                      </div>
                    </div>

                    {/* Disconnect */}
                    <button
                      onClick={handleDisconnect}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      <LogOut className="w-4 h-4 inline mr-2" />
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>

      {/* Overlay for mobile */}
      <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40" />
    </>
  );
};

export default Sidebar;