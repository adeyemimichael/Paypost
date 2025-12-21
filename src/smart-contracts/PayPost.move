module PayPost::ContentPlatform {
    use std::signer;
    use std::vector;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::event;
    use aptos_framework::timestamp;

    /// Error codes
    const E_NOT_AUTHORIZED: u64 = 1;
    const E_SURVEY_NOT_FOUND: u64 = 2;
    const E_POST_NOT_FOUND: u64 = 3;
    const E_ALREADY_COMPLETED: u64 = 4;
    const E_ALREADY_UNLOCKED: u64 = 5;
    const E_SURVEY_INACTIVE: u64 = 6;
    const E_INVALID_REWARD: u64 = 7;
    const E_INVALID_PRICE: u64 = 8;
    const E_MAX_RESPONSES_REACHED: u64 = 9;

    /// Survey structure
    struct Survey has key, store {
        id: u64,
        creator: address,
        title: vector<u8>,
        description: vector<u8>,
        reward_amount: u64,
        max_responses: u64,
        current_responses: u64,
        is_active: bool,
        created_at: u64,
        expires_at: u64,
    }

    /// Premium post structure
    struct Post has key, store {
        id: u64,
        creator: address,
        title: vector<u8>,
        content_hash: vector<u8>,
        price: u64,
        is_premium: bool,
        created_at: u64,
    }

    /// User activity tracking
    struct UserActivity has key {
        completed_surveys: vector<u64>,
        unlocked_posts: vector<u64>,
        total_earnings: u64,
        total_spent: u64,
    }

    /// Survey response data
    struct SurveyResponse has store {
        survey_id: u64,
        participant: address,
        response_hash: vector<u8>,
        completed_at: u64,
    }

    /// Global survey registry
    struct SurveyRegistry has key {
        surveys: vector<Survey>,
        responses: vector<SurveyResponse>,
        next_survey_id: u64,
        total_rewards_distributed: u64,
    }

    /// Events
    struct SurveyCreatedEvent has drop, store {
        survey_id: u64,
        creator: address,
        reward_amount: u64,
        max_responses: u64,
    }

    struct SurveyCompletedEvent has drop, store {
        survey_id: u64,
        participant: address,
        creator: address,
        reward_earned: u64,
    }

    struct TipSentEvent has drop, store {
        creator: address,
        tipper: address,
        amount: u64,
    }

    struct SurveyClosedEvent has drop, store {
        survey_id: u64,
        total_responses: u64,
        total_rewards_paid: u64,
    }

    /// Initialize the module
    fun init_module(account: &signer) {
        let registry = SurveyRegistry {
            surveys: vector::empty<Survey>(),
            responses: vector::empty<SurveyResponse>(),
            next_survey_id: 1,
            total_rewards_distributed: 0,
        };
        move_to(account, registry);
    }

    /// Create a new survey
    public entry fun create_survey(
        creator: &signer,
        title: vector<u8>,
        description: vector<u8>,
        reward_amount: u64,
        max_responses: u64,
        duration_seconds: u64,
    ) acquires SurveyRegistry {
        assert!(reward_amount > 0, E_INVALID_REWARD);
        assert!(max_responses > 0, E_INVALID_REWARD);
        
        let creator_addr = signer::address_of(creator);
        let registry = borrow_global_mut<SurveyRegistry>(@SurveyRewards);
        let now = timestamp::now_seconds();
        
        let survey = Survey {
            id: registry.next_survey_id,
            creator: creator_addr,
            title,
            description,
            reward_amount,
            max_responses,
            current_responses: 0,
            is_active: true,
            created_at: now,
            expires_at: now + duration_seconds,
        };

        vector::push_back(&mut registry.surveys, survey);
        
        event::emit(SurveyCreatedEvent {
            survey_id: registry.next_survey_id,
            creator: creator_addr,
            reward_amount,
            max_responses,
        });

        registry.next_survey_id = registry.next_survey_id + 1;
    }

    /// Complete a survey and earn rewards
    public entry fun complete_survey(
        participant: &signer,
        survey_id: u64,
        response_hash: vector<u8>,
    ) acquires SurveyRegistry, UserSurveys {
        let participant_addr = signer::address_of(participant);
        let registry = borrow_global_mut<SurveyRegistry>(@SurveyRewards);
        
        // Find the survey
        let survey_ref = find_survey_mut(&mut registry.surveys, survey_id);
        assert!(option::is_some(&survey_ref), E_SURVEY_NOT_FOUND);
        
        let survey = option::extract(&mut survey_ref);
        
        // Check survey conditions
        assert!(survey.is_active, E_SURVEY_INACTIVE);
        assert!(survey.current_responses < survey.max_responses, E_MAX_RESPONSES_REACHED);
        assert!(timestamp::now_seconds() < survey.expires_at, E_SURVEY_INACTIVE);
        
        // Check if already completed
        if (exists<UserSurveys>(participant_addr)) {
            let user_surveys = borrow_global<UserSurveys>(participant_addr);
            assert!(!vector::contains(&user_surveys.completed_surveys, &survey_id), E_ALREADY_COMPLETED);
        };

        // Transfer reward from survey creator to participant
        let reward = coin::withdraw<AptosCoin>(&survey.creator, survey.reward_amount);
        coin::deposit(participant_addr, reward);

        // Update survey response count
        survey.current_responses = survey.current_responses + 1;
        
        // Record response
        let response = SurveyResponse {
            survey_id,
            participant: participant_addr,
            response_hash,
            completed_at: timestamp::now_seconds(),
        };
        vector::push_back(&mut registry.responses, response);

        // Update user surveys
        if (!exists<UserSurveys>(participant_addr)) {
            let user_surveys = UserSurveys {
                completed_surveys: vector::empty<u64>(),
                total_earnings: 0,
            };
            move_to(participant, user_surveys);
        };

        let user_surveys = borrow_global_mut<UserSurveys>(participant_addr);
        vector::push_back(&mut user_surveys.completed_surveys, survey_id);
        user_surveys.total_earnings = user_surveys.total_earnings + survey.reward_amount;

        // Update global stats
        registry.total_rewards_distributed = registry.total_rewards_distributed + survey.reward_amount;

        event::emit(SurveyCompletedEvent {
            survey_id,
            participant: participant_addr,
            creator: survey.creator,
            reward_earned: survey.reward_amount,
        });

        // Close survey if max responses reached
        if (survey.current_responses >= survey.max_responses) {
            survey.is_active = false;
            event::emit(SurveyClosedEvent {
                survey_id,
                total_responses: survey.current_responses,
                total_rewards_paid: survey.reward_amount * survey.current_responses,
            });
        };
    }

    /// Send a tip to a creator
    public entry fun tip_creator(
        tipper: &signer,
        creator: address,
        amount: u64,
    ) {
        assert!(amount > 0, E_INVALID_PRICE);
        
        let tipper_addr = signer::address_of(tipper);
        let tip = coin::withdraw<AptosCoin>(tipper, amount);
        coin::deposit(creator, tip);

        event::emit(TipSentEvent {
            creator,
            tipper: tipper_addr,
            amount,
        });
    }

    /// Check if user has completed a survey
    #[view]
    public fun has_completed_survey(user: address, survey_id: u64): bool acquires UserSurveys {
        if (!exists<UserSurveys>(user)) {
            return false
        };

        let user_surveys = borrow_global<UserSurveys>(user);
        vector::contains(&user_surveys.completed_surveys, &survey_id)
    }

    /// Get survey details
    #[view]
    public fun get_survey(survey_id: u64): (address, vector<u8>, u64, u64, u64, bool) acquires SurveyRegistry {
        let registry = borrow_global<SurveyRegistry>(@SurveyRewards);
        let survey_ref = find_survey(&registry.surveys, survey_id);
        assert!(option::is_some(&survey_ref), E_SURVEY_NOT_FOUND);
        
        let survey = option::extract(&mut survey_ref);
        (survey.creator, survey.title, survey.reward_amount, survey.max_responses, survey.current_responses, survey.is_active)
    }

    /// Get survey reward amount
    #[view]
    public fun get_survey_reward(survey_id: u64): u64 acquires SurveyRegistry {
        let registry = borrow_global<SurveyRegistry>(@SurveyRewards);
        let survey_ref = find_survey(&registry.surveys, survey_id);
        assert!(option::is_some(&survey_ref), E_SURVEY_NOT_FOUND);
        
        let survey = option::extract(&mut survey_ref);
        survey.reward_amount
    }

    /// Helper function to find a survey by ID
    fun find_survey(surveys: &vector<Survey>, survey_id: u64): option::Option<Survey> {
        let i = 0;
        let len = vector::length(surveys);
        
        while (i < len) {
            let survey = vector::borrow(surveys, i);
            if (survey.id == survey_id) {
                return option::some(*survey)
            };
            i = i + 1;
        };
        
        option::none<Survey>()
    }

    /// Helper function to find a mutable survey by ID
    fun find_survey_mut(surveys: &mut vector<Survey>, survey_id: u64): option::Option<&mut Survey> {
        let i = 0;
        let len = vector::length(surveys);
        
        while (i < len) {
            let survey = vector::borrow_mut(surveys, i);
            if (survey.id == survey_id) {
                return option::some(survey)
            };
            i = i + 1;
        };
        
        option::none<&mut Survey>()
    }

    /// Get total number of surveys
    #[view]
    public fun get_total_surveys(): u64 acquires SurveyRegistry {
        let registry = borrow_global<SurveyRegistry>(@SurveyRewards);
        vector::length(&registry.surveys)
    }

    /// Get user's completed surveys
    #[view]
    public fun get_user_completed_surveys(user: address): vector<u64> acquires UserSurveys {
        if (!exists<UserSurveys>(user)) {
            return vector::empty<u64>()
        };

        let user_surveys = borrow_global<UserSurveys>(user);
        user_surveys.completed_surveys
    }

    /// Get user's total earnings
    #[view]
    public fun get_user_earnings(user: address): u64 acquires UserSurveys {
        if (!exists<UserSurveys>(user)) {
            return 0
        };

        let user_surveys = borrow_global<UserSurveys>(user);
        user_surveys.total_earnings
    }

    /// Get platform statistics
    #[view]
    public fun get_platform_stats(): (u64, u64, u64) acquires SurveyRegistry {
        let registry = borrow_global<SurveyRegistry>(@SurveyRewards);
        let total_surveys = vector::length(&registry.surveys);
        let total_responses = vector::length(&registry.responses);
        (total_surveys, total_responses, registry.total_rewards_distributed)
    }
}