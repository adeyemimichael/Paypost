import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { useUserStore } from '../stores/userStore';
import { formatTokenAmount } from '../utils/formatters';

const WalletBalance = ({ className = '', showLabel = true, size = 'md' }) => {
  const { authenticated } = usePrivy();
  const { balance, fetchBalance } = useUserStore();
  
  const [showBalance, setShowBalance] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (isRefreshing || !authenticated) return;
    
    setIsRefreshing(true);
    try {
      await fetchBalance();
    } catch (error) {
      console.error('Failed to refresh balance:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const toggleBalanceVisibility = () => {
    setShowBalance(!showBalance);
  };

  if (!authenticated) {
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
        {isRefreshing ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <RefreshCw className={`${iconSizes[size]} text-movement-500`} />
          </motion.div>
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
          disabled={isRefreshing}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
          title="Refresh balance"
        >
          <RefreshCw className={`${iconSizes[size]} ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </motion.div>
  );
};

export default WalletBalance;