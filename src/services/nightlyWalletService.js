// Nightly Wallet integration for Movement blockchain
import { notify } from '../utils/notify';

class NightlyWalletService {
  constructor() {
    this.wallet = null;
    this.isConnected = false;
  }

  async connectWallet() {
    try {
      // Check if Nightly wallet is installed
      if (!window.nightly) {
        throw new Error('Nightly wallet not installed. Please install from https://nightly.app');
      }

      const toastId = notify.loading('Connecting to Nightly wallet...');

      // Connect to Nightly wallet
      const response = await window.nightly.connect();
      
      if (response && response.publicKey) {
        this.wallet = {
          address: response.publicKey.toString(),
          publicKey: response.publicKey
        };
        this.isConnected = true;

        notify.update(toastId, {
          render: 'Nightly wallet connected successfully!',
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        });

        return this.wallet;
      }

      throw new Error('Failed to connect to Nightly wallet');
    } catch (error) {
      console.error('Nightly wallet connection failed:', error);
      notify.error(`Failed to connect Nightly wallet: ${error.message}`);
      throw error;
    }
  }

  async disconnectWallet() {
    try {
      if (window.nightly && this.isConnected) {
        await window.nightly.disconnect();
      }
      
      this.wallet = null;
      this.isConnected = false;
      
      notify.success('Nightly wallet disconnected');
    } catch (error) {
      console.error('Failed to disconnect Nightly wallet:', error);
      throw error;
    }
  }

  async signAndSubmitTransaction(transaction) {
    try {
      if (!this.isConnected || !window.nightly) {
        throw new Error('Nightly wallet not connected');
      }

      console.log('🔐 Signing transaction with Nightly wallet...');

      // Sign the transaction with Nightly wallet
      const signedTransaction = await window.nightly.signTransaction(transaction);
      
      console.log('✅ Transaction signed with Nightly wallet');
      return signedTransaction;
      
    } catch (error) {
      console.error('❌ Nightly wallet signing failed:', error);
      throw new Error(`Nightly wallet signing failed: ${error.message}`);
    }
  }

  canSignTransactions() {
    return this.isConnected && !!window.nightly;
  }

  getWalletAddress() {
    return this.wallet?.address || null;
  }

  getUser() {
    return {
      id: this.wallet?.address || 'nightly_user',
      wallet: this.wallet,
      email: `${this.wallet?.address?.slice(0, 8)}@nightly.app`
    };
  }

  getBalance() {
    // Would implement balance fetching from Movement blockchain
    return 0;
  }

  isWalletInstalled() {
    return !!window.nightly;
  }
}

export const nightlyWalletService = new NightlyWalletService();