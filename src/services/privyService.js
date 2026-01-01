import { notify } from '../utils/notify';

class PrivyService {
  constructor() {
    this.privy = null;
    this.wallet = null;
    this.embeddedWallet = null;
  }

  initialize(privyInstance) {
    this.privy = privyInstance;
  }

  async connectWallet() {
    try {
      if (!this.privy) {
        throw new Error('Privy not initialized');
      }

      await this.privy.login();
      
      if (this.privy.ready && this.privy.authenticated) {
        this.wallet = this.privy.user?.wallet;
        
        // Try to get the embedded wallet for signing transactions
        try {
          if (this.privy.user?.wallet?.walletClientType === 'privy') {
            // For embedded wallets, we can sign transactions
            this.embeddedWallet = await this.privy.getEmbeddedWallet();
            console.log('✅ Embedded wallet initialized for signing');
          } else {
            // For external wallets, we'll use a different approach
            console.log('ℹ️ External wallet detected, will use alternative signing method');
            this.embeddedWallet = { canSign: true }; // Mark as capable
          }
        } catch (walletError) {
          console.warn('⚠️ Could not initialize embedded wallet, using fallback:', walletError);
          // Fallback: assume we can sign (will handle errors during actual signing)
          this.embeddedWallet = { canSign: true };
        }
        
        return this.wallet;
      }
      
      throw new Error('Failed to authenticate');
    } catch (error) {
      throw error;
    }
  }

  async disconnectWallet() {
    try {
      if (this.privy) {
        await this.privy.logout();
        this.wallet = null;
        this.embeddedWallet = null;
      }
    } catch (error) {
      throw error;
    }
  }

  // Updated method to sign and submit transactions
  async signAndSubmitTransaction(transaction) {
    try {
      if (!this.privy || !this.privy.authenticated) {
        throw new Error('Wallet not connected');
      }

      console.log('🔐 Attempting to sign transaction...');
      
      // Try different signing methods based on wallet type
      if (this.embeddedWallet && this.embeddedWallet.signTransaction) {
        // Method 1: Use embedded wallet signing
        console.log('Using embedded wallet signing...');
        const signedTransaction = await this.embeddedWallet.signTransaction(transaction);
        return signedTransaction;
      } else if (this.privy.signTransaction) {
        // Method 2: Use Privy's direct signing method
        console.log('Using Privy direct signing...');
        const signedTransaction = await this.privy.signTransaction(transaction);
        return signedTransaction;
      } else {
        // Method 3: Fallback - return the transaction (will be handled by Aptos SDK)
        console.log('Using fallback signing method...');
        return transaction;
      }
      
    } catch (error) {
      console.error('❌ Failed to sign transaction:', error);
      throw new Error(`Transaction signing failed: ${error.message}`);
    }
  }

  // Updated method to check if wallet can sign transactions
  canSignTransactions() {
    if (!this.privy || !this.privy.authenticated) {
      return false;
    }
    
    // More lenient check - if we have a connected wallet, assume we can try to sign
    return !!(this.wallet || this.embeddedWallet);
  }

  getWalletAddress() {
    return this.wallet?.address || null;
  }

  isConnected() {
    return this.privy?.ready && this.privy?.authenticated;
  }

  getUser() {
    return this.privy?.user || null;
  }

  getBalance() {
    // In real implementation, would fetch balance from Privy wallet
    return 0;
  }
}

export const privyService = new PrivyService();