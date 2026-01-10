import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { movementService } from '../services/movementService';
import { supabaseService } from '../services/supabaseService';

export const usePostStore = create(
  persist(
    (set, get) => ({
      posts: [],
      isLoading: false,
      lastRefresh: null,
      completedSurveys: new Set(),
      unlockedPosts: new Set(),
      userEarnings: 0,

      initialize: async (userAddress = null) => {
        try {
          set({ isLoading: true });
          console.log('🔄 Initializing post store...');
          
          const backendAvailable = await movementService.testConnection();
          
          if (backendAvailable) {
            console.log('✅ Backend available, loading from blockchain...');
            await get().loadSurveysFromChain();
            if (userAddress) {
              await get().loadUserChainActivity(userAddress);
            }
          }
          
          await supabaseService.initialize();
          await get().loadSurveysFromSupabase();
          if (userAddress) {
            await get().loadUserSupabaseActivity(userAddress);
          }
        } catch (error) {
          console.error('❌ Failed to initialize post store:', error);
          get().loadMockSurveys();
        } finally {
          set({ isLoading: false, lastRefresh: Date.now() });
        }
      },

      loadSurveysFromChain: async () => {
        try {
          console.log('⛓️ Loading surveys from blockchain...');
          const surveys = await movementService.getSurveys();
          
          const transformedSurveys = surveys.map(survey => ({
            id: survey.id,
            title: survey.title,
            description: survey.description,
            reward: survey.reward_amount,
            maxResponses: survey.max_responses,
            responses: survey.current_responses,
            isActive: survey.isActive,
            timestamp: Date.now(),
            author: `${survey.creator.substring(0, 6)}...${survey.creator.substring(62)}`,
            image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800',
            questions: [{
              id: 1,
              type: 'multiple-choice',
              question: 'How would you rate this survey?',
              options: ['Excellent', 'Good', 'Fair', 'Poor'],
              required: true
            }],
            type: 'survey',
            source: 'chain'
          }));

          set({ posts: transformedSurveys });
          console.log(`✅ Loaded ${transformedSurveys.length} surveys from blockchain`);
        } catch (error) {
          console.error('❌ Failed to load surveys from chain:', error);
          await supabaseService.initialize();
          await get().loadSurveysFromSupabase();
        }
      },

      loadSurveysFromSupabase: async (filters = {}) => {
        try {
          console.log('📊 Loading surveys from Supabase...');
          const surveys = await supabaseService.getSurveys(filters);
          
          const transformedSurveys = surveys.map(survey => {
            let questions = [];
            if (survey.questions && Array.isArray(survey.questions)) {
              questions = survey.questions.map(q => ({
                id: q.id,
                type: q.question_type || 'multiple-choice',
                question: q.question_text,
                options: q.options || [],
                required: q.is_required !== false,
                max: q.max_rating || 5
              }));
            }
            
            if (questions.length === 0) {
              questions = [{
                id: 1,
                type: 'multiple-choice',
                question: 'How would you rate this survey topic?',
                options: ['Excellent', 'Good', 'Fair', 'Poor'],
                required: true
              }];
            }

            return {
              id: survey.id,
              title: survey.title,
              description: survey.description,
              reward: survey.reward_amount,
              maxResponses: survey.max_responses,
              responses: survey.current_responses || 0,
              isActive: survey.is_active,
              timestamp: new Date(survey.created_at).getTime(),
              author: survey.creator?.display_name || 'Anonymous Creator',
              image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800',
              questions,
              type: 'survey',
              source: 'supabase',
              category: survey.category,
              estimatedTime: survey.estimated_time,
              expiresAt: survey.expires_at,
              creatorAddress: survey.creator?.wallet_address
            };
          });

          set({ posts: transformedSurveys });
          console.log(`✅ Loaded ${transformedSurveys.length} surveys from Supabase`);
        } catch (error) {
          console.error('❌ Failed to load surveys from Supabase:', error);
          get().loadMockSurveys();
        }
      },

      loadUserSupabaseActivity: async (userAddress) => {
        try {
          if (!supabaseService.initialized) {
            await supabaseService.initialize();
          }
          
          const user = await supabaseService.getUser(userAddress);
          if (!user) return;

          const stats = await supabaseService.getUserStats(user.id);
          set({ userEarnings: stats.totalEarnings || 0 });
          
          const { posts } = get();
          const completed = new Set();
          
          await Promise.all(posts.map(async (post) => {
            if (post.type === 'survey') {
              const hasCompleted = await supabaseService.hasCompletedSurvey(post.id, user.id);
              if (hasCompleted) {
                completed.add(post.id);
              }
            }
          }));
          
          set({ completedSurveys: completed });
        } catch (error) {
          console.error('Failed to load user activity from Supabase:', error);
        }
      },

      loadUserChainActivity: async (userAddress) => {
        try {
          console.log('⛓️ Loading user activity from blockchain...');
          const activity = await movementService.getUserActivity(userAddress);
          
          set({ 
            userEarnings: activity.totalEarnings || 0,
            completedSurveys: new Set(activity.completedSurveys || [])
          });
          
          console.log(`✅ User has earned ${activity.totalEarnings || 0} MOVE tokens`);
        } catch (error) {
          console.error('❌ Failed to load user activity from blockchain:', error);
        }
      },

      refreshAfterAction: async (userAddress) => {
        try {
          set({ isLoading: true });
          
          const backendAvailable = await movementService.testConnection();
          
          if (backendAvailable) {
            await get().loadSurveysFromChain();
            if (userAddress) {
              await get().loadUserChainActivity(userAddress);
            }
          } else {
            await supabaseService.initialize();
            await get().loadSurveysFromSupabase();
            if (userAddress) {
              await get().loadUserSupabaseActivity(userAddress);
            }
          }
        } catch (error) {
          console.error('❌ Failed to refresh data:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      createSurvey: async (surveyData, wallet) => {
        try {
          console.log('Creating survey with mandatory blockchain transaction...', surveyData);
          
          if (!supabaseService.initialized) {
            await supabaseService.initialize();
          }
          
          const user = await supabaseService.getOrCreateUser(wallet.address, null, 'creator');
          if (!user) {
            throw new Error('Failed to create user in database');
          }

          try {
            const surveys = await movementService.getSurveys();
            const userActiveSurveys = surveys.filter(s => 
              s.creator.toLowerCase() === wallet.address.toLowerCase() && s.isActive
            );
            
            if (userActiveSurveys.length > 0) {
              for (const survey of userActiveSurveys) {
                try {
                  await movementService.closeSurvey(survey.id, wallet);
                } catch (closeError) {
                  console.warn(`Failed to close survey ${survey.id}:`, closeError);
                }
              }
            }
          } catch (error) {
            console.warn('Failed to check existing surveys:', error);
          }

          const blockchainResult = await movementService.createSurvey(surveyData, wallet);

          const survey = await supabaseService.createSurvey({
            ...surveyData,
            creatorId: user.id,
            blockchain_tx_hash: blockchainResult.transactionHash,
            blockchain_status: 'confirmed'
          });

          const newSurvey = {
            id: blockchainResult.transactionHash,
            title: surveyData.title,
            description: surveyData.description,
            reward: surveyData.rewardAmount,
            maxResponses: surveyData.maxResponses,
            responses: 0,
            isActive: true,
            timestamp: Date.now(),
            author: `${wallet.address.substring(0, 6)}...${wallet.address.substring(62)}`,
            image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800',
            questions: surveyData.questions || [{
              id: 1,
              type: 'multiple-choice',
              question: 'How would you rate this survey?',
              options: ['Excellent', 'Good', 'Fair', 'Poor'],
              required: true
            }],
            type: 'survey',
            source: 'chain',
            blockchain_tx_hash: blockchainResult.transactionHash
          };

          set(state => ({
            posts: [newSurvey, ...state.posts]
          }));

          setTimeout(() => {
            get().loadSurveysFromSupabase();
            if (typeof window !== 'undefined' && window.useWalletStore) {
              window.useWalletStore.getState().fetchBalance();
            }
          }, 1000);

          return blockchainResult;
        } catch (error) {
          console.error('Failed to create survey:', error);
          
          if (error.message.includes('INSUFFICIENT_BALANCE')) {
            throw new Error('Insufficient MOVE tokens to create survey. Please fund your wallet.');
          } else if (error.message.includes('Module not found')) {
            throw new Error('Smart contract not deployed. Please contact support.');
          } else {
            throw error;
          }
        }
      },

      getCreatorSurveys: async (walletAddress) => {
        try {
          if (!supabaseService.initialized) {
            await supabaseService.initialize();
          }

          const user = await supabaseService.getUser(walletAddress);
          if (!user) {
            throw new Error('User not found for wallet: ' + walletAddress);
          }

          const surveys = await supabaseService.getCreatorSurveys(user.id);
          return surveys;
        } catch (error) {
          console.error('Failed to get creator surveys:', error);
          throw error;
        }
      },

      completeSurvey: async (surveyId, wallet, responseData) => {
        try {
          if (!supabaseService.initialized) {
            await supabaseService.initialize();
          }

          const user = await supabaseService.getOrCreateUser(wallet.address, null, 'participant');
          if (!user) {
            throw new Error('Failed to create user in database');
          }

          const hasCompleted = await supabaseService.hasCompletedSurvey(surveyId, user.id);
          if (hasCompleted) {
            throw new Error('You have already completed this survey');
          }

          const blockchainResult = await movementService.completeSurvey(surveyId, wallet);

          await supabaseService.saveResponse(
            surveyId,
            user.id,
            responseData || {},
            blockchainResult.transactionHash || blockchainResult.hash
          );

          set(state => ({
            posts: state.posts.map(post => 
              post.id === surveyId 
                ? { ...post, responses: (post.responses || 0) + 1 }
                : post
            ),
            userEarnings: (state.userEarnings || 0) + (state.posts.find(p => p.id === surveyId)?.reward || 0)
          }));

          setTimeout(() => {
            get().loadSurveysFromSupabase();
            if (typeof window !== 'undefined' && window.useWalletStore) {
              window.useWalletStore.getState().fetchBalance();
            }
          }, 1000);

          return blockchainResult;
        } catch (error) {
          console.error('Failed to complete survey:', error);
          throw error;
        }
      },

      getCreatorStats: async (walletAddress) => {
        const { posts } = get();
        
        if (!walletAddress) {
          return {
            totalSurveys: 0,
            activeSurveys: 0,
            totalResponses: 0,
            totalEscrow: 0
          };
        }

        const creatorSurveys = posts.filter(post => 
          post.type === 'survey' && 
          post.creatorAddress?.toLowerCase() === walletAddress.toLowerCase()
        );

        const activeSurveys = creatorSurveys.filter(survey => survey.isActive);
        const totalResponses = creatorSurveys.reduce((sum, survey) => sum + (survey.responses || 0), 0);

        let totalEscrow = 0;
        try {
          totalEscrow = await movementService.getCreatorEscrow(walletAddress);
        } catch (error) {
          console.error('Failed to get creator escrow:', error);
        }

        return {
          totalSurveys: creatorSurveys.length,
          activeSurveys: activeSurveys.length,
          totalResponses,
          totalEscrow
        };
      },

      loadMockSurveys: () => {
        const mockSurveys = [{
          id: 'mock-1',
          title: 'Product Feedback Survey',
          description: 'Help us improve our product with your valuable feedback',
          reward: 0.5,
          maxResponses: 100,
          responses: 23,
          isActive: true,
          timestamp: Date.now() - 86400000,
          author: 'TechCorp',
          image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800',
          questions: [{
            id: 1,
            type: 'rating',
            question: 'How satisfied are you with our product?',
            required: true,
            max: 5
          }],
          type: 'survey',
          source: 'mock'
        }];
        
        set({ posts: mockSurveys });
        console.log('✅ Loaded mock surveys');
      },

      getPost: (postId) => get().posts.find(p => p.id === postId),
      isSurveyCompleted: (postId) => get().completedSurveys.has(postId),
      isPostUnlocked: (postId) => get().unlockedPosts.has(postId),
      
      // Missing functions that components expect
      hasUserCompletedSurvey: async (surveyId, userAddress) => {
        try {
          if (!supabaseService.initialized) {
            await supabaseService.initialize();
          }
          const user = await supabaseService.getUser(userAddress);
          if (!user) return false;
          return await supabaseService.hasCompletedSurvey(surveyId, user.id);
        } catch (error) {
          console.error('Failed to check survey completion:', error);
          return false;
        }
      },
      
      checkSurveyCompletion: async (surveyId, userAddress) => {
        return await get().hasUserCompletedSurvey(surveyId, userAddress);
      },
      
      checkPostAccess: async (postId) => get().unlockedPosts.has(postId),
      
      unlockPost: async (postId) => {
        const { unlockedPosts } = get();
        const newUnlocked = new Set(unlockedPosts);
        newUnlocked.add(postId);
        set({ unlockedPosts: newUnlocked });
      }
    }),
    {
      name: 'paypost-post-store',
      partialize: (state) => ({
        completedSurveys: Array.from(state.completedSurveys),
        unlockedPosts: Array.from(state.unlockedPosts),
        userEarnings: state.userEarnings
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.completedSurveys = new Set(state.completedSurveys || []);
          state.unlockedPosts = new Set(state.unlockedPosts || []);
        }
      }
    }
  )
);