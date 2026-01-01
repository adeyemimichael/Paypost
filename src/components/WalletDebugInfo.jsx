import { useState } from 'react';
import { motion } from 'framer-motion';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { useUserStore } from '../stores/userStore';
import { privyService } from '../services/privyService';

const WalletDebugInfo = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { ready, authenticated, user } = usePrivy();
  const { userRole, getWalletAddress } = useUserStore();

  const debugInfo = {
    privyReady: ready,
    privyAuthenticated: authenticated,
    userExists: !!user,
    walletExists: !!user?.wallet,
    walletType: user?.wallet?.walletClientType || 'none',
    walletAddress: user?.wallet?.address || 'none',
    userRole: userRole || 'none',
    canSignTransactions: privyService.canSignTransactions(),
    privyServiceWallet: !!privyService.wallet,
    embeddedWallet: !!privyService.embeddedWallet,
    storeWalletAddress: getWalletAddress() || 'none'
  };

  if (!import.meta.env.DEV) {
    return null; // Only show in development
  }

  return (
    <div className="fixed bottom-20 right-4 z-40">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900 text-white rounded-lg shadow-lg border border-gray-700 p-3 max-w-sm"
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-2 w-full text-left"
        >
          <Info className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium">Wallet Debug</span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 ml-auto" />
          ) : (
            <ChevronDown className="w-4 h-4 ml-auto" />
          )}
        </button>

        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 space-y-1 text-xs"
          >
            {Object.entries(debugInfo).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-gray-400">{key}:</span>
                <span className={
                  typeof value === 'boolean' 
                    ? value ? 'text-green-400' : 'text-red-400'
                    : 'text-white'
                }>
                  {typeof value === 'boolean' ? (value ? '✅' : '❌') : String(value)}
                </span>
              </div>
            ))}
            
            <div className="mt-3 pt-2 border-t border-gray-700">
              <div className="text-xs text-gray-400">
                Issues? Try:
              </div>
              <div className="text-xs text-gray-300 mt-1">
                1. Disconnect & reconnect wallet<br/>
                2. Refresh page<br/>
                3. Check console for errors
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default WalletDebugInfo;