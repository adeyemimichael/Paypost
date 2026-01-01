import { create } from 'zustand';
import { realMovementService } from '../services/realMovementService';
import { supabaseService } from '../services/supabaseService';

export const usePostStore = create((set, get) => ({
  posts: [], // Start with empty array - no mock data
  completedSurveys: new Set(),
  unlockedPosts: new Set(),
  userResponses: {},
  userEarnings: 0,
  isLoading: false,
  useSupabase: false,
  lastRefresh: 0,
  
  // Initialize the store and load real data
  initialize: async () => {
    set({ isLoading: true });
    
    try {
      // Initialize Movement service first
      await realMovementService.initialize();
      
      // Try to initialize Supabase
      const supabaseAvailable = await supabaseService.initialize();
      
      if (supabaseAvailable) {
        console.log('✅ Using Supabase + Blockchain hybrid approach');
        set({ useSupabase: true });
        await get().loadSurveysFromSupabase();
      } else {
        console.log('✅ Using Blockchain-only approach');
        set({ useSupabase: false });
        await get().loadSurveysFromBlockchain();
      }
    } catch (error) {
      console.error('❌ Failed to initialize post store:', error);
      // If everything fails, start with empty array
      set({ posts: [] });
    } finally {
      set({ isLoading: false, lastRefresh: Date.now() });
    }
  },

  // Load surveys from Supabase
  loadSurveysFromSupabase: async (filters = {}) => {
    try {
      console.log('📊 Loading surveys from Supabase...');
      const surveys = await supabaseService.getSurveys(filters);
      const transformedSurveys = surveys.map(survey => ({
        id: survey.id,
        title: survey.title,
        preview: survey.description?.substring(0, 150) + '...' || 'No description available',
        content: survey.description || 'Thank you for participating!',
        author: survey.creator?.display_name || 'Anonymous',
        authorAddress: survey.creator?.wallet_address || '0x0000000000000000000000000000000000000000',
        reward: parseFloat(survey.reward_amount) || 0,
        type: 'survey',
        estimatedTime: survey.estimated_time || 5,
        responses: survey.current_responses || 0,
        maxResponses: survey.max_responses || 100,
        isActive: survey.is_active,
        timestamp: new Date(survey.created_at).getTime(),
        image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400',
        questions: survey.questions?.length > 0 ? survey.questions.map((q, index) => ({
          id: q.id || index + 1,
          type: q.question_type || 'multiple-choice',
          question: q.question_text || q.question || 'Sample question',
          options: q.options ? (typeof q.options === 'string' ? JSON.parse(q.options) : q.options) : ['Option 1', 'Option 2', 'Option 3'],
          required: q.required !== false,
          max: q.question_type === 'rating' ? 5 : undefined
        })) : [
          {
            id: 1,
            type: 'multiple-choice',
            question: 'How would you rate this survey platform?',
            options: ['Excellent', 'Good', 'Fair', 'Poor']
          },
          {
            id: 2,
            type: 'text',
            question: 'What improvements would you suggest?'
          }
        ],
        category: survey.category || 'general',
        blockchainId: survey.blockchain_id,
        source: 'supabase'
      }));
      
      console.log(`✅ Loaded ${transformedSurveys.length} surveys from Supabase`);
      set({ posts: transformedSurveys });
    } catch (error) {
      console.error('❌ Failed to load surveys from Supabase:', error);
      // Fallback to blockchain
      await get().loadSurveysFromBlockchain();
    }
  },

  // Load surveys directly from blockchain
  loadSurveysFromBlockchain: async () => {
    try {
      console.log('⛓️ Loading surveys from Movement blockchain...');
      
      // Get active survey IDs from blockchain
      const activeSurveyIds = await realMovementService.getActiveSurveys();
      console.log('Active survey IDs from blockchain:', activeSurveyIds);
      
      if (!activeSurveyIds || activeSurveyIds.length === 0) {
        console.log('ℹ️ No active surveys found on blockchain');
        set({ posts: [] });
        return;
      }

      // Fetch details for each survey
      const surveyPromises = activeSurveyIds.map(async (surveyId) => {
        try {
          const details = await realMovementService.getSurveyDetails(surveyId);
          return {
            id: surveyId.toString(),
            title: details.title || `Survey #${surveyId}`,
            preview: `Complete this survey and earn ${(details.rewardAmount / 1000000).toFixed(2)} MOVE tokens. Help us gather valuable insights!`,
            content: details.title || 'Thank you for participating in this survey!',
            author: 'Survey Creator',
            authorAddress: details.creator,
            reward: details.rewardAmount / 1000000, // Convert from micro-MOVE
            type: 'survey',
            estimatedTime: 5,
            responses: details.currentResponses,
            maxResponses: details.maxResponses,
            isActive: details.isActive,
            timestamp: Date.now() - (Math.random() * 86400000), // Random time within last day
            image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400',
            questions: [
              {
                id: 1,
                type: 'multiple-choice',
                question: 'How would you rate this survey platform?',
                options: ['Excellent', 'Good', 'Fair', 'Poor']
              },
              {
                id: 2,
                type: 'text',
                question: 'What improvements would you suggest?'
              }
            ],
            category: 'general',
            blockchainId: surveyId,
            source: 'blockchain'
          };
        } catch (error) {
          console.error(`❌ Failed to load survey ${surveyId}:`, error);
          return null;
        }
      });

      const surveys = (await Promise.all(surveyPromises)).filter(Boolean);
      console.log(`✅ Loaded ${surveys.length} surveys from blockchain`);
      
      set({ posts: surveys });
    } catch (error) {
      console.error('❌ Failed to load surveys from blockchain:', error);
      set({ posts: [] });
    }
  },

  // Load surveys (unified method)
  loadSurveys: async (filters = {}) => {
    const { useSupabase } = get();
    set({ isLoading: true });
    
    try {
      if (useSupabase) {
        await get().loadSurveysFromSupabase(filters);
      } else {
        await get().loadSurveysFromBlockchain();
      }
    } catch (error) {
      console.error('❌ Failed to load surveys:', error);
      set({ posts: [] });
    } finally {
      set({ isLoading: false, lastRefresh: Date.now() });
    }
  },

  // Create a new survey (Supabase + Blockchain)
  createSurvey: async (surveyData, walletAddress, userId) => {
    const { useSupabase } = get();
    set({ isLoading: true });
    
    try {
      console.log('🔨 Creating survey...', { surveyData, walletAddress, userId, useSupabase });
      
      let dbSurvey = null;
      
      if (useSupabase && userId) {
        console.log('💾 Creating survey in Supabase...');
        // 1. Create in Supabase first
        dbSurvey = await supabaseService.createSurvey({
          ...surveyData,
          creatorId: userId
        });
        console.log('✅ Survey created in Supabase:', dbSurvey);
        
        // 2. Create questions if provided
        if (surveyData.questions && surveyData.questions.length > 0) {
          await supabaseService.createSurveyQuestions(dbSurvey.id, surveyData.questions);
          console.log('✅ Survey questions created in Supabase');
        }
      }
      
      // 3. Create on blockchain
      console.log('⛓️ Creating survey on blockchain...');
      const blockchainResult = await realMovementService.createSurvey(surveyData, walletAddress);
      console.log('✅ Survey created on blockchain:', blockchainResult);
      
      if (useSupabase && dbSurvey && blockchainResult.success) {
        // 4. Update Supabase with blockchain ID
        console.log('🔗 Linking Supabase survey to blockchain...');
        await supabaseService.updateSurvey(dbSurvey.id, {
          blockchain_id: blockchainResult.surveyId
        });
        console.log('✅ Survey linked to blockchain');
      }
      
      // 5. Reload surveys to show the new one
      console.log('🔄 Refreshing survey list...');
      await get().loadSurveys();
      
      set({ isLoading: false });
      return { 
        success: true, 
        surveyId: dbSurvey?.id || blockchainResult.surveyId,
        blockchainId: blockchainResult.surveyId,
        isSimulated: blockchainResult.isSimulated
      };
    } catch (error) {
      console.error('❌ Failed to create survey:', error);
      set({ isLoading: false });
      throw error;
    }
  },
  
  setPosts: (posts) => set({ posts }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  completeSurvey: async (postId, responses, walletAddress, userId = null) => {
    const { posts, completedSurveys, useSupabase } = get();
    const post = posts.find(p => p.id === postId);
    
    if (!post) throw new Error('Survey not found');
    if (completedSurveys.has(postId)) throw new Error('Survey already completed');
    if (!post.isActive) throw new Error('Survey is no longer active');
    
    set({ isLoading: true });
    
    try {
      console.log('📝 Completing survey...', { postId, responses, walletAddress, userId });
      
      // 1. Complete on blockchain
      const blockchainId = post.blockchainId || postId;
      const result = await realMovementService.completeSurvey(blockchainId, responses, walletAddress);
      console.log('✅ Survey completed on blockchain:', result);
      
      if (result.success) {
        // 2. Save to Supabase if available
        if (useSupabase && userId) {
          try {
            await supabaseService.saveResponse(postId, userId, responses, result.txHash);
            console.log('✅ Response saved to Supabase');
          } catch (dbError) {
            console.warn('⚠️ Failed to save response to database:', dbError);
            // Continue anyway - blockchain transaction succeeded
          }
        }
        
        // 3. Update local state
        const newCompletedSurveys = new Set(completedSurveys);
        newCompletedSurveys.add(postId);
        
        const { userResponses, userEarnings } = get();
        const newUserResponses = { ...userResponses, [postId]: responses };
        const newEarnings = userEarnings + post.reward;
        
        // Update post response count
        const updatedPosts = posts.map(p => 
          p.id === postId ? { ...p, responses: p.responses + 1 } : p
        );
        
        set({ 
          completedSurveys: newCompletedSurveys, 
          userResponses: newUserResponses,
          userEarnings: newEarnings,
          posts: updatedPosts,
          isLoading: false 
        });
        
        return result;
      }
      
      throw new Error('Transaction failed');
    } catch (error) {
      console.error('❌ Failed to complete survey:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  // Refresh surveys (force reload)
  refreshSurveys: async () => {
    console.log('🔄 Force refreshing surveys...');
    await get().loadSurveys();
  },

  unlockPost: async (postId, walletAddress) => {
    const { posts, unlockedPosts } = get();
    const post = posts.find(p => p.id === postId);
    
    if (!post) throw new Error('Post not found');
    if (unlockedPosts.has(postId)) throw new Error('Post already unlocked');
    if (!post.isPremium) throw new Error('Post is free');
    
    set({ isLoading: true });
    
    try {
      // This would need to be implemented in the smart contract
      const result = { success: true, txHash: 'mock_unlock_tx' };
      
      if (result.success) {
        const newUnlockedPosts = new Set(unlockedPosts);
        newUnlockedPosts.add(postId);
        
        set({ 
          unlockedPosts: newUnlockedPosts,
          isLoading: false 
        });
        return result;
      }
      
      throw new Error('Transaction failed');
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  
  checkSurveyCompletion: async (postId, walletAddress, userId = null) => {
    if (!walletAddress) return false;
    
    const { completedSurveys, useSupabase } = get();
    if (completedSurveys.has(postId)) return true;
    
    try {
      // Check Supabase first if available
      if (useSupabase && userId) {
        const hasCompleted = await supabaseService.hasCompletedSurvey(postId, userId);
        if (hasCompleted) {
          const newCompletedSurveys = new Set(completedSurveys);
          newCompletedSurveys.add(postId);
          set({ completedSurveys: newCompletedSurveys });
          return true;
        }
      }
      
      // Fallback to blockchain check
      const hasCompleted = await realMovementService.hasSurveyCompleted(postId, walletAddress);
      if (hasCompleted) {
        const newCompletedSurveys = new Set(completedSurveys);
        newCompletedSurveys.add(postId);
        set({ completedSurveys: newCompletedSurveys });
      }
      return hasCompleted;
    } catch (error) {
      console.error('Failed to check survey completion:', error);
      return false;
    }
  },

  checkPostAccess: async (postId, walletAddress) => {
    if (!walletAddress) return false;
    
    const { unlockedPosts } = get();
    if (unlockedPosts.has(postId)) return true;
    
    try {
      // This would need to be implemented
      const hasAccess = false; // Placeholder
      if (hasAccess) {
        const newUnlockedPosts = new Set(unlockedPosts);
        newUnlockedPosts.add(postId);
        set({ unlockedPosts: newUnlockedPosts });
      }
      return hasAccess;
    } catch (error) {
      console.error('Failed to check post access:', error);
      return false;
    }
  },
  
  getPost: (postId) => {
    const { posts } = get();
    return posts.find(p => p.id === postId);
  },
  
  isSurveyCompleted: (postId) => {
    const { completedSurveys } = get();
    return completedSurveys.has(postId);
  },

  isPostUnlocked: (postId) => {
    const { unlockedPosts } = get();
    return unlockedPosts.has(postId);
  },
  
  getUserResponses: (postId) => {
    const { userResponses } = get();
    return userResponses[postId] || null;
  },
  
  getActiveSurveys: () => {
    const { posts } = get();
    return posts.filter(p => p.isActive && p.responses < p.maxResponses);
  },
  
  getUserStats: () => {
    const { completedSurveys, unlockedPosts, userEarnings, posts } = get();
    const availableSurveys = posts.filter(p => p.type === 'survey' || p.type === 'poll').filter(p => p.isActive && p.responses < p.maxResponses).length;
    const availablePosts = posts.filter(p => p.type === 'premium-post' || p.type === 'free-post').length;
    
    return {
      surveysCompleted: completedSurveys.size,
      postsUnlocked: unlockedPosts.size,
      totalEarnings: userEarnings,
      availableSurveys,
      availablePosts
    };
  },

  getSurveys: () => {
    const { posts } = get();
    return posts.filter(p => p.type === 'survey' || p.type === 'poll');
  },

  getPosts: () => {
    const { posts } = get();
    return posts.filter(p => p.type === 'premium-post' || p.type === 'free-post');
  },

  // Debug methods
  getDebugInfo: () => {
    const { posts, useSupabase, lastRefresh } = get();
    return {
      totalPosts: posts.length,
      useSupabase,
      lastRefresh: new Date(lastRefresh).toISOString(),
      isSimulationMode: realMovementService.isInSimulationMode(),
      sources: posts.map(p => ({ id: p.id, source: p.source }))
    };
  }
}));