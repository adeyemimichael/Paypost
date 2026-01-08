import { create } from 'zustand';

export const useUserStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  userRole: null, // 'creator' or 'participant'
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
  
  logout: async () => {
    set({ 
      user: null, 
      isAuthenticated: false, 
      userRole: null
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