import { motion } from 'framer-motion';
import { Wallet, LogOut, User } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { formatAddress } from '../utils/formatters';
import Button from './Button';

const Navbar = () => {
  const { ready, authenticated, user, login, logout } = usePrivy();

  const handleConnect = async () => {
    try {
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
      className="bg-white border-b border-gray-200 sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div 
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
          >
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-movement-600">PayPost</h1>
            </div>
          </motion.div>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <a href="#" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Feed
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Creators
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                About
              </a>
            </div>
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {ready && authenticated ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2">
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {formatAddress(user?.wallet?.address)}
                  </span>
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