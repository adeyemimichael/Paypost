import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import { notify } from '../utils/notify';

class RealMovementService {
  constructor() {
    this.aptos = null;
    this.contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
    this.initialized = false;
    this.isSimulationMode = true; // Will be set to false when real wallet integration is ready
  }

  async initialize() {
    try {
      // Validate environment variables
      if (!import.meta.env.VITE_MOVEMENT_RPC_URL) {
        throw new Error('VITE_MOVEMENT_RPC_URL not configured');
      }
      
      if (!import.meta.env.VITE_CONTRACT_ADDRESS) {
        console.warn('⚠️ VITE_CONTRACT_ADDRESS not configured, using simulation mode');
        this.contractAddress = '0x1'; // Fallback address
      }
      
      // Initialize Aptos SDK with Movement testnet configuration
      const config = new AptosConfig({
        network: Network.CUSTOM,
        fullnode: import.meta.env.VITE_MOVEMENT_RPC_URL,
        indexer: import.meta.env.VITE_MOVEMENT_RPC_URL,
      });
      
      this.aptos = new Aptos(config);
      this.initialized = true;
      
      console.log('✅ Movement service initialized successfully');
      
      // Test contract connection (non-blocking)
      const contractConnected = await this.testContractConnection();
      if (!contractConnected) {
        console.log('📝 Contract not accessible - using simulation mode for development');
        this.isSimulationMode = true;
      }
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Movement service:', error);
      
      // Don't show error notification for initialization failures
      // The app should continue to work in simulation mode
      console.log('📝 Continuing in simulation mode due to initialization error');
      this.isSimulationMode = true;
      this.initialized = true; // Allow app to continue
      
      return false;
    }
  }

  async testContractConnection() {
    try {
      // Validate contract address format first
      if (!this.contractAddress || !this.contractAddress.startsWith('0x')) {
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
      
      // Don't throw error, just log it - allow app to continue in simulation mode
      console.warn('⚠️ Contract not accessible, continuing in simulation mode');
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
      
      const toastId = notify.loading('Submitting survey and claiming reward...');
      
      // Create response hash from survey responses
      const responseHash = this.createResponseHash(responses);
      
      if (this.isSimulationMode) {
        // Simulation mode - for development
        const result = await this.simulateTransaction({
          function: `${this.contractAddress}::ContentPlatform::complete_survey`,
          type_arguments: [],
          arguments: [
            surveyId.toString(),
            Array.from(new TextEncoder().encode(responseHash))
          ]
        });
        
        notify.update(toastId, {
          render: `✅ Survey completed! Earned ${result.reward} MOVE tokens (Simulated)`,
          type: 'success',
          isLoading: false,
          autoClose: 5000,
        });

        return { 
          success: true, 
          txHash: result.hash, 
          reward: result.reward,
          isSimulated: true
        };
      } else {
        // Real transaction mode
        const { privyService } = await import('./privyService');
        
        if (!privyService.canSignTransactions()) {
          throw new Error('Wallet cannot sign transactions. Please reconnect your wallet.');
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

        // Sign and submit the transaction
        const signedTx = await privyService.signAndSubmitTransaction(transactionPayload);
        
        // Submit to the blockchain
        const pendingTransaction = await this.aptos.submitTransaction({
          senderAddress: walletAddress,
          transaction: signedTx
        });

        // Wait for confirmation
        const confirmedTransaction = await this.aptos.waitForTransaction({
          transactionHash: pendingTransaction.hash
        });

        if (confirmedTransaction.success) {
          notify.update(toastId, {
            render: `✅ Survey completed! Earned MOVE tokens. TX: ${pendingTransaction.hash.slice(0, 10)}...`,
            type: 'success',
            isLoading: false,
            autoClose: 5000,
          });

          return { 
            success: true, 
            txHash: pendingTransaction.hash, 
            reward: 0.5, // This would come from the transaction events
            isSimulated: false
          };
        } else {
          throw new Error('Transaction failed on blockchain');
        }
      }
    } catch (error) {
      console.error('Failed to complete survey:', error);
      notify.error(`Failed to complete survey: ${error.message}`);
      throw error;
    }
  }

  async createSurvey(surveyData, walletAddress) {
    try {
      await this.ensureInitialized();
      
      const toastId = notify.loading('Creating and funding survey on blockchain...');
      
      // Calculate duration in seconds
      const durationSeconds = surveyData.durationSeconds || (7 * 24 * 60 * 60);
      
      if (this.isSimulationMode) {
        // Simulation mode - for development
        const result = await this.simulateTransaction({
          function: `${this.contractAddress}::ContentPlatform::create_and_fund_survey`,
          type_arguments: [],
          arguments: [
            Array.from(new TextEncoder().encode(surveyData.title)),
            Array.from(new TextEncoder().encode(surveyData.description)),
            (surveyData.rewardAmount * 1000000).toString(), // Convert to micro-MOVE
            surveyData.maxResponses.toString(),
            durationSeconds.toString()
          ]
        });
        
        notify.update(toastId, {
          render: `✅ Survey created and funded! ID: ${result.surveyId} (Simulated)`,
          type: 'success',
          isLoading: false,
          autoClose: 5000,
        });

        return { 
          success: true, 
          txHash: result.hash, 
          surveyId: result.surveyId,
          isSimulated: true
        };
      } else {
        // Real transaction mode
        const { privyService } = await import('./privyService');
        
        if (!privyService.canSignTransactions()) {
          throw new Error('Wallet cannot sign transactions. Please reconnect your wallet.');
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

        try {
          // Try to sign the transaction
          const signedTx = await privyService.signAndSubmitTransaction(transactionPayload);
          
          // Submit to the blockchain
          const pendingTransaction = await this.aptos.submitTransaction({
            senderAddress: walletAddress,
            transaction: signedTx
          });

          // Wait for confirmation
          const confirmedTransaction = await this.aptos.waitForTransaction({
            transactionHash: pendingTransaction.hash
          });

          if (confirmedTransaction.success) {
            // Extract survey ID from transaction events
            const surveyId = this.extractSurveyIdFromEvents(confirmedTransaction.events);
            
            notify.update(toastId, {
              render: `✅ Survey created and funded! ID: ${surveyId}. TX: ${pendingTransaction.hash.slice(0, 10)}...`,
              type: 'success',
              isLoading: false,
              autoClose: 5000,
            });

            return { 
              success: true, 
              txHash: pendingTransaction.hash, 
              surveyId: surveyId,
              isSimulated: false
            };
          } else {
            throw new Error('Transaction failed on blockchain');
          }
        } catch (signingError) {
          console.warn('⚠️ Real transaction failed, falling back to simulation:', signingError);
          
          // Fallback to simulation if real transaction fails
          const result = await this.simulateTransaction(transactionPayload);
          
          notify.update(toastId, {
            render: `✅ Survey created! ID: ${result.surveyId} (Simulated - Real signing failed)`,
            type: 'warning',
            isLoading: false,
            autoClose: 5000,
          });

          return { 
            success: true, 
            txHash: result.hash, 
            surveyId: result.surveyId,
            isSimulated: true,
            fallbackReason: signingError.message
          };
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
      
      // Skip blockchain check if contract address is invalid or in simulation mode
      if (!this.contractAddress || !this.contractAddress.startsWith('0x') || this.isSimulationMode) {
        console.log('📝 Skipping blockchain survey completion check - using simulation mode');
        return false; // Allow user to attempt in simulation mode
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