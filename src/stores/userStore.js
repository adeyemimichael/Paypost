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
    const { balance, useMockAuth } = get();
    const newBalance = balance + amount;
    
    if (useMockAuth) {
      // Update mock auth service balance
      const { mockAuthService } = await import('../services/mockAuthService');
      if (amount > 0) {
        mockAuthService.addBalance(amount);
      } else {
        mockAuthService.deductBalance(Math.abs(amount));
      }
    }
    
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
  
  login: async (role = 'reader') => {
    set({ isLoading: true });
    
    let toastId;
    try {
      toastId = notify.loading('Connecting wallet...');
      
      let wallet, user;
      
      // Always try Privy first - no fallback to mock auth
      try {
        wallet = await privyService.connectWallet();
        user = privyService.getUser();
        
        if (!wallet || !wallet.address) {
          throw new Error('No wallet address received from Privy');
        }
        
        console.log('✅ Privy wallet connected:', wallet.address);
      } catch (privyError) {
        console.error('❌ Privy connection failed:', privyError);
        set({ isLoading: false });
        notify.update(toastId, {
          render: `Failed to connect wallet: ${privyError.message}`,
          type: 'error',
          isLoading: false,
          autoClose: 8000,
        });
        throw privyError;
      }
      
      // Try to create/get user in Supabase (required for survey operations)
      let dbUser = null;
      let registrationAttempts = 0;
      const maxAttempts = 3;
      
      while (!dbUser && registrationAttempts < maxAttempts) {
        try {
          registrationAttempts++;
          console.log(`🔄 Database registration attempt ${registrationAttempts}/${maxAttempts}...`);
          
          const { supabaseService } = await import('../services/supabaseService');
          
          // Ensure Supabase is initialized
          const initialized = await supabaseService.initialize();
          if (!initialized) {
            throw new Error('Supabase service not available');
          }
          
          // Use wallet address as primary identifier
          dbUser = await supabaseService.getOrCreateUser(
            wallet.address, 
            user.email, 
            role,
            user.id // Use Privy user ID
          );
          
          if (!dbUser) {
            throw new Error('Failed to create database user');
          }
          
          console.log('✅ User registered in database:', dbUser.id);
          break; // Success, exit retry loop
          
        } catch (dbError) {
          console.error(`❌ Database registration attempt ${registrationAttempts} failed:`, dbError);
          
          if (registrationAttempts >= maxAttempts) {
            // For creators, database registration is required
            if (role === 'creator') {
              set({ isLoading: false });
              notify.update(toastId, {
                render: 'Failed to register user in database after multiple attempts. Please check your internet connection and try again.',
                type: 'error',
                isLoading: false,
                autoClose: 8000,
              });
              throw new Error('Database registration required for creators. Please check your internet connection and try again.');
            }
            
            // For participants, continue without database (limited functionality)
            console.warn('⚠️ Continuing without database registration (limited functionality)');
            break;
          }
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * registrationAttempts));
        }
      }
      
      // Fetch real balance from blockchain
      let realBalance = 0;
      try {
        const { realMovementService } = await import('../services/realMovementService');
        await realMovementService.ensureInitialized();
        realBalance = await realMovementService.getAccountBalance(wallet.address);
        console.log(`💰 Real balance fetched: ${realBalance} MOVE`);
      } catch (balanceError) {
        console.warn('⚠️ Failed to fetch real balance:', balanceError);
        // Continue with 0 balance
      }
      
      set({ 
        user: { 
          ...user, 
          wallet: {
            ...wallet,
            balance: realBalance
          },
          dbId: dbUser?.id, // Store Supabase UUID separately
          dbUser 
        }, 
        isAuthenticated: true, 
        isLoading: false,
        userRole: role,
        balance: realBalance,
        useMockAuth: false // Always false for real implementation
      });
      
      // Store role and balance in localStorage
      localStorage.setItem('paypost_user_role', role);
      localStorage.setItem('paypost_user_balance', realBalance.toString());
      
      // Update success notification
      const successMessage = dbUser 
        ? 'Wallet connected and user registered successfully!'
        : 'Wallet connected successfully! (Database registration skipped)';
        
      notify.update(toastId, {
        render: successMessage,
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
          autoClose: 8000,
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
      
      await privyService.disconnectWallet();
      
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false,
        userRole: null,
        balance: 0,
        useMockAuth: false
      });
      localStorage.removeItem('paypost_user_role');
      localStorage.removeItem('paypost_user_balance');
      
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
  
  updateBalance: async (amount) => {
    const { balance } = get();
    const newBalance = balance + amount;
    
    // Update store balance
    get().setBalance(newBalance);
    return newBalance;
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