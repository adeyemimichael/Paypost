import { notify } from '../utils/notify';

class PrivyService {
  constructor() {
    this.privy = null;
    this.wallet = null;
  }

  initialize(privyInstance) {
    this.privy = privyInstance;
  }

  async connectWallet() {
    try {
      if (!this.privy) {
        throw new Error('Privy not initialized');
      }

      const toastId = notify.loading('Connecting wallet...');
      
      await this.privy.login();
      
      if (this.privy.ready && this.privy.authenticated) {
        this.wallet = this.privy.user?.wallet;
        notify.update(toastId, {
          render: 'Wallet connected successfully!',
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        });
        return this.wallet;
      }
      
      throw new Error('Failed to authenticate');
    } catch (error) {
      notify.error(`Failed to connect wallet: ${error.message}`);
      throw error;
    }
  }

  async disconnectWallet() {
    try {
      if (this.privy) {
        await this.privy.logout();
        this.wallet = null;
        notify.success('Wallet disconnected');
      }
    } catch (error) {
      notify.error(`Failed to disconnect wallet: ${error.message}`);
      throw error;
    }
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
}

export const privyService = new PrivyService();