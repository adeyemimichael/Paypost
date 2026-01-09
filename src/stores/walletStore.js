import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { walletService } from '../services/walletService';
import { movementService } from '../services/movementService';

export const useWalletStore = create(
  persist(
    (set, get) => ({
      // State
      wallet: null,
      balance: 0,
      isLoading: false,
      isInitialized: false,
      
      // Actions
      setWallet: (wallet) => set({ wallet }),
      setBalance: (balance) => set({ balance }),
      setLoading: (isLoading) => set({ isLoading }),
      setInitialized: (isInitialized) => set({ isInitialized }),

      // Initialize wallet for user
      initializeWallet: async (userId) => {
        const { wallet, isInitialized } = get();
        
        // Don't reinitialize if already done for this user
        if (isInitialized && wallet?.userId === userId) {
          console.log('Wallet already initialized for user:', userId);
          // Still fetch balance in case it changed
          get().fetchBalance();
          return wallet;
        }

        set({ isLoading: true });
        
        try {
          console.log('Initializing wallet for user:', userId);
          const aptosWallet = await walletService.ensureAptosWallet(userId);
          
          if (aptosWallet) {
            // Ensure wallet has complete info including publicKey
            const completeWallet = await walletService.ensureCompleteWallet(aptosWallet);
            
            // Add userId to wallet object for tracking
            const walletWithUserId = { ...completeWallet, userId };
            set({ 
              wallet: walletWithUserId, 
              isInitialized: true,
              isLoading: false 
            });
            
            // Fetch initial balance
            get().fetchBalance();
            
            console.log('Wallet initialized with publicKey:', walletWithUserId.address);
            return walletWithUserId;
          }
        } catch (error) {
          console.error('Failed to initialize wallet:', error);
          set({ isLoading: false });
        }
        
        return null;
      },

      // Fetch balance for current wallet
      fetchBalance: async () => {
        const { wallet } = get();
        if (!wallet?.address) return;

        set({ isLoading: true });
        
        try {
          console.log('Fetching balance for:', wallet.address);
          const balance = await movementService.getBalance(wallet.address);
          set({ balance, isLoading: false });
          console.log('Balance updated:', balance);
        } catch (error) {
          console.error('Failed to fetch balance:', error);
          set({ isLoading: false });
        }
      },

      // Reset wallet state (for logout)
      resetWallet: () => {
        set({
          wallet: null,
          balance: 0,
          isLoading: false,
          isInitialized: false
        });
        walletService.clearAllCache();
      },

      // Transaction methods
      createSurvey: async (surveyData) => {
        const { wallet } = get();
        if (!wallet) throw new Error('Wallet not initialized');
        return await movementService.createSurvey(surveyData, wallet);
      },

      completeSurvey: async (surveyId) => {
        const { wallet } = get();
        if (!wallet) throw new Error('Wallet not initialized');
        return await movementService.completeSurvey(surveyId, wallet);
      },

      transfer: async (toAddress, amount) => {
        const { wallet } = get();
        if (!wallet) throw new Error('Wallet not initialized');
        return await movementService.transfer(toAddress, amount, wallet);
      }
    }),
    {
      name: 'paypost-wallet-store', // localStorage key
      partialize: (state) => ({ 
        wallet: state.wallet, 
        isInitialized: state.isInitialized 
      }), // Only persist wallet and initialization state
    }
  )
);