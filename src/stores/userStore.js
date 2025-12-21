import { create } from 'zustand';
import { privyService } from '../services/privyService';

export const useUserStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  
  setUser: (user) => {
    const currentUser = get().user;
    // Only update if user actually changed
    if (!currentUser || currentUser.id !== user?.id) {
      set({ user, isAuthenticated: !!user });
    }
  },
  
  setLoading: (isLoading) => set({ isLoading }),
  
  login: async () => {
    set({ isLoading: true });
    try {
      const wallet = await privyService.connectWallet();
      const user = privyService.getUser();
      set({ 
        user: { ...user, wallet }, 
        isAuthenticated: true, 
        isLoading: false 
      });
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
        isLoading: false 
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  
  getWalletAddress: () => {
    const { user } = get();
    return user?.wallet?.address || null;
  },
}));