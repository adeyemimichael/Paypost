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

      // Initialize wallet for user with optional user data
      initializeWallet: async (userId, userEmail = null, userRole = null) => {
        const { wallet, isInitialized } = get();
        
        // Check if we have a stored wallet address for this user
        const storedWalletAddress = localStorage.getItem(`paypost_wallet_${userId}`);
        
        // Don't reinitialize if already done for this user and wallet address matches
        if (isInitialized && wallet?.userId === userId && storedWalletAddress === wallet?.address) {
          console.log('✅ Wallet already initialized for user:', userId);
          // Still fetch balance in case it changed
          get().fetchBalance();
          return wallet;
        }

        set({ isLoading: true });
        
        try {
          console.log('🔄 Initializing wallet for user:', userId, { email: !!userEmail, role: userRole });
          const aptosWallet = await walletService.ensureAptosWallet(userId, userEmail, userRole);
          
          if (aptosWallet) {
            // Ensure wallet has complete info including publicKey
            const completeWallet = await walletService.ensureCompleteWallet(aptosWallet);
            
            // Add userId to wallet object for tracking
            const walletWithUserId = { 
              ...completeWallet, 
              userId,
              userEmail: userEmail || completeWallet.userEmail,
              userRole: userRole || completeWallet.userRole || 'reader'
            };
            
            // Store wallet address for persistence
            localStorage.setItem(`paypost_wallet_${userId}`, completeWallet.address);
            
            // Store user preferences
            if (userEmail || userRole) {
              localStorage.setItem(`paypost_user_${userId}`, JSON.stringify({
                email: userEmail,
                role: userRole,
                walletAddress: completeWallet.address,
                lastLogin: new Date().toISOString()
              }));
            }
            
            set({ 
              wallet: walletWithUserId, 
              isInitialized: true,
              isLoading: false 
            });
            
            // Fetch initial balance
            get().fetchBalance();
            
            console.log('✅ Wallet initialized with address:', walletWithUserId.address);
            return walletWithUserId;
          }
        } catch (error) {
          console.error('❌ Failed to initialize wallet:', error);
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

      // Get stored user data
      getStoredUserData: (userId) => {
        try {
          const storedData = localStorage.getItem(`paypost_user_${userId}`);
          return storedData ? JSON.parse(storedData) : null;
        } catch (error) {
          console.error('Failed to get stored user data:', error);
          return null;
        }
      },

      // Update user data
      updateUserData: (userId, userData) => {
        try {
          const currentData = get().getStoredUserData(userId) || {};
          const updatedData = {
            ...currentData,
            ...userData,
            lastUpdated: new Date().toISOString()
          };
          localStorage.setItem(`paypost_user_${userId}`, JSON.stringify(updatedData));
          
          // Update wallet object if it exists
          const { wallet } = get();
          if (wallet && wallet.userId === userId) {
            set({
              wallet: {
                ...wallet,
                userEmail: userData.email || wallet.userEmail,
                userRole: userData.role || wallet.userRole
              }
            });
          }
        } catch (error) {
          console.error('Failed to update user data:', error);
        }
      },

      // Transaction methods
      createSurvey: async (surveyData) => {
        const { wallet } = get();
        if (!wallet) throw new Error('Wallet not initialized');
        const result = await movementService.createSurvey(surveyData, wallet);
        // Refresh balance after transaction
        setTimeout(() => get().fetchBalance(), 2000);
        return result;
      },

      completeSurvey: async (surveyId) => {
        const { wallet } = get();
        if (!wallet) throw new Error('Wallet not initialized');
        const result = await movementService.completeSurvey(surveyId, wallet);
        // Refresh balance after transaction
        setTimeout(() => get().fetchBalance(), 2000);
        return result;
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