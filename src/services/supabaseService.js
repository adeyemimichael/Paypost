import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

class SupabaseService {
  constructor() {
    this.initialized = false;
  }

  async initialize() {
    try {
      // Test connection
      const { data, error } = await supabase.from('users').select('count').limit(1);
      if (error && error.code !== 'PGRST116') {
        console.warn('Supabase connection test failed:', error.message);
        return false;
      }
      this.initialized = true;
      console.log('Supabase service initialized successfully');
      return true;
    } catch (error) {
      console.warn('Supabase initialization failed:', error.message);
      return false;
    }
  }

  // User Management
  async createUser(walletAddress, email, role, displayName = null) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{ 
          wallet_address: walletAddress, 
          email, 
          role,
          display_name: displayName || `${role}_${walletAddress.slice(0, 8)}`
        }])
        .select()
      
      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  }

  async getUser(walletAddress) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single()
      
      if (error && error.code !== 'PGRST116') throw error
      return data
    } catch (error) {
      console.error('Failed to get user:', error);
      return null;
    }
  }

  async updateUser(walletAddress, updates) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('wallet_address', walletAddress)
        .select()
      
      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  }

  // Survey Management
  async createSurvey(surveyData) {
    try {
      const { data, error } = await supabase
        .from('surveys')
        .insert([{
          title: surveyData.title,
          description: surveyData.description,
          category: surveyData.category || 'general',
          reward_amount: surveyData.rewardAmount,
          max_responses: surveyData.maxResponses,
          estimated_time: surveyData.estimatedTime || 5,
          expires_at: surveyData.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          creator_id: surveyData.creatorId
        }])
        .select()
      
      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('Failed to create survey:', error);
      throw error;
    }
  }

  async updateSurvey(surveyId, updates) {
    try {
      const { data, error } = await supabase
        .from('surveys')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', surveyId)
        .select()
      
      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('Failed to update survey:', error);
      throw error;
    }
  }

  async getSurveys(filters = {}) {
    try {
      let query = supabase
        .from('surveys')
        .select(`
          *,
          creator:users!surveys_creator_id_fkey(display_name, wallet_address),
          questions:survey_questions(*),
          _count:survey_responses(count)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (filters.category && filters.category !== 'all') {
        query = query.eq('category', filters.category)
      }

      if (filters.creatorId) {
        query = query.eq('creator_id', filters.creatorId)
      }

      const { data, error } = await query
      if (error) throw error
      
      // Transform data to match expected format
      return data.map(survey => ({
        ...survey,
        creator: survey.creator || { display_name: 'Unknown', wallet_address: '' },
        responseCount: survey._count?.[0]?.count || 0
      }))
    } catch (error) {
      console.error('Failed to get surveys:', error);
      return [];
    }
  }

  async getCreatorSurveys(creatorId) {
    try {
      const { data, error } = await supabase
        .from('surveys')
        .select(`
          *,
          questions:survey_questions(*),
          responses:survey_responses(count)
        `)
        .eq('creator_id', creatorId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data.map(survey => ({
        ...survey,
        responseCount: survey.responses?.[0]?.count || 0
      }))
    } catch (error) {
      console.error('Failed to get creator surveys:', error);
      return [];
    }
  }

  // Survey Questions Management
  async createSurveyQuestions(surveyId, questions) {
    try {
      const questionsData = questions.map((question, index) => ({
        survey_id: surveyId,
        question_text: question.text,
        question_type: question.type,
        options: question.options ? JSON.stringify(question.options) : null,
        required: question.required !== false,
        order_index: index
      }));

      const { data, error } = await supabase
        .from('survey_questions')
        .insert(questionsData)
        .select()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Failed to create survey questions:', error);
      throw error;
    }
  }

  async getSurveyQuestions(surveyId) {
    try {
      const { data, error } = await supabase
        .from('survey_questions')
        .select('*')
        .eq('survey_id', surveyId)
        .order('order_index')

      if (error) throw error
      return data.map(q => ({
        ...q,
        options: q.options ? JSON.parse(q.options) : null
      }))
    } catch (error) {
      console.error('Failed to get survey questions:', error);
      return [];
    }
  }

  // Response Management
  async saveResponse(surveyId, participantId, responseData, txHash = null) {
    try {
      const { data, error } = await supabase
        .from('survey_responses')
        .insert([{
          survey_id: surveyId,
          participant_id: participantId,
          response_data: JSON.stringify(responseData),
          blockchain_tx_hash: txHash
        }])
        .select()

      if (error) throw error

      // Update survey response count
      await this.incrementSurveyResponses(surveyId);

      return data[0]
    } catch (error) {
      console.error('Failed to save response:', error);
      throw error;
    }
  }

  async hasCompletedSurvey(surveyId, participantId) {
    try {
      const { data, error } = await supabase
        .from('survey_responses')
        .select('id')
        .eq('survey_id', surveyId)
        .eq('participant_id', participantId)
        .single()

      return !!data && !error
    } catch (error) {
      return false;
    }
  }

  async incrementSurveyResponses(surveyId) {
    try {
      const { error } = await supabase.rpc('increment_survey_responses', {
        survey_id: surveyId
      });
      
      if (error) {
        // Fallback: manual increment
        const { data: survey } = await supabase
          .from('surveys')
          .select('current_responses')
          .eq('id', surveyId)
          .single();
        
        if (survey) {
          await supabase
            .from('surveys')
            .update({ current_responses: (survey.current_responses || 0) + 1 })
            .eq('id', surveyId);
        }
      }
    } catch (error) {
      console.error('Failed to increment survey responses:', error);
    }
  }

  // Analytics
  async getSurveyAnalytics(surveyId) {
    try {
      const { data, error } = await supabase
        .from('survey_responses')
        .select('response_data, completed_at')
        .eq('survey_id', surveyId)

      if (error) throw error
      return data.map(response => ({
        ...response,
        response_data: JSON.parse(response.response_data)
      }))
    } catch (error) {
      console.error('Failed to get survey analytics:', error);
      return [];
    }
  }

  async getUserStats(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          total_earnings,
          total_surveys_created,
          total_surveys_completed,
          surveys:surveys(count),
          responses:survey_responses(count)
        `)
        .eq('id', userId)
        .single()

      if (error) throw error
      return {
        totalEarnings: data.total_earnings || 0,
        surveysCreated: data.surveys?.[0]?.count || 0,
        surveysCompleted: data.responses?.[0]?.count || 0
      }
    } catch (error) {
      console.error('Failed to get user stats:', error);
      return {
        totalEarnings: 0,
        surveysCreated: 0,
        surveysCompleted: 0
      };
    }
  }

  // Real-time subscriptions
  subscribeTo(table, callback, filters = {}) {
    let channel = supabase
      .channel(`${table}-changes`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: table,
        ...filters
      }, callback);

    return channel.subscribe();
  }

  // Utility methods
  async testConnection() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);
      
      return !error;
    } catch (error) {
      return false;
    }
  }

  // Mock data fallback for development
  getMockSurveys() {
    return [
      {
        id: 'mock-1',
        title: 'Product Feedback Survey',
        description: 'Help us improve our product with your valuable feedback',
        category: 'product',
        reward_amount: 0.5,
        max_responses: 100,
        current_responses: 23,
        estimated_time: 5,
        is_active: true,
        created_at: new Date().toISOString(),
        creator: {
          display_name: 'TechCorp',
          wallet_address: '0x1234...5678'
        },
        questions: [
          {
            question_text: 'How satisfied are you with our product?',
            question_type: 'rating',
            required: true
          }
        ]
      },
      {
        id: 'mock-2',
        title: 'Market Research Study',
        description: 'Share your thoughts on current market trends',
        category: 'research',
        reward_amount: 1.0,
        max_responses: 50,
        current_responses: 12,
        estimated_time: 10,
        is_active: true,
        created_at: new Date().toISOString(),
        creator: {
          display_name: 'ResearchLab',
          wallet_address: '0x5678...9012'
        },
        questions: [
          {
            question_text: 'What is your primary concern about the current market?',
            question_type: 'multiple-choice',
            options: ['Price volatility', 'Regulation', 'Technology adoption', 'Other'],
            required: true
          }
        ]
      }
    ];
  }
}

export const supabaseService = new SupabaseService();