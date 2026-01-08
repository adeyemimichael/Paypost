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
      
      // 1. Build transaction
      const rawTxn = await aptos.transaction.build.simple({
        sender: AccountAddress.from(address),
        data: transactionPayload
      });

      console.log('📝 Transaction built, generating signing message...');

      // 2. Generate signing message
      const message = generateSigningMessageForTransaction(rawTxn);
      
      console.log('✍️ Signing with Privy...');

      // 3. Sign with Privy
      const signatureResponse = await privy.wallets().rawSign(walletId, {
        params: { hash: toHex(message) }
      });
      
      const signature = signatureResponse;
      console.log('✅ Signature received, submitting transaction...');

      // 4. Submit transaction
      const senderAuthenticator = new AccountAuthenticatorEd25519(
        new Ed25519PublicKey(publicKey),
        new Ed25519Signature(signature.slice(2))
      );

      const pending = await aptos.transaction.submit.simple({
        transaction: rawTxn,
        senderAuthenticator
      });

      console.log('⏳ Waiting for transaction confirmation...');

      const executed = await aptos.waitForTransaction({
        transactionHash: pending.hash
      });

      console.log('🎉 Transaction executed:', executed.hash);
      return executed;

    } catch (error) {
      console.error('❌ Transaction failed:', error);
      throw new Error(`Transaction failed: ${error.message}`);
    }
  }

  // Transaction payload builders
  buildCreateSurveyPayload(title, description, rewardAmount, maxResponses) {
    const titleBytes = Array.from(new TextEncoder().encode(title));
    const descBytes = Array.from(new TextEncoder().encode(description));
    const rewardOctas = Math.floor(rewardAmount * 100000000);

    return {
      function: `${MODULE_ADDRESS}::${MODULE_NAME}::create_and_fund_survey`,
      functionArguments: [
        titleBytes,
        descBytes,
        rewardOctas,
        maxResponses,
        604800 // 7 days duration
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