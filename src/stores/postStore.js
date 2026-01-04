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

  // Fallback to Supabase
  loadSurveysFromSupabase: async (filters = {}) => {
    try {
      const surveys = await supabaseService.getSurveys(filters);
      const transformedSurveys = surveys.map(survey => ({
        id: survey.id,
        title: survey.title,
        preview: survey.description,
        content: survey.description,
        reward: parseFloat(survey.reward_amount),
        type: 'survey',
        responses: survey.current_responses,
        maxResponses: survey.max_responses,
        isActive: survey.is_active,
        timestamp: new Date(survey.created_at).getTime(),
        image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400',
        questions: survey.questions || [],
        source: 'supabase'
      }));
      set({ posts: transformedSurveys });
    } catch (error) {
      console.error('❌ Failed to load from Supabase:', error);
      get().loadMockSurveys();
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

  // Refresh data after blockchain transactions
  refreshAfterAction: async (userAddress) => {
    set({ isLoading: true });
    try {
      await get().loadSurveysFromChain();
      if (userAddress) {
        await get().loadUserChainActivity(userAddress);
      }
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