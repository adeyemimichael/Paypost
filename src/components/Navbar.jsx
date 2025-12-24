import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Wallet, LogOut, User, Plus, Menu, X } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { useUserStore } from '../stores/userStore';
import { formatAddress } from '../utils/formatters';
import Button from './Button';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const { ready, authenticated, logout } = usePrivy();
  const { user, userRole, isCreator, login } = useUserStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navigationLinks = [
    {
      to: "/feed",
      label: isCreator() ? 'My Dashboard' : 'Earn Rewards',
      show: true
    },
    {
      to: "/creators",
      label: 'Creators',
      show: true
    },
    {
      to: "/about",
      label: 'About',
      show: true
    },
    {
      to: "/create-survey",
      label: 'Create Survey',
      icon: <Plus className="w-4 h-4" />,
      show: isCreator()
    }
  ];

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
            <Link to="/" className="flex-shrink-0" onClick={closeMobileMenu}>
              <h1 className="text-2xl font-bold text-movement-600 dark:text-movement-400">PayPost</h1>
            </Link>
          </motion.div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navigationLinks.filter(link => link.show).map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
                >
                  {link.icon && <span className="mr-1">{link.icon}</span>}
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop Wallet Connection & Theme Toggle */}
          <div className="hidden md:flex items-center space-x-4">
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
                  className="flex items-center justify-center"
                >
                  <LogOut className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>Disconnect</span>
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleConnect}
                disabled={!ready}
                className="flex items-center justify-center"
              >
                <Wallet className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{ready ? 'Connect Wallet' : 'Loading...'}</span>
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={toggleMobileMenu}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white p-2"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-200 dark:border-gray-700"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                {/* Navigation Links */}
                {navigationLinks.filter(link => link.show).map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={closeMobileMenu}
                    className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors flex items-center"
                  >
                    {link.icon && <span className="mr-2">{link.icon}</span>}
                    {link.label}
                  </Link>
                ))}
                
                {/* Wallet Section */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                  {ready && authenticated ? (
                    <div className="space-y-3">
                      <div className="px-3 py-2">
                        <div className="flex items-center space-x-2 text-sm">
                          <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                          <span className="text-gray-700 dark:text-gray-200">
                            {formatAddress(user?.wallet?.address)}
                          </span>
                        </div>
                        {userRole && (
                          <div className="mt-2">
                            <span className={`
                              text-xs px-2 py-1 rounded-full font-medium
                              ${userRole === 'creator' 
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' 
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                              }
                            `}>
                              {userRole === 'creator' ? 'Creator' : 'Participant'}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="px-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDisconnect}
                          className="w-full flex items-center justify-center"
                        >
                          <LogOut className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>Disconnect Wallet</span>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="px-3">
                      <Button
                        onClick={handleConnect}
                        disabled={!ready}
                        className="w-full flex items-center justify-center"
                      >
                        <Wallet className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{ready ? 'Connect Wallet' : 'Loading...'}</span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;