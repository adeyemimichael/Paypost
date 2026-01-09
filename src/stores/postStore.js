import { create } from 'zustand';
import { supabaseService } from '../services/supabaseService';
import { movementService } from '../services/movementService';

export const usePostStore = create((set, get) => ({
  posts: [], 
  completedSurveys: new Set(),
  unlockedPosts: new Set(),
  userResponses: {},
  userEarnings: 0,
  isLoading: false,
  lastRefresh: 0,
  
  // Initialize the store
  initialize: async (userAddress) => {
    set({ isLoading: true });
    
    try {
      console.log('🔄 Initializing post store...');
      
      // Try blockchain first, fallback to Supabase
      const backendAvailable = await movementService.testConnection();
      
      if (backendAvailable) {
        console.log('✅ Backend available, loading from blockchain...');
        await get().loadSurveysFromChain();
        if (userAddress) {
          await get().loadUserChainActivity(userAddress);
        }
      } else {
        console.log('⚠️ Backend unavailable, falling back to Supabase...');
        const supabaseAvailable = await supabaseService.initialize();
        if (supabaseAvailable) {
          await get().loadSurveysFromSupabase();
          if (userAddress) {
            await get().loadUserSupabaseActivity(userAddress);
          }
        } else {
          console.log('⚠️ Supabase unavailable, using mock data');
          get().loadMockSurveys();
        }
      }
    } catch (error) {
      console.error('❌ Failed to initialize post store:', error);
      get().loadMockSurveys();
    } finally {
      set({ isLoading: false, lastRefresh: Date.now() });
    }
  },

  // Load surveys from blockchain via backend
  loadSurveysFromChain: async () => {
    try {
      console.log('📊 Loading surveys from blockchain...');
      const surveys = await movementService.getSurveys();
      set({ posts: surveys });
      console.log(`✅ Loaded ${surveys.length} surveys from blockchain`);
    } catch (error) {
      console.error('❌ Failed to load surveys from chain:', error);
      throw error;
    }
  },

  // Load user activity from blockchain
  loadUserChainActivity: async (userAddress) => {
    try {
      console.log('👤 Loading user activity from blockchain...');
      
      const activity = await movementService.getUserActivity(userAddress);
      set({ userEarnings: activity.totalEarnings || 0 });
      
      // Get completed surveys for this user
      const { posts } = get();
      const completed = new Set();
      
      await Promise.all(posts.map(async (post) => {
        if (post.type === 'survey') {
          const hasCompleted = await movementService.hasCompletedSurvey(userAddress, post.id);
          if (hasCompleted) {
            completed.add(post.id);
          }
        }
      }));
      
      set({ completedSurveys: completed });
      console.log(`✅ User has completed ${completed.size} surveys`);
    } catch (error) {
      console.error('❌ Failed to load user activity from blockchain:', error);
    }
  },

  // Load surveys from Blockchain
  loadSurveysFromChain: async () => {
    try {
      const surveys = await movementService.getSurveys();
      set({ posts: surveys });
    } catch (error) {
      console.error('❌ Failed to load surveys from chain:', error);
      // Fallback to Supabase
      await get().loadSurveysFromSupabase();
    }
  },

  // Load user activity from Blockchain
  loadUserChainActivity: async (address) => {
    try {
      const activity = await movementService.getUserActivity(address);
      set({ userEarnings: activity.totalEarnings });
      
      // Check which surveys are completed
      const { posts } = get();
      const completed = new Set();
      
      await Promise.all(posts.map(async (post) => {
        if (post.type === 'survey') {
          const hasCompleted = await movementService.hasCompletedSurvey(address, post.id);
          if (hasCompleted) {
            completed.add(post.id);
          }
        }
      }));
      
      set({ completedSurveys: completed });
    } catch (error) {
      console.error('❌ Failed to load user chain activity:', error);
    }
  },

  // Load surveys from Supabase (primary data source)
  loadSurveysFromSupabase: async (filters = {}) => {
    try {
      console.log('📊 Loading surveys from Supabase...');
      const surveys = await supabaseService.getSurveys(filters);
      
      // Transform surveys to match expected format
      const transformedSurveys = surveys.map(survey => ({
        id: survey.id,
        title: survey.title,
        preview: survey.description?.substring(0, 100) + '...' || 'No description',
        content: survey.description || 'No description available',
        author: survey.creator?.display_name || 'Unknown Creator',
        reward: parseFloat(survey.reward_amount) || 0,
        maxResponses: survey.max_responses || 100,
        responses: survey.current_responses || 0,
        isActive: survey.is_active !== false,
        timestamp: new Date(survey.created_at).getTime(),
        image: survey.image_url || 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800',
        questions: survey.questions || [],
        type: 'survey',
        source: 'supabase',
        creatorId: survey.creator_id,
        category: survey.category || 'general',
        estimatedTime: survey.estimated_time || 5
      }));
      
      set({ posts: transformedSurveys });
      console.log(`✅ Loaded ${transformedSurveys.length} surveys from Supabase`);
    } catch (error) {
      console.error('❌ Failed to load from Supabase:', error);
      get().loadMockSurveys();
    }
  },

  // Load user activity from Supabase
  loadUserSupabaseActivity: async (userAddress) => {
    try {
      console.log('👤 Loading user activity from Supabase...');
      
      // Get user by wallet address
      const user = await supabaseService.getUser(userAddress);
      if (!user) {
        console.log('User not found in database');
        return;
      }

      // Get user stats
      const stats = await supabaseService.getUserStats(user.id);
      set({ userEarnings: stats.totalEarnings || 0 });
      
      // Get completed surveys for this user
      const { posts } = get();
      const completed = new Set();
      
      // Check each survey to see if user completed it
      await Promise.all(posts.map(async (post) => {
        if (post.type === 'survey') {
          const hasCompleted = await supabaseService.hasCompletedSurvey(post.id, user.id);
          if (hasCompleted) {
            completed.add(post.id);
          }
        }
      }));
      
      set({ completedSurveys: completed });
      console.log(`✅ User has completed ${completed.size} surveys`);
    } catch (error) {
      console.error('❌ Failed to load user activity from Supabase:', error);
    }
  },

  // Mock data fallback
  loadMockSurveys: () => {
    const mockSurveys = [
      {
        id: 'mock-1',
        title: 'Community Feedback Survey',
        preview: 'Help us improve our platform.',
        content: 'We value your opinion!',
        reward: 5.0,
        type: 'survey',
        responses: 10,
        maxResponses: 100,
        isActive: true,
        timestamp: Date.now(),
        image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400',
        questions: [
          {
            id: 1,
            type: 'multiple-choice',
            question: 'How would you rate our platform?',
            options: ['Excellent', 'Good', 'Fair', 'Poor'],
            required: true
          }
        ],
        source: 'mock'
      }
    ];
    set({ posts: mockSurveys });
  },

  // Refresh data after user actions
  refreshAfterAction: async (userAddress) => {
    set({ isLoading: true });
    try {
      console.log('🔄 Refreshing data after user action...');
      
      const backendAvailable = await movementService.testConnection();
      if (backendAvailable) {
        await get().loadSurveysFromChain();
        if (userAddress) {
          await get().loadUserChainActivity(userAddress);
        }
      } else {
        await get().loadSurveysFromSupabase();
        if (userAddress) {
          await get().loadUserSupabaseActivity(userAddress);
        }
      }
      console.log('✅ Data refreshed successfully');
    } catch (error) {
      console.error('❌ Failed to refresh data:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  // Transaction methods (mandatory blockchain + database)
  createSurvey: async (surveyData, wallet) => {
    try {
      console.log('Creating survey with mandatory blockchain transaction...', surveyData);
      console.log('Wallet address:', wallet.address);
      
      // Initialize Supabase if not already done
      if (!supabaseService.initialized) {
        console.log('Initializing Supabase service...');
        const initialized = await supabaseService.initialize();
        if (!initialized) {
          throw new Error('Failed to initialize Supabase service');
        }
      }
      
      // Step 1: Get or create user in database
      console.log('Getting or creating user...');
      const user = await supabaseService.getOrCreateUser(
        wallet.address,
        null, // email will be auto-generated if needed
        'creator'
      );

      if (!user) {
        throw new Error('Failed to create user in database');
      }

      console.log('User found/created:', user);

      // Step 2: MANDATORY blockchain transaction first (this deducts tokens)
      console.log('Creating survey on blockchain (MANDATORY)...');
      const blockchainResult = await movementService.createSurvey(surveyData, wallet);
      console.log('✅ Survey created on blockchain:', blockchainResult);

      // Step 3: Only create in database if blockchain succeeds
      console.log('Creating survey in database with blockchain confirmation...');
      const survey = await supabaseService.createSurvey({
        ...surveyData,
        creatorId: user.id,
        blockchain_tx_hash: blockchainResult.transactionHash,
        blockchain_status: 'confirmed'
      });

      if (!survey) {
        // This is a critical error - blockchain succeeded but database failed
        console.error('❌ CRITICAL: Blockchain succeeded but database failed!');
        throw new Error('Database creation failed after successful blockchain transaction. Please contact support with transaction hash: ' + blockchainResult.transactionHash);
      }

      console.log('✅ Survey created in database:', survey);

      // Step 4: Refresh the surveys list and user balance
      setTimeout(() => {
        get().loadSurveysFromSupabase();
        // Also refresh wallet balance since money was deducted
        if (typeof window !== 'undefined' && window.useWalletStore) {
          window.useWalletStore.getState().fetchBalance();
        }
      }, 1000);

      return {
        success: true,
        surveyId: survey.id,
        transactionHash: blockchainResult.transactionHash,
        message: 'Survey created successfully on blockchain and database',
        blockchainStatus: 'confirmed'
      };
    } catch (error) {
      console.error('❌ Failed to create survey:', error);
      
      // Provide specific error messages
      if (error.message.includes('INSUFFICIENT_BALANCE')) {
        throw new Error('Insufficient MOVE tokens to create survey. Please fund your wallet.');
      } else if (error.message.includes('Module not found')) {
        throw new Error('Smart contract not deployed. Please contact support.');
      } else {
        throw error;
      }
    }
  },

  // Get creator's surveys
  getCreatorSurveys: async (walletAddress) => {
    try {
      if (!supabaseService.initialized) {
        await supabaseService.initialize();
      }

      // Get user by wallet address
      const user = await supabaseService.getUser(walletAddress);
      if (!user) {
        console.log('User not found for wallet:', walletAddress);
        return [];
      }

      // Get surveys created by this user
      const surveys = await supabaseService.getCreatorSurveys(user.id);
      console.log('Creator surveys loaded:', surveys.length);
      
      return surveys;
    } catch (error) {
      console.error('Failed to get creator surveys:', error);
      return [];
    }
  },

  // Get creator stats (with blockchain escrow data)
  getCreatorStats: async (walletAddress) => {
    const { posts } = get();
    
    if (!walletAddress) {
      return {
        totalSurveys: 0,
        activeSurveys: 0,
        totalResponses: 0,
        escrowBalance: 0
      };
    }

    // Filter surveys created by this wallet address
    const creatorSurveys = posts.filter(post => {
      // Check both creator object and direct creator_wallet_address field
      return post.creator?.wallet_address === walletAddress || 
             post.creator_wallet_address === walletAddress;
    });

    const totalResponses = creatorSurveys.reduce((sum, survey) => 
      sum + (survey.current_responses || 0), 0
    );

    const activeSurveys = creatorSurveys.filter(survey => survey.is_active).length;

    // Get real escrow balance from blockchain
    let escrowBalance = 0;
    try {
      escrowBalance = await movementService.getCreatorEscrow(walletAddress);
    } catch (error) {
      console.error('Failed to get blockchain escrow:', error);
      // Fallback to calculated escrow from database
      escrowBalance = creatorSurveys.reduce((sum, survey) => {
        if (survey.is_active) {
          const remainingResponses = (survey.max_responses || 0) - (survey.current_responses || 0);
          const rewardPerResponse = survey.reward_amount || 0;
          return sum + (remainingResponses * rewardPerResponse);
        }
        return sum;
      }, 0);
    }

    const stats = {
      totalSurveys: creatorSurveys.length,
      activeSurveys,
      totalResponses,
      escrowBalance
    };

    return stats;
  },

  // Check if user has completed a specific survey
  hasUserCompletedSurvey: async (userAddress, surveyId) => {
    try {
      // First check blockchain
      const hasCompleted = await movementService.hasCompletedSurvey(userAddress, surveyId);
      if (hasCompleted) return true;
      
      // Fallback to Supabase check
      const user = await supabaseService.getUser(userAddress);
      if (user) {
        return await supabaseService.hasCompletedSurvey(surveyId, user.id);
      }
      
      return false;
    } catch (error) {
      console.error('Failed to check survey completion:', error);
      return false;
    }
  },

  completeSurvey: async (surveyId, wallet) => {
    try {
      const result = await movementService.completeSurvey(surveyId, wallet);
      // Refresh data after successful transaction
      if (wallet?.address) {
        setTimeout(() => get().refreshAfterAction(wallet.address), 2000);
      }
      return result;
    } catch (error) {
      console.error('Failed to complete survey:', error);
      throw error;
    }
  },

  // Getters
  getPost: (postId) => get().posts.find(p => p.id === postId),
  isSurveyCompleted: (postId) => get().completedSurveys.has(postId),
  isPostUnlocked: (postId) => get().unlockedPosts.has(postId),
  
  getUserStats: () => {
    const { posts, completedSurveys, userEarnings, unlockedPosts } = get();
    const availableSurveys = posts.filter(p => 
      p.type === 'survey' && 
      p.isActive && 
      !completedSurveys.has(p.id)
    ).length;
    
    return {
      totalEarnings: userEarnings,
      surveysCompleted: completedSurveys.size,
      postsUnlocked: unlockedPosts.size,
      availableSurveys,
      availablePosts: 0
    };
  },
  
  // Helper methods for UI components
  getCreateSurveyPayload: (data) => movementService.createSurveyPayload(
    data.title, 
    data.description, 
    data.rewardAmount, 
    data.maxResponses
  ),
  
  getCompleteSurveyPayload: (surveyId) => movementService.completeSurveyPayload(surveyId),
  
  getWithdrawPayload: (address, amount) => movementService.withdrawPayload(address, amount),

  // Legacy methods for compatibility
  checkSurveyCompletion: async (postId) => get().completedSurveys.has(postId),
  checkPostAccess: async (postId) => get().unlockedPosts.has(postId),
  
  unlockPost: async (postId) => {
    const { unlockedPosts } = get();
    const newUnlocked = new Set(unlockedPosts);
    newUnlocked.add(postId);
    set({ unlockedPosts: newUnlocked });
  }
}));