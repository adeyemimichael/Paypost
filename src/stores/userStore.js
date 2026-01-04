import { create } from 'zustand';
import { movementService } from '../services/movementService';

export const useUserStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  userRole: null, // 'creator' or 'reader'
  balance: 0,
  isLoading: false,
  
  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
    if (user) {
      get().loadUserRole();
      get().fetchBalance();
      
      // Initialize survey store
      const { useSurveyStore } = require('./surveyStore');
      useSurveyStore.getState().initialize();
    }
  },
  
  setUserRole: (role) => {
    set({ userRole: role });
    // Store role in localStorage for persistence
    if (role) {
      localStorage.setItem('paypost_user_role', role);
      
      // Auto-fund creators with test tokens (simulating faucet)
      if (role === 'creator') {
        const currentBalance = get().balance;
        if (currentBalance === 0) {
          // Give creators 1000 test MOVE tokens to start
          set({ balance: 1000 });
          console.log('Creator auto-funded with 1000 test MOVE tokens');
        }
      }
    } else {
      localStorage.removeItem('paypost_user_role');
    }
  },
  
  loadUserRole: () => {
    const savedRole = localStorage.getItem('paypost_user_role');
    if (savedRole) {
      set({ userRole: savedRole });
    }
  },
  
  // Real Balance Management
  fetchBalance: async () => {
    const { user } = get();
    if (!user) return;
    
    // Check if user has a wallet address
    const walletAddress = user.wallet?.address || user.email?.address; // Adjust based on Privy user object structure
    
    if (walletAddress) {
      try {
        const balance = await movementService.getBalance(walletAddress);
        set({ balance });
      } catch (error) {
        console.error('Failed to fetch balance:', error);
      }
    }
  },

  // Update balance is now just a refresh, as the chain is the source of truth
  updateBalance: async () => {
    await get().fetchBalance();
  },
  
  logout: () => {
    set({ 
      user: null, 
      isAuthenticated: false, 
      userRole: null,
      balance: 0
    });
    localStorage.removeItem('paypost_user_role');
    
    // Clear survey store
    const { useSurveyStore } = require('./surveyStore');
    useSurveyStore.getState().clear();
  },
  
  isCreator: () => {
    const { userRole } = get();
    return userRole === 'creator';
  },
  
  isReader: () => {
    const { userRole } = get();
    return userRole === 'reader';
  },
}));