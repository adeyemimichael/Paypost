import { create } from 'zustand';
import { supabaseService } from '../services/supabaseService';

export const usePostStore = create((set, get) => ({
  posts: [], 
  completedSurveys: new Set(),
  unlockedPosts: new Set(),
  userResponses: {},
  userEarnings: 0,
  isLoading: false,
  useSupabase: true, // Always true for Pure Database App
  lastRefresh: 0,
  
  // Initialize the store
  initialize: async () => {
    set({ isLoading: true });
    
    try {
      // Try to initialize Supabase
      const supabaseAvailable = await supabaseService.initialize();
      
      if (supabaseAvailable) {
        console.log('✅ Using Supabase for data');
        await get().loadSurveysFromSupabase();
      } else {
        console.log('⚠️ Supabase not available, using mock data');
        // Fallback to mock data if Supabase fails
        get().loadMockSurveys();
      }
    } catch (error) {
      console.error('❌ Failed to initialize post store:', error);
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
        })) : [],
        category: survey.category || 'general',
        source: 'supabase'
      }));
      
      set({ posts: transformedSurveys });
    } catch (error) {
      console.error('❌ Failed to load surveys from Supabase:', error);
      get().loadMockSurveys();
    }
  },

  loadMockSurveys: () => {
    const mockSurveys = [
      {
        id: 'mock-1',
        title: 'Community Feedback Survey',
        preview: 'Help us improve our platform by providing your feedback.',
        content: 'We value your opinion!',
        author: 'PayPost Team',
        reward: 5.0,
        type: 'survey',
        estimatedTime: 2,
        responses: 10,
        maxResponses: 100,
        isActive: true,
        timestamp: Date.now(),
        image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400',
        questions: [
          {
            id: 1,
            type: 'multiple-choice',
            question: 'How do you like the new design?',
            options: ['Love it', 'It is okay', 'Needs work'],
            required: true
          }
        ],
        category: 'feedback',
        source: 'mock'
      }
    ];
    set({ posts: mockSurveys });
  },

  // Create a new survey
  createSurvey: async (surveyData, walletAddress, userId) => {
    set({ isLoading: true });
    
    try {
      console.log('🔨 Creating survey...', { surveyData, userId });
      
      // Calculate total cost
      const totalRewards = surveyData.rewardAmount * surveyData.maxResponses;
      const platformFee = totalRewards * 0.025;
      const totalCost = totalRewards + platformFee;
      
      // Deduct from creator's balance (Simulated)
      const { useUserStore } = await import('./userStore');
      const { updateBalance } = useUserStore.getState();
      await updateBalance(-totalCost);
      console.log(`💰 Deducted ${totalCost} MOVE from creator balance`);

      // Create in Supabase
      const dbSurvey = await supabaseService.createSurvey({
        ...surveyData,
        creatorId: userId
      });
      
      if (surveyData.questions && surveyData.questions.length > 0) {
        await supabaseService.createSurveyQuestions(dbSurvey.id, surveyData.questions);
      }
      
      // Refresh list
      await get().loadSurveysFromSupabase();
      
      set({ isLoading: false });
      return { success: true, surveyId: dbSurvey.id };
    } catch (error) {
      console.error('❌ Failed to create survey:', error);
      set({ isLoading: false });
      throw error;
    }
  },
  
  completeSurvey: async (postId, responses, walletAddress, userId) => {
    const { posts, completedSurveys } = get();
    const post = posts.find(p => p.id === postId);
    
    if (!post) throw new Error('Survey not found');
    if (completedSurveys.has(postId)) throw new Error('Survey already completed');
    
    set({ isLoading: true });
    
    try {
      console.log('📝 Completing survey...', { postId, responses, userId });
      
      // Add reward to participant's balance (Simulated)
      const { useUserStore } = await import('./userStore');
      const { updateBalance } = useUserStore.getState();
      await updateBalance(post.reward);
      console.log(`💰 Added ${post.reward} MOVE to participant balance`);
      
      // Save to Supabase
      if (userId) {
        await supabaseService.saveResponse(postId, userId, responses, 'simulated_tx_hash');
      }
      
      // Update local state
      const newCompletedSurveys = new Set(completedSurveys);
      newCompletedSurveys.add(postId);
      
      const { userResponses, userEarnings } = get();
      const newUserResponses = { ...userResponses, [postId]: responses };
      const newEarnings = userEarnings + post.reward;
      
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
      
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to complete survey:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  refreshSurveys: async () => {
    await get().loadSurveysFromSupabase();
  },
  
  // ... other getters ...
  // ... other getters ...
  getPost: (postId) => get().posts.find(p => p.id === postId),
  isSurveyCompleted: (postId) => get().completedSurveys.has(postId),
  isPostUnlocked: (postId) => get().unlockedPosts.has(postId),
  getUserResponses: (postId) => get().userResponses[postId] || null,
  getActiveSurveys: () => get().posts.filter(p => p.isActive && p.responses < p.maxResponses),
  getSurveys: () => get().posts.filter(p => p.type === 'survey'),
  
  checkSurveyCompletion: async (postId, walletAddress) => {
    // In a real app, check against DB or Chain
    return get().completedSurveys.has(postId);
  },

  checkPostAccess: async (postId, walletAddress) => {
    // In a real app, check against DB or Chain
    return get().unlockedPosts.has(postId);
  },

  unlockPost: async (postId, walletAddress) => {
    // Simulated unlock
    const { unlockedPosts } = get();
    const newUnlockedPosts = new Set(unlockedPosts);
    newUnlockedPosts.add(postId);
    set({ unlockedPosts: newUnlockedPosts });
    return true;
  },
  
  getUserStats: () => {
    const { posts, completedSurveys, userEarnings, unlockedPosts } = get();
    const availableSurveys = posts.filter(p => p.type === 'survey' && p.isActive && !completedSurveys.has(p.id)).length;
    const availablePosts = posts.filter(p => p.type === 'post' && !unlockedPosts.has(p.id)).length;
    
    return {
      totalEarnings: userEarnings,
      surveysCompleted: completedSurveys.size,
      postsUnlocked: unlockedPosts.size,
      availableSurveys,
      availablePosts
    };
  },
}));