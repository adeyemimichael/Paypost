# PayPost + Supabase Integration Plan

## 🎯 **Why Supabase + Movement Blockchain?**

### **Perfect Hybrid Architecture:**
- **Movement Blockchain**: Handles all financial transactions, ownership, and immutable records
- **Supabase Database**: Handles metadata, user experience, and analytics

## 📊 **Database Schema Design**

### **1. Users Table**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,
  email TEXT,
  role TEXT CHECK (role IN ('creator', 'participant')),
  display_name TEXT,
  avatar_url TEXT,
  total_earnings DECIMAL DEFAULT 0,
  total_surveys_created INTEGER DEFAULT 0,
  total_surveys_completed INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### **2. Surveys Table**
```sql
CREATE TABLE surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blockchain_id BIGINT UNIQUE, -- Links to smart contract
  creator_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  image_url TEXT,
  reward_amount DECIMAL NOT NULL,
  max_responses INTEGER NOT NULL,
  current_responses INTEGER DEFAULT 0,
  estimated_time INTEGER, -- in minutes
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### **3. Survey Questions Table**
```sql
CREATE TABLE survey_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT CHECK (question_type IN ('multiple-choice', 'rating', 'text', 'checkbox')),
  options JSONB, -- For multiple choice/checkbox options
  required BOOLEAN DEFAULT true,
  order_index INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### **4. Survey Responses Table**
```sql
CREATE TABLE survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID REFERENCES surveys(id),
  participant_id UUID REFERENCES users(id),
  blockchain_tx_hash TEXT, -- Links to blockchain transaction
  response_data JSONB, -- Encrypted response data
  completed_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(survey_id, participant_id) -- Prevent duplicates
);
```

### **5. Posts Table (Premium Content)**
```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  content TEXT,
  preview TEXT,
  category TEXT,
  image_url TEXT,
  is_premium BOOLEAN DEFAULT false,
  price DECIMAL,
  read_time INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🔧 **Implementation Steps**

### **Step 1: Install Supabase**
```bash
npm install @supabase/supabase-js
```

### **Step 2: Environment Setup**
```env
# Add to .env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### **Step 3: Supabase Service**
```javascript
// src/services/supabaseService.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

class SupabaseService {
  // User Management
  async createUser(walletAddress, email, role) {
    const { data, error } = await supabase
      .from('users')
      .insert([{ wallet_address: walletAddress, email, role }])
      .select()
    
    if (error) throw error
    return data[0]
  }

  async getUser(walletAddress) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  // Survey Management
  async createSurvey(surveyData) {
    const { data, error } = await supabase
      .from('surveys')
      .insert([surveyData])
      .select()
    
    if (error) throw error
    return data[0]
  }

  async getSurveys(filters = {}) {
    let query = supabase
      .from('surveys')
      .select(`
        *,
        creator:users(display_name, wallet_address),
        questions:survey_questions(*)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (filters.category) {
      query = query.eq('category', filters.category)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  }

  async getCreatorSurveys(creatorId) {
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
    return data
  }

  // Response Management
  async saveResponse(surveyId, participantId, responseData, txHash) {
    const { data, error } = await supabase
      .from('survey_responses')
      .insert([{
        survey_id: surveyId,
        participant_id: participantId,
        response_data: responseData,
        blockchain_tx_hash: txHash
      }])
      .select()

    if (error) throw error
    return data[0]
  }

  async hasCompletedSurvey(surveyId, participantId) {
    const { data, error } = await supabase
      .from('survey_responses')
      .select('id')
      .eq('survey_id', surveyId)
      .eq('participant_id', participantId)
      .single()

    return !!data && !error
  }

  // Analytics
  async getSurveyAnalytics(surveyId) {
    const { data, error } = await supabase
      .from('survey_responses')
      .select('response_data, completed_at')
      .eq('survey_id', surveyId)

    if (error) throw error
    return data
  }
}

export const supabaseService = new SupabaseService()
```

## 🔄 **Integration with Existing Code**

### **Update Post Store**
```javascript
// src/stores/postStore.js
import { supabaseService } from '../services/supabaseService'

export const usePostStore = create((set, get) => ({
  posts: [],
  isLoading: false,

  // Load surveys from Supabase
  loadSurveys: async () => {
    set({ isLoading: true })
    try {
      const surveys = await supabaseService.getSurveys()
      set({ posts: surveys, isLoading: false })
    } catch (error) {
      console.error('Failed to load surveys:', error)
      set({ isLoading: false })
    }
  },

  // Create survey (Supabase + Blockchain)
  createSurvey: async (surveyData, walletAddress) => {
    try {
      // 1. Create in Supabase first
      const dbSurvey = await supabaseService.createSurvey(surveyData)
      
      // 2. Create on blockchain
      const blockchainResult = await movementService.createSurvey(surveyData, walletAddress)
      
      // 3. Update Supabase with blockchain ID
      await supabaseService.updateSurvey(dbSurvey.id, {
        blockchain_id: blockchainResult.surveyId
      })
      
      return { success: true, surveyId: dbSurvey.id }
    } catch (error) {
      throw error
    }
  }
}))
```

## 🚀 **Benefits of This Architecture**

### **Performance**
- **Fast Queries**: Supabase handles complex filtering/search
- **Real-time Updates**: Live survey statistics
- **Caching**: Better user experience

### **Scalability**
- **Blockchain**: Handles financial transactions securely
- **Database**: Handles high-volume metadata efficiently
- **Best of Both**: Combines security with performance

### **User Experience**
- **Instant Loading**: Surveys load from database
- **Rich Metadata**: Detailed survey information
- **Search & Filter**: Advanced discovery features
- **Analytics**: Real-time creator dashboards

## 📱 **Real-time Features**

### **Live Updates**
```javascript
// Real-time survey response count
supabase
  .channel('survey-updates')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'survey_responses'
  }, (payload) => {
    // Update UI with new response count
    updateSurveyCount(payload.new.survey_id)
  })
  .subscribe()
```

## 🔐 **Security & Privacy**

### **Data Protection**
- **Encrypted Responses**: Sensitive data encrypted before storage
- **Wallet-based Auth**: No passwords, just wallet signatures
- **Row Level Security**: Users only see their own data
- **Blockchain Verification**: All payments verified on-chain

## 🎯 **Implementation Priority**

### **Phase 1: Core Database (2-3 hours)**
1. Set up Supabase project
2. Create database schema
3. Implement basic CRUD operations
4. Replace mock data with real database

### **Phase 2: Integration (1-2 hours)**
1. Connect survey creation to database
2. Load surveys from Supabase
3. Save user profiles and preferences
4. Implement response tracking

### **Phase 3: Advanced Features (Optional)**
1. Real-time updates
2. Advanced analytics
3. Search and filtering
4. User recommendations

---

## 💡 **Why This Wins the Hackathon**

1. **Production Architecture**: Real database + blockchain
2. **Scalable Design**: Handles thousands of users
3. **Rich Features**: Analytics, search, real-time updates
4. **Best Practices**: Proper separation of concerns
5. **Demo Ready**: Fast, responsive, feature-rich

This hybrid approach gives you the security and immutability of blockchain for financial transactions, combined with the speed and flexibility of a modern database for everything else. Perfect for a winning hackathon project! 🏆