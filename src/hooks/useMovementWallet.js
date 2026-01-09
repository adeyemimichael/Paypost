import { useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useWalletStore } from '../stores/walletStore';

export const useMovementWallet = () => {
  const { user, authenticated } = usePrivy();
  const {
    wallet,
    balance,
    isLoading,
    isInitialized,
    initializeWallet,
    fetchBalance,
    resetWallet,
    createSurvey,
    completeSurvey,
    transfer
  } = useWalletStore();

  // Initialize wallet when user authenticates
  useEffect(() => {
    if (authenticated && user?.id && !isInitialized) {
      console.log('Initializing wallet for authenticated user:', user.id);
      initializeWallet(user.id);
    } else if (!authenticated && isInitialized) {
      console.log('User logged out, resetting wallet');
      resetWallet();
    }
  }, [authenticated, user?.id, isInitialized, initializeWallet, resetWallet]);

  return {
    wallet,
    balance,
    isConnected: !!wallet,
    isLoading,
    fetchBalance,
    // Transaction methods
    createSurvey,
    completeSurvey,
    transfer
  };
};