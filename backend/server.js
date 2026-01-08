import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrivyClient } from '@privy-io/node';
import { transactionService } from './services/transactionService.js';

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
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Wallet management endpoints
app.post('/api/wallets/create-aptos', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    console.log('Creating Aptos wallet for user:', userId);

    // Create Aptos wallet using Privy API
    const wallet = await privy.wallets().create({
      owner: { user_id: userId },
      chain_type: 'aptos'
    });

    console.log('Aptos wallet created:', wallet);

    res.json({
      success: true,
      wallet: {
        id: wallet.id,
        address: wallet.address,
        chainType: wallet.chain_type,
        createdAt: wallet.created_at
      }
    });

  } catch (error) {
    console.error('Failed to create Aptos wallet:', error);
    
    // Handle specific Privy errors
    if (error.message.includes('already exists')) {
      return res.status(409).json({ 
        error: 'User already has an Aptos wallet',
        code: 'WALLET_EXISTS'
      });
    }
    
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
    
    // Get user's wallets from Privy
    const user = await privy.users().getByUserId(userId);
    const wallets = user.linked_accounts.filter(account => 
      account.type === 'wallet'
    );

    res.json({
      success: true,
      wallets: wallets.map(wallet => ({
        id: wallet.id,
        address: wallet.address,
        chainType: wallet.chain_type,
        walletClientType: wallet.wallet_client_type
      }))
    });

  } catch (error) {
    console.error('Failed to get user wallets:', error);
    res.status(500).json({ 
      error: 'Failed to get user wallets',
      details: error.message 
    });
  }
});

// Transaction endpoints
app.post('/api/transactions/create-survey', async (req, res) => {
  try {
    const { walletId, publicKey, address, surveyData } = req.body;
    
    if (!walletId || !publicKey || !address || !surveyData) {
      return res.status(400).json({ 
        error: 'Missing required fields: walletId, publicKey, address, surveyData' 
      });
    }

    const payload = transactionService.buildCreateSurveyPayload(
      surveyData.title,
      surveyData.description,
      surveyData.rewardAmount,
      surveyData.maxResponses
    );

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