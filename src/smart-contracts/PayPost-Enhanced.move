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
    const E_ALREADY_COMPLETED: u64 = 3;
    const E_SURVEY_INACTIVE: u64 = 4;
    const E_INVALID_REWARD: u64 = 5;
    const E_MAX_RESPONSES_REACHED: u64 = 6;
    const E_INSUFFICIENT_FUNDS: u64 = 7;
    const E_SURVEY_EXPIRED: u64 = 8;

    /// Survey structure with funding pool
    struct Survey has key, store {
        id: u64,
        creator: address,
        title: vector<u8>,
        description: vector<u8>,
        reward_amount: u64,
        max_responses: u64,
        current_responses: u64,
        total_funded: u64,        // Total MOVE tokens deposited
        remaining_funds: u64,     // Remaining funds for rewards
        is_active: bool,
        created_at: u64,
        expires_at: u64,
    }

    /// User activity tracking
    struct UserActivity has key {
        completed_surveys: vector<u64>,
        total_earnings: u64,
        surveys_created: u64,
        total_funded: u64,
    }

    /// Survey response data
    struct SurveyResponse has store {
        survey_id: u64,
        participant: address,
        response_hash: vector<u8>,
        completed_at: u64,
    }

    /// Global survey registry with funding pool
    struct SurveyRegistry has key {
        surveys: vector<Survey>,
        responses: vector<SurveyResponse>,
        next_survey_id: u64,
        total_rewards_distributed: u64,
        platform_fee_rate: u64,  // Fee rate in basis points (e.g., 250 = 2.5%)
    }

    /// Survey funding pool - holds tokens for rewards
    struct SurveyFunds has key {
        survey_id: u64,
        funds: coin::Coin<AptosCoin>,
    }

    /// Events
    struct SurveyCreatedEvent has drop, store {
        survey_id: u64,
        creator: address,
        reward_amount: u64,
        max_responses: u64,
        total_funding_required: u64,
    }

    struct SurveyFundedEvent has drop, store {
        survey_id: u64,
        creator: address,
        amount_funded: u64,
        total_funded: u64,
    }

    struct SurveyCompletedEvent has drop, store {
        survey_id: u64,
        participant: address,
        creator: address,
        reward_earned: u64,
    }

    struct SurveyClosedEvent has drop, store {
        survey_id: u64,
        total_responses: u64,
        total_rewards_paid: u64,
        refunded_amount: u64,
    }

    /// Initialize the module
    fun init_module(account: &signer) {
        let registry = SurveyRegistry {
            surveys: vector::empty<Survey>(),
            responses: vector::empty<SurveyResponse>(),
            next_survey_id: 1,
            total_rewards_distributed: 0,
            platform_fee_rate: 250, // 2.5% platform fee
        };
        move_to(account, registry);
    }

    /// Create and fund a new survey in one transaction
    public entry fun create_and_fund_survey(
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
        let registry = borrow_global_mut<SurveyRegistry>(@PayPost);
        let now = timestamp::now_seconds();
        
        // Calculate total funding needed (rewards + platform fee)
        let total_rewards = reward_amount * max_responses;
        let platform_fee = (total_rewards * registry.platform_fee_rate) / 10000;
        let total_funding_required = total_rewards + platform_fee;
        
        // Withdraw funds from creator
        let funding = coin::withdraw<AptosCoin>(creator, total_funding_required);
        
        let survey = Survey {
            id: registry.next_survey_id,
            creator: creator_addr,
            title,
            description,
            reward_amount,
            max_responses,
            current_responses: 0,
            total_funded: total_funding_required,
            remaining_funds: total_rewards, // Exclude platform fee from rewards
            is_active: true,
            created_at: now,
            expires_at: now + duration_seconds,
        };

        // Store funding in survey-specific resource
        let survey_funds = SurveyFunds {
            survey_id: registry.next_survey_id,
            funds: funding,
        };
        
        move_to(creator, survey_funds);
        vector::push_back(&mut registry.surveys, survey);
        
        event::emit(SurveyCreatedEvent {
            survey_id: registry.next_survey_id,
            creator: creator_addr,
            reward_amount,
            max_responses,
            total_funding_required,
        });

        event::emit(SurveyFundedEvent {
            survey_id: registry.next_survey_id,
            creator: creator_addr,
            amount_funded: total_funding_required,
            total_funded: total_funding_required,
        });

        registry.next_survey_id = registry.next_survey_id + 1;
    }

    /// Complete a survey and earn rewards
    public entry fun complete_survey(
        participant: &signer,
        survey_id: u64,
        response_hash: vector<u8>,
    ) acquires SurveyRegistry, UserActivity, SurveyFunds {
        let participant_addr = signer::address_of(participant);
        let registry = borrow_global_mut<SurveyRegistry>(@PayPost);
        
        // Find the survey
        let survey_index = find_survey_index(&registry.surveys, survey_id);
        assert!(survey_index < vector::length(&registry.surveys), E_SURVEY_NOT_FOUND);
        
        let survey = vector::borrow_mut(&mut registry.surveys, survey_index);
        
        // Check survey conditions
        assert!(survey.is_active, E_SURVEY_INACTIVE);
        assert!(survey.current_responses < survey.max_responses, E_MAX_RESPONSES_REACHED);
        assert!(timestamp::now_seconds() < survey.expires_at, E_SURVEY_EXPIRED);
        assert!(survey.remaining_funds >= survey.reward_amount, E_INSUFFICIENT_FUNDS);
        
        // Check if already completed
        if (exists<UserActivity>(participant_addr)) {
            let user_activity = borrow_global<UserActivity>(participant_addr);
            assert!(!vector::contains(&user_activity.completed_surveys, &survey_id), E_ALREADY_COMPLETED);
        };

        // Get survey funds and pay participant
        let survey_funds = borrow_global_mut<SurveyFunds>(survey.creator);
        let reward = coin::extract(&mut survey_funds.funds, survey.reward_amount);
        coin::deposit(participant_addr, reward);

        // Update survey state
        survey.current_responses = survey.current_responses + 1;
        survey.remaining_funds = survey.remaining_funds - survey.reward_amount;
        
        // Record response
        let response = SurveyResponse {
            survey_id,
            participant: participant_addr,
            response_hash,
            completed_at: timestamp::now_seconds(),
        };
        vector::push_back(&mut registry.responses, response);

        // Update user activity
        if (!exists<UserActivity>(participant_addr)) {
            let user_activity = UserActivity {
                completed_surveys: vector::empty<u64>(),
                total_earnings: 0,
                surveys_created: 0,
                total_funded: 0,
            };
            move_to(participant, user_activity);
        };

        let user_activity = borrow_global_mut<UserActivity>(participant_addr);
        vector::push_back(&mut user_activity.completed_surveys, survey_id);
        user_activity.total_earnings = user_activity.total_earnings + survey.reward_amount;

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
            close_survey_internal(survey, survey_funds, registry);
        };
    }

    /// Close survey and refund remaining funds
    public entry fun close_survey(
        creator: &signer,
        survey_id: u64,
    ) acquires SurveyRegistry, SurveyFunds {
        let creator_addr = signer::address_of(creator);
        let registry = borrow_global_mut<SurveyRegistry>(@PayPost);
        
        let survey_index = find_survey_index(&registry.surveys, survey_id);
        assert!(survey_index < vector::length(&registry.surveys), E_SURVEY_NOT_FOUND);
        
        let survey = vector::borrow_mut(&mut registry.surveys, survey_index);
        assert!(survey.creator == creator_addr, E_NOT_AUTHORIZED);
        assert!(survey.is_active, E_SURVEY_INACTIVE);
        
        let survey_funds = borrow_global_mut<SurveyFunds>(creator_addr);
        close_survey_internal(survey, survey_funds, registry);
    }

    /// Internal function to close survey and handle refunds
    fun close_survey_internal(
        survey: &mut Survey,
        survey_funds: &mut SurveyFunds,
        registry: &mut SurveyRegistry,
    ) {
        survey.is_active = false;
        
        // Refund remaining funds to creator
        let refund_amount = survey.remaining_funds;
        if (refund_amount > 0) {
            let refund = coin::extract(&mut survey_funds.funds, refund_amount);
            coin::deposit(survey.creator, refund);
            survey.remaining_funds = 0;
        };

        event::emit(SurveyClosedEvent {
            survey_id: survey.id,
            total_responses: survey.current_responses,
            total_rewards_paid: survey.reward_amount * survey.current_responses,
            refunded_amount: refund_amount,
        });
    }

    /// View functions
    #[view]
    public fun has_completed_survey(user: address, survey_id: u64): bool acquires UserActivity {
        if (!exists<UserActivity>(user)) {
            return false
        };

        let user_activity = borrow_global<UserActivity>(user);
        vector::contains(&user_activity.completed_surveys, &survey_id)
    }

    #[view]
    public fun get_survey(survey_id: u64): (address, vector<u8>, u64, u64, u64, u64, bool) acquires SurveyRegistry {
        let registry = borrow_global<SurveyRegistry>(@PayPost);
        let survey_index = find_survey_index(&registry.surveys, survey_id);
        assert!(survey_index < vector::length(&registry.surveys), E_SURVEY_NOT_FOUND);
        
        let survey = vector::borrow(&registry.surveys, survey_index);
        (
            survey.creator,
            survey.title,
            survey.reward_amount,
            survey.max_responses,
            survey.current_responses,
            survey.remaining_funds,
            survey.is_active
        )
    }

    #[view]
    public fun get_user_earnings(user: address): u64 acquires UserActivity {
        if (!exists<UserActivity>(user)) {
            return 0
        };

        let user_activity = borrow_global<UserActivity>(user);
        user_activity.total_earnings
    }

    #[view]
    public fun get_creator_surveys(creator: address): vector<u64> acquires SurveyRegistry {
        let registry = borrow_global<SurveyRegistry>(@PayPost);
        let creator_surveys = vector::empty<u64>();
        let i = 0;
        let len = vector::length(&registry.surveys);
        
        while (i < len) {
            let survey = vector::borrow(&registry.surveys, i);
            if (survey.creator == creator) {
                vector::push_back(&mut creator_surveys, survey.id);
            };
            i = i + 1;
        };
        
        creator_surveys
    }

    #[view]
    public fun get_active_surveys(): vector<u64> acquires SurveyRegistry {
        let registry = borrow_global<SurveyRegistry>(@PayPost);
        let active_surveys = vector::empty<u64>();
        let i = 0;
        let len = vector::length(&registry.surveys);
        let now = timestamp::now_seconds();
        
        while (i < len) {
            let survey = vector::borrow(&registry.surveys, i);
            if (survey.is_active && 
                survey.current_responses < survey.max_responses && 
                now < survey.expires_at &&
                survey.remaining_funds >= survey.reward_amount) {
                vector::push_back(&mut active_surveys, survey.id);
            };
            i = i + 1;
        };
        
        active_surveys
    }

    /// Helper function to find survey index
    fun find_survey_index(surveys: &vector<Survey>, survey_id: u64): u64 {
        let i = 0;
        let len = vector::length(surveys);
        
        while (i < len) {
            let survey = vector::borrow(surveys, i);
            if (survey.id == survey_id) {
                return i
            };
            i = i + 1;
        };
        
        len // Return length if not found (will cause assertion failure)
    }
}