#!/usr/bin/env node

import { Aptos, AptosConfig, Network, Account, Ed25519PrivateKey } from '@aptos-labs/ts-sdk';
import fs from 'fs';
import path from 'path';

// Configuration
const MOVEMENT_RPC_URL = 'https://testnet.movementnetwork.xyz/v1';
const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY; // You'll need to set this

async function deployContract() {
    try {
        console.log('🚀 Starting ContentPlatform deployment to Movement testnet...');

        // Initialize Aptos client for Movement
        const config = new AptosConfig({
            network: Network.CUSTOM,
            fullnode: MOVEMENT_RPC_URL
        });
        const aptos = new Aptos(config);

        // Create deployer account
        if (!PRIVATE_KEY) {
            console.error('❌ DEPLOYER_PRIVATE_KEY environment variable not set');
            console.log('💡 Generate a private key and fund it with Movement testnet tokens');
            console.log('💡 Then run: DEPLOYER_PRIVATE_KEY=your_private_key node deploy.js');
            process.exit(1);
        }

        const privateKey = new Ed25519PrivateKey(PRIVATE_KEY);
        const deployer = Account.fromPrivateKey({ privateKey });
        
        console.log('📍 Deployer address:', deployer.accountAddress.toString());

        // Check deployer balance
        try {
            const balance = await aptos.getAccountAPTAmount({
                accountAddress: deployer.accountAddress
            });
            console.log('💰 Deployer balance:', balance / 100000000, 'MOVE');
            
            if (balance < 100000000) { // Less than 1 MOVE
                console.warn('⚠️  Low balance! You may need more MOVE tokens for deployment');
            }
        } catch (error) {
            console.warn('⚠️  Could not check balance:', error.message);
        }

        // Read the compiled module
        const moduleBytes = fs.readFileSync(
            path.join(process.cwd(), 'build', 'ContentPlatform', 'bytecode_modules', 'ContentPlatform.mv')
        );

        console.log('📦 Module size:', moduleBytes.length, 'bytes');

        // Deploy the module
        console.log('🔄 Deploying ContentPlatform module...');
        
        const transaction = await aptos.publishPackageTransaction({
            account: deployer.accountAddress,
            metadataBytes: fs.readFileSync(
                path.join(process.cwd(), 'build', 'ContentPlatform', 'package-metadata.bcs')
            ),
            moduleBytecode: [moduleBytes]
        });

        const pendingTxn = await aptos.signAndSubmitTransaction({
            signer: deployer,
            transaction
        });

        console.log('⏳ Transaction submitted:', pendingTxn.hash);
        console.log('🔗 Explorer:', `https://explorer.testnet.movementnetwork.xyz/txn/${pendingTxn.hash}`);

        // Wait for confirmation
        const executedTxn = await aptos.waitForTransaction({
            transactionHash: pendingTxn.hash
        });

        if (executedTxn.success) {
            console.log('✅ ContentPlatform deployed successfully!');
            console.log('📍 Contract address:', deployer.accountAddress.toString());
            
            // Initialize the contract
            console.log('🔄 Initializing ContentPlatform...');
            
            const initTransaction = await aptos.transaction.build.simple({
                sender: deployer.accountAddress,
                data: {
                    function: `${deployer.accountAddress}::ContentPlatform::initialize`,
                    functionArguments: []
                }
            });

            const initPendingTxn = await aptos.signAndSubmitTransaction({
                signer: deployer,
                transaction: initTransaction
            });

            console.log('⏳ Initialization transaction:', initPendingTxn.hash);

            const initExecutedTxn = await aptos.waitForTransaction({
                transactionHash: initPendingTxn.hash
            });

            if (initExecutedTxn.success) {
                console.log('✅ ContentPlatform initialized successfully!');
                console.log('');
                console.log('🎉 Deployment Complete!');
                console.log('📍 Contract Address:', deployer.accountAddress.toString());
                console.log('🔗 Transaction:', `https://explorer.testnet.movementnetwork.xyz/txn/${pendingTxn.hash}`);
                console.log('');
                console.log('📝 Update your .env files with:');
                console.log(`CONTRACT_ADDRESS=${deployer.accountAddress.toString()}`);
                console.log(`VITE_CONTRACT_ADDRESS=${deployer.accountAddress.toString()}`);
            } else {
                console.error('❌ Initialization failed:', initExecutedTxn);
            }
        } else {
            console.error('❌ Deployment failed:', executedTxn);
        }

    } catch (error) {
        console.error('❌ Deployment error:', error);
        
        if (error.message.includes('INSUFFICIENT_BALANCE')) {
            console.log('💡 Fund your deployer account with Movement testnet tokens');
            console.log('💡 Faucet: https://faucet.testnet.movementnetwork.xyz/');
        }
    }
}

// Run deployment
deployContract();