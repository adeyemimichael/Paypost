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
      console.log('🔄 Initializing post store with Supabase...');
      
      // Try Supabase first (primary data source)
      const supabaseAvailable = await supabaseService.initialize();
      if (supabaseAvailable) {
        await get().loadSurveysFromSupabase();
        if (userAddress) {
          await get().loadUserSupabaseActivity(userAddress);
        }
        console.log('✅ Loaded data from Supabase');
      } else {
        // Fallback to mock data if Supabase fails
        console.log('⚠️ Supabase unavailable, using mock data');
        get().loadMockSurveys();
      }
    } catch (error) {
      console.error('❌ Failed to initialize post store:', error);
      // Always fallback to mock data on error
      get().loadMockSurveys();
    } finally {
      set({ isLoading: false, lastRefresh: Date.now() });
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

  // Refresh data after user actions (Supabase-first)
  refreshAfterAction: async (userAddress) => {
    set({ isLoading: true });
    try {
      console.log('🔄 Refreshing data after user action...');
      await get().loadSurveysFromSupabase();
      if (userAddress) {
        await get().loadUserSupabaseActivity(userAddress);
      }
      console.log('✅ Data refreshed successfully');
    } catch (error) {
      console.error('❌ Failed to refresh data:', error);
    } finally {
      set({ isLoading: false });
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