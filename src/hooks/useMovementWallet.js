import { useState, useEffect } from 'react';
import { useWallets, usePrivy } from '@privy-io/react-auth';
import { movementService } from '../services/movementService';
import { walletService } from '../services/walletService';

export const useMovementWallet = () => {
  const { wallets } = useWallets();
  const { user, authenticated } = usePrivy();
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [aptosWallet, setAptosWallet] = useState(null);

  // Find Aptos wallet (prioritize Aptos over embedded)
  const movementWallet = wallets.find(w => 
    w.chainType === 'aptos'
  ) || wallets.find(w => 
    w.walletClientType === 'privy'
  );

  // Ensure user has Aptos wallet
  useEffect(() => {
    const ensureAptosWallet = async () => {
      if (authenticated && user?.id && !movementWallet) {
        try {
          console.log('Ensuring Aptos wallet exists...');
          const wallet = await walletService.ensureAptosWallet(user.id);
          setAptosWallet(wallet);
        } catch (error) {
          console.error('Failed to ensure Aptos wallet:', error);
        }
      }
    };

    ensureAptosWallet();
  }, [authenticated, user?.id, movementWallet]);

  // Fetch balance when wallet is available
  useEffect(() => {
    const walletAddress = movementWallet?.address || aptosWallet?.address;
    if (walletAddress) {
      fetchBalance();
    }
  }, [movementWallet?.address, aptosWallet?.address]);

  const fetchBalance = async () => {
    const walletAddress = movementWallet?.address || aptosWallet?.address;
    if (!walletAddress) return;
    
    setIsLoading(true);
    try {
      const balance = await movementService.getBalance(walletAddress);
      setBalance(balance);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Create wallet object for backend transactions
  const wallet = movementWallet ? {
    id: movementWallet.id,
    address: movementWallet.address,
    publicKey: movementWallet.publicKey,
    chainType: movementWallet.chainType
  } : aptosWallet ? {
    id: aptosWallet.id,
    address: aptosWallet.address,
    publicKey: aptosWallet.publicKey,
    chainType: 'aptos'
  } : null;

  return {
    wallet,
    balance,
    isConnected: !!wallet,
    isLoading,
    fetchBalance,
    // Transaction methods that call backend
    createSurvey: async (surveyData) => {
      if (!wallet) throw new Error('Wallet not connected');
      return await movementService.createSurvey(surveyData, wallet);
    },
    completeSurvey: async (surveyId) => {
      if (!wallet) throw new Error('Wallet not connected');
      return await movementService.completeSurvey(surveyId, wallet);
    },
    transfer: async (toAddress, amount) => {
      if (!wallet) throw new Error('Wallet not connected');
      return await movementService.transfer(toAddress, amount, wallet);
    }
  };
};