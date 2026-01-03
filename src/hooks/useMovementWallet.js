import { useEffect, useState } from 'react';
import { usePrivy, useWallets, useCreateWallet } from '@privy-io/react-auth';

/**
 * Custom hook to ensure user has an Aptos wallet for Movement blockchain
 * Based on PropaChain implementation pattern
 */
export const useMovementWallet = () => {
  const { authenticated, user } = usePrivy();
  const { wallets } = useWallets();
  const { createWallet } = useCreateWallet();
  const [isCreating, setIsCreating] = useState(false);
  const [aptosWallet, setAptosWallet] = useState(null);

  useEffect(() => {
    const initializeWallet = async () => {
      if (!authenticated || !user) {
        setAptosWallet(null);
        return;
      }

      // Check if user already has an Aptos wallet
      const existingAptosWallet = wallets.find(
        (wallet) => wallet.chainType === 'aptos' || wallet.address?.length > 50
      );

      if (existingAptosWallet) {
        console.log('Found existing Aptos wallet:', existingAptosWallet.address);
        setAptosWallet(existingAptosWallet);
        return;
      }

      // If no Aptos wallet exists, create one
      if (!isCreating) {
        setIsCreating(true);
        try {
          console.log('Creating Aptos wallet for Movement...');
          await createWallet({ chainType: 'aptos' });
          console.log('Aptos wallet created successfully');
        } catch (error) {
          console.error('Failed to create Aptos wallet:', error);
        } finally {
          setIsCreating(false);
        }
      }
    };

    initializeWallet();
  }, [authenticated, user, wallets, createWallet, isCreating]);

  return {
    aptosWallet,
    isCreating,
    hasAptosWallet: !!aptosWallet,
  };
};
