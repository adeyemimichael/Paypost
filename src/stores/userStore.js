import { create } from 'zustand';
import { privyService } from '../services/privyService';

export const useUserStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  userRole: null, // 'creator' or 'reader'
  
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
  },
  
  setLoading: (isLoading) => set({ isLoading }),
  
  login: async (role = 'reader') => {
    set({ isLoading: true });
    try {
      const wallet = await privyService.connectWallet();
      const user = privyService.getUser();
      set({ 
        user: { ...user, wallet }, 
        isAuthenticated: true, 
        isLoading: false,
        userRole: role
      });
      
      // Store role in localStorage
      localStorage.setItem('paypost_user_role', role);
      
      return user;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  
  logout: async () => {
    set({ isLoading: true });
    try {
      await privyService.disconnectWallet();
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false,
        userRole: null
      });
      localStorage.removeItem('paypost_user_role');
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  
  getWalletAddress: () => {
    const { user } = get();
    return user?.wallet?.address || null;
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