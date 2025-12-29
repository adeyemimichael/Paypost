#!/usr/bin/env node

// Simple script to create a test survey on Movement blockchain
// This will give you real data to see in your app

import { execSync } from 'child_process';

const CONTRACT_ADDRESS = '0xa74c3b75410a0681f854cfe2b869a3cd6b959d7dbe551aef4781c6a3ff3aa8dd';

console.log('🚀 Creating test survey on Movement blockchain...');
console.log('Contract Address:', CONTRACT_ADDRESS);

try {
  // Create a test survey
  const command = `movement move run \\
    --function-id ${CONTRACT_ADDRESS}::ContentPlatform::create_and_fund_survey \\
    --args \\
      string:"Web3 Developer Survey" \\
      string:"Share your experience with Web3 development and earn MOVE tokens!" \\
      u64:500000 \\
      u64:100 \\
      u64:604800 \\
    --profile default`;

  console.log('Executing command:', command);
  
  const result = execSync(command, { encoding: 'utf8' });
  console.log('✅ Survey created successfully!');
  console.log('Result:', result);
  
  console.log('\n🎉 Test survey created! You should now see it in your app at http://localhost:5173');
  console.log('\nSurvey Details:');
  console.log('- Title: Web3 Developer Survey');
  console.log('- Reward: 0.5 MOVE tokens');
  console.log('- Max Responses: 100');
  console.log('- Duration: 7 days');
  
} catch (error) {
  console.error('❌ Failed to create test survey:', error.message);
  console.log('\n💡 This is normal if you don\'t have MOVE tokens in your wallet.');
  console.log('Your app will still work - it will just show "No surveys found" until surveys are created.');
  console.log('\n🔗 Get testnet tokens: https://faucet.movementlabs.xyz/');
}