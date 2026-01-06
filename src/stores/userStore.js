import { create } from 'zustand';

export const useUserStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  userRole: null, // 'creator' or 'participant'
  balance: 0,
  isLoading: false,
  
  setUser: async (user) => {
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
      
      // Auto-fund creators with 100 MOVE tokens (simulate faucet)
      if (role === 'creator') {
        const currentBalance = get().balance;
        if (currentBalance < 100) {
          // Give creators 100 test MOVE tokens to start
          set({ balance: 100 });
          console.log('Creator auto-funded with 100 test MOVE tokens');
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
  
  // Update balance from wallet hook or manual update
  updateBalance: (balance) => {
    const { user } = get();
    set({ balance });
    
    // Persist to localStorage for simulation
    if (user) {
      localStorage.setItem(`paypost_balance_${user.id || user.wallet?.address}`, balance.toString());
    }
  },
  
  // Fetch balance from localStorage (simulated balance)
  fetchBalance: async () => {
    const { user } = get();
    if (!user) return;
    
    // For now, use localStorage to persist simulated balance
    const savedBalance = localStorage.getItem(`paypost_balance_${user.id || user.wallet?.address}`);
    if (savedBalance) {
      set({ balance: parseFloat(savedBalance) });
    } else {
      // Default balance for new users
      set({ balance: 0 });
    }
  },
  
  logout: async () => {
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
  
  isParticipant: () => {
    const { userRole } = get();
    return userRole === 'participant';
  },
}));