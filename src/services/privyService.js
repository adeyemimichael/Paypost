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

      // Login with Privy
      await this.privy.login();
      
      if (this.privy.ready && this.privy.authenticated) {
        const privyUser = this.privy.user;
        console.log('Privy user authenticated:', privyUser);
        
        // Get wallet address from Privy user
        let walletAddress = null;
        let walletType = 'embedded';
        
        // Check for embedded wallet first
        if (privyUser?.wallet?.address) {
          walletAddress = privyUser.wallet.address;
          walletType = privyUser.wallet.walletClientType || 'embedded';
        } 
        // Check linked accounts for external wallets
        else if (privyUser?.linkedAccounts) {
          const walletAccount = privyUser.linkedAccounts.find(account => 
            account.type === 'wallet' || account.type === 'ethereum_wallet'
          );
          if (walletAccount?.address) {
            walletAddress = walletAccount.address;
            walletType = 'external';
          }
        }
        
        if (!walletAddress) {
          throw new Error('No wallet found in Privy user account. Please ensure you have a wallet connected.');
        }
        
        // Validate wallet address format
        if (!walletAddress.startsWith('0x') || walletAddress.length !== 42) {
          throw new Error(`Invalid wallet address format: ${walletAddress}`);
        }
        
        this.wallet = {
          address: walletAddress,
          type: walletType,
          balance: 0, // Will be fetched from blockchain
          canSign: true,
          ...privyUser?.wallet
        };
        
        console.log('✅ Wallet connected:', {
          address: walletAddress,
          type: walletType
        });
        
        // Initialize embedded wallet for signing if available
        if (walletType === 'embedded' || privyUser?.wallet?.walletClientType === 'privy') {
          try {
            this.embeddedWallet = await this.privy.getEmbeddedWallet();
            console.log('✅ Embedded wallet initialized for signing');
          } catch (walletError) {
            console.warn('⚠️ Could not initialize embedded wallet:', walletError);
            // For embedded wallets, this is a real issue
            throw new Error('Failed to initialize embedded wallet for signing');
          }
        }
        
        return this.wallet;
      }
      
      throw new Error('Privy authentication failed');
    } catch (error) {
      console.error('❌ Privy wallet connection failed:', error);
      throw error;
    }
  }

  async disconnectWallet() {
    try {
      if (this.privy) {
        await this.privy.logout();
        this.wallet = null;
        this.embeddedWallet = null;
        console.log('✅ Wallet disconnected');
      }
    } catch (error) {
      console.error('❌ Failed to disconnect wallet:', error);
      throw error;
    }
  }

  // Sign and submit transaction for Movement blockchain
  async signAndSubmitTransaction(transaction) {
    try {
      if (!this.privy || !this.privy.authenticated) {
        throw new Error('Wallet not connected');
      }

      if (!this.wallet) {
        throw new Error('No wallet available');
      }

      console.log('🔐 Signing transaction with Privy wallet...');
      
      // For embedded wallets, use Privy's signing
      if (this.embeddedWallet && this.embeddedWallet.signTransaction) {
        console.log('Using Privy embedded wallet signing...');
        const signedTransaction = await this.embeddedWallet.signTransaction(transaction);
        return signedTransaction;
      } 
      // For external wallets, delegate to Movement wallet service
      else if (this.wallet.type === 'external') {
        console.log('External wallet detected, delegating to Movement wallet service...');
        // Import and use Movement wallet service for external wallets
        const { movementWalletService } = await import('./nightlyWalletService');
        
        if (!movementWalletService.isConnected) {
          // Try to connect the Movement wallet
          await movementWalletService.connectWallet('auto');
        }
        
        return await movementWalletService.signAndSubmitTransaction(transaction);
      }
      else {
        throw new Error('No signing method available for this wallet type');
      }
      
    } catch (error) {
      console.error('❌ Transaction signing failed:', error);
      throw new Error(`Transaction signing failed: ${error.message}`);
    }
  }

  canSignTransactions() {
    if (!this.privy || !this.privy.authenticated || !this.wallet) {
      return false;
    }
    
    // Check if we have a signing method available
    return !!(this.embeddedWallet || this.wallet.type === 'external');
  }

  getWalletAddress() {
    return this.wallet?.address || null;
  }

  isConnected() {
    return this.privy?.ready && this.privy?.authenticated && !!this.wallet;
  }

  getUser() {
    const privyUser = this.privy?.user;
    if (!privyUser) return null;
    
    return {
      id: privyUser.id,
      email: privyUser.email?.address || `user@paypost.xyz`,
      wallet: this.wallet,
      createdAt: privyUser.createdAt,
      ...privyUser
    };
  }

  getBalance() {
    return this.wallet?.balance || 0;
  }
}

export const privyService = new PrivyService();