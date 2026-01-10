# Design Document: Survey Completion Bug Fixes

## Overview

This design addresses critical bugs in the survey completion flow that prevent participants from completing surveys. The main issues are CORS misconfiguration, incorrect handling of UUID vs numeric survey IDs, faulty completion check logic, and a syntax error in the SurveyModal component.

## Architecture

The survey completion system involves three main layers:

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ SurveyModal │  │  postStore  │  │  movementService    │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Express)                         │
│  ┌─────────────────────┐  ┌─────────────────────────────┐   │
│  │  CORS Middleware    │  │  Transaction Service        │   │
│  └─────────────────────┘  └─────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐    ┌─────────────────────────────┐
│      Supabase           │    │   Movement Blockchain       │
│  (UUID survey IDs)      │    │   (Numeric survey IDs)      │
└─────────────────────────┘    └─────────────────────────────┘
```

## Components and Interfaces

### 1. Backend CORS Configuration (server.js)

**Current Issue**: CORS only allows `localhost:5174`, but dev server runs on `5173`.

**Fix**: Update CORS to allow all common localhost ports.

```javascript
// backend/server.js
app.use(cors({
  origin: [
    'http://localhost:5173',  // Add this
    'http://localhost:5174', 
    'http://localhost:5175', 
    'http://localhost:3000',
    // ... production URLs
  ],
  credentials: true
}));
```

### 2. Survey ID Type Detection (movementService.js)

**Current Issue**: `hasCompletedSurvey` logs warnings for UUID IDs and fails.

**Fix**: Detect ID type and route to appropriate service.

```javascript
// Helper function to detect survey ID type
function isUUID(id) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return typeof id === 'string' && uuidRegex.test(id);
}

async hasCompletedSurvey(address, surveyId) {
  // For UUID surveys, skip blockchain check entirely
  if (isUUID(surveyId)) {
    return false; // Let Supabase handle UUID surveys
  }
  
  // For numeric IDs, check blockchain
  const numericSurveyId = typeof surveyId === 'string' ? parseInt(surveyId) : surveyId;
  if (isNaN(numericSurveyId)) {
    return false;
  }
  // ... existing blockchain check
}
```

### 3. Completion Check Logic (postStore.js)

**Current Issue**: `hasUserCompletedSurvey` may return incorrect results for UUID surveys.

**Fix**: Check Supabase first for UUID surveys, blockchain for numeric.

```javascript
hasUserCompletedSurvey: async (surveyId, userAddress) => {
  try {
    // For UUID surveys, only check Supabase
    if (isUUID(surveyId)) {
      if (supabaseService.initialized || await supabaseService.initialize()) {
        const user = await supabaseService.getUser(userAddress);
        if (user) {
          return await supabaseService.hasCompletedSurvey(surveyId, user.id);
        }
      }
      return false;
    }
    
    // For numeric IDs, check blockchain first, then Supabase
    const hasCompletedOnChain = await movementService.hasCompletedSurvey(userAddress, surveyId);
    if (hasCompletedOnChain) return true;
    
    // Fallback to Supabase
    if (supabaseService.initialized || await supabaseService.initialize()) {
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
}
```

### 4. SurveyModal Syntax Fix (SurveyModal.jsx)

**Current Issue**: Missing closing brace in `if (alreadyCompleted)` block causes syntax error.

**Fix**: Restructure conditional rendering properly.

```javascript
// Current broken code:
if (alreadyCompleted) {
  // Show wallet funding message if needed
  if (walletStatus && walletStatus.needsFunding) {
    return (...);
  }
  return (...); // Already completed modal
}

// Fixed code:
if (alreadyCompleted) {
  return (
    // Already completed modal JSX
  );
}

// Separate check for wallet funding
if (walletStatus && walletStatus.needsFunding) {
  return (
    // Wallet needs funding modal JSX
  );
}
```

### 5. Survey Completion Flow (postStore.js)

**Fix**: Handle UUID surveys by saving to Supabase only.

```javascript
completeSurvey: async (surveyId, wallet, responseData) => {
  const survey = posts.find(p => p.id === surveyId);
  if (!survey) throw new Error('Survey not found');
  
  // For UUID surveys, save to Supabase only
  if (isUUID(surveyId)) {
    return await completeSurveySupabaseOnly(surveyId, wallet, responseData, survey);
  }
  
  // For numeric IDs, try blockchain first
  try {
    const blockchainResult = await movementService.completeSurvey(surveyId, wallet);
    // Save to Supabase as backup
    await saveToSupabase(surveyId, wallet, responseData, blockchainResult.hash);
    return blockchainResult;
  } catch (blockchainError) {
    // Fallback to Supabase only
    return await completeSurveySupabaseOnly(surveyId, wallet, responseData, survey);
  }
}
```

## Data Models

### Survey Response (Supabase)

```typescript
interface SurveyResponse {
  id: string;              // UUID auto-generated
  survey_id: string;       // UUID or numeric string
  participant_id: string;  // User ID from Supabase
  wallet_address: string;  // Participant's wallet address
  response_data: object;   // JSON of question answers
  blockchain_tx_hash?: string; // Optional, if blockchain succeeded
  reward_status: 'pending' | 'paid' | 'failed';
  created_at: timestamp;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Per-Survey Completion Tracking

*For any* participant wallet address and *for any* two different survey IDs, completing one survey SHALL NOT affect the completion status of the other survey.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 6.3, 6.4**

### Property 2: UUID vs Numeric ID Routing

*For any* survey ID, if the ID matches UUID format, the completion check SHALL query Supabase only; if the ID is numeric, the completion check SHALL query blockchain first then Supabase.

**Validates: Requirements 2.1, 2.2, 2.4**

### Property 3: Response Persistence Round-Trip

*For any* valid survey response submission, saving to Supabase then querying for that response SHALL return the same survey ID, wallet address, and response data.

**Validates: Requirements 5.1, 5.2, 5.4**

### Property 4: Duplicate Prevention

*For any* participant and *for any* specific survey, attempting to complete the same survey twice SHALL result in rejection on the second attempt.

**Validates: Requirements 6.1, 6.2**

### Property 5: Response Count Increment

*For any* survey with current response count N, after a successful completion, the response count SHALL be N+1.

**Validates: Requirements 7.1**

## Error Handling

| Error Scenario | Handling Strategy |
|----------------|-------------------|
| CORS blocked | Update backend CORS config to include origin |
| UUID survey ID on blockchain check | Skip blockchain, use Supabase only |
| Blockchain transaction fails | Fallback to Supabase-only completion |
| Supabase save fails | Retry up to 3 times, then show error |
| Both services fail | Show "try again later" message |
| Already completed survey | Show "Already Completed" modal with working close button |

## Testing Strategy

### Unit Tests

1. **isUUID helper function**: Test with valid UUIDs, numeric strings, and edge cases
2. **CORS configuration**: Verify allowed origins list includes all required ports
3. **Modal close button**: Verify onClick handler is properly attached

### Property-Based Tests

Using a property-based testing library (e.g., fast-check for JavaScript):

1. **Per-Survey Completion**: Generate random wallet addresses and survey IDs, verify completion of one doesn't affect another
2. **ID Type Routing**: Generate random UUIDs and numeric IDs, verify correct service is called
3. **Response Round-Trip**: Generate random response data, save and retrieve, verify equality
4. **Duplicate Prevention**: Generate random completions, attempt duplicates, verify rejection

### Integration Tests

1. Complete a Supabase-only survey (UUID) end-to-end
2. Complete a blockchain survey (numeric ID) end-to-end
3. Verify CORS headers from different localhost ports
