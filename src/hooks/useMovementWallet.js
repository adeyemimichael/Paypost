import { useState, useEffect } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { movementService } from '../services/movementService';
import { notify } from '../utils/notify';

export const useMovementWallet = () => {
  const { user, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Get the wallet from Privy
  useEffect(() => {
    if (authenticated && wallets.length > 0) {
      // Privy creates embedded wallets - use the first one
      const privyWallet = wallets[0];
      setWallet(privyWallet);
    } else {
      setWallet(null);
    }
  }, [authenticated, wallets]);

  // Fetch balance when wallet changes
  useEffect(() => {
    if (wallet?.address) {
      fetchBalance();
    }
  }, [wallet?.address]);

  const fetchBalance = async () => {
    if (!wallet?.address) return;
    
    try {
      const balance = await movementService.getBalance(wallet.address);
      setBalance(balance);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      setBalance(0);
    }
  };

  // Sign and submit transaction to Move blockchain
  const signAndSubmitTransaction = async (payload) => {
    if (!wallet) {
      throw new Error('No wallet connected');
    }

    setIsLoading(true);
    try {
      // Use Privy's wallet to sign and submit the transaction
      const result = await wallet.signAndSubmitTransaction({
        payload
      });
      
      // Refresh balance after transaction
      setTimeout(fetchBalance, 2000);
      
      return result;
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    wallet,
    address: wallet?.address,
    balance,
    isLoading,
    fetchBalance,
    signAndSubmitTransaction,
    isConnected: !!wallet
  };
};