import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrivyClient } from '@privy-io/node';
import { transactionService } from './services/transactionService.js';

console.log('🔄 Server.js loaded at:', new Date().toISOString());

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Privy client for wallet management
const privy = new PrivyClient({
  appId: process.env.PRIVY_APP_ID,
  appSecret: process.env.PRIVY_APP_SECRET
});

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:5174', 
    'http://localhost:5175', 
    'http://localhost:3000',
    'https://paypost.vercel.app',
    'https://paypost-7jthfan6v-adeyemimichaels-projects.vercel.app',
    'https://paypost-cgvzsv0c2-adeyemimichaels-projects.vercel.app'
  ],
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Simple in-memory user-wallet mapping (in production, use a database)
const userWalletMapping = new Map();

// Helper function to find wallet by user ID from Privy API
async function findUserWalletFromPrivy(userId) {
  try {
    console.log('🔍 Searching for wallet in Privy for user:', userId);
    
    // Get all wallets from Privy
    const allWallets = await privy.wallets().list();
    console.log('📊 Total wallets in Privy:', allWallets.length);
    
    // Try to find wallet by matching user ID patterns
    const userIdShort = userId.split(':').pop(); // Extract the short ID from did:privy:xxx
    
    const matchingWallets = allWallets.filter(wallet => {
      if (!wallet.owner_id) return false;
      
      // Check exact match or partial match
      return wallet.owner_id === userId || 
             wallet.owner_id === userIdShort ||
             wallet.owner_id.includes(userIdShort);
    });
    
    console.log('🎯 Found matching wallets:', matchingWallets.length);
    
    // Find Aptos wallet specifically
    const aptosWallet = matchingWallets.find(w => w.chain_type === 'aptos');
    
    if (aptosWallet) {
      console.log('✅ Found existing Aptos wallet:', aptosWallet.address);
      // Update our mapping
      userWalletMapping.set(userId, aptosWallet.id);
      return aptosWallet;
    }
    
    console.log('⚠️ No Aptos wallet found for user');
    return null;
    
  } catch (error) {
    console.error('❌ Error searching for user wallet:', error);
    return null;
  }
}

// Wallet management endpoints
app.post('/api/wallets/create-aptos', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    console.log('Creating Aptos wallet for user:', userId);

    // Check if user already has a wallet in our mapping
    if (userWalletMapping.has(userId)) {
      const existingWalletId = userWalletMapping.get(userId);
      console.log('✅ User already has wallet in mapping:', existingWalletId);
      
      try {
        const existingWallet = await privy.wallets().get(existingWalletId);
        if (existingWallet && existingWallet.chain_type === 'aptos') {
          console.log('✅ Returning existing wallet:', existingWallet.address);
          return res.status(409).json({ 
            error: 'User already has an Aptos wallet',
            code: 'WALLET_EXISTS',
            wallet: {
              id: existingWallet.id,
              address: existingWallet.address,
              chainType: existingWallet.chain_type,
              publicKey: existingWallet.public_key,
              createdAt: existingWallet.created_at
            }
          });
        }
      } catch (walletError) {
        console.log('Existing wallet not found, removing from mapping');
        userWalletMapping.delete(userId);
      }
    }

    // Create new Aptos wallet
    const wallet = await privy.wallets().create({
      chain_type: 'aptos'
    });

    console.log('Aptos wallet created:', wallet);

    // Store the mapping
    userWalletMapping.set(userId, wallet.id);
    console.log('✅ Wallet mapped to user:', userId, '->', wallet.id);

    res.json({
      success: true,
      wallet: {
        id: wallet.id,
        address: wallet.address,
        chainType: wallet.chain_type,
        publicKey: wallet.public_key,
        createdAt: wallet.created_at
      }
    });

  } catch (error) {
    console.error('Failed to create Aptos wallet:', error);
    
    res.status(500).json({ 
      error: 'Failed to create Aptos wallet',
      details: error.message 
    });
  }
});

// Get user's wallets
app.get('/api/wallets/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Getting wallets for user:', userId);
    
    // Check our mapping first
    if (userWalletMapping.has(userId)) {
      const walletId = userWalletMapping.get(userId);
      console.log('Found wallet in mapping:', walletId);
      
      try {
        const wallet = await privy.wallets().get(walletId);
        if (wallet) {
          console.log('✅ Retrieved wallet from mapping:', wallet.address);
          return res.json({
            success: true,
            wallets: [{
              id: wallet.id,
              address: wallet.address,
              chainType: wallet.chain_type,
              walletClientType: 'privy',
              publicKey: wallet.public_key,
              createdAt: wallet.created_at
            }]
          });
        }
      } catch (walletError) {
        console.log('Wallet from mapping not found, removing mapping');
        userWalletMapping.delete(userId);
      }
    }
    
    // Fallback to original method
    try {
      const user = await privy.users().getById(userId);
      console.log('User found:', user.id);
      
      // Get all wallets and filter by owner_id
      const allWallets = await privy.wallets().list();
      const userWallets = allWallets.filter(wallet => {
        return wallet.owner_id && (
          wallet.owner_id === user.id || 
          wallet.owner_id.includes(userId.split(':').pop())
        );
      });
      
      console.log('Found wallets for user:', userWallets.length);

      res.json({
        success: true,
        wallets: userWallets.map(wallet => ({
          id: wallet.id,
          address: wallet.address,
          chainType: wallet.chain_type,
          walletClientType: 'privy',
          publicKey: wallet.public_key,
          createdAt: wallet.created_at
        }))
      });
    } catch (userError) {
      console.error('Failed to get user or wallets:', userError);
      res.json({
        success: true,
        wallets: []
      });
    }

  } catch (error) {
    console.error('Failed to get user wallets:', error);
    res.status(500).json({ 
      error: 'Failed to get user wallets',
      details: error.message 
    });
  }
});

// Get complete wallet info by wallet ID (to fetch missing publicKey)
app.get('/api/wallets/:walletId/complete', async (req, res) => {
  try {
    const { walletId } = req.params;
    console.log('Getting complete wallet info for:', walletId);
    
    // Get the complete wallet object from Privy
    const wallet = await privy.wallets().get(walletId);
    console.log('Complete wallet from Privy:', wallet);
    
    res.json({
      success: true,
      wallet: {
        id: wallet.id,
        address: wallet.address,
        chainType: wallet.chain_type,
        publicKey: wallet.public_key,
        createdAt: wallet.created_at
      }
    });

  } catch (error) {
    console.error('Failed to get complete wallet info:', error);
    res.status(500).json({ 
      error: 'Failed to get complete wallet info',
      details: error.message 
    });
  }
});

// Get creator's escrowed funds
app.get('/api/creator-escrow/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const totalEscrow = await transactionService.getCreatorEscrow(address);
    res.json({ success: true, totalEscrow });
  } catch (error) {
    console.error('Failed to get creator escrow:', error);
    res.status(500).json({ 
      error: 'Failed to get creator escrow',
      details: error.message 
    });
  }
});

// Test endpoint
app.get('/api/test', (req, res) => {
  console.log('🧪 TEST ENDPOINT CALLED');
  res.json({ message: 'Test endpoint working', timestamp: new Date().toISOString() });
});

// Debug endpoint for create survey
app.post('/api/debug-create-survey', async (req, res) => {
  console.log('🔍 DEBUG CREATE SURVEY CALLED');
  console.log('🔍 Request body:', JSON.stringify(req.body, null, 2));
  res.json({ message: 'Debug endpoint working', body: req.body });
});

// Create and fund a survey on Movement blockchain
app.post('/api/transactions/create-survey', async (req, res) => {
  console.log('🚀 CREATE SURVEY ENDPOINT CALLED');
  try {
    console.log('🚀 Create survey endpoint called with:', JSON.stringify(req.body, null, 2));
    
    const { walletId, publicKey, address, surveyData } = req.body;
    
    if (!walletId || !publicKey || !address || !surveyData) {
      return res.status(400).json({ 
        error: 'Missing required fields: walletId, publicKey, address, surveyData' 
      });
    }

    // Check user balance before creating survey
    console.log('💰 Checking balance for address:', address);
    const balance = await transactionService.getBalance(address);
    const rewardAmount = surveyData.rewardAmount;
    const maxResponses = surveyData.maxResponses;
    const totalRewards = rewardAmount * maxResponses;
    const platformFee = (totalRewards * 250) / 10000; // 2.5% platform fee
    const totalRequired = totalRewards + platformFee;

    console.log('💰 Balance check:', {
      userBalance: balance,
      totalRequired,
      totalRewards,
      platformFee,
      rewardAmount,
      maxResponses
    });

    if (balance < totalRequired) {
      return res.status(400).json({ 
        error: `Insufficient balance. Required: ${totalRequired} MOVE, Available: ${balance} MOVE`,
        details: {
          required: totalRequired,
          available: balance,
          shortfall: totalRequired - balance
        }
      });
    }

    console.log('🔧 About to build payload with:', {
      title: surveyData.title,
      description: surveyData.description,
      rewardAmount: surveyData.rewardAmount,
      maxResponses: surveyData.maxResponses
    });

    let payload;
    try {
      payload = transactionService.buildCreateSurveyPayload(
        surveyData.title,
        surveyData.description,
        surveyData.rewardAmount,
        surveyData.maxResponses
      );
    } catch (payloadError) {
      console.error('❌ Failed to build payload:', payloadError);
      return res.status(400).json({ 
        error: `Failed to build transaction payload: ${payloadError.message}` 
      });
    }

    console.log('🔧 Built payload:', JSON.stringify(payload, null, 2));

    if (!payload) {
      throw new Error('Failed to build transaction payload');
    }

    console.log('🚀 About to call signAndSubmitTransaction with payload:', !!payload);
    console.log('🚀 Payload type:', typeof payload);
    console.log('🚀 Payload keys:', Object.keys(payload || {}));

    const result = await transactionService.signAndSubmitTransaction(
      walletId, publicKey, address, payload
    );

    res.json({ 
      success: true, 
      transactionHash: result.hash,
      result 
    });

  } catch (error) {
    console.error('Create survey error:', error);
    res.status(500).json({ 
      error: error.message,
      details: error.stack 
    });
  }
});

app.post('/api/transactions/close-survey', async (req, res) => {
  try {
    const { walletId, publicKey, address, surveyId } = req.body;
    
    if (!walletId || !publicKey || !address || !surveyId) {
      return res.status(400).json({ 
        error: 'Missing required fields: walletId, publicKey, address, surveyId' 
      });
    }

    const payload = transactionService.buildCloseSurveyPayload(surveyId);

    const result = await transactionService.signAndSubmitTransaction(
      walletId, publicKey, address, payload
    );

    res.json({ 
      success: true, 
      transactionHash: result.hash,
      result 
    });

  } catch (error) {
    console.error('Close survey error:', error);
    res.status(500).json({ 
      error: error.message,
      details: error.stack 
    });
  }
});

app.post('/api/transactions/complete-survey', async (req, res) => {
  try {
    const { walletId, publicKey, address, surveyId } = req.body;
    
    if (!walletId || !publicKey || !address || !surveyId) {
      return res.status(400).json({ 
        error: 'Missing required fields: walletId, publicKey, address, surveyId' 
      });
    }

    const payload = transactionService.buildCompleteSurveyPayload(surveyId);

    const result = await transactionService.signAndSubmitTransaction(
      walletId, publicKey, address, payload
    );

    res.json({ 
      success: true, 
      transactionHash: result.hash,
      result 
    });

  } catch (error) {
    console.error('Complete survey error:', error);
    res.status(500).json({ 
      error: error.message,
      details: error.stack 
    });
  }
});

app.post('/api/transactions/transfer', async (req, res) => {
  try {
    const { walletId, publicKey, address, toAddress, amount } = req.body;
    
    if (!walletId || !publicKey || !address || !toAddress || !amount) {
      return res.status(400).json({ 
        error: 'Missing required fields: walletId, publicKey, address, toAddress, amount' 
      });
    }

    const payload = transactionService.buildTransferPayload(toAddress, amount);

    const result = await transactionService.signAndSubmitTransaction(
      walletId, publicKey, address, payload
    );

    res.json({ 
      success: true, 
      transactionHash: result.hash,
      result 
    });

  } catch (error) {
    console.error('Transfer error:', error);
    res.status(500).json({ 
      error: error.message,
      details: error.stack 
    });
  }
});

// Read-only endpoints
app.get('/api/balance/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const balance = await transactionService.getBalance(address);
    res.json({ balance });
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/surveys', async (req, res) => {
  try {
    const surveys = await transactionService.getSurveys();
    res.json({ surveys });
  } catch (error) {
    console.error('Get surveys error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/user-activity/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const activity = await transactionService.getUserActivity(address);
    res.json(activity);
  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/survey-completion/:address/:surveyId', async (req, res) => {
  try {
    const { address, surveyId } = req.params;
    const completed = await transactionService.hasCompletedSurvey(address, surveyId);
    res.json({ completed });
  } catch (error) {
    console.error('Check survey completion error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 PayPost Backend running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
});