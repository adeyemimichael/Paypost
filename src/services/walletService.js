import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

class WalletService {
  constructor() {
    this.walletCache = new Map(); // Cache wallets by userId
    this.creationLocks = new Map(); // Prevent concurrent wallet creation
  }

  // Create Aptos wallet for user via backend
  async createAptosWallet(userId) {
    try {
      const response = await axios.post(`${API_BASE_URL}/wallets/create-aptos`, {
        userId
      });
      
      // Cache the wallet
      this.walletCache.set(userId, response.data.wallet);
      return response.data;
    } catch (error) {
      if (error.response?.status === 409) {
        // User already has Aptos wallet - return the existing one
        const existingWallet = error.response.data.wallet;
        if (existingWallet) {
          console.log('✅ Using existing wallet from 409 response:', existingWallet.address);
          this.walletCache.set(userId, existingWallet);
          return { wallet: existingWallet };
        } else {
          // Fallback: get it via getUserAptosWallet
          const existingWallet = await this.getUserAptosWallet(userId);
          return { wallet: existingWallet };
        }
      }
      
      throw new Error(error.response?.data?.error || 'Failed to create Aptos wallet');
    }
  }

  // Get user's wallets from backend
  async getUserWallets(userId) {
    try {
      console.log('🔍 Getting wallets from backend for user:', userId);
      const response = await axios.get(`${API_BASE_URL}/wallets/user/${userId}`);
      console.log('🔍 Backend response:', response.data);
      return response.data.wallets;
    } catch (error) {
      console.error('❌ Failed to get user wallets:', error);
      throw new Error(error.response?.data?.error || 'Failed to get user wallets');
    }
  }

  // Get user's specific Aptos wallet
  async getUserAptosWallet(userId) {
    try {
      console.log('🔍 Getting Aptos wallet for user:', userId);
      
      // Check cache first
      if (this.walletCache.has(userId)) {
        const cachedWallet = this.walletCache.get(userId);
        console.log('✅ Using cached Aptos wallet:', cachedWallet.address);
        return cachedWallet;
      }

      // Get from backend
      console.log('🔍 Fetching wallets from backend...');
      const wallets = await this.getUserWallets(userId);
      console.log('🔍 Backend returned wallets:', wallets.length);
      
      const aptosWallet = wallets.find(wallet => wallet.chainType === 'aptos');
      
      if (aptosWallet) {
        console.log('✅ Found Aptos wallet in backend response:', aptosWallet.address);
        
        // Cache it
        this.walletCache.set(userId, aptosWallet);
        return aptosWallet;
      }
      
      console.log('⚠️ No Aptos wallet found in backend response');
      return null;
    } catch (error) {
      console.error('❌ Failed to get user Aptos wallet:', error);
      return null;
    }
  }

  // Check if user has Aptos wallet
  async hasAptosWallet(userId) {
    try {
      const aptosWallet = await this.getUserAptosWallet(userId);
      return !!aptosWallet;
    } catch (error) {
      console.error('Failed to check Aptos wallet:', error);
      return false;
    }
  }

  // Ensure user has exactly one Aptos wallet (persistent across sessions)
  async ensureAptosWallet(userId, userEmail = null, userRole = null) {
    try {
      console.log('🔄 Ensuring persistent Aptos wallet for user:', userId);
      
      // Prevent concurrent wallet creation for same user
      if (this.creationLocks.has(userId)) {
        console.log('⏳ Wallet creation already in progress for user:', userId);
        await this.creationLocks.get(userId);
      }

      // Check cache first for performance
      if (this.walletCache.has(userId)) {
        const cachedWallet = this.walletCache.get(userId);
        console.log('✅ Using cached wallet:', cachedWallet.address);
        return cachedWallet;
      }
      
      // ALWAYS check backend first for existing wallet
      let aptosWallet = await this.getUserAptosWallet(userId);
      
      if (aptosWallet) {
        console.log('✅ Found existing Aptos wallet:', aptosWallet.address);
        
        // Ensure user data is persisted in database if provided
        if (userEmail || userRole) {
          await this.ensureUserDataPersistence(userId, aptosWallet.address, userEmail, userRole);
        }
        
        // Store in localStorage for faster future access
        const storageKey = `paypost_wallet_${userId}`;
        localStorage.setItem(storageKey, JSON.stringify(aptosWallet));
        return aptosWallet;
      }
      
      // Create lock to prevent concurrent creation
      const creationPromise = this.createWalletWithUserData(userId, userEmail, userRole);
      this.creationLocks.set(userId, creationPromise);
      
      try {
        const result = await creationPromise;
        return result;
      } finally {
        this.creationLocks.delete(userId);
      }
      
    } catch (error) {
      console.error('❌ Failed to ensure Aptos wallet:', error);
      this.creationLocks.delete(userId);
      throw error;
    }
  }

  // Create wallet and persist user data
  async createWalletWithUserData(userId, userEmail, userRole) {
    try {
      console.log('🔧 Creating new Aptos wallet with user data for:', userId);
      
      // Create the wallet first
      const result = await this.createAptosWallet(userId);
      
      // Persist user data in database if available
      if (userEmail || userRole) {
        await this.ensureUserDataPersistence(userId, result.wallet.address, userEmail, userRole);
      }
      
      // Store the new wallet in localStorage
      const storageKey = `paypost_wallet_${userId}`;
      localStorage.setItem(storageKey, JSON.stringify(result.wallet));
      
      console.log('✅ New Aptos wallet created with user data:', result.wallet.address);
      return result.wallet;
      
    } catch (error) {
      console.error('❌ Failed to create wallet with user data:', error);
      throw error;
    }
  }

  async ensureUserDataPersistence(userId, walletAddress, email, role) {
    try {
      const { supabaseService } = await import('./supabaseService.js');
      
      if (!supabaseService.initialized) {
        await supabaseService.initialize();
      }
      
      if (supabaseService.initialized) {
        await supabaseService.getOrCreateUser(walletAddress, email, role, userId);
      }
    } catch (error) {
      console.error('Failed to persist user data:', error);
    }
  }

  // Fetch complete wallet info to get missing publicKey
  async getCompleteWalletInfo(walletId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/wallets/${walletId}/complete`);
      return response.data.wallet;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to get complete wallet info');
    }
  }

  // Ensure wallet has all required fields (including publicKey)
  async ensureCompleteWallet(wallet) {
    try {
      // If wallet already has publicKey, return as is
      if (wallet.publicKey || wallet.public_key) {
        return wallet;
      }

      console.log('Wallet missing publicKey, fetching complete info...');
      
      // Fetch complete wallet info from backend/Privy
      const completeWallet = await this.getCompleteWalletInfo(wallet.id);
      
      // Merge the complete info with existing wallet
      const updatedWallet = {
        ...wallet,
        publicKey: completeWallet.publicKey
      };

      console.log('Updated wallet with publicKey:', updatedWallet.address);
      return updatedWallet;
      
    } catch (error) {
      console.error('Failed to ensure complete wallet:', error);
      // Return original wallet even if we couldn't get publicKey
      return wallet;
    }
  }

  // Clear cache for user (useful for testing)
  clearCache(userId) {
    this.walletCache.delete(userId);
  }

  // Clear all cache
  clearAllCache() {
    this.walletCache.clear();
    // Also clear localStorage wallet cache
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('paypost_wallet_') || key === 'paypost-wallet-store') {
        localStorage.removeItem(key);
      }
    });
    console.log('All wallet cache cleared');
  }
}

export const walletService = new WalletService();