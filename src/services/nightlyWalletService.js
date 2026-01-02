// Movement Wallet Service - Handles real transactions on Movement blockchain
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import { notify } from '../utils/notify';

class MovementWalletService {
  constructor() {
    this.wallet = null;
    this.isConnected = false;
    this.aptos = null;
    this.walletType = null; // 'nightly', 'petra', 'martian', etc.
  }

  async initialize() {
    try {
      // Initialize Aptos SDK for Movement testnet
      const config = new AptosConfig({
        network: Network.CUSTOM,
        fullnode: import.meta.env.VITE_MOVEMENT_RPC_URL || 'https://testnet.movementnetwork.xyz/v1',
        indexer: import.meta.env.VITE_MOVEMENT_RPC_URL || 'https://testnet.movementnetwork.xyz/v1',
      });
      
      this.aptos = new Aptos(config);
      console.log('✅ Movement wallet service initialized with real testnet');
      console.log('🔧 RPC URL:', import.meta.env.VITE_MOVEMENT_RPC_URL);
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Movement wallet service:', error);
      return false;
    }
  }

  async connectWallet(preferredWallet = 'auto') {
    try {
      await this.initialize();
      
      const toastId = notify.loading('Connecting to Movement wallet...');

      let wallet = null;
      let walletType = null;

      // Try different wallet options in order of preference
      if (preferredWallet === 'nightly' || preferredWallet === 'auto') {
        wallet = await this.tryConnectNightly();
        if (wallet) walletType = 'nightly';
      }

      if (!wallet && (preferredWallet === 'petra' || preferredWallet === 'auto')) {
        wallet = await this.tryConnectPetra();
        if (wallet) walletType = 'petra';
      }

      if (!wallet && (preferredWallet === 'martian' || preferredWallet === 'auto')) {
        wallet = await this.tryConnectMartian();
        if (wallet) walletType = 'martian';
      }

      if (!wallet) {
        throw new Error('No compatible wallet found. Please install Nightly, Petra, or Martian wallet.');
      }

      this.wallet = wallet;
      this.walletType = walletType;
      this.isConnected = true;

      notify.update(toastId, {
        render: `✅ ${walletType.charAt(0).toUpperCase() + walletType.slice(1)} wallet connected!`,
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });

      console.log(`✅ Connected to ${walletType} wallet:`, wallet.address);
      return this.wallet;

    } catch (error) {
      console.error('❌ Wallet connection failed:', error);
      notify.error(`Failed to connect wallet: ${error.message}`);
      throw error;
    }
  }

  async tryConnectNightly() {
    try {
      if (!window.nightly) {
        console.log('Nightly wallet not found');
        return null;
      }

      const response = await window.nightly.connect();
      if (response && response.publicKey) {
        return {
          address: response.publicKey.toString(),
          publicKey: response.publicKey,
          signTransaction: (tx) => window.nightly.signTransaction(tx),
          signAndSubmitTransaction: (tx) => window.nightly.signAndSubmitTransaction(tx)
        };
      }
      return null;
    } catch (error) {
      console.log('Nightly connection failed:', error);
      return null;
    }
  }

  async tryConnectPetra() {
    try {
      if (!window.aptos) {
        console.log('Petra wallet not found');
        return null;
      }

      const response = await window.aptos.connect();
      if (response && response.address) {
        return {
          address: response.address,
          publicKey: response.publicKey,
          signTransaction: (tx) => window.aptos.signTransaction(tx),
          signAndSubmitTransaction: (tx) => window.aptos.signAndSubmitTransaction(tx)
        };
      }
      return null;
    } catch (error) {
      console.log('Petra connection failed:', error);
      return null;
    }
  }

  async tryConnectMartian() {
    try {
      if (!window.martian) {
        console.log('Martian wallet not found');
        return null;
      }

      const response = await window.martian.connect();
      if (response && response.address) {
        return {
          address: response.address,
          publicKey: response.publicKey,
          signTransaction: (tx) => window.martian.signTransaction(tx),
          signAndSubmitTransaction: (tx) => window.martian.signAndSubmitTransaction(tx)
        };
      }
      return null;
    } catch (error) {
      console.log('Martian connection failed:', error);
      return null;
    }
  }

  async disconnectWallet() {
    try {
      if (this.isConnected) {
        // Disconnect based on wallet type
        if (this.walletType === 'nightly' && window.nightly) {
          await window.nightly.disconnect();
        } else if (this.walletType === 'petra' && window.aptos) {
          await window.aptos.disconnect();
        } else if (this.walletType === 'martian' && window.martian) {
          await window.martian.disconnect();
        }
      }
      
      this.wallet = null;
      this.walletType = null;
      this.isConnected = false;
      
      notify.success('Wallet disconnected');
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      throw error;
    }
  }

  async signAndSubmitTransaction(transactionPayload) {
    try {
      if (!this.isConnected || !this.wallet) {
        throw new Error('Wallet not connected');
      }

      console.log('🔐 Building and signing transaction...');
      console.log('Transaction payload:', transactionPayload);

      // Build the transaction using Aptos SDK
      const transaction = await this.aptos.transaction.build.simple({
        sender: this.wallet.address,
        data: {
          function: transactionPayload.function,
          typeArguments: transactionPayload.type_arguments || [],
          functionArguments: transactionPayload.arguments || []
        }
      });

      console.log('📝 Transaction built:', transaction);

      // Sign and submit the transaction
      let pendingTransaction;
      
      if (this.wallet.signAndSubmitTransaction) {
        // Use wallet's built-in sign and submit
        console.log('Using wallet signAndSubmitTransaction...');
        pendingTransaction = await this.wallet.signAndSubmitTransaction(transaction);
      } else if (this.wallet.signTransaction) {
        // Sign first, then submit manually
        console.log('Using wallet signTransaction + manual submit...');
        const signedTransaction = await this.wallet.signTransaction(transaction);
        pendingTransaction = await this.aptos.transaction.submit.simple(signedTransaction);
      } else {
        throw new Error('Wallet does not support transaction signing');
      }

      console.log('📤 Transaction submitted:', pendingTransaction);

      // Wait for confirmation
      const confirmedTransaction = await this.aptos.waitForTransaction({
        transactionHash: pendingTransaction.hash
      });

      console.log('✅ Transaction confirmed:', confirmedTransaction);

      return {
        hash: pendingTransaction.hash,
        success: confirmedTransaction.success,
        transaction: confirmedTransaction
      };

    } catch (error) {
      console.error('❌ Transaction signing/submission failed:', error);
      throw new Error(`Transaction failed: ${error.message}`);
    }
  }

  async getAccountBalance(address = null) {
    try {
      const targetAddress = address || this.wallet?.address;
      if (!targetAddress) {
        throw new Error('No address provided');
      }

      await this.initialize();

      // Get account resources to find APT balance
      const resources = await this.aptos.getAccountResources({
        accountAddress: targetAddress
      });

      // Look for the APT coin resource
      const aptResource = resources.find(resource => 
        resource.type === '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>'
      );

      if (aptResource && aptResource.data && aptResource.data.coin) {
        const balance = parseInt(aptResource.data.coin.value);
        // Convert from Octas to MOVE (1 MOVE = 100,000,000 Octas)
        return balance / 100000000;
      }

      return 0;
    } catch (error) {
      console.error('Failed to get account balance:', error);
      return 0;
    }
  }

  canSignTransactions() {
    return this.isConnected && this.wallet && (
      this.wallet.signTransaction || this.wallet.signAndSubmitTransaction
    );
  }

  getWalletAddress() {
    return this.wallet?.address || null;
  }

  getWalletType() {
    return this.walletType;
  }

  getUser() {
    return {
      id: this.wallet?.address || 'movement_user',
      wallet: this.wallet,
      email: `${this.wallet?.address?.slice(0, 8)}@${this.walletType || 'movement'}.app`,
      walletType: this.walletType
    };
  }

  isWalletInstalled(walletType = 'any') {
    if (walletType === 'nightly') return !!window.nightly;
    if (walletType === 'petra') return !!window.aptos;
    if (walletType === 'martian') return !!window.martian;
    
    // Check if any wallet is installed
    return !!(window.nightly || window.aptos || window.martian);
  }

  getAvailableWallets() {
    const wallets = [];
    
    if (window.nightly) {
      wallets.push({
        name: 'Nightly',
        type: 'nightly',
        icon: '🌙',
        installed: true
      });
    }
    
    if (window.aptos) {
      wallets.push({
        name: 'Petra',
        type: 'petra', 
        icon: '🪨',
        installed: true
      });
    }
    
    if (window.martian) {
      wallets.push({
        name: 'Martian',
        type: 'martian',
        icon: '👽',
        installed: true
      });
    }

    // Add not installed wallets
    if (!window.nightly) {
      wallets.push({
        name: 'Nightly',
        type: 'nightly',
        icon: '🌙',
        installed: false,
        downloadUrl: 'https://nightly.app'
      });
    }

    if (!window.aptos) {
      wallets.push({
        name: 'Petra',
        type: 'petra',
        icon: '🪨', 
        installed: false,
        downloadUrl: 'https://petra.app'
      });
    }

    return wallets;
  }
}

export const movementWalletService = new MovementWalletService();

// Keep the old export for backward compatibility
export const nightlyWalletService = movementWalletService;