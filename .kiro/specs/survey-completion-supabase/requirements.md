# Requirements Document

## Introduction

This feature fixes critical bugs in the survey completion flow and improves reliability. The main issues are:
1. CORS configuration blocking requests from localhost:5173
2. Survey completion checks failing for Supabase surveys with UUID IDs
3. "Already Completed" message showing incorrectly for surveys user hasn't completed
4. Close button not working on the "Already Completed" modal
5. Users should be able to complete multiple different surveys (one completion per survey)

## Glossary

- **Survey_Completion_Service**: The service responsible for handling survey response submission and participant rewards
- **Participant**: A user who completes surveys to earn token rewards
- **Survey_Response**: The answers provided by a participant for a survey's questions
- **Reward_Token**: The MOVE tokens awarded to participants upon successful survey completion
- **Supabase**: The backend database service used to persist survey responses
- **Blockchain_Survey**: A survey with a numeric ID stored on the blockchain
- **Supabase_Survey**: A survey with a UUID stored in Supabase only
- **Survey_ID**: Either a numeric blockchain ID or a UUID from Supabase

## Requirements

### Requirement 1: Fix CORS Configuration

**User Story:** As a developer, I want the backend to accept requests from all localhost ports, so that development works correctly.

#### Acceptance Criteria

1. THE Backend_Server SHALL include `http://localhost:5173` in the CORS allowed origins
2. THE Backend_Server SHALL accept requests from any localhost port during development
3. WHEN a request comes from an allowed origin, THE Backend_Server SHALL return the correct `Access-Control-Allow-Origin` header

### Requirement 2: Handle Both UUID and Numeric Survey IDs

**User Story:** As a participant, I want to complete surveys regardless of whether they are stored on blockchain or Supabase only, so that I can participate in all available surveys.

#### Acceptance Criteria

1. WHEN checking survey completion for a UUID survey ID, THE Survey_Completion_Service SHALL check Supabase only (skip blockchain check)
2. WHEN checking survey completion for a numeric survey ID, THE Survey_Completion_Service SHALL check both blockchain and Supabase
3. THE Survey_Completion_Service SHALL not log warnings for UUID survey IDs (this is expected behavior)
4. WHEN completing a Supabase-only survey, THE Survey_Completion_Service SHALL save the response to Supabase and skip blockchain transaction

### Requirement 3: Fix Survey Completion Check Logic

**User Story:** As a participant, I want to see accurate completion status for each survey, so that I know which surveys I can still complete.

#### Acceptance Criteria

1. THE Survey_Completion_Service SHALL check completion status per survey, not globally
2. WHEN a participant has completed Survey A, THE Survey_Completion_Service SHALL still allow them to complete Survey B
3. THE Survey_Completion_Service SHALL only show "Already Completed" for the specific survey the participant has already completed
4. THE Survey_Completion_Service SHALL use the participant's wallet address AND survey ID together to determine completion status

### Requirement 4: Fix Modal Close Button

**User Story:** As a participant, I want the Close button to work on all modal states, so that I can dismiss the modal and continue browsing.

#### Acceptance Criteria

1. WHEN the "Already Completed" modal is displayed, THE Close_Button SHALL close the modal when clicked
2. WHEN the "Wallet Needs Funding" modal is displayed, THE Close_Button SHALL close the modal when clicked
3. THE SurveyModal component SHALL have correct syntax with proper conditional rendering

### Requirement 5: Save Survey Responses to Supabase

**User Story:** As a participant, I want my survey responses to be saved reliably, so that my participation is recorded.

#### Acceptance Criteria

1. WHEN a participant submits survey responses, THE Survey_Completion_Service SHALL save the response data to Supabase
2. WHEN saving a response, THE Survey_Completion_Service SHALL include the survey ID, participant wallet address, response data, completion timestamp, and reward status
3. IF the Supabase save operation fails, THEN THE Survey_Completion_Service SHALL retry the operation up to 3 times before reporting failure
4. WHEN a response is successfully saved, THE Survey_Completion_Service SHALL return a success confirmation to the participant

### Requirement 6: Prevent Duplicate Survey Completions Per Survey

**User Story:** As a survey creator, I want to ensure each participant can only complete each survey once, so that the survey results are valid.

#### Acceptance Criteria

1. WHEN a participant attempts to complete a survey, THE Survey_Completion_Service SHALL check if they have already completed that specific survey
2. IF a participant has already completed the specific survey, THEN THE Survey_Completion_Service SHALL reject the submission and display an appropriate message
3. THE Survey_Completion_Service SHALL allow participants to complete multiple different surveys
4. THE Survey_Completion_Service SHALL use the combination of participant wallet address AND survey ID for completion checks

### Requirement 7: Update Survey Response Count

**User Story:** As a survey creator, I want to see accurate response counts for my surveys, so that I can track participation progress.

#### Acceptance Criteria

1. WHEN a survey response is successfully saved, THE Survey_Completion_Service SHALL increment the survey's response count in Supabase
2. WHEN the response count reaches the maximum responses, THE Survey_Completion_Service SHALL mark the survey as inactive
3. THE Survey_Completion_Service SHALL update the local UI state to reflect the new response count

### Requirement 8: Graceful Error Handling

**User Story:** As a participant, I want clear feedback when something goes wrong, so that I understand what happened and what to do next.

#### Acceptance Criteria

1. IF any step of the completion process fails, THEN THE Survey_Completion_Service SHALL display a user-friendly error message
2. WHEN an error occurs, THE Survey_Completion_Service SHALL log detailed error information for debugging
3. IF the blockchain fails but Supabase succeeds, THEN THE Survey_Completion_Service SHALL inform the participant that their response was recorded
4. IF both blockchain and Supabase fail, THEN THE Survey_Completion_Service SHALL inform the participant to try again later
