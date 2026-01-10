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
    getStoredUserData,
    updateUserData,
    createSurvey,
    completeSurvey,
    transfer
  } = useWalletStore();

  // Initialize wallet when user authenticates
  useEffect(() => {
    if (authenticated && user?.id && !isInitialized) {
      console.log('🔄 Initializing wallet for authenticated user:', user.id);
      
      // Get stored user data if available
      const storedUserData = getStoredUserData(user.id);
      const userEmail = user.email?.address || storedUserData?.email;
      const userRole = storedUserData?.role || 'reader';
      
      console.log('📋 User data for initialization:', { 
        email: !!userEmail, 
        role: userRole,
        hasStoredData: !!storedUserData 
      });
      
      initializeWallet(user.id, userEmail, userRole);
    } else if (!authenticated && isInitialized) {
      console.log('👋 User logged out, resetting wallet');
      resetWallet();
    }
  }, [authenticated, user?.id, user?.email?.address, isInitialized, initializeWallet, resetWallet, getStoredUserData]);

  return {
    wallet,
    balance,
    isConnected: !!wallet,
    isLoading,
    fetchBalance,
    // User data methods
    getStoredUserData: () => getStoredUserData(user?.id),
    updateUserData: (userData) => updateUserData(user?.id, userData),
    // Transaction methods
    createSurvey,
    completeSurvey,
    transfer
  };
};