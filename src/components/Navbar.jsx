import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Wallet, LogOut, User, Home, FileText, Users } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { formatAddress } from '../utils/formatters';
import Button from './Button';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const location = useLocation();

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

  const navLinks = [
    {
      to: '/',
      label: 'Home',
      icon: <Home className="w-4 h-4" />
    },
    {
      to: '/feed',
      label: 'Feed',
      icon: <FileText className="w-4 h-4" />
    },
    {
      to: '/creators',
      label: 'Creators',
      icon: <Users className="w-4 h-4" />
    }
  ];

  const isActiveLink = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors duration-300"
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
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`
                    flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${isActiveLink(link.to)
                      ? 'bg-movement-100 dark:bg-movement-900 text-movement-700 dark:text-movement-300'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                    }
                  `}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            {ready && authenticated ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
                  <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
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