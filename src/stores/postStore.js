import { create } from 'zustand';
import { movementService } from '../services/movementService';
import { supabaseService } from '../services/supabaseService';

export const usePostStore = create((set, get) => ({
  posts: [], // Start with empty array - no mock data
  completedSurveys: new Set(),
  unlockedPosts: new Set(),
  userResponses: {},
  userEarnings: 0,
  isLoading: false,
  useSupabase: false,
  
  // Initialize the store and load real data
  initialize: async () => {
    set({ isLoading: true });
    
    try {
      // Try to initialize Supabase
      const supabaseAvailable = await supabaseService.initialize();
      
      if (supabaseAvailable) {
        console.log('Using Supabase for data storage');
        set({ useSupabase: true });
        await get().loadSurveysFromSupabase();
      } else {
        console.log('Loading surveys from blockchain only');
        set({ useSupabase: false });
        await get().loadSurveysFromBlockchain();
      }
    } catch (error) {
      console.error('Failed to initialize post store:', error);
      // If everything fails, start with empty array
      set({ posts: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  // Load surveys from Supabase
  loadSurveysFromSupabase: async (filters = {}) => {
    try {
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
        questions: survey.questions || [],
        category: survey.category || 'general',
        blockchainId: survey.blockchain_id
      }));
      
      set({ posts: transformedSurveys });
    } catch (error) {
      console.error('Failed to load surveys from Supabase:', error);
      // Fallback to blockchain
      await get().loadSurveysFromBlockchain();
    }
  },

  // Load surveys directly from blockchain
  loadSurveysFromBlockchain: async () => {
    try {
      console.log('Loading surveys from Movement blockchain...');
      
      // Get active survey IDs from blockchain
      const activeSurveyIds = await movementService.getActiveSurveys();
      console.log('Active survey IDs:', activeSurveyIds);
      
      if (!activeSurveyIds || activeSurveyIds.length === 0) {
        console.log('No active surveys found on blockchain');
        set({ posts: [] });
        return;
      }

      // Fetch details for each survey
      const surveyPromises = activeSurveyIds.map(async (surveyId) => {
        try {
          const details = await movementService.getSurveyDetails(surveyId);
          return {
            id: surveyId.toString(),
            title: details.title || `Survey #${surveyId}`,
            preview: `Complete this survey and earn ${details.rewardAmount / 1000000} MOVE tokens. Help us gather valuable insights!`,
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
            blockchainId: surveyId
          };
        } catch (error) {
          console.error(`Failed to load survey ${surveyId}:`, error);
          return null;
        }
      });

      const surveys = (await Promise.all(surveyPromises)).filter(Boolean);
      console.log('Loaded surveys from blockchain:', surveys);
      
      set({ posts: surveys });
    } catch (error) {
      console.error('Failed to load surveys from blockchain:', error);
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
      console.error('Failed to load surveys:', error);
      set({ posts: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  // Create a new survey (Supabase + Blockchain)
  createSurvey: async (surveyData, walletAddress, userId) => {
    const { useSupabase } = get();
    set({ isLoading: true });
    
    try {
      let dbSurvey = null;
      
      if (useSupabase && userId) {
        // 1. Create in Supabase first
        dbSurvey = await supabaseService.createSurvey({
          ...surveyData,
          creatorId: userId
        });
        
        // 2. Create questions if provided
        if (surveyData.questions && surveyData.questions.length > 0) {
          await supabaseService.createSurveyQuestions(dbSurvey.id, surveyData.questions);
        }
      }
      
      // 3. Create on blockchain
      const blockchainResult = await movementService.createSurvey(surveyData, walletAddress);
      
      if (useSupabase && dbSurvey && blockchainResult.success) {
        // 4. Update Supabase with blockchain ID
        await supabaseService.updateSurvey(dbSurvey.id, {
          blockchain_id: blockchainResult.surveyId
        });
      }
      
      // 5. Reload surveys to show the new one
      await get().loadSurveys();
      
      set({ isLoading: false });
      return { 
        success: true, 
        surveyId: dbSurvey?.id || blockchainResult.surveyId,
        blockchainId: blockchainResult.surveyId
      };
    } catch (error) {
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
      // 1. Complete on blockchain
      const result = await movementService.completeSurvey(postId, responses, walletAddress);
      
      if (result.success) {
        // 2. Save to Supabase if available
        if (useSupabase && userId) {
          try {
            await supabaseService.saveResponse(postId, userId, responses, result.txHash);
          } catch (dbError) {
            console.warn('Failed to save response to database:', dbError);
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
      set({ isLoading: false });
      throw error;
    }
  },

  unlockPost: async (postId, walletAddress) => {
    const { posts, unlockedPosts } = get();
    const post = posts.find(p => p.id === postId);
    
    if (!post) throw new Error('Post not found');
    if (unlockedPosts.has(postId)) throw new Error('Post already unlocked');
    if (!post.isPremium) throw new Error('Post is free');
    
    set({ isLoading: true });
    
    try {
      const result = await movementService.unlockPost(postId, post.price, walletAddress);
      
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
  
  tipCreator: async (creatorAddress, amount, walletAddress) => {
    set({ isLoading: true });
    
    try {
      const result = await movementService.tipCreator(creatorAddress, amount, walletAddress);
      
      if (result.success) {
        const { userEarnings } = get();
        const newEarnings = Math.max(0, userEarnings - amount); // Deduct tip from earnings
        set({ userEarnings: newEarnings, isLoading: false });
      } else {
        set({ isLoading: false });
      }
      
      return result;
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
      const hasCompleted = await movementService.hasSurveyCompleted(postId, walletAddress);
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
      const hasAccess = await movementService.hasPostAccess(postId, walletAddress);
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
}));