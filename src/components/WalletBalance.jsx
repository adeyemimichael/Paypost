import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import { realMovementService } from '../services/realMovementService';
import { formatTokenAmount } from '../utils/formatters';

const WalletBalance = ({ className = '', showLabel = true, size = 'md' }) => {
  const { getWalletAddress, getBalance, useMockAuth, updateBalance } = useUserStore();
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [error, setError] = useState(null);

  const walletAddress = getWalletAddress();
  const storeBalance = getBalance(); // Get balance from store

  const fetchBalance = async () => {
    if (!walletAddress) return;

    setIsLoading(true);
    setError(null);

    try {
      let currentBalance = storeBalance; // Start with store balance

      if (!useMockAuth) {
        // Try to get balance from Movement blockchain for real wallets
        try {
          await realMovementService.ensureInitialized();
          
          // Get real blockchain balance directly from Movement service
          const blockchainBalance = await realMovementService.getAccountBalance(walletAddress);
          
          if (blockchainBalance !== null && blockchainBalance !== undefined) {
            // Use blockchain balance if available
            currentBalance = blockchainBalance;
            
            // Update store with blockchain balance if significantly different
            if (Math.abs(blockchainBalance - storeBalance) > 0.01) {
              console.log(`💰 Updating balance from blockchain: ${blockchainBalance} MOVE`);
              updateBalance(blockchainBalance - storeBalance);
            }
          }
        } catch (blockchainError) {
          console.warn('Failed to get blockchain balance, using store balance:', blockchainError);
          // Use store balance as fallback
        }
      }

      setBalance(currentBalance);
    } catch (err) {
      console.error('Failed to fetch balance:', err);
      setError('Failed to load balance');
      setBalance(storeBalance); // Fallback to store balance
    } finally {
      setIsLoading(false);
    }
  };

  // Update balance when store balance changes
  useEffect(() => {
    setBalance(storeBalance);
  }, [storeBalance]);

  useEffect(() => {
    if (walletAddress) {
      fetchBalance();
    }
  }, [walletAddress, useMockAuth]);

  const handleRefresh = () => {
    fetchBalance();
  };

  const toggleBalanceVisibility = () => {
    setShowBalance(!showBalance);
  };

  if (!walletAddress) {
    return null;
  }

  const sizeClasses = {
    sm: 'text-sm px-2 py-1',
    md: 'text-sm px-3 py-2',
    lg: 'text-base px-4 py-3'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        inline-flex items-center space-x-2 bg-gradient-to-r from-movement-50 to-purple-50 
        dark:from-movement-900/30 dark:to-purple-900/30 rounded-lg border border-movement-200 
        dark:border-movement-700 ${sizeClasses[size]} ${className}
      `}
    >
      <Wallet className={`${iconSizes[size]} text-movement-600 dark:text-movement-400 flex-shrink-0`} />
      
      {showLabel && (
        <span className="text-gray-600 dark:text-gray-300 font-medium">
          Balance:
        </span>
      )}
      
      <div className="flex items-center space-x-1">
        {isLoading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <RefreshCw className={`${iconSizes[size]} text-movement-500`} />
          </motion.div>
        ) : error ? (
          <span className="text-red-500 text-xs">Error</span>
        ) : (
          <span className="font-bold text-movement-700 dark:text-movement-300">
            {showBalance ? formatTokenAmount(balance) : '••••'} MOVE
          </span>
        )}
      </div>

      <div className="flex items-center space-x-1">
        <button
          onClick={toggleBalanceVisibility}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          title={showBalance ? 'Hide balance' : 'Show balance'}
        >
          {showBalance ? (
            <EyeOff className={iconSizes[size]} />
          ) : (
            <Eye className={iconSizes[size]} />
          )}
        </button>
        
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
          title="Refresh balance"
        >
          <RefreshCw className={`${iconSizes[size]} ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </motion.div>
  );
};

export default WalletBalance;