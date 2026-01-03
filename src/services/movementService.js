import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

// Configuration
const MOVEMENT_NETWORK = "testnet"; // or "custom"
const MOVEMENT_RPC_URL = "https://testnet.movementnetwork.xyz/v1";
const MODULE_ADDRESS = "0xa74c3b75410a0681f854cfe2b869a3cd6b959d7dbe551aef4781c6a3ff3aa8dd";
const MODULE_NAME = "ContentPlatform";

// Initialize Aptos Client
const config = new AptosConfig({
  network: Network.CUSTOM,
  fullnode: MOVEMENT_RPC_URL,
});

const aptos = new Aptos(config);

export const movementService = {
  /**
   * Get all active surveys from the blockchain
   */
  getSurveys: async () => {
    try {
      // Fetch the SurveyRegistry resource directly to get all fields
      const resource = await aptos.getAccountResource({
        accountAddress: MODULE_ADDRESS,
        resourceType: `${MODULE_ADDRESS}::${MODULE_NAME}::SurveyRegistry`,
      });

      const surveysData = resource.data.surveys; // Array of Survey objects

      return surveysData.map((s) => {
        try {
          // Decode fields
          const title = new TextDecoder().decode(new Uint8Array(s.title.vec ? s.title.vec[0] : s.title)); // Handle MoveString/vector format
          const description = new TextDecoder().decode(new Uint8Array(s.description.vec ? s.description.vec[0] : s.description));
          
          // Try to parse questions from description if it's JSON, otherwise default
          let questions = [];
          try {
            const parsed = JSON.parse(description);
            if (parsed.questions) questions = parsed.questions;
          } catch (e) {
            // Not JSON or no questions
          }

          if (questions.length === 0) {
            // Default questions if none found (since contract doesn't store them explicitly)
            questions = [
              {
                id: 1,
                type: 'multiple-choice',
                question: 'How would you rate this survey?',
                options: ['Excellent', 'Good', 'Fair', 'Poor'],
                required: true
              }
            ];
          }

          return {
            id: s.id,
            creator: s.creator,
            title: title,
            description: description,
            preview: description.substring(0, 100) + '...',
            content: description,
            author: `${s.creator.substring(0, 6)}...${s.creator.substring(62)}`,
            reward: Number(s.reward_amount) / 100000000,
            maxResponses: Number(s.max_responses),
            responses: Number(s.current_responses),
            isActive: s.is_active,
            timestamp: Number(s.created_at) * 1000, // Seconds to ms
            image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800', // Default image
            questions: questions,
            type: 'survey',
            source: 'chain'
          };
        } catch (e) {
          console.error("Error parsing survey:", e);
          return null;
        }
      }).filter(s => s !== null);
    } catch (error) {
      console.error("Failed to get surveys from chain:", error);
      return [];
    }
  },

  /**
   * Get user balance (MOVE)
   */
  getBalance: async (address) => {
    try {
      const resources = await aptos.getAccountResources({ accountAddress: address });
      const coinResource = resources.find((r) => r.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>");
      
      if (coinResource) {
        const value = coinResource.data.coin.value;
        return Number(value) / 100000000;
      }
      return 0;
    } catch (error) {
      return 0;
    }
  },

  /**
   * Get user activity and earnings
   */
  getUserActivity: async (address) => {
    try {
      const earnings = await aptos.view({
        payload: {
          function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_user_earnings`,
          functionArguments: [address],
        },
      });

      return {
        totalEarnings: Number(earnings[0]) / 100000000, // Adjust decimals
      };
    } catch (error) {
      // User might not have activity resource yet
      return { totalEarnings: 0 };
    }
  },

  /**
   * Check if user has completed a survey
   */
  hasCompletedSurvey: async (address, surveyId) => {
    try {
      const result = await aptos.view({
        payload: {
          function: `${MODULE_ADDRESS}::${MODULE_NAME}::has_completed_survey`,
          functionArguments: [address, surveyId],
        },
      });
      return result[0];
    } catch (error) {
      return false;
    }
  },

  /**
   * Construct payload for creating a survey
   */
  createSurveyPayload: (title, description, rewardAmount, maxResponses, durationSeconds = 604800) => {
    // Convert strings to hex/bytes
    const titleBytes = new TextEncoder().encode(title);
    const descBytes = new TextEncoder().encode(description);
    
    // Convert reward to octas (assuming 8 decimals)
    const rewardOctas = Math.floor(rewardAmount * 100000000);

    return {
      function: `${MODULE_ADDRESS}::${MODULE_NAME}::create_and_fund_survey`,
      functionArguments: [
        Array.from(titleBytes),
        Array.from(descBytes),
        rewardOctas,
        maxResponses,
        durationSeconds
      ],
    };
  },

  /**
   * Construct payload for completing a survey
   */
  completeSurveyPayload: (surveyId, responseHash = "0x00") => {
    // responseHash should be vector<u8>
    // For now using a dummy hash if not provided
    const hashBytes = new TextEncoder().encode("response"); 

    return {
      function: `${MODULE_ADDRESS}::${MODULE_NAME}::complete_survey`,
      functionArguments: [
        surveyId,
        Array.from(hashBytes) // Using dummy hash for now
      ],
    };
  },

  /**
   * Construct payload for withdrawing funds (transfer)
   */
  withdrawPayload: (toAddress, amount) => {
    const amountOctas = Math.floor(amount * 100000000);
    return {
      function: "0x1::aptos_account::transfer",
      functionArguments: [toAddress, amountOctas],
    };
  }
};
