import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, ExternalLink, AlertCircle, CheckCircle, Download } from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import Button from './Button';

const MovementWalletPrompt = ({ isOpen, onClose, onSuccess, title = "Connect Movement Wallet" }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [availableWallets, setAvailableWallets] = useState([]);
  const [error, setError] = useState(null);

  const walletOptions = [
    {
      id: 'petra',
      name: 'Petra Wallet',
      description: 'Official Aptos wallet extension',
      icon: '🦋',
      downloadUrl: 'https://petra.app/',
      isInstalled: () => typeof window !== 'undefined' && window.aptos,
      connect: async () => {
        if (window.aptos) {
          const response = await window.aptos.connect();
          return response;
        }
        throw new Error('Petra wallet not found');
      }
    },
    {
      id: 'nightly',
      name: 'Nightly Wallet',
      description: 'Multi-chain wallet with Aptos support',
      icon: '🌙',
      downloadUrl: 'https://nightly.app/',
      isInstalled: () => typeof window !== 'undefined' && window.nightly?.aptos,
      connect: async () => {
        if (window.nightly?.aptos) {
          const response = await window.nightly.aptos.connect();
          return response;
        }
        throw new Error('Nightly wallet not found');
      }
    },
    {
      id: 'martian',
      name: 'Martian Wallet',
      description: 'Secure Aptos wallet extension',
      icon: '👽',
      downloadUrl: 'https://martianwallet.xyz/',
      isInstalled: () => typeof window !== 'undefined' && window.martian,
      connect: async () => {
        if (window.martian) {
          const response = await window.martian.connect();
          return response;
        }
        throw new Error('Martian wallet not found');
      }
    }
  ];

  useEffect(() => {
    if (isOpen) {
      const available = walletOptions.map(wallet => ({
        ...wallet,
        installed: wallet.isInstalled()
      }));
      setAvailableWallets(available);
    }
  }, [isOpen]);

  const handleWalletConnect = async (wallet) => {
    setIsConnecting(true);
    setSelectedWallet(wallet.id);
    setError(null);

    try {
      if (!wallet.installed) {
        setError(`${wallet.name} is not installed. Please install it first.`);
        return;
      }

      const response = await wallet.connect();
      
      if (response && response.address) {
        if (onSuccess) {
          onSuccess({
            address: response.address,
            publicKey: response.publicKey,
            walletName: wallet.name
          });
        }
        onClose();
      } else {
        throw new Error('Failed to get wallet address');
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
      setError(error.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
      setSelectedWallet(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {title}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Choose a wallet to connect to Movement blockchain
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Wallet Options */}
          <div className="space-y-3 mb-6">
            {availableWallets.map((wallet) => (
              <div
                key={wallet.id}
                className={`border-2 rounded-lg p-4 transition-all ${
                  wallet.installed 
                    ? 'border-gray-200 hover:border-blue-300 cursor-pointer' 
                    : 'border-gray-100 bg-gray-50'
                }`}
                onClick={() => wallet.installed && handleWalletConnect(wallet)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{wallet.icon}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{wallet.name}</h3>
                      <p className="text-sm text-gray-600">{wallet.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    {wallet.installed ? (
                      <>
                        {isConnecting && selectedWallet === wallet.id ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                        ) : (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                      </>
                    ) : (
                      <a
                        href={wallet.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Install
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* No Wallets Available */}
          {availableWallets.length === 0 && (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No compatible wallets found</p>
              <p className="text-sm text-gray-500">
                Please install a supported Aptos wallet to continue
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-4">
              Make sure you're on the official wallet websites when downloading
            </p>
            
            <div className="flex space-x-3">
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1"
                disabled={isConnecting}
              >
                Cancel
              </Button>
              
              <Button
                onClick={() => window.open('https://aptos.dev/guides/wallet/', '_blank')}
                variant="outline"
                className="flex-1"
                disabled={isConnecting}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Learn More
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MovementWalletPrompt;