import { PrivyClient } from '@privy-io/node';
import { 
  Aptos, 
  AptosConfig, 
  Network,
  AccountAddress,
  AccountAuthenticatorEd25519,
  Ed25519PublicKey,
  Ed25519Signature,
  generateSigningMessageForTransaction 
} from '@aptos-labs/ts-sdk';
import { toHex } from 'viem';
import dotenv from 'dotenv';

dotenv.config();

const privy = new PrivyClient({
  appId: process.env.PRIVY_APP_ID,
  appSecret: process.env.PRIVY_APP_SECRET
});

const aptos = new Aptos(new AptosConfig({
  network: Network.CUSTOM,
  fullnode: process.env.MOVEMENT_RPC_URL
}));

const MODULE_ADDRESS = process.env.CONTRACT_ADDRESS;
const MODULE_NAME = "ContentPlatform";

export class TransactionService {
  async signAndSubmitTransaction(walletId, publicKey, address, transactionPayload) {
    try {
      console.log('🔧 signAndSubmitTransaction called with:', {
        walletId: !!walletId,
        publicKey: !!publicKey,
        address: !!address,
        transactionPayload: !!transactionPayload,
        payloadType: typeof transactionPayload,
        payloadKeys: transactionPayload ? Object.keys(transactionPayload) : 'undefined'
      });

      if (!transactionPayload) {
        throw new Error('transactionPayload is undefined');
      }

      if (!transactionPayload.function) {
        throw new Error('transactionPayload.function is undefined');
      }
      // Clean and validate inputs
      const cleanAddress = address.startsWith('0x') ? address : `0x${address}`;
      let cleanPublicKey = publicKey;
      
      // Handle publicKey formatting - ensure exactly 64 hex characters
      if (typeof publicKey === 'string') {
        // Remove 0x prefix if present
        if (publicKey.startsWith('0x')) {
          cleanPublicKey = publicKey.slice(2);
        }
        
        // Handle case where publicKey is 66 chars (with leading 00) - THIS IS THE FIX
        if (cleanPublicKey.length === 66 && cleanPublicKey.startsWith('00')) {
          cleanPublicKey = cleanPublicKey.slice(2);
        }
        
        // Handle case where publicKey is 130 chars (65 bytes with 0x prefix removed)
        if (cleanPublicKey.length === 130) {
          cleanPublicKey = cleanPublicKey.slice(-64);
        }
        
        // Validate final length
        if (cleanPublicKey.length !== 64) {
          console.error(`❌ PublicKey validation failed:`, {
            original: publicKey,
            cleaned: cleanPublicKey,
            originalLength: publicKey.length,
            cleanedLength: cleanPublicKey.length
          });
          throw new Error(`Invalid publicKey length: ${cleanPublicKey.length}. Expected 64 hex characters (32 bytes). Got: ${publicKey}`);
        }
      }

      console.log('✅ Clean address:', cleanAddress);
      console.log('✅ Clean publicKey:', cleanPublicKey, 'length:', cleanPublicKey.length);
      console.log('🔧 Transaction payload:', JSON.stringify(transactionPayload, null, 2));

      // 1. Build transaction
      console.log('🔧 About to build transaction...');
      const rawTxn = await aptos.transaction.build.simple({
        sender: cleanAddress,
        data: {
          function: transactionPayload.function,
          functionArguments: transactionPayload.functionArguments
        }
      });

      console.log('🔧 Transaction built successfully');
      console.log('📦 Built transaction:', JSON.stringify({
        sender: rawTxn.sender,
        function: rawTxn.payload?.function || 'undefined',
        arguments: rawTxn.payload?.arguments || 'undefined'
      }, null, 2));

      // 2. Generate signing message
      const message = generateSigningMessageForTransaction(rawTxn);

      // 3. Sign with Privy
      const signatureResponse = await privy.wallets().rawSign(walletId, {
        params: { hash: toHex(message) }
      });
      
      // Handle different response formats from Privy
      let cleanSignature;
      if (typeof signatureResponse === 'string') {
        cleanSignature = signatureResponse.startsWith('0x') ? signatureResponse.slice(2) : signatureResponse;
      } else if (signatureResponse && signatureResponse.signature) {
        // Sometimes Privy returns an object with signature property
        cleanSignature = signatureResponse.signature.startsWith('0x') ? signatureResponse.signature.slice(2) : signatureResponse.signature;
      } else if (signatureResponse && signatureResponse.data) {
        // Another possible format
        cleanSignature = signatureResponse.data.startsWith('0x') ? signatureResponse.data.slice(2) : signatureResponse.data;
      } else {
        throw new Error(`Invalid signature response from Privy: ${JSON.stringify(signatureResponse)}`);
      }
      
      // Validate signature length (should be 128 hex chars = 64 bytes)
      if (!cleanSignature || cleanSignature.length !== 128) {
        console.error(`❌ Signature validation failed:`, {
          original: signatureResponse,
          cleaned: cleanSignature,
          originalType: typeof signatureResponse,
          cleanedLength: cleanSignature?.length
        });
        throw new Error(`Invalid signature length: ${cleanSignature?.length}. Expected 128 hex characters (64 bytes).`);
      }
      
      console.log('✅ Signature received and validated, length:', cleanSignature.length);

      // 4. Create authenticator
      
      // 4. Create authenticator
      let ed25519PublicKey, ed25519Signature, senderAuthenticator;
      
      try {
        ed25519PublicKey = new Ed25519PublicKey(cleanPublicKey);
      } catch (error) {
        throw new Error(`Failed to create Ed25519PublicKey: ${error.message}`);
      }
      
      try {
        ed25519Signature = new Ed25519Signature(cleanSignature);
      } catch (error) {
        throw new Error(`Failed to create Ed25519Signature: ${error.message}`);
      }
      
      try {
        senderAuthenticator = new AccountAuthenticatorEd25519(ed25519PublicKey, ed25519Signature);
      } catch (error) {
        throw new Error(`Failed to create AccountAuthenticatorEd25519: ${error.message}`);
      }

      // 5. Submit transaction
      const pending = await aptos.transaction.submit.simple({
        transaction: rawTxn,
        senderAuthenticator
      });

      // 6. Wait for confirmation
      const executed = await aptos.waitForTransaction({
        transactionHash: pending.hash
      });

      return executed;

    } catch (error) {
      console.error('❌ Transaction failed:', error);
      throw new Error(`Transaction failed: ${error.message}`);
    }
  }

  // Transaction payload builders
  buildCreateSurveyPayload(title, description, rewardAmount, maxResponses) {
    // Convert strings to byte arrays
    const titleBytes = Array.from(new TextEncoder().encode(title));
    const descBytes = Array.from(new TextEncoder().encode(description));
    
    // Convert reward amount to octas (1 MOVE = 100,000,000 octas)
    const rewardOctas = Math.floor(rewardAmount * 100000000);
    
    // Duration in seconds (7 days)
    const durationSeconds = 604800;

    console.log('📋 Building survey payload:', {
      title,
      description,
      titleBytes: titleBytes.length,
      descBytes: descBytes.length,
      rewardAmount,
      rewardOctas,
      maxResponses,
      durationSeconds
    });

    // Validate inputs
    if (titleBytes.length === 0) {
      throw new Error('Title cannot be empty');
    }
    if (descBytes.length === 0) {
      throw new Error('Description cannot be empty');
    }
    if (rewardOctas <= 0) {
      throw new Error('Reward amount must be positive');
    }
    if (maxResponses <= 0) {
      throw new Error('Max responses must be positive');
    }

    return {
      function: `${MODULE_ADDRESS}::ContentPlatform::create_and_fund_survey`,
      functionArguments: [
        titleBytes,
        descBytes,
        rewardOctas,
        maxResponses,
        durationSeconds
      ]
    };
  }

  buildCloseSurveyPayload(surveyId) {
    return {
      function: `${MODULE_ADDRESS}::${MODULE_NAME}::close_survey`,
      functionArguments: [surveyId]
    };
  }

  buildCompleteSurveyPayload(surveyId) {
    const responseHash = Array.from(new TextEncoder().encode("response"));
    
    return {
      function: `${MODULE_ADDRESS}::${MODULE_NAME}::complete_survey`,
      functionArguments: [
        surveyId,
        responseHash
      ]
    };
  }

  buildTransferPayload(toAddress, amount) {
    const amountOctas = Math.floor(amount * 100000000);
    
    return {
      function: "0x1::aptos_account::transfer",
      functionArguments: [toAddress, amountOctas]
    };
  }

  // Read-only operations (direct chain calls)
  async getBalance(address) {
    try {
      const resources = await aptos.getAccountResources({ 
        accountAddress: address 
      });
      
      const coinResource = resources.find(r => 
        r.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"
      );
      
      if (coinResource) {
        const value = coinResource.data.coin.value;
        return Number(value) / 100000000;
      }
      return 0;
    } catch (error) {
      console.error('Failed to get balance:', error);
      return 0;
    }
  }

  async getSurveys() {
    try {
      const resource = await aptos.getAccountResource({
        accountAddress: MODULE_ADDRESS,
        resourceType: `${MODULE_ADDRESS}::${MODULE_NAME}::SurveyRegistry`,
      });

      const surveysData = resource.data.surveys;
      return surveysData.map(s => ({
        id: s.id,
        creator: s.creator,
        title: new TextDecoder().decode(new Uint8Array(s.title)),
        description: new TextDecoder().decode(new Uint8Array(s.description)),
        reward: Number(s.reward_amount) / 100000000,
        maxResponses: Number(s.max_responses),
        responses: Number(s.current_responses),
        isActive: s.is_active,
        timestamp: Number(s.created_at) * 1000
      }));
    } catch (error) {
      console.error('Failed to get surveys from chain:', error);
      return [];
    }
  }

  async getUserActivity(address) {
    try {
      const earnings = await aptos.view({
        payload: {
          function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_user_earnings`,
          functionArguments: [address],
        },
      });

      return {
        totalEarnings: Number(earnings[0]) / 100000000,
      };
    } catch (error) {
      return { totalEarnings: 0 };
    }
  }

  async hasCompletedSurvey(address, surveyId) {
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
  }

  async getCreatorEscrow(address) {
    try {
      // Get all surveys created by this address
      const surveys = await this.getSurveys();
      const creatorSurveys = surveys.filter(s => s.creator.toLowerCase() === address.toLowerCase());
      
      // Calculate total escrowed funds (remaining_funds for active surveys)
      let totalEscrow = 0;
      creatorSurveys.forEach(survey => {
        if (survey.isActive) {
          // For active surveys, escrow = remaining rewards that can be paid out
          const remainingRewards = (survey.maxResponses - survey.responses) * survey.reward;
          totalEscrow += remainingRewards;
        }
      });
      
      return totalEscrow;
    } catch (error) {
      console.error('Failed to calculate creator escrow:', error);
      return 0;
    }
  }
}

export const transactionService = new TransactionService();