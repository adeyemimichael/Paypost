// Supabase REST API service - uses fetch instead of the SDK to avoid bundler issues
// This provides the same functionality without the problematic SDK

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isValidConfig = SUPABASE_URL && SUPABASE_KEY && SUPABASE_KEY.length > 50 && SUPABASE_KEY.startsWith('eyJ');

class SupabaseService {
  constructor() {
    this.initialized = false;
    this.baseUrl = SUPABASE_URL;
    this.apiKey = SUPABASE_KEY;
  }

  getHeaders() {
    return {
      'apikey': this.apiKey,
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };
  }

  async initialize() {
    if (!isValidConfig) {
      console.log('ℹ️ Supabase disabled - invalid configuration');
      return false;
    }

    try {
      // Test connection
      const response = await fetch(`${this.baseUrl}/rest/v1/users?select=count&limit=1`, {
        headers: this.getHeaders()
      });
      
      if (response.ok) {
        this.initialized = true;
        console.log('✅ Supabase service initialized successfully');
        return true;
      } else {
        console.warn('⚠️ Supabase connection failed:', response.status);
        return false;
      }
    } catch (error) {
      console.warn('⚠️ Supabase initialization failed:', error.message);
      return false;
    }
  }

  async createUser(walletAddress, email, role, displayName = null) {
    if (!isValidConfig) return null;
    
    try {
      const userData = { 
        wallet_address: walletAddress, 
        email, 
        role: role || 'reader',
        display_name: displayName || `${role}_${walletAddress.slice(0, 8)}`
      };

      const response = await fetch(`${this.baseUrl}/rest/v1/users`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create user');
      }

      const data = await response.json();
      return data[0];
    } catch (error) {
      console.error('Failed to create user:', error);
      return null;
    }
  }

  async getOrCreateUser(walletAddress, email = null, role = 'reader') {
    try {
      let user = await this.getUser(walletAddress);
      
      if (!user) {
        user = await this.createUser(
          walletAddress, 
          email || `${walletAddress}@paypost.xyz`, 
          role
        );
      }
      
      return user;
    } catch (error) {
      console.error('Failed to get or create user:', error);
      return { id: walletAddress, wallet_address: walletAddress, role };
    }
  }

  async getUser(walletAddress) {
    if (!isValidConfig) return null;
    
    try {
      const response = await fetch(
        `${this.baseUrl}/rest/v1/users?wallet_address=eq.${walletAddress}&limit=1`,
        { headers: this.getHeaders() }
      );

      if (!response.ok) return null;

      const data = await response.json();
      return data[0] || null;
    } catch (error) {
      console.error('Failed to get user:', error);
      return null;
    }
  }

  async createSurvey(surveyData) {
    if (!isValidConfig) return null;
    
    try {
      const payload = {
        title: surveyData.title,
        description: surveyData.description,
        category: surveyData.category || 'general',
        reward_amount: surveyData.rewardAmount,
        max_responses: surveyData.maxResponses,
        estimated_time: surveyData.estimatedTime || 5,
        expires_at: surveyData.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        creator_id: surveyData.creatorId,
        blockchain_tx_hash: surveyData.blockchain_tx_hash
      };

      const response = await fetch(`${this.baseUrl}/rest/v1/surveys`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create survey');
      }

      const data = await response.json();
      return data[0];
    } catch (error) {
      console.error('Failed to create survey:', error);
      return null;
    }
  }

  async getSurveys(filters = {}) {
    if (!isValidConfig) return [];
    
    try {
      let url = `${this.baseUrl}/rest/v1/surveys?is_active=eq.true&order=created_at.desc`;
      
      if (filters.category && filters.category !== 'all') {
        url += `&category=eq.${filters.category}`;
      }

      const response = await fetch(url, { headers: this.getHeaders() });

      if (!response.ok) return [];

      const surveys = await response.json();
      
      // Fetch questions for each survey
      const surveysWithQuestions = await Promise.all(surveys.map(async (survey) => {
        const questions = await this.getSurveyQuestions(survey.id);
        return { ...survey, questions };
      }));

      return surveysWithQuestions;
    } catch (error) {
      console.error('Failed to get surveys:', error);
      return [];
    }
  }

  async getSurveyQuestions(surveyId) {
    if (!isValidConfig) return [];
    
    try {
      const response = await fetch(
        `${this.baseUrl}/rest/v1/survey_questions?survey_id=eq.${surveyId}&order=order_index`,
        { headers: this.getHeaders() }
      );

      if (!response.ok) return [];

      const questions = await response.json();
      return questions.map(q => ({
        ...q,
        options: q.options ? (typeof q.options === 'string' ? JSON.parse(q.options) : q.options) : null
      }));
    } catch (error) {
      console.error('Failed to get survey questions:', error);
      return [];
    }
  }

  async getSurveyByTitle(title) {
    if (!isValidConfig) return null;
    
    try {
      const response = await fetch(
        `${this.baseUrl}/rest/v1/surveys?title=eq.${encodeURIComponent(title)}&limit=1`,
        { headers: this.getHeaders() }
      );

      if (!response.ok) return null;

      const data = await response.json();
      return data[0] || null;
    } catch (error) {
      console.error('Failed to get survey by title:', error);
      return null;
    }
  }

  async getQuestionsByTitle(title) {
    if (!isValidConfig) return [];
    
    try {
      // First find the survey by title
      const survey = await this.getSurveyByTitle(title);
      if (!survey) return [];
      
      // Then get its questions
      return await this.getSurveyQuestions(survey.id);
    } catch (error) {
      console.error('Failed to get questions by title:', error);
      return [];
    }
  }

  async getAllSurveysWithQuestions() {
    if (!isValidConfig) return [];
    
    try {
      const response = await fetch(
        `${this.baseUrl}/rest/v1/surveys?order=created_at.desc`,
        { headers: this.getHeaders() }
      );

      if (!response.ok) return [];

      const surveys = await response.json();
      
      // Fetch questions for each survey
      const surveysWithQuestions = await Promise.all(surveys.map(async (survey) => {
        const questions = await this.getSurveyQuestions(survey.id);
        return { ...survey, questions };
      }));

      return surveysWithQuestions;
    } catch (error) {
      console.error('Failed to get all surveys with questions:', error);
      return [];
    }
  }

  async createSurveyQuestions(surveyId, questions) {
    if (!isValidConfig) return [];
    
    try {
      const questionsData = questions.map((question, index) => ({
        survey_id: surveyId,
        question_text: question.text || question.question,
        question_type: question.type,
        options: question.options ? JSON.stringify(question.options) : null,
        required: question.required !== false,
        order_index: index
      }));

      const response = await fetch(`${this.baseUrl}/rest/v1/survey_questions`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(questionsData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create questions');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to create survey questions:', error);
      return [];
    }
  }

  async saveResponse(surveyId, participantId, responseData, txHash = null) {
    if (!isValidConfig) return null;
    
    try {
      const payload = {
        survey_id: surveyId,
        participant_id: participantId,
        response_data: JSON.stringify(responseData),
        blockchain_tx_hash: txHash
      };

      const response = await fetch(`${this.baseUrl}/rest/v1/survey_responses`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save response');
      }

      return (await response.json())[0];
    } catch (error) {
      console.error('Failed to save response:', error);
      return null;
    }
  }

  async hasCompletedSurvey(surveyId, participantId) {
    if (!isValidConfig) return false;
    
    try {
      const response = await fetch(
        `${this.baseUrl}/rest/v1/survey_responses?survey_id=eq.${surveyId}&participant_id=eq.${participantId}&limit=1`,
        { headers: this.getHeaders() }
      );

      if (!response.ok) return false;

      const data = await response.json();
      return data.length > 0;
    } catch (error) {
      return false;
    }
  }

  async getCreatorSurveys(creatorId) {
    if (!isValidConfig) return [];
    
    try {
      const response = await fetch(
        `${this.baseUrl}/rest/v1/surveys?creator_id=eq.${creatorId}&order=created_at.desc`,
        { headers: this.getHeaders() }
      );

      if (!response.ok) return [];

      return await response.json();
    } catch (error) {
      console.error('Failed to get creator surveys:', error);
      return [];
    }
  }

  async getUserStats(userId) {
    return { totalEarnings: 0, surveysCreated: 0, surveysCompleted: 0 };
  }
}

export const supabaseService = new SupabaseService();
export const supabase = null;
