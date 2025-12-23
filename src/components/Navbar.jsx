import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Wallet, LogOut, User, Plus } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { useUserStore } from '../stores/userStore';
import { formatAddress } from '../utils/formatters';
import Button from './Button';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const { ready, authenticated, logout } = usePrivy();
  const { user, userRole, isCreator, login } = useUserStore();

  const handleConnect = async () => {
    try {
      // This will trigger the role selection modal
      await login();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div 
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
          >
            <Link to="/" className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-movement-600 dark:text-movement-400">PayPost</h1>
            </Link>
          </motion.div>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link to="/feed" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                {isCreator() ? 'My Surveys' : 'Earn Rewards'}
              </Link>
              <Link to="/creators" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Creators
              </Link>
              <Link to="/about" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                About
              </Link>
              {isCreator() && (
                <Link to="/create-survey" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center">
                  <Plus className="w-4 h-4 mr-1" />
                  Create Survey
                </Link>
              )}
            </div>
          </div>

          {/* Wallet Connection & Theme Toggle */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            {ready && authenticated ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
                  <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {formatAddress(user?.wallet?.address)}
                  </span>
                  {userRole && (
                    <span className={`
                      text-xs px-2 py-1 rounded-full font-medium
                      ${userRole === 'creator' 
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' 
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      }
                    `}>
                      {userRole === 'creator' ? 'Creator' : 'Participant'}
                    </span>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDisconnect}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleConnect}
                disabled={!ready}
              >
                <Wallet className="w-4 h-4 mr-2" />
                {ready ? 'Connect Wallet' : 'Loading...'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;