import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, ExternalLink, AlertCircle, CheckCircle } from 'lucide-react';
import { movementWalletService } from '../services/nightlyWalletService';
import { useUserStore } from '../stores/userStore';
import Button from './Button';

const MovementWalletPrompt = ({ isOpen, onClose, onSuccess, title = "Connect Movement Wallet" }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [availableWallets, setAvailableWallets] = useState([]);

  useEffect(() => {
    if (isOpen) {
      const wallets = movementWalletService.getAvailableWallets();
      setAvailableWallets(wallets);
    }
  }, [isOpen]);

  const handleWalletConnect = async (walletType) => {
    setIsConnecting(true);
    setSelectedWallet(walletType);

    try {
      // Connect Movement wallet
      const wallet = await movementWalletService.connectWallet(walletType);
      const user = movementWalletService.getUser();
      
      // Update user store with Movement wallet info
      const { setUser, setUserRole } = useUserStore.getState();
      setUser({ ...user, wallet });
      setUserRole('creator'); // Movement wallet users are creators
      
      onSuccess && onSuccess(wallet);
      onClose();
    } catch (error) {
      console.error('Movement wallet connection failed:', error);
    } finally {
      setIsConnecting(false);
      setSelectedWallet(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6"
        >
          <div className="text-center mb-6">
            <Wallet className="w-12 h-12 text-movement-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {title}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Real transactions require a Movement-compatible wallet
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">Why do I need a Movement wallet?</p>
                <p>To perform real transactions with MOVE tokens, you need a wallet that supports the Movement blockchain. Privy wallets are great for participants but don't support Movement transactions.</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {availableWallets.filter(w => w.installed).map((wallet) => (
              <button
                key={wallet.type}
                onClick={() => handleWalletConnect(wallet.type)}
                disabled={isConnecting}
                className="w-full p-4 rounded-lg border-2 border-gray-200 hover:border-movement-500 hover:bg-movement-50 dark:border-gray-600 dark:hover:border-movement-400 text-left transition-all"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{wallet.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {wallet.name}
                      </h3>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Installed and ready to use
                    </p>
                  </div>
                  {isConnecting && selectedWallet === wallet.type && (
                    <div className="w-5 h-5 border-2 border-movement-500 border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
              </button>
            ))}

            {availableWallets.filter(w => !w.installed).map((wallet) => (
              <div key={wallet.type} className="relative">
                <div className="w-full p-4 rounded-lg border-2 border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700 text-left">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl opacity-50">{wallet.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {wallet.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Not installed
                      </p>
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 dark:bg-gray-800 dark:bg-opacity-90 rounded-lg">
                  <div className="text-center">
                    <AlertCircle className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                    <a
                      href={wallet.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-movement-600 hover:text-movement-700 text-sm font-medium flex items-center justify-center"
                    >
                      Install {wallet.name}
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isConnecting}
            >
              Cancel
            </Button>
          </div>

          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
            <div className="mb-2">
              <strong>Need help?</strong> Check our <a href="/how-it-works" className="text-movement-600 hover:underline">How It Works</a> guide
            </div>
            <div>
              Movement wallets are required for real MOVE token transactions
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MovementWalletPrompt;