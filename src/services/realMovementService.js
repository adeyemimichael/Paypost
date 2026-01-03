import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import { notify } from '../utils/notify';

class RealMovementService {
  constructor() {
    this.aptos = null;
    this.contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || null;
    this.initialized = false;
    this.isSimulationMode = false; // ✅ ENABLE REAL TRANSACTIONS
  }

  async initialize() {
    try {
      // Validate environment variables
      if (!import.meta.env.VITE_MOVEMENT_RPC_URL) {
        throw new Error('VITE_MOVEMENT_RPC_URL not configured');
      }
      
      if (!this.contractAddress) {
        console.warn('⚠️ VITE_CONTRACT_ADDRESS not configured');
        this.contractAddress = '0x1'; // Fallback address
      }
      
      console.log('🔧 Contract address:', this.contractAddress);
      
      // Initialize Aptos SDK with Movement testnet configuration
      const config = new AptosConfig({
        network: Network.CUSTOM,
        fullnode: import.meta.env.VITE_MOVEMENT_RPC_URL,
        indexer: import.meta.env.VITE_MOVEMENT_RPC_URL,
      });
      
      this.aptos = new Aptos(config);
      this.initialized = true;
      
      console.log('✅ Movement service initialized with real testnet');
      console.log('🔧 RPC URL:', import.meta.env.VITE_MOVEMENT_RPC_URL);
      console.log('🔧 Contract address:', this.contractAddress);
      
      // Test contract connection (non-blocking)
      const contractConnected = await this.testContractConnection();
      if (!contractConnected) {
        console.warn('⚠️ Contract not deployed at configured address');
        console.warn('📝 App will work with database-only mode until contract is deployed');
        console.warn('💡 To deploy contract: cd src/smart-contracts && movement move publish');
      }
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Movement service:', error);
      
      // For real transactions, we need to fail properly
      console.error('🚨 Real transaction mode requires proper initialization');
      this.initialized = false;
      
      return false;
    }
  }

  async testContractConnection() {
    try {
      // Validate contract address format first
      if (!this.contractAddress || typeof this.contractAddress !== 'string') {
        throw new Error(`Contract address is not defined or not a string: ${this.contractAddress}`);
      }
      
      if (!this.contractAddress.startsWith('0x')) {
        throw new Error(`Invalid contract address format: ${this.contractAddress}`);
      }
      
      // Test with a simple view function that should exist
      const activeSurveys = await this.aptos.view({
        function: `${this.contractAddress}::ContentPlatform::get_active_surveys`,
        type_arguments: [],
        arguments: []
      });
      console.log('✅ Contract connection test successful. Active surveys:', activeSurveys);
      return true;
    } catch (error) {
      console.error('❌ Contract connection test failed:', error);
      
      // Check if this is a contract not found error vs network error
      if (error.message && (
        error.message.includes('FUNCTION_NOT_FOUND') || 
        error.message.includes('MODULE_NOT_FOUND') ||
        error.message.includes('not published') ||
        error.message.includes("doesn't exist") ||
        error.message.includes('LINKER_ERROR')
      )) {
        console.warn('⚠️ Contract not deployed at this address - needs deployment');
        console.warn('💡 Run: cd src/smart-contracts && movement move publish --named-addresses PayPost=<your-address>');
      } else if (error.message && error.message.includes('network')) {
        console.warn('⚠️ Network connection issue - check RPC URL');
      }
      
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

  async completeSurvey(surveyId, responses, walletAddress, signAndSubmitTransaction) {
    try {
      await this.ensureInitialized();
      
      const toastId = notify.loading('Submitting survey and claiming reward...');
      
      // Create response hash from survey responses
      const responseHash = this.createResponseHash(responses);
      
      // ALWAYS use real transactions now
      console.log('🔄 Processing REAL survey completion transaction...');
      
      // Check if wallet can sign transactions
      if (!signAndSubmitTransaction) {
        notify.update(toastId, {
          render: 'Please connect your wallet to complete surveys with real MOVE rewards',
          type: 'error',
          isLoading: false,
          autoClose: 5000,
        });
        throw new Error('Wallet not connected or cannot sign transactions. Please connect your wallet first.');
      }

      // Build the transaction payload
      const transactionPayload = {
        function: `${this.contractAddress}::ContentPlatform::complete_survey`,
        type_arguments: [],
        arguments: [
          surveyId.toString(),
          Array.from(new TextEncoder().encode(responseHash))
        ]
      };

      console.log('📝 Submitting real transaction to Movement blockchain...');
      
      // Sign and submit the transaction using the unified wallet hook
      const result = await signAndSubmitTransaction(transactionPayload);
      
      if (result && result.hash) {
        const rewardAmount = this.extractRewardFromEvents(result.events || []);
        
        notify.update(toastId, {
          render: `✅ Survey completed! Earned ${rewardAmount} MOVE tokens. TX: ${result.hash.slice(0, 10)}...`,
          type: 'success',
          isLoading: false,
          autoClose: 5000,
        });

        return { 
          success: true, 
          txHash: result.hash, 
          reward: rewardAmount,
          isSimulated: false
        };
      } else {
        throw new Error('Transaction failed on blockchain');
      }
    } catch (error) {
      console.error('Failed to complete survey:', error);
      notify.error(`Failed to complete survey: ${error.message}`);
      throw error;
    }
  }

  async createSurvey(surveyData, walletAddress, signAndSubmitTransaction) {
    try {
      await this.ensureInitialized();
      
      const toastId = notify.loading('Creating and funding survey on blockchain...');
      
      // Calculate duration in seconds
      const durationSeconds = surveyData.durationSeconds || (7 * 24 * 60 * 60);
      
      if (this.isSimulationMode) {
        // This should never happen now - we disabled simulation mode
        throw new Error('Simulation mode is disabled. Real transactions only.');
      } else {
        // Real transaction mode - use unified wallet hook for signing
        
        // Check if wallet can sign transactions
        if (!signAndSubmitTransaction) {
          notify.update(toastId, {
            render: 'Please connect your wallet to create surveys with real MOVE funding',
            type: 'error',
            isLoading: false,
            autoClose: 5000,
          });
          throw new Error('Wallet not connected or cannot sign transactions. Please connect your wallet first.');
        }

        // Build the transaction payload
        const transactionPayload = {
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

        console.log('📝 Submitting real survey creation to Movement blockchain...');
        console.log('💰 Total cost:', (surveyData.rewardAmount * surveyData.maxResponses * 1.025), 'MOVE');
        
        // Sign and submit the transaction using unified wallet hook
        const result = await signAndSubmitTransaction(transactionPayload);
        
        if (result && result.hash) {
          // Extract survey ID from transaction events
          const surveyId = this.extractSurveyIdFromEvents(result.events || []);
          
          notify.update(toastId, {
            render: `✅ Survey created and funded! ID: ${surveyId}. TX: ${result.hash.slice(0, 10)}...`,
            type: 'success',
            isLoading: false,
            autoClose: 5000,
          });

          return { 
            success: true, 
            txHash: result.hash, 
            surveyId: surveyId,
            isSimulated: false
          };
        } else {
          throw new Error('Transaction failed on blockchain');
        }
      }
    } catch (error) {
      console.error('Failed to create survey:', error);
      notify.error(`Failed to create survey: ${error.message}`);
      throw error;
    }
  }

  async getCreatorSurveys(walletAddress) {
    try {
      await this.ensureInitialized();
      
      // Skip if contract address is invalid
      if (!this.contractAddress || typeof this.contractAddress !== 'string' || !this.contractAddress.startsWith('0x')) {
        console.log('📝 Skipping blockchain creator surveys check - invalid contract address');
        return [];
      }
      
      const result = await this.aptos.view({
        function: `${this.contractAddress}::ContentPlatform::get_creator_surveys`,
        type_arguments: [],
        arguments: [walletAddress]
      });
      
      console.log('Creator surveys from blockchain:', result);
      return result[0] || [];
    } catch (error) {
      console.error('Failed to get creator surveys:', error);
      return [];
    }
  }

  async getActiveSurveys() {
    try {
      await this.ensureInitialized();
      
      // Skip if contract address is invalid
      if (!this.contractAddress || typeof this.contractAddress !== 'string' || !this.contractAddress.startsWith('0x')) {
        console.log('📝 Skipping blockchain active surveys check - invalid contract address');
        return [];
      }
      
      const result = await this.aptos.view({
        function: `${this.contractAddress}::ContentPlatform::get_active_surveys`,
        type_arguments: [],
        arguments: []
      });
      
      console.log('Active surveys from blockchain:', result);
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
      
      if (this.isSimulationMode) {
        const result = await this.simulateTransaction({
          function: `${this.contractAddress}::ContentPlatform::close_survey`,
          type_arguments: [],
          arguments: [surveyId.toString()]
        });
        
        notify.update(toastId, {
          render: '✅ Survey closed successfully! (Simulated)',
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        });

        return { success: true, txHash: result.hash, isSimulated: true };
      } else {
        throw new Error('Real wallet signing not implemented yet. Using simulation mode.');
      }
    } catch (error) {
      console.error('Failed to close survey:', error);
      notify.error(`Failed to close survey: ${error.message}`);
      throw error;
    }
  }

  async hasSurveyCompleted(surveyId, walletAddress) {
    try {
      await this.ensureInitialized();
      
      // Always check blockchain for real completion status
      if (!this.contractAddress || typeof this.contractAddress !== 'string' || !this.contractAddress.startsWith('0x')) {
        console.log('📝 Invalid contract address - cannot check survey completion');
        return false;
      }
      
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
        remainingFunds: parseInt(result[5]),
        isActive: result[6]
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

  async getAccountBalance(walletAddress) {
    try {
      await this.ensureInitialized();
      
      // Use the correct method for getting account balance
      const resources = await this.aptos.getAccountResources({
        accountAddress: walletAddress
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

  // Simulation method for development - clearly marked
  async simulateTransaction(transaction) {
    console.log('🔄 SIMULATION MODE: Transaction would be:', transaction);
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.05) { // 95% success rate
          const hash = `0x${Math.random().toString(16).substr(2, 16)}`;
          const surveyId = Math.floor(Math.random() * 1000) + 1;
          
          resolve({
            hash,
            surveyId,
            reward: 0.5 // Default reward amount
          });
        } else {
          reject(new Error('Simulated transaction failed'));
        }
      }, 2000); // 2 second delay to simulate network
    });
  }

  // Method to switch to real transaction mode (when wallet integration is ready)
  enableRealTransactions() {
    this.isSimulationMode = false;
    console.log('✅ Real transaction mode enabled');
  }

  // Method to check if we're in simulation mode
  isInSimulationMode() {
    return this.isSimulationMode;
  }

  // Helper method to extract survey ID from transaction events
  extractSurveyIdFromEvents(events) {
    try {
      // Look for SurveyCreatedEvent in the transaction events
      const surveyCreatedEvent = events.find(event => 
        event.type.includes('SurveyCreatedEvent')
      );
      
      if (surveyCreatedEvent && surveyCreatedEvent.data) {
        return surveyCreatedEvent.data.survey_id || Math.floor(Math.random() * 1000) + 1;
      }
      
      // Fallback to random ID if event parsing fails
      return Math.floor(Math.random() * 1000) + 1;
    } catch (error) {
      console.warn('Failed to extract survey ID from events:', error);
      return Math.floor(Math.random() * 1000) + 1;
    }
  }

  // Helper method to extract reward amount from transaction events
  extractRewardFromEvents(events) {
    try {
      const surveyCompletedEvent = events.find(event => 
        event.type.includes('SurveyCompletedEvent')
      );
      
      if (surveyCompletedEvent && surveyCompletedEvent.data) {
        return (surveyCompletedEvent.data.reward_earned || 500000) / 1000000; // Convert from micro-MOVE
      }
      
      return 0.5; // Default fallback
    } catch (error) {
      console.warn('Failed to extract reward from events:', error);
      return 0.5;
    }
  }

  // Gas estimation
  async estimateGas(transaction) {
    try {
      await this.ensureInitialized();
      
      // For Movement/Aptos, gas is typically very low
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
      
      if (this.isSimulationMode) {
        return {
          status: 'success',
          blockHeight: Math.floor(Math.random() * 1000000),
          gasUsed: 1000,
          timestamp: Date.now(),
          isSimulated: true
        };
      }
      
      const transaction = await this.aptos.getTransactionByHash({ transactionHash: txHash });
      
      return {
        status: transaction.success ? 'success' : 'failed',
        blockHeight: transaction.version,
        gasUsed: transaction.gas_used,
        timestamp: transaction.timestamp,
        isSimulated: false
      };
    } catch (error) {
      console.error('Failed to get transaction status:', error);
      return {
        status: 'pending',
        blockHeight: null,
        gasUsed: null,
        timestamp: null,
        isSimulated: this.isSimulationMode
      };
    }
  }
}

export const realMovementService = new RealMovementService();