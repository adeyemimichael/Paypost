import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Info, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { useUserStore } from '../stores/userStore';
import { privyService } from '../services/privyService';
import { movementWalletService } from '../services/nightlyWalletService';
import { realMovementService } from '../services/realMovementService';

const WalletDebugInfo = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [debugInfo, setDebugInfo] = useState({});
  const { ready, authenticated, user } = usePrivy();
  const { userRole, getWalletAddress } = useUserStore();

  const updateDebugInfo = async () => {
    const info = {
      // Privy Info
      privyReady: ready,
      privyAuthenticated: authenticated,
      userExists: !!user,
      walletExists: !!user?.wallet,
      walletType: user?.wallet?.walletClientType || 'none',
      walletAddress: user?.wallet?.address || 'none',
      
      // Movement Wallet Info
      movementConnected: movementWalletService.isConnected,
      movementWalletType: movementWalletService.getWalletType() || 'none',
      movementAddress: movementWalletService.getWalletAddress() || 'none',
      movementCanSign: movementWalletService.canSignTransactions(),
      
      // Available Wallets
      nightlyInstalled: movementWalletService.isWalletInstalled('nightly'),
      petraInstalled: movementWalletService.isWalletInstalled('petra'),
      martianInstalled: movementWalletService.isWalletInstalled('martian'),
      
      // App State
      userRole: userRole || 'none',
      storeWalletAddress: getWalletAddress() || 'none',
      
      // Services
      privyCanSign: privyService.canSignTransactions(),
      realMovementMode: realMovementService.isInSimulationMode() ? 'simulation' : 'real',
      realMovementInitialized: realMovementService.initialized
    };

    setDebugInfo(info);
  };

  useEffect(() => {
    updateDebugInfo();
  }, [ready, authenticated, user, userRole]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await updateDebugInfo();
    setTimeout(() => setRefreshing(false), 500);
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
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRefresh();
            }}
            className={`ml-auto p-1 hover:bg-gray-700 rounded ${refreshing ? 'animate-spin' : ''}`}
          >
            <RefreshCw className="w-3 h-3" />
          </button>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 space-y-1 text-xs"
          >
            <div className="text-yellow-400 font-semibold mb-2">Privy Wallet</div>
            {Object.entries(debugInfo).filter(([key]) => key.startsWith('privy') || key.includes('user') || key.includes('wallet')).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-gray-400">{key}:</span>
                <span className={
                  typeof value === 'boolean' 
                    ? value ? 'text-green-400' : 'text-red-400'
                    : 'text-white'
                }>
                  {typeof value === 'boolean' ? (value ? '✅' : '❌') : String(value).slice(0, 20)}
                </span>
              </div>
            ))}

            <div className="text-purple-400 font-semibold mb-2 mt-3">Movement Wallet</div>
            {Object.entries(debugInfo).filter(([key]) => key.startsWith('movement') || key.includes('Installed')).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-gray-400">{key}:</span>
                <span className={
                  typeof value === 'boolean' 
                    ? value ? 'text-green-400' : 'text-red-400'
                    : 'text-white'
                }>
                  {typeof value === 'boolean' ? (value ? '✅' : '❌') : String(value).slice(0, 20)}
                </span>
              </div>
            ))}

            <div className="text-blue-400 font-semibold mb-2 mt-3">App State</div>
            {Object.entries(debugInfo).filter(([key]) => key.startsWith('real') || key === 'userRole' || key === 'storeWalletAddress').map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-gray-400">{key}:</span>
                <span className={
                  typeof value === 'boolean' 
                    ? value ? 'text-green-400' : 'text-red-400'
                    : value === 'simulation' ? 'text-yellow-400' : 'text-white'
                }>
                  {typeof value === 'boolean' ? (value ? '✅' : '❌') : String(value)}
                </span>
              </div>
            ))}
            
            <div className="mt-3 pt-2 border-t border-gray-700">
              <div className="text-xs text-gray-400">
                Real Transactions Status:
              </div>
              <div className="text-xs mt-1">
                {debugInfo.movementConnected && debugInfo.movementCanSign ? (
                  <span className="text-green-400">✅ Ready for real transactions</span>
                ) : (
                  <span className="text-yellow-400">⚠️ Using simulation mode</span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default WalletDebugInfo;