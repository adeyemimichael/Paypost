import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

class WalletService {
  constructor() {
    this.walletCache = new Map(); // Cache wallets by userId
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
        // User already has Aptos wallet - get it
        const existingWallet = await this.getUserAptosWallet(userId);
        return { wallet: existingWallet };
      }
      
      throw new Error(error.response?.data?.error || 'Failed to create Aptos wallet');
    }
  }

  // Get user's wallets from backend
  async getUserWallets(userId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/wallets/user/${userId}`);
      return response.data.wallets;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to get user wallets');
    }
  }

  // Get user's specific Aptos wallet
  async getUserAptosWallet(userId) {
    try {
      // Check cache first
      if (this.walletCache.has(userId)) {
        const cachedWallet = this.walletCache.get(userId);
        console.log('Using cached Aptos wallet:', cachedWallet);
        return cachedWallet;
      }

      // Get from backend
      const wallets = await this.getUserWallets(userId);
      const aptosWallet = wallets.find(wallet => wallet.chainType === 'aptos');
      
      if (aptosWallet) {
        // If wallet is missing publicKey, try to get it from the full wallet list
        if (!aptosWallet.publicKey) {
          console.log('Wallet missing publicKey, attempting to fetch from backend...');
          // For now, we'll handle this in the movement service
        }
        
        // Cache it
        this.walletCache.set(userId, aptosWallet);
        console.log('Found and cached Aptos wallet:', aptosWallet);
        return aptosWallet;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get user Aptos wallet:', error);
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
  async ensureAptosWallet(userId) {
    try {
      console.log('Ensuring persistent Aptos wallet for user:', userId);
      
      // ALWAYS check backend first for existing wallet
      let aptosWallet = await this.getUserAptosWallet(userId);
      
      if (aptosWallet) {
        console.log('✅ Found existing Aptos wallet:', aptosWallet.address);
        // Store in localStorage for faster future access
        const storageKey = `paypost_wallet_${userId}`;
        localStorage.setItem(storageKey, JSON.stringify(aptosWallet));
        return aptosWallet;
      }
      
      // Check localStorage as secondary option (but verify with backend)
      const storageKey = `paypost_wallet_${userId}`;
      const storedWallet = localStorage.getItem(storageKey);
      
      if (storedWallet) {
        try {
          const wallet = JSON.parse(storedWallet);
          console.log('Found stored wallet, verifying with backend:', wallet.address);
          
          // Verify this wallet still exists in backend
          const backendWallets = await this.getUserWallets(userId);
          const matchingWallet = backendWallets.find(w => w.address === wallet.address);
          
          if (matchingWallet) {
            console.log('✅ Verified stored wallet exists in backend');
            this.walletCache.set(userId, matchingWallet);
            return matchingWallet;
          } else {
            console.log('⚠️ Stored wallet not found in backend, removing from storage');
            localStorage.removeItem(storageKey);
          }
        } catch (error) {
          console.error('Failed to parse stored wallet, removing:', error);
          localStorage.removeItem(storageKey);
        }
      }
      
      // Only create new wallet if absolutely none exists
      console.log('Creating new Aptos wallet for user:', userId);
      const result = await this.createAptosWallet(userId);
      
      // Store the new wallet in localStorage
      localStorage.setItem(storageKey, JSON.stringify(result.wallet));
      
      console.log('✅ New Aptos wallet created:', result.wallet.address);
      return result.wallet;
      
    } catch (error) {
      console.error('Failed to ensure Aptos wallet:', error);
      throw error;
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