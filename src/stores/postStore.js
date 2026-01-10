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
          
          // Try to initialize Supabase, but don't fail if it's not available
          try {
            const supabaseInitialized = await supabaseService.initialize();
            if (supabaseInitialized) {
              await get().loadSurveysFromSupabase();
              if (userAddress) {
                await get().loadUserSupabaseActivity(userAddress);
              }
            } else {
              console.log('⚠️ Supabase not available, using blockchain data only');
            }
          } catch (supabaseError) {
            console.warn('⚠️ Supabase initialization failed, continuing without it:', supabaseError.message);
          }
          
          // If no data loaded, use mock data
          const { posts } = get();
          if (posts.length === 0) {
            console.log('📊 No surveys loaded, using mock data');
            get().loadMockSurveys();
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
          
          // Get locally stored posts to preserve questions
          const { posts: localPosts } = get();
          const localPostsMap = new Map(localPosts.map(p => [p.title, p]));
          
          // Try to get all surveys with questions from Supabase
          let supabaseSurveys = [];
          try {
            if (supabaseService.initialized || (await supabaseService.initialize().catch(() => false))) {
              supabaseSurveys = await supabaseService.getAllSurveysWithQuestions();
              console.log(`📊 Loaded ${supabaseSurveys.length} surveys from Supabase for question matching`);
            }
          } catch (e) {
            console.warn('⚠️ Could not load Supabase surveys for questions:', e.message);
          }
          
          // Create a map of Supabase surveys by title for quick lookup
          const supabaseSurveysByTitle = new Map(supabaseSurveys.map(s => [s.title, s]));
          
          const transformedSurveys = surveys.map(survey => {
            // Try to find matching local survey to get questions
            const matchingLocalSurvey = localPostsMap.get(survey.title);
            
            // Try to find matching Supabase survey to get questions
            const matchingSupabaseSurvey = supabaseSurveysByTitle.get(survey.title);
            
            let questions = [];
            
            // Priority 1: Use questions from Supabase (most reliable)
            if (matchingSupabaseSurvey?.questions && Array.isArray(matchingSupabaseSurvey.questions) && matchingSupabaseSurvey.questions.length > 0) {
              questions = matchingSupabaseSurvey.questions.map(q => ({
                id: q.id,
                type: q.question_type || 'multiple-choice',
                question: q.question_text,
                options: q.options || [],
                required: q.is_required !== false,
                max: q.max_rating || 5
              }));
              console.log(`📝 Using Supabase questions for "${survey.title}" (${questions.length} questions)`);
            }
            // Priority 2: Use questions from local storage
            else if (matchingLocalSurvey?.questions && Array.isArray(matchingLocalSurvey.questions) && matchingLocalSurvey.questions.length > 0) {
              questions = matchingLocalSurvey.questions;
              console.log(`📝 Using locally stored questions for "${survey.title}"`);
            }
            
            // Fallback to default question if none found
            if (questions.length === 0) {
              questions = [{
                id: 1,
                type: 'multiple-choice',
                question: 'How would you rate this survey?',
                options: ['Excellent', 'Good', 'Fair', 'Poor'],
                required: true
              }];
              console.log(`⚠️ No questions found for "${survey.title}", using default`);
            }
            
            return {
              id: survey.id, // Use the actual survey ID from blockchain
              title: survey.title,
              description: survey.description,
              reward: survey.reward_amount,
              maxResponses: survey.max_responses,
              responses: survey.current_responses,
              isActive: survey.isActive,
              timestamp: Date.now(),
              author: `${survey.creator.substring(0, 6)}...${survey.creator.substring(62)}`,
              image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800',
              questions,
              type: 'survey',
              source: 'chain',
              creatorAddress: survey.creator,
              actualSurveyId: survey.id // Store the blockchain survey ID
            };
          });

          set({ posts: transformedSurveys });
          console.log(`✅ Loaded ${transformedSurveys.length} surveys from blockchain`);
        } catch (error) {
          console.error('❌ Failed to load surveys from chain:', error);
          // Keep existing posts if chain load fails
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
            const initialized = await supabaseService.initialize();
            if (!initialized) {
              console.log('⚠️ Supabase not available for user activity');
              return;
            }
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
          console.log('Creating survey with blockchain transaction...', surveyData);
          
          if (!supabaseService.initialized) {
            await supabaseService.initialize();
          }
          
          const user = await supabaseService.getOrCreateUser(wallet.address, null, 'creator');
          if (!user) {
            throw new Error('Failed to create user in database');
          }

          // Check if user already has an active survey
          console.log('🔍 Checking for existing active surveys...');
          try {
            const surveys = await movementService.getSurveys();
            const userActiveSurveys = surveys.filter(s => 
              s.creator && s.creator.toLowerCase() === wallet.address.toLowerCase() && s.isActive
            );
            
            if (userActiveSurveys.length > 0) {
              console.log(`❌ User has ${userActiveSurveys.length} active survey(s). Cannot create new survey.`);
              throw new Error('You already have an active survey. Please wait for it to complete or expire before creating a new one. Due to smart contract limitations, only one active survey per creator is allowed.');
            }
          } catch (checkError) {
            if (checkError.message.includes('already have an active survey')) {
              throw checkError;
            }
            console.warn('⚠️ Failed to check existing surveys:', checkError);
            // Continue anyway - the blockchain will enforce the constraint
          }

          // Attempt to create survey directly
          console.log('🚀 Creating survey on blockchain...');
          const blockchainResult = await movementService.createSurvey(surveyData, wallet);
          console.log('✅ Survey created successfully:', blockchainResult.transactionHash);

          // Save to Supabase with questions
          try {
            const survey = await supabaseService.createSurvey({
              ...surveyData,
              creatorId: user.id,
              blockchain_tx_hash: blockchainResult.transactionHash
            });
            console.log('✅ Survey saved to Supabase:', survey?.id);
            
            // Save questions to Supabase if survey was created
            if (survey?.id && surveyData.questions && surveyData.questions.length > 0) {
              try {
                await supabaseService.createSurveyQuestions(survey.id, surveyData.questions);
                console.log('✅ Survey questions saved to Supabase');
              } catch (questionsError) {
                console.warn('⚠️ Failed to save questions to Supabase:', questionsError);
              }
            }
          } catch (dbError) {
            console.warn('⚠️ Failed to save to Supabase, but blockchain transaction succeeded:', dbError);
          }

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
            questions: surveyData.questions && surveyData.questions.length > 0 
              ? surveyData.questions.map((q, idx) => ({
                  id: q.id || idx + 1,
                  type: q.type || 'multiple-choice',
                  question: q.text || q.question,
                  options: q.options || [],
                  required: q.required !== false
                }))
              : [{
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

          // Refresh data after a delay
          setTimeout(() => {
            get().loadSurveysFromSupabase();
            if (typeof window !== 'undefined' && window.useWalletStore) {
              window.useWalletStore.getState().fetchBalance();
            }
          }, 2000);

          return blockchainResult;
        } catch (error) {
          console.error('Failed to create survey:', error);
          
          if (error.message.includes('INSUFFICIENT_BALANCE') || error.message.includes('Insufficient balance')) {
            throw new Error('Insufficient MOVE tokens to create survey. Please fund your wallet.');
          } else if (error.message.includes('Module not found')) {
            throw new Error('Smart contract not deployed. Please contact support.');
          } else if (error.message.includes('find_survey_index')) {
            throw new Error('Survey creation failed due to smart contract state inconsistency. You may have an existing survey that cannot be properly detected. Please contact support or try again later.');
          } else if (error.message.includes('ACTIVE_SURVEY_EXISTS') || error.message.includes('E_ACTIVE_SURVEY_EXISTS')) {
            throw new Error('You already have an active survey. Please wait for it to complete or close it before creating a new one.');
          } else if (error.message.includes('already have an active survey')) {
            throw error; // Pass through the specific error message
          } else if (error.message.includes('Transaction failed')) {
            throw new Error('Survey creation failed. This may be due to an existing active survey or smart contract limitations. Please ensure you don\'t have any active surveys and try again.');
          } else {
            throw error;
          }
        }
      },

      // Manual survey management
      closeSurvey: async (surveyId, wallet) => {
        try {
          console.log('🔒 Closing survey:', surveyId);
          const result = await movementService.closeSurvey(surveyId, wallet);
          console.log('✅ Survey closed successfully:', result);
          
          // Update local state
          set(state => ({
            posts: state.posts.map(post => 
              post.id === surveyId 
                ? { ...post, isActive: false }
                : post
            )
          }));
          
          return result;
        } catch (error) {
          console.error('❌ Failed to close survey:', error);
          throw error;
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
          // Find the survey to get its blockchain ID
          const { posts } = get();
          const survey = posts.find(p => p.id === surveyId);
          if (!survey) {
            throw new Error('Survey not found');
          }

          // Use the blockchain survey ID if available, otherwise try to parse the surveyId
          let blockchainSurveyId;
          if (survey.actualSurveyId !== undefined) {
            blockchainSurveyId = survey.actualSurveyId;
          } else if (survey.source === 'chain' && typeof survey.id === 'number') {
            blockchainSurveyId = survey.id;
          } else if (typeof survey.id === 'number') {
            blockchainSurveyId = survey.id;
          } else {
            // Try to parse as number for blockchain operations
            const parsed = parseInt(survey.id);
            if (!isNaN(parsed)) {
              blockchainSurveyId = parsed;
            } else {
              throw new Error('Cannot complete survey: blockchain survey ID not found. This survey may not be deployed to the blockchain.');
            }
          }

          console.log('Completing survey with blockchain ID:', blockchainSurveyId);
          
          // Complete survey on blockchain first (this is the main operation)
          const blockchainResult = await movementService.completeSurvey(blockchainSurveyId, wallet);

          // Try to save to Supabase if available, but don't fail if it's not
          try {
            if (supabaseService.initialized || (await supabaseService.initialize().catch(() => false))) {
              const user = await supabaseService.getOrCreateUser(wallet.address, null, 'participant');
              if (user) {
                await supabaseService.saveResponse(
                  surveyId,
                  user.id,
                  responseData || {},
                  blockchainResult.transactionHash || blockchainResult.hash
                );
                console.log('✅ Response saved to Supabase');
              }
            }
          } catch (supabaseError) {
            console.warn('⚠️ Failed to save to Supabase, but blockchain transaction succeeded:', supabaseError.message);
            // Don't throw - blockchain operation succeeded
          }

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
          // First check blockchain completion status
          const hasCompletedOnChain = await movementService.hasCompletedSurvey(userAddress, surveyId);
          if (hasCompletedOnChain) {
            return true;
          }

          // Then check Supabase if available
          if (supabaseService.initialized || (await supabaseService.initialize().catch(() => false))) {
            const user = await supabaseService.getUser(userAddress);
            if (user) {
              return await supabaseService.hasCompletedSurvey(surveyId, user.id);
            }
          }
          
          return false;
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
        posts: state.posts, // Store posts with questions locally
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