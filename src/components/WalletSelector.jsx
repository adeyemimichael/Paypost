import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, ExternalLink, AlertCircle, CheckCircle } from 'lucide-react';
import { useUserStore } from '../stores/newUserStore';
import { usePayPostWallet } from '../hooks/usePayPostWallet';
import Button from './Button';

const WalletSelector = ({ 
  onClose, 
  userRole = 'reader', 
  onWalletConnected,
  showRoleInfo = true 
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [availableWallets, setAvailableWallets] = useState([]);
  const { setUser, setUserRole } = useUserStore();
  const { connectWallet, isConnected, user } = usePayPostWallet();

  useEffect(() => {
    // Check for available wallets
    const walletOptions = [
      {
        id: 'privy',
        name: 'Privy (Email/Social)',
        description: 'Easy login with email or social accounts - Best for participants',
        icon: '🔐',
        available: true,
        recommended: userRole === 'reader',
        type: 'auth'
      },
      {
        id: 'nightly',
        name: 'Nightly Wallet',
        description: 'Native Movement wallet - Best for creators',
        icon: '🌙',
        available: typeof window !== 'undefined' && window.nightly,
        installUrl: 'https://nightly.app',
        type: 'movement'
      },
      {
        id: 'petra',
        name: 'Petra Wallet',
        description: 'Popular Aptos wallet with Movement support',
        icon: '🪨',
        available: typeof window !== 'undefined' && window.petra,
        installUrl: 'https://petra.app',
        type: 'movement'
      },
      {
        id: 'martian',
        name: 'Martian Wallet',
        description: 'Multi-chain wallet with Movement support',
        icon: '👽',
        available: typeof window !== 'undefined' && window.martian,
        installUrl: 'https://martian.app',
        type: 'movement'
      }
    ];

    setAvailableWallets(walletOptions);
  }, [userRole]);

  const handleWalletConnect = async (walletType) => {
    setIsConnecting(true);
    setSelectedWallet(walletType);

    try {
      await connectWallet(walletType);
      
      // Wait a moment for wallet connection to complete
      setTimeout(() => {
        if (onWalletConnected && user) {
          onWalletConnected(user);
        } else if (onClose) {
          onClose();
        }
      }, 1000);
      
    } catch (error) {
      console.error('Wallet connection failed:', error);
    } finally {
      setIsConnecting(false);
      setSelectedWallet(null);
    }
  };

  return (
    <div className="space-y-4">
      {showRoleInfo && (
        <div className="text-center mb-6">
          <Wallet className="w-12 h-12 text-movement-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Choose Your Wallet
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Select how you'd like to connect to PayPost
          </p>
        </div>
      )}

      <div className="space-y-3">
        {availableWallets.map((wallet) => (
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
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {wallet.name}
                    </h4>
                    {wallet.recommended && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        Recommended
                      </span>
                    )}
                    {wallet.available && wallet.type === 'movement' && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
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

      {showRoleInfo && (
        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
          <div className="mb-2">
            <strong>Privy:</strong> Easy for participants, uses email/social login
          </div>
          <div>
            <strong>Movement Wallets:</strong> Required for creators to fund surveys with real MOVE tokens
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletSelector;