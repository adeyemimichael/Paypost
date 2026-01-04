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
    }
  },
  
  setUserRole: (role) => {
    set({ userRole: role });
    // Store role in localStorage for persistence
    if (role) {
      localStorage.setItem('paypost_user_role', role);
      
      // Auto-fund creators with 100 MOVE tokens (simulated)
      if (role === 'creator') {
        const currentBalance = get().balance;
        if (currentBalance < 100) {
          // Give creators 100 MOVE tokens to start
          set({ balance: 100 });
          console.log('Creator auto-funded with 100 MOVE tokens');
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
  
  // Update balance from wallet hook
  updateBalance: (balance) => {
    set({ balance });
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