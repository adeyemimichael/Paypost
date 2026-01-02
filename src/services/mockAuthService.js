// Mock authentication service for development/demo when Privy is unavailable
import { notify } from '../utils/notify';

class MockAuthService {
  constructor() {
    this.isAuthenticated = false;
    this.user = null;
    this.wallet = null;
  }

  async connectWallet() {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Generate mock wallet address
        const mockAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
        
        // Try to load persisted balance, otherwise use default
        const savedBalance = localStorage.getItem('paypost_mock_balance');
        const initialBalance = savedBalance ? parseFloat(savedBalance) : 10.0;
        
        this.wallet = {
          address: mockAddress,
          balance: initialBalance,
        };
        
        this.user = {
          id: `user_${Date.now()}`,
          email: 'demo@paypost.xyz',
          wallet: this.wallet,
        };
        
        this.isAuthenticated = true;
        
        // Don't show notification here - let the calling component handle it
        resolve(this.wallet);
      }, 1000);
    });
  }

  async disconnectWallet() {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isAuthenticated = false;
        this.user = null;
        this.wallet = null;
        
        // Clear persisted balance
        localStorage.removeItem('paypost_mock_balance');
        
        // Don't show notification here - let the calling component handle it
        resolve();
      }, 500);
    });
  }

  getUser() {
    return this.user;
  }

  isReady() {
    return true;
  }

  isUserAuthenticated() {
    return this.isAuthenticated;
  }

  getWalletAddress() {
    return this.wallet?.address || null;
  }

  getBalance() {
    return this.wallet?.balance || 0;
  }

  // Mock transaction signing
  async signTransaction(transaction) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          hash: `0x${Math.random().toString(16).substr(2, 64)}`,
          signature: `0x${Math.random().toString(16).substr(2, 128)}`,
        });
      }, 2000);
    });
  }

  // Mock balance update (simulate earning tokens)
  addBalance(amount) {
    if (this.wallet) {
      this.wallet.balance += amount;
      // Persist to localStorage
      localStorage.setItem('paypost_mock_balance', this.wallet.balance.toString());
      console.log(`💰 Mock wallet: Added ${amount} MOVE. New balance: ${this.wallet.balance}`);
    }
  }

  // Mock balance deduction (simulate spending tokens)
  deductBalance(amount) {
    if (this.wallet && this.wallet.balance >= amount) {
      this.wallet.balance -= amount;
      // Persist to localStorage
      localStorage.setItem('paypost_mock_balance', this.wallet.balance.toString());
      console.log(`💸 Mock wallet: Deducted ${amount} MOVE. New balance: ${this.wallet.balance}`);
      return true;
    }
    console.warn(`⚠️ Mock wallet: Insufficient balance. Tried to deduct ${amount}, but only have ${this.wallet?.balance || 0}`);
    return false;
  }
}

export const mockAuthService = new MockAuthService();