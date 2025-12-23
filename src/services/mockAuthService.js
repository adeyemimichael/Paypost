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
        
        this.wallet = {
          address: mockAddress,
          balance: 10.0, // Mock balance of 10 MOVE tokens
        };
        
        this.user = {
          id: `user_${Date.now()}`,
          email: 'demo@paypost.xyz',
          wallet: this.wallet,
        };
        
        this.isAuthenticated = true;
        
        notify.success('Mock wallet connected successfully!');
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
        
        notify.success('Wallet disconnected');
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
}

export const mockAuthService = new MockAuthService();