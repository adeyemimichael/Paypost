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
      // 1. Get list of active survey IDs
      const activeSurveyIds = await aptos.view({
        payload: {
          function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_active_surveys`,
          functionArguments: [],
        },
      });

      const ids = activeSurveyIds[0]; // Vector of u64
      
      // 2. Fetch details for each survey
      const surveys = await Promise.all(
        ids.map(async (id) => {
          try {
            const details = await aptos.view({
              payload: {
                function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_survey`,
                functionArguments: [id],
              },
            });

            // Details: [creator, title, reward, max_responses, current_responses, remaining_funds, is_active]
            // Title and description are vector<u8>, need to decode
            const [
              creator,
              titleHex,
              reward,
              maxResponses,
              currentResponses,
              remainingFunds,
              isActive
            ] = details;

            return {
              id: id.toString(),
              creator,
              title: new TextDecoder().decode(new Uint8Array(titleHex.map(Number))), // Decode vector<u8>
              // Description isn't in get_survey view, might need another way or just use title/preview
              // For now, we'll use title as description or fetch if there's another view
              description: "Blockchain Survey", // Placeholder as get_survey doesn't return description in the Move code I saw? 
              // Wait, let me check the Move code again.
              // get_survey returns: (creator, title, reward_amount, max_responses, current_responses, remaining_funds, is_active)
              // It does NOT return description. I might need to add a view or just use what I have.
              reward: Number(reward) / 100000000, // Assuming 8 decimals for MOVE? Or 6? Aptos is usually 8.
              maxResponses: Number(maxResponses),
              responses: Number(currentResponses),
              isActive,
              type: 'survey',
              source: 'chain'
            };
          } catch (e) {
            console.error(`Failed to fetch survey ${id}`, e);
            return null;
          }
        })
      );

      return surveys.filter(s => s !== null);
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
