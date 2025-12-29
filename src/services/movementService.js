import { Aptos, AptosConfig, Network, Account, Ed25519PrivateKey } from '@aptos-labs/ts-sdk';
import { notify } from '../utils/notify';

class MovementService {
  constructor() {
    this.aptos = null;
    this.contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
    this.initialized = false;
  }

  async initialize() {
    try {
      // Initialize Aptos SDK with Movement testnet configuration
      const config = new AptosConfig({
        network: Network.CUSTOM,
        fullnode: import.meta.env.VITE_MOVEMENT_RPC_URL,
        indexer: import.meta.env.VITE_MOVEMENT_RPC_URL,
      });
      
      this.aptos = new Aptos(config);
      this.initialized = true;
      
      console.log('Movement service initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Movement service:', error);
      notify.error('Failed to connect to Movement network');
      return false;
    }
  }

  async ensureInitialized() {
    if (!this.initialized) {
      await this.initialize();
    }
    if (!this.initialized) {
      throw new Error('Movement service not initialized');
    }
  }

  async completeSurvey(surveyId, responses, walletAddress) {
    try {
      await this.ensureInitialized();
      
      const toastId = notify.loading('Submitting survey...');
      
      // Create response hash from survey responses
      const responseHash = this.createResponseHash(responses);
      
      // Build transaction payload
      const transaction = {
        function: `${this.contractAddress}::ContentPlatform::complete_survey`,
        type_arguments: [],
        arguments: [
          surveyId.toString(),
          Array.from(new TextEncoder().encode(responseHash))
        ]
      };

      // For now, simulate the transaction since we need wallet integration
      // In production, this would use the connected wallet to sign
      const result = await this.simulateTransaction(transaction);
      
      notify.update(toastId, {
        render: `Survey completed! Transaction: ${result.hash}`,
        type: 'success',
        isLoading: false,
        autoClose: 5000,
      });

      return { 
        success: true, 
        txHash: result.hash, 
        reward: result.reward 
      };
    } catch (error) {
      console.error('Failed to complete survey:', error);
      notify.error(`Failed to complete survey: ${error.message}`);
      throw error;
    }
  }

  async createSurvey(surveyData, walletAddress) {
    try {
      await this.ensureInitialized();
      
      const toastId = notify.loading('Creating and funding survey...');
      
      // Calculate duration in seconds
      const durationSeconds = surveyData.durationSeconds || (7 * 24 * 60 * 60);
      
      const transaction = {
        function: `${this.contractAddress}::ContentPlatform::create_and_fund_survey`,
        type_arguments: [],
        arguments: [
          Array.from(new TextEncoder().encode(surveyData.title)),
          Array.from(new TextEncoder().encode(surveyData.description)),
          (surveyData.rewardAmount * 1000000).toString(), // Convert to micro-MOVE
          surveyData.maxResponses.toString(),
          durationSeconds.toString()
        ]
      };

      const result = await this.simulateTransaction(transaction);
      
      notify.update(toastId, {
        render: `Survey created and funded! ID: ${result.surveyId}`,
        type: 'success',
        isLoading: false,
        autoClose: 5000,
      });

      return { 
        success: true, 
        txHash: result.hash, 
        surveyId: result.surveyId 
      };
    } catch (error) {
      console.error('Failed to create survey:', error);
      notify.error(`Failed to create survey: ${error.message}`);
      throw error;
    }
  }

  async getCreatorSurveys(walletAddress) {
    try {
      await this.ensureInitialized();
      
      const result = await this.aptos.view({
        function: `${this.contractAddress}::ContentPlatform::get_creator_surveys`,
        type_arguments: [],
        arguments: [walletAddress]
      });
      
      return result[0] || [];
    } catch (error) {
      console.error('Failed to get creator surveys:', error);
      return [];
    }
  }

  async getActiveSurveys() {
    try {
      await this.ensureInitialized();
      
      const result = await this.aptos.view({
        function: `${this.contractAddress}::ContentPlatform::get_active_surveys`,
        type_arguments: [],
        arguments: []
      });
      
      return result[0] || [];
    } catch (error) {
      console.error('Failed to get active surveys:', error);
      return [];
    }
  }

  async closeSurvey(surveyId, walletAddress) {
    try {
      await this.ensureInitialized();
      
      const toastId = notify.loading('Closing survey...');
      
      const transaction = {
        function: `${this.contractAddress}::ContentPlatform::close_survey`,
        type_arguments: [],
        arguments: [surveyId.toString()]
      };

      const result = await this.simulateTransaction(transaction);
      
      notify.update(toastId, {
        render: 'Survey closed successfully!',
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });

      return { success: true, txHash: result.hash };
    } catch (error) {
      console.error('Failed to close survey:', error);
      notify.error(`Failed to close survey: ${error.message}`);
      throw error;
    }
  }

  async tipCreator(creatorAddress, amount, walletAddress) {
    try {
      await this.ensureInitialized();
      
      const toastId = notify.loading('Sending tip...');
      
      const transaction = {
        function: `${this.contractAddress}::ContentPlatform::tip_creator`,
        type_arguments: [],
        arguments: [
          creatorAddress,
          amount.toString()
        ]
      };

      const result = await this.simulateTransaction(transaction);
      
      notify.update(toastId, {
        render: 'Tip sent successfully!',
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });

      return { success: true, txHash: result.hash };
    } catch (error) {
      console.error('Failed to send tip:', error);
      notify.error(`Failed to send tip: ${error.message}`);
      throw error;
    }
  }

  async hasSurveyCompleted(surveyId, walletAddress) {
    try {
      await this.ensureInitialized();
      
      const result = await this.aptos.view({
        function: `${this.contractAddress}::ContentPlatform::has_completed_survey`,
        type_arguments: [],
        arguments: [walletAddress, surveyId.toString()]
      });
      
      return result[0] || false;
    } catch (error) {
      console.error('Failed to check survey completion:', error);
      // Return false on error to allow user to attempt
      return false;
    }
  }

  async getSurveyDetails(surveyId) {
    try {
      await this.ensureInitialized();
      
      const result = await this.aptos.view({
        function: `${this.contractAddress}::ContentPlatform::get_survey`,
        type_arguments: [],
        arguments: [surveyId.toString()]
      });
      
      return {
        creator: result[0],
        title: new TextDecoder().decode(new Uint8Array(result[1])),
        rewardAmount: parseInt(result[2]),
        maxResponses: parseInt(result[3]),
        currentResponses: parseInt(result[4]),
        isActive: result[5]
      };
    } catch (error) {
      console.error('Failed to get survey details:', error);
      throw error;
    }
  }

  async getUserEarnings(walletAddress) {
    try {
      await this.ensureInitialized();
      
      const result = await this.aptos.view({
        function: `${this.contractAddress}::ContentPlatform::get_user_earnings`,
        type_arguments: [],
        arguments: [walletAddress]
      });
      
      return parseInt(result[0]) || 0;
    } catch (error) {
      console.error('Failed to get user earnings:', error);
      return 0;
    }
  }

  async getPlatformStats() {
    try {
      await this.ensureInitialized();
      
      const result = await this.aptos.view({
        function: `${this.contractAddress}::ContentPlatform::get_platform_stats`,
        type_arguments: [],
        arguments: []
      });
      
      return {
        totalSurveys: parseInt(result[0]) || 0,
        totalResponses: parseInt(result[1]) || 0,
        totalRewardsDistributed: parseInt(result[2]) || 0
      };
    } catch (error) {
      console.error('Failed to get platform stats:', error);
      return {
        totalSurveys: 0,
        totalResponses: 0,
        totalRewardsDistributed: 0
      };
    }
  }

  // Helper method to create response hash
  createResponseHash(responses) {
    const responseString = JSON.stringify(responses);
    // Simple hash - in production, use a proper hashing library
    let hash = 0;
    for (let i = 0; i < responseString.length; i++) {
      const char = responseString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  // Temporary simulation method - remove when wallet integration is complete
  async simulateTransaction(transaction) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.1) { // 90% success rate
          const hash = `0x${Math.random().toString(16).substr(2, 16)}`;
          resolve({
            hash,
            surveyId: Math.floor(Math.random() * 1000) + 1,
            reward: 0.5 // Default reward amount
          });
        } else {
          reject(new Error('Transaction simulation failed'));
        }
      }, 1000); // Reduced delay for better UX
    });
  }

  // Gas estimation
  async estimateGas(transaction) {
    try {
      await this.ensureInitialized();
      
      // For Movement/Aptos, gas is typically very low
      // This would be replaced with actual gas estimation
      return {
        gasUsed: 1000,
        gasPrice: 100,
        totalCost: 0.0001 // in MOVE tokens
      };
    } catch (error) {
      console.error('Failed to estimate gas:', error);
      return {
        gasUsed: 1000,
        gasPrice: 100,
        totalCost: 0.0001
      };
    }
  }

  // Transaction status tracking
  async getTransactionStatus(txHash) {
    try {
      await this.ensureInitialized();
      
      const transaction = await this.aptos.getTransactionByHash({ transactionHash: txHash });
      
      return {
        status: transaction.success ? 'success' : 'failed',
        blockHeight: transaction.version,
        gasUsed: transaction.gas_used,
        timestamp: transaction.timestamp
      };
    } catch (error) {
      console.error('Failed to get transaction status:', error);
      return {
        status: 'pending',
        blockHeight: null,
        gasUsed: null,
        timestamp: null
      };
    }
  }
}

export const movementService = new MovementService();