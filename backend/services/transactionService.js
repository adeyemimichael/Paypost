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
      console.log('🔄 Building transaction for:', address);
      console.log('📋 Transaction payload:', JSON.stringify(transactionPayload, null, 2));
      console.log('🔑 PublicKey (raw):', publicKey);
      console.log('🔑 PublicKey type:', typeof publicKey);
      console.log('🔑 PublicKey length:', publicKey?.length);
      console.log('🆔 WalletId:', walletId);

      // Clean and validate inputs
      const cleanAddress = address.startsWith('0x') ? address : `0x${address}`;
      let cleanPublicKey = publicKey;
      
      // Handle publicKey formatting - ensure exactly 64 hex characters
      if (typeof publicKey === 'string') {
        console.log('🔍 Original publicKey:', publicKey);
        
        // Remove 0x prefix if present
        if (publicKey.startsWith('0x')) {
          cleanPublicKey = publicKey.slice(2);
          console.log('🔍 After removing 0x:', cleanPublicKey);
        }
        
        // Handle case where publicKey is 66 chars (with leading 00)
        if (cleanPublicKey.length === 66 && cleanPublicKey.startsWith('00')) {
          cleanPublicKey = cleanPublicKey.slice(2);
          console.log('🔍 After removing leading 00:', cleanPublicKey);
        }
        
        // Handle case where publicKey is 130 chars (65 bytes with 0x prefix removed)
        if (cleanPublicKey.length === 130) {
          // This might be a compressed public key, take the last 64 chars
          cleanPublicKey = cleanPublicKey.slice(-64);
          console.log('🔍 After taking last 64 chars from 130-char key:', cleanPublicKey);
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

      // 1. Build transaction with explicit typing
      const rawTxn = await aptos.transaction.build.simple({
        sender: cleanAddress,
        data: {
          function: `${MODULE_ADDRESS}::ContentPlatform::create_and_fund_survey`,
          functionArguments: transactionPayload.functionArguments
        }
      });

      console.log('📝 Transaction built successfully');

      // 2. Generate signing message
      const message = generateSigningMessageForTransaction(rawTxn);
      console.log('📝 Signing message generated');

      // 3. Sign with Privy
      console.log('✍️ Signing with Privy...');
      const signatureResponse = await privy.wallets().rawSign(walletId, {
        params: { hash: toHex(message) }
      });
      
      console.log('🔍 Raw signature response:', signatureResponse);
      console.log('🔍 Signature type:', typeof signatureResponse);
      console.log('🔍 Signature length:', signatureResponse?.length);
      
      let cleanSignature = signatureResponse;
      if (typeof signatureResponse === 'string') {
        if (signatureResponse.startsWith('0x')) {
          cleanSignature = signatureResponse.slice(2);
          console.log('🔍 Signature after removing 0x:', cleanSignature);
        }
      }
      
      // Validate signature length (should be 128 hex chars = 64 bytes)
      if (cleanSignature.length !== 128) {
        console.error(`❌ Signature validation failed:`, {
          original: signatureResponse,
          cleaned: cleanSignature,
          originalLength: typeof signatureResponse === 'string' ? signatureResponse.length : 'not string',
          cleanedLength: cleanSignature.length
        });
        throw new Error(`Invalid signature length: ${cleanSignature.length}. Expected 128 hex characters (64 bytes).`);
      }
      
      console.log('✅ Signature received and validated, length:', cleanSignature.length);

      // 4. Create authenticator
      console.log('🔧 Creating Ed25519 objects...');
      console.log('🔧 PublicKey for Ed25519PublicKey:', cleanPublicKey);
      console.log('🔧 Signature for Ed25519Signature:', cleanSignature);
      
      let ed25519PublicKey, ed25519Signature, senderAuthenticator;
      
      try {
        ed25519PublicKey = new Ed25519PublicKey(cleanPublicKey);
        console.log('✅ Ed25519PublicKey created successfully');
      } catch (error) {
        console.error('❌ Failed to create Ed25519PublicKey:', error);
        throw new Error(`Failed to create Ed25519PublicKey: ${error.message}`);
      }
      
      try {
        ed25519Signature = new Ed25519Signature(cleanSignature);
        console.log('✅ Ed25519Signature created successfully');
      } catch (error) {
        console.error('❌ Failed to create Ed25519Signature:', error);
        throw new Error(`Failed to create Ed25519Signature: ${error.message}`);
      }
      
      try {
        senderAuthenticator = new AccountAuthenticatorEd25519(ed25519PublicKey, ed25519Signature);
        console.log('✅ AccountAuthenticatorEd25519 created successfully');
      } catch (error) {
        console.error('❌ Failed to create AccountAuthenticatorEd25519:', error);
        throw new Error(`Failed to create AccountAuthenticatorEd25519: ${error.message}`);
      }

      // 5. Submit transaction
      const pending = await aptos.transaction.submit.simple({
        transaction: rawTxn,
        senderAuthenticator
      });

      console.log('⏳ Transaction submitted:', pending.hash);

      // 6. Wait for confirmation
      const executed = await aptos.waitForTransaction({
        transactionHash: pending.hash
      });

      console.log('🎉 Transaction executed:', executed.hash);
      return executed;

    } catch (error) {
      console.error('❌ Transaction failed:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        invalidReason: error.invalidReason
      });
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
}

export const transactionService = new TransactionService();