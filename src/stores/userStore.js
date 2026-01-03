import { create } from 'zustand';

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
  },
  
  // Simulated Balance Management
  fetchBalance: async () => {
    // In a real app, this would fetch from Supabase
    // For now, we use localStorage to simulate persistence
    const savedBalance = localStorage.getItem('paypost_simulated_balance');
    set({ balance: savedBalance ? parseFloat(savedBalance) : 0 });
  },

  updateBalance: async (amount) => {
    const { balance } = get();
    const newBalance = balance + amount;
    set({ balance: newBalance });
    localStorage.setItem('paypost_simulated_balance', newBalance.toString());
    
    // Ideally, we would also sync this to Supabase here
    // await supabaseService.updateUserBalance(user.id, newBalance);
  },
  
  logout: () => {
    set({ 
      user: null, 
      isAuthenticated: false, 
      userRole: null,
      balance: 0
    });
    localStorage.removeItem('paypost_user_role');
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