import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, ExternalLink, AlertCircle } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { useUserStore } from '../stores/userStore';
import { nightlyWalletService } from '../services/nightlyWalletService';
import Button from './Button';

const WalletSelector = ({ onClose }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const { login } = useUserStore();
  const privy = usePrivy();

  const walletOptions = [
    {
      id: 'privy',
      name: 'Privy (Email/Social)',
      description: 'Easy login with email or social accounts',
      icon: '🔐',
      available: true,
      recommended: true
    },
    {
      id: 'nightly',
      name: 'Nightly Wallet',
      description: 'Native Movement blockchain wallet',
      icon: '🌙',
      available: nightlyWalletService.isWalletInstalled(),
      installUrl: 'https://nightly.app'
    }
  ];

  const handleWalletConnect = async (walletType) => {
    setIsConnecting(true);
    setSelectedWallet(walletType);

    try {
      if (walletType === 'privy') {
        // Use existing Privy flow
        await login();
      } else if (walletType === 'nightly') {
        // Use Nightly wallet
        const wallet = await nightlyWalletService.connectWallet();
        const user = nightlyWalletService.getUser();
        
        // Update user store with Nightly wallet info
        const { setUser, setUserRole } = useUserStore.getState();
        setUser({ ...user, wallet });
        setUserRole('creator'); // Default to creator for Nightly users
      }
      
      onClose();
    } catch (error) {
      console.error('Wallet connection failed:', error);
    } finally {
      setIsConnecting(false);
      setSelectedWallet(null);
    }
  };

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
              Choose Your Wallet
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Select how you'd like to connect to PayPost
            </p>
          </div>

          <div className="space-y-3">
            {walletOptions.map((wallet) => (
              <div key={wallet.id} className="relative">
                <button
                  onClick={() => wallet.available && handleWalletConnect(wallet.id)}
                  disabled={!wallet.available || isConnecting}
                  className={`
                    w-full p-4 rounded-lg border-2 text-left transition-all
                    ${wallet.available 
                      ? 'border-gray-200 hover:border-movement-500 hover:bg-movement-50 dark:border-gray-600 dark:hover:border-movement-400' 
                      : 'border-gray-200 bg-gray-50 cursor-not-allowed dark:border-gray-600 dark:bg-gray-700'
                    }
                    ${selectedWallet === wallet.id ? 'border-movement-500 bg-movement-50' : ''}
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{wallet.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {wallet.name}
                        </h3>
                        {wallet.recommended && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {wallet.description}
                      </p>
                    </div>
                    {isConnecting && selectedWallet === wallet.id && (
                      <div className="w-5 h-5 border-2 border-movement-500 border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>
                </button>

                {!wallet.available && wallet.installUrl && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-lg">
                    <div className="text-center">
                      <AlertCircle className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">Not installed</p>
                      <a
                        href={wallet.installUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-movement-600 hover:text-movement-700 text-sm font-medium flex items-center justify-center"
                      >
                        Install {wallet.name}
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </div>
                  </div>
                )}
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
            Your wallet will be used to sign transactions and receive MOVE tokens
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default WalletSelector;