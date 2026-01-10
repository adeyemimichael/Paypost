#!/usr/bin/env node

/**
 * Simple script to check surveys on the smart contract
 */

const API_BASE_URL = 'http://localhost:3001/api';

async function checkSurveys() {
  console.log('📊 Checking surveys on PayPost smart contract...');
  console.log('================================================');
  
  try {
    // Check if backend is running
    console.log('🔍 Connecting to backend...');
    const healthResponse = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
    if (!healthResponse.ok) {
      throw new Error('Backend not available. Please start the backend server.');
    }
    console.log('✅ Backend is running');
    
    // Fetch surveys from blockchain
    console.log('\n📋 Fetching surveys from blockchain...');
    const response = await fetch(`${API_BASE_URL}/surveys`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch surveys: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const surveys = data.surveys || [];
    
    console.log(`\n🎯 Found ${surveys.length} total surveys on the smart contract\n`);
    
    if (surveys.length === 0) {
      console.log('📝 No surveys found on the blockchain yet.');
      return;
    }
    
    // Analyze surveys
    const activeSurveys = surveys.filter(s => s.isActive);
    const completedSurveys = surveys.filter(s => !s.isActive);
    
    console.log(`📊 Survey Statistics:`);
    console.log(`   • Total surveys: ${surveys.length}`);
    console.log(`   • Active surveys: ${activeSurveys.length}`);
    console.log(`   • Completed surveys: ${completedSurveys.length}`);
    
    console.log(`\n📋 Survey Details:`);
    console.log('='.repeat(80));
    
    surveys.forEach((survey, index) => {
      const status = survey.isActive ? '🟢 ACTIVE' : '🔴 COMPLETED';
      const creator = `${survey.creator.substring(0, 8)}...${survey.creator.substring(58)}`;
      const progress = `${survey.current_responses}/${survey.max_responses}`;
      const reward = `${survey.reward_amount} MOVE`;
      
      console.log(`${index + 1}. ${status} Survey ID: ${survey.id}`);
      console.log(`   Title: "${survey.title}"`);
      console.log(`   Creator: ${creator}`);
      console.log(`   Progress: ${progress} responses`);
      console.log(`   Reward: ${reward} per response`);
      console.log(`   Description: ${survey.description.substring(0, 100)}${survey.description.length > 100 ? '...' : ''}`);
      console.log('');
    });
    
    // Show recent activity
    const recentSurveys = surveys
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 3);
    
    if (recentSurveys.length > 0) {
      console.log(`🕒 Most Recent Surveys:`);
      recentSurveys.forEach((survey, index) => {
        const timeAgo = new Date(survey.timestamp).toLocaleString();
        console.log(`   ${index + 1}. "${survey.title}" - Created: ${timeAgo}`);
      });
    }
    
    // Show creators
    const creators = [...new Set(surveys.map(s => s.creator))];
    console.log(`\n👥 Unique Creators: ${creators.length}`);
    creators.forEach((creator, index) => {
      const creatorSurveys = surveys.filter(s => s.creator === creator);
      const shortAddress = `${creator.substring(0, 8)}...${creator.substring(58)}`;
      console.log(`   ${index + 1}. ${shortAddress} (${creatorSurveys.length} surveys)`);
    });
    
  } catch (error) {
    console.error('❌ Error checking surveys:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure the backend is running: cd backend && npm run dev');
    console.log('2. Check that the smart contract is deployed');
    console.log('3. Verify environment variables are set correctly');
  }
}

// Run the check
checkSurveys();