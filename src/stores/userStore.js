import { create } from 'zustand';
import { privyService } from '../services/privyService';
import { mockAuthService } from '../services/mockAuthService';

export const useUserStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  userRole: null, // 'creator' or 'reader'
  useMockAuth: false, // Flag to use mock auth when Privy fails
  
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
  
  enableMockAuth: () => {
    set({ useMockAuth: true });
  },
  
  login: async (role = 'reader') => {
    set({ isLoading: true });
    try {
      const { useMockAuth } = get();
      let wallet, user;
      
      if (useMockAuth) {
        // Use mock authentication
        wallet = await mockAuthService.connectWallet();
        user = mockAuthService.getUser();
      } else {
        // Try Privy first
        try {
          wallet = await privyService.connectWallet();
          user = privyService.getUser();
        } catch (privyError) {
          console.warn('Privy failed, falling back to mock auth:', privyError);
          set({ useMockAuth: true });
          wallet = await mockAuthService.connectWallet();
          user = mockAuthService.getUser();
        }
      }
      
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
      const { useMockAuth } = get();
      
      if (useMockAuth) {
        await mockAuthService.disconnectWallet();
      } else {
        await privyService.disconnectWallet();
      }
      
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
    const { user, useMockAuth } = get();
    if (useMockAuth) {
      return mockAuthService.getWalletAddress();
    }
    return user?.wallet?.address || null;
  },
  
  getBalance: () => {
    const { useMockAuth } = get();
    if (useMockAuth) {
      return mockAuthService.getBalance();
    }
    return 0; // Would get from Privy in real implementation
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