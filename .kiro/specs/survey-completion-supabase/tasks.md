# Implementation Plan: Survey Completion Bug Fixes (Participant Page)

## Overview

This implementation plan fixes critical bugs preventing participants from completing surveys on the feed/home page. The fixes target: CORS configuration, UUID/numeric ID handling, completion check logic, and SurveyModal syntax error.

**Note**: These fixes apply to the participant experience (PostCard, SurveyModal, Feed) - not the creator dashboard.

## Tasks

- [x] 1. Fix Backend CORS Configuration
  - [x] 1.1 Update CORS allowed origins in backend/server.js
    - Add `http://localhost:5173` to the origin array
    - Ensure all common localhost ports are included
    - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Add UUID Detection Helper
  - [x] 2.1 Create isUUID helper function in movementService.js
    - Add regex-based UUID detection function
    - Export for use in other modules
    - _Requirements: 2.1, 2.2_

- [x] 3. Fix Survey Completion Check Logic
  - [x] 3.1 Update hasCompletedSurvey in movementService.js
    - Skip blockchain check for UUID survey IDs
    - Remove warning logs for UUID IDs (expected behavior)
    - Only check blockchain for numeric IDs
    - _Requirements: 2.1, 2.3_
  
  - [x] 3.2 Update hasUserCompletedSurvey in postStore.js
    - Check Supabase first for UUID surveys
    - Check blockchain then Supabase for numeric surveys
    - Use wallet address + survey ID combination for checks
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 6.4_

- [ ]* 3.3 Write property test for per-survey completion tracking
    - **Property 1: Per-Survey Completion Tracking**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 6.3, 6.4**

- [x] 4. Fix SurveyModal Syntax Error
  - [x] 4.1 Fix conditional rendering in SurveyModal.jsx
    - Separate alreadyCompleted check from walletStatus check
    - Ensure proper closing braces for all conditionals
    - Verify Close button onClick handler works
    - _Requirements: 4.1, 4.2, 4.3_

- [x] 5. Update Survey Completion Flow
  - [x] 5.1 Update completeSurvey in postStore.js
    - Add UUID detection at start of function
    - Route UUID surveys to Supabase-only completion
    - Keep blockchain path for numeric IDs with Supabase fallback
    - _Requirements: 2.4, 5.1, 5.2_
  
  - [x] 5.2 Add completeSurveySupabaseOnly helper function
    - Save response to Supabase
    - Update local state
    - Return success result
    - _Requirements: 5.1, 5.2, 5.4_

- [ ]* 5.3 Write property test for response persistence round-trip
    - **Property 3: Response Persistence Round-Trip**
    - **Validates: Requirements 5.1, 5.2, 5.4**

- [x] 6. Checkpoint - Test Core Fixes
  - Ensure all tests pass, ask the user if questions arise.
  - Test completing a Supabase-only survey (UUID)
  - Test that Close button works on modals
  - Verify no CORS errors from localhost:5173

- [x] 7. Add Duplicate Prevention
  - [x] 7.1 Ensure Supabase hasCompletedSurvey checks wallet + survey ID
    - Verify the query uses both participant_id and survey_id
    - _Requirements: 6.1, 6.2_

- [ ]* 7.2 Write property test for duplicate prevention
    - **Property 4: Duplicate Prevention**
    - **Validates: Requirements 6.1, 6.2**

- [x] 8. Update Response Count Logic
  - [x] 8.1 Verify incrementSurveyResponses works for Supabase surveys
    - Check that response count updates in Supabase
    - Check that survey becomes inactive at max responses
    - _Requirements: 7.1, 7.2, 7.3_

- [x] 9. Final Checkpoint
  - Ensure all tests pass, ask the user if questions arise.
  - Verify complete flow works end-to-end
  - Test error handling scenarios

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The main priority is fixing the blocking bugs (CORS, syntax error, UUID handling)
- Property tests validate universal correctness properties
