import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

class WalletService {
  // Create Aptos wallet for user via backend
  async createAptosWallet(userId) {
    try {
      const response = await axios.post(`${API_BASE_URL}/wallets/create-aptos`, {
        userId
      });
      
      return response.data;
    } catch (error) {
      if (error.response?.status === 409) {
        // User already has Aptos wallet
        throw new Error('User already has an Aptos wallet');
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

  // Check if user has Aptos wallet
  async hasAptosWallet(userId) {
    try {
      const wallets = await this.getUserWallets(userId);
      return wallets.some(wallet => wallet.chainType === 'aptos');
    } catch (error) {
      console.error('Failed to check Aptos wallet:', error);
      return false;
    }
  }

  // Ensure user has Aptos wallet (create if doesn't exist)
  async ensureAptosWallet(userId) {
    try {
      const hasAptos = await this.hasAptosWallet(userId);
      
      if (!hasAptos) {
        console.log('Creating Aptos wallet for user:', userId);
        const result = await this.createAptosWallet(userId);
        console.log('Aptos wallet created:', result.wallet);
        return result.wallet;
      }
      
      // Get existing Aptos wallet
      const wallets = await this.getUserWallets(userId);
      return wallets.find(wallet => wallet.chainType === 'aptos');
      
    } catch (error) {
      if (error.message.includes('already has an Aptos wallet')) {
        // Get the existing wallet
        const wallets = await this.getUserWallets(userId);
        return wallets.find(wallet => wallet.chainType === 'aptos');
      }
      
      throw error;
    }
  }
}

export const walletService = new WalletService();