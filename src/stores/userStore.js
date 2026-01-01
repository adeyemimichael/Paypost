import { create } from 'zustand';
import { privyService } from '../services/privyService';
import { mockAuthService } from '../services/mockAuthService';
import { notify } from '../utils/notify';

export const useUserStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  userRole: null, // 'creator' or 'reader'
  useMockAuth: false, // Flag to use mock auth when Privy fails
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
  },
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setBalance: (balance) => set({ balance }),
  
  enableMockAuth: () => {
    set({ useMockAuth: true });
  },
  
  login: async (role = 'reader') => {
    set({ isLoading: true });
    
    let toastId;
    try {
      toastId = notify.loading('Connecting wallet...');
      
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
      
      // Try to create/get user in Supabase
      let dbUser = null;
      try {
        const { supabaseService } = await import('../services/supabaseService');
        dbUser = await supabaseService.getOrCreateUser(
          wallet.address, 
          user.email, 
          role
        );
      } catch (dbError) {
        console.warn('Failed to create user in database:', dbError);
        // Continue without database user
      }
      
      set({ 
        user: { 
          ...user, 
          wallet,
          id: dbUser?.id || user.id,
          dbUser 
        }, 
        isAuthenticated: true, 
        isLoading: false,
        userRole: role,
        balance: wallet?.balance || 0
      });
      
      // Store role in localStorage
      localStorage.setItem('paypost_user_role', role);
      
      // Update success notification
      notify.update(toastId, {
        render: 'Wallet connected successfully!',
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });
      
      return user;
    } catch (error) {
      set({ isLoading: false });
      
      // Update error notification
      if (toastId) {
        notify.update(toastId, {
          render: `Failed to connect wallet: ${error.message}`,
          type: 'error',
          isLoading: false,
          autoClose: 5000,
        });
      }
      
      throw error;
    }
  },
  
  logout: async () => {
    set({ isLoading: true });
    
    let toastId;
    try {
      toastId = notify.loading('Disconnecting wallet...');
      
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
        userRole: null,
        balance: 0
      });
      localStorage.removeItem('paypost_user_role');
      
      // Update success notification
      notify.update(toastId, {
        render: 'Wallet disconnected successfully!',
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });
      
    } catch (error) {
      set({ isLoading: false });
      
      // Update error notification
      if (toastId) {
        notify.update(toastId, {
          render: `Failed to disconnect wallet: ${error.message}`,
          type: 'error',
          isLoading: false,
          autoClose: 5000,
        });
      }
      
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
    const { useMockAuth, balance } = get();
    if (useMockAuth) {
      return mockAuthService.getBalance();
    }
    return balance;
  },
  
  updateBalance: async () => {
    const { useMockAuth } = get();
    if (useMockAuth) {
      const newBalance = mockAuthService.getBalance();
      set({ balance: newBalance });
      return newBalance;
    }
    // In real implementation, would fetch from blockchain
    return get().balance;
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