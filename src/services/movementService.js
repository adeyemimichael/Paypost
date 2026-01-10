// Frontend API client for Movement blockchain operations
// All transaction signing happens on backend via Privy

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export const movementService = {
  /**
   * Submit transaction to backend for signing and execution
   */
  async submitTransaction(endpoint, payload, userWallet) {
    try {
      // Handle both camelCase and snake_case field names from different sources
      const walletData = {
        walletId: userWallet.id,
        publicKey: userWallet.publicKey || userWallet.public_key,
        address: userWallet.address,
        ...payload
      };

      // If publicKey is still missing, try to get it from the wallet service
      if (!walletData.publicKey && userWallet.id) {
        try {
          const { walletService } = await import('../services/walletService.js');
          const completeWallet = await walletService.getCompleteWalletInfo(userWallet.id);
          walletData.publicKey = completeWallet.publicKey;
        } catch (error) {
          console.error('Failed to fetch publicKey:', error);
        }
      }

      // Validate required fields
      if (!walletData.walletId || !walletData.publicKey || !walletData.address) {
        console.error('Missing wallet fields:', {
          walletId: !!walletData.walletId,
          publicKey: !!walletData.publicKey,
          address: !!walletData.address
        });
        
        if (!walletData.publicKey) {
          throw new Error('Unable to retrieve wallet publicKey. Please try refreshing the page.');
        }
        
        throw new Error('Missing required fields: walletId, publicKey, address, surveyData');
      }

      const response = await fetch(`${API_BASE_URL}/transactions/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(walletData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Transaction failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Transaction submission failed:', error);
      
      // Handle specific error cases with better messages
      if (error.message.includes('Account not found')) {
        throw new Error('Wallet not funded. Please add MOVE tokens to your wallet first. Visit the Movement faucet at https://faucet.testnet.movementnetwork.xyz/ to get free testnet tokens.');
      } else if (error.message.includes('INSUFFICIENT_BALANCE')) {
        throw new Error('Insufficient MOVE tokens. Please add more tokens to your wallet.');
      } else if (error.message.includes('Module not found')) {
        throw new Error('Smart contract not deployed. Please contact support.');
      }
      
      throw error;
    }
  },

  /**
   * Close a survey and refund remaining funds
   */
  async closeSurvey(surveyId, userWallet) {
    return await this.submitTransaction('close-survey', { surveyId }, userWallet);
  },

  /**
   * Create and fund a survey on Movement blockchain
   */
  async createSurvey(surveyData, userWallet) {
    return await this.submitTransaction('create-survey', { surveyData }, userWallet);
  },

  /**
   * Complete a survey and receive rewards
   */
  async completeSurvey(surveyId, userWallet) {
    return await this.submitTransaction('complete-survey', { surveyId }, userWallet);
  },

  /**
   * Transfer MOVE tokens to another address
   */
  async transfer(toAddress, amount, userWallet) {
    return await this.submitTransaction('transfer', { toAddress, amount }, userWallet);
  },

  /**
   * Get user's MOVE token balance
   */
  async getBalance(address) {
    try {
      const response = await fetch(`${API_BASE_URL}/balance/${address}`);
      if (!response.ok) {
        throw new Error('Failed to fetch balance');
      }
      const data = await response.json();
      return data.balance;
    } catch (error) {
      console.error('Failed to get balance:', error);
      return 0;
    }
  },

  /**
   * Get all active surveys from blockchain
   */
  async getSurveys() {
    try {
      const response = await fetch(`${API_BASE_URL}/surveys`);
      if (!response.ok) {
        throw new Error('Failed to fetch surveys');
      }
      const data = await response.json();
      return data.surveys.map(survey => ({
        ...survey,
        preview: survey.description?.substring(0, 100) + '...' || 'No description',
        content: survey.description || 'No description available',
        author: `${survey.creator.substring(0, 6)}...${survey.creator.substring(62)}`,
        image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800',
        questions: [
          {
            id: 1,
            type: 'multiple-choice',
            question: 'How would you rate this survey?',
            options: ['Excellent', 'Good', 'Fair', 'Poor'],
            required: true
          }
        ],
        type: 'survey',
        source: 'chain'
      }));
    } catch (error) {
      console.error('Failed to get surveys from chain:', error);
      return [];
    }
  },

  /**
   * Get user activity and earnings
   */
  async getUserActivity(address) {
    try {
      const response = await fetch(`${API_BASE_URL}/user-activity/${address}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user activity');
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to get user activity:', error);
      return { totalEarnings: 0 };
    }
  },

  /**
   * Check if user has completed a survey
   */
  async hasCompletedSurvey(address, surveyId) {
    try {
      // Ensure surveyId is numeric for blockchain operations
      const numericSurveyId = typeof surveyId === 'string' ? parseInt(surveyId) : surveyId;
      
      if (isNaN(numericSurveyId)) {
        console.warn('Cannot check completion for non-numeric survey ID:', surveyId);
        return false;
      }

      const response = await fetch(`${API_BASE_URL}/survey-completion/${address}/${numericSurveyId}`);
      if (!response.ok) {
        throw new Error('Failed to check survey completion');
      }
      const data = await response.json();
      return data.completed;
    } catch (error) {
      console.error('Failed to check survey completion:', error);
      return false;
    }
  },

  /**
   * Get creator's escrowed funds from blockchain
   */
  async getCreatorEscrow(address) {
    try {
      const response = await fetch(`${API_BASE_URL}/creator-escrow/${address}`);
      if (!response.ok) {
        throw new Error('Failed to fetch creator escrow');
      }
      const data = await response.json();
      return data.totalEscrow;
    } catch (error) {
      console.error('Failed to get creator escrow:', error);
      return 0;
    }
  },

  /**
   * Check if wallet exists and is funded on Movement blockchain
   */
  async checkWalletStatus(address) {
    try {
      const balance = await this.getBalance(address);
      return {
        exists: balance >= 0,
        balance: balance,
        needsFunding: balance === 0
      };
    } catch (error) {
      return {
        exists: false,
        balance: 0,
        needsFunding: true,
        error: error.message
      };
    }
  },

  /**
   * Get Movement testnet faucet URL
   */
  getFaucetUrl() {
    return 'https://faucet.testnet.movementnetwork.xyz/';
  },
  async testConnection() {
    try {
      const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
      return response.ok;
    } catch (error) {
      console.error('Backend connection test failed:', error);
      return false;
    }
  }
};
