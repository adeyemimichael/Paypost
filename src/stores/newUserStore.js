import { create } from 'zustand';
import { notify } from '../utils/notify';

export const useUserStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  userRole: null, // 'creator' or 'reader'
  balance: 0, // User's MOVE token balance
  
  setUser: (user) => {
    const currentUser = get().user;
    // Only update if user actually changed
    if (!currentUser || currentUser.id !== user?.id) {
      set({ user, isAuthenticated: !!user });
    }
  },
  
  setUserRole: (role) => {
    set({ userRole: role });
    // Store role in localStorage for persistence
    if (role) {
      localStorage.setItem('paypost_user_role', role);
    } else {
      localStorage.removeItem('paypost_user_role');
    }
  },
  
  loadUserRole: () => {
    const savedRole = localStorage.getItem('paypost_user_role');
    if (savedRole) {
      set({ userRole: savedRole });
    }
    // Also load persisted balance
    get().loadPersistedBalance();
  },
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setBalance: (balance) => {
    set({ balance });
    // Persist balance in localStorage
    localStorage.setItem('paypost_user_balance', balance.toString());
  },
  
  updateBalance: async (amount) => {
    const { balance } = get();
    const newBalance = balance + amount;
    
    // Update store balance
    get().setBalance(newBalance);
    return newBalance;
  },
  
  loadPersistedBalance: () => {
    const savedBalance = localStorage.getItem('paypost_user_balance');
    if (savedBalance) {
      const balance = parseFloat(savedBalance);
      if (!isNaN(balance)) {
        set({ balance });
      }
    }
  },
  
  // Simplified login - actual logic is in components using the wallet hook
  login: async (role = 'reader') => {
    set({ isLoading: true });
    
    try {
      // This will be handled by components with wallet hook access
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  
  logout: async () => {
    set({ isLoading: true });
    
    try {
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false,
        userRole: null,
        balance: 0
      });
      localStorage.removeItem('paypost_user_role');
      localStorage.removeItem('paypost_user_balance');
      
      notify.success('Wallet disconnected successfully!');
      
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  
  getWalletAddress: () => {
    const { user } = get();
    return user?.wallet?.address || null;
  },
  
  getDatabaseUserId: () => {
    const { user } = get();
    return user?.dbId || null;
  },
  
  getBalance: () => {
    const { balance } = get();
    return balance;
  },
  
  isCreator: () => {
    const { userRole } = get();
    return userRole === 'creator';
  },
  
  isReader: () => {
    const { userRole } = get();
    return userRole === 'reader';
  },
  
  canCreateSurveys: () => {
    const { userRole, user } = get();
    return userRole === 'creator' && user?.dbId;
  },
  
  requiresDatabaseRegistration: () => {
    const { userRole, user } = get();
    return userRole === 'creator' && !user?.dbId;
  },
}));