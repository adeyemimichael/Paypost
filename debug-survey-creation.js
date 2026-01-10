#!/usr/bin/env node

/**
 * Debug script to understand why blockchain transaction hashes are not being saved to Supabase
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function debugSurveyCreation() {
  console.log('🔍 Debugging Survey Creation Process...');
  console.log('==========================================');
  
  try {
    // 1. Check recent surveys in Supabase
    console.log('1️⃣ Checking recent surveys in Supabase...');
    const { data: recentSurveys, error: surveysError } = await supabase
      .from('surveys')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (surveysError) {
      console.error('❌ Error fetching surveys:', surveysError.message);
      return;
    }
    
    console.log(`Found ${recentSurveys.length} recent surveys:`);
    recentSurveys.forEach((survey, index) => {
      console.log(`   ${index + 1}. "${survey.title}" - TX Hash: ${survey.blockchain_tx_hash || 'MISSING'}`);
      console.log(`      Created: ${new Date(survey.created_at).toLocaleString()}`);
      console.log(`      Creator ID: ${survey.creator_id}`);
    });
    
    // 2. Check blockchain surveys
    console.log('\n2️⃣ Checking blockchain surveys...');
    const API_BASE_URL = 'http://localhost:3001/api';
    
    try {
      const response = await fetch(`${API_BASE_URL}/surveys`);
      if (!response.ok) {
        throw new Error(`Backend not available: ${response.status}`);
      }
      
      const data = await response.json();
      const blockchainSurveys = data.surveys || [];
      
      console.log(`Found ${blockchainSurveys.length} blockchain surveys:`);
      blockchainSurveys.slice(0, 5).forEach((survey, index) => {
        console.log(`   ${index + 1}. "${survey.title}" - ID: ${survey.id}`);
        console.log(`      Creator: ${survey.creator}`);
        console.log(`      Active: ${survey.isActive}`);
      });
      
      // 3. Try to match surveys between blockchain and Supabase
      console.log('\n3️⃣ Matching surveys between blockchain and Supabase...');
      
      const matches = [];
      const unmatched = [];
      
      recentSurveys.forEach(supabaseSurvey => {
        const blockchainMatch = blockchainSurveys.find(blockchainSurvey => 
          blockchainSurvey.title === supabaseSurvey.title &&
          Math.abs(new Date(supabaseSurvey.created_at).getTime() - blockchainSurvey.timestamp) < 300000 // 5 minutes
        );
        
        if (blockchainMatch) {
          matches.push({
            supabase: supabaseSurvey,
            blockchain: blockchainMatch
          });
        } else {
          unmatched.push(supabaseSurvey);
        }
      });
      
      console.log(`✅ Found ${matches.length} matching surveys:`);
      matches.forEach((match, index) => {
        console.log(`   ${index + 1}. "${match.supabase.title}"`);
        console.log(`      Supabase TX Hash: ${match.supabase.blockchain_tx_hash || 'MISSING'}`);
        console.log(`      Blockchain ID: ${match.blockchain.id}`);
        console.log(`      Time diff: ${Math.abs(new Date(match.supabase.created_at).getTime() - match.blockchain.timestamp) / 1000}s`);
      });
      
      console.log(`⚠️ Found ${unmatched.length} unmatched Supabase surveys:`);
      unmatched.forEach((survey, index) => {
        console.log(`   ${index + 1}. "${survey.title}" - No blockchain match found`);
      });
      
    } catch (backendError) {
      console.error('❌ Backend connection failed:', backendError.message);
      console.log('   Make sure backend is running: cd backend && npm run dev');
    }
    
    // 4. Check users table for creator mapping
    console.log('\n4️⃣ Checking user-creator mapping...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, wallet_address, role, created_at')
      .eq('role', 'creator')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError.message);
    } else {
      console.log(`Found ${users.length} recent creators:`);
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.wallet_address} (ID: ${user.id})`);
        console.log(`      Created: ${new Date(user.created_at).toLocaleString()}`);
      });
    }
    
    // 5. Analyze the issue
    console.log('\n5️⃣ Issue Analysis:');
    console.log('==================');
    
    const surveysWithoutTxHash = recentSurveys.filter(s => !s.blockchain_tx_hash);
    const surveysWithTxHash = recentSurveys.filter(s => s.blockchain_tx_hash);
    
    console.log(`📊 Surveys without TX hash: ${surveysWithoutTxHash.length}/${recentSurveys.length}`);
    console.log(`📊 Surveys with TX hash: ${surveysWithTxHash.length}/${recentSurveys.length}`);
    
    if (surveysWithoutTxHash.length > 0) {
      console.log('\n🔍 Possible causes for missing TX hashes:');
      console.log('1. Survey creation is happening in Supabase but failing on blockchain');
      console.log('2. Blockchain transaction succeeds but TX hash is not being saved to Supabase');
      console.log('3. There\'s an error in the survey creation flow in postStore.js');
      console.log('4. The createSurvey function in supabaseService.js is not receiving the TX hash');
      
      console.log('\n💡 Recommendations:');
      console.log('1. Check browser console logs during survey creation');
      console.log('2. Verify the postStore.js createSurvey function is passing blockchain_tx_hash');
      console.log('3. Check if supabaseService.createSurvey is properly handling the TX hash');
      console.log('4. Ensure the surveys table has a blockchain_tx_hash column');
    }
    
    // 6. Check table schema
    console.log('\n6️⃣ Checking surveys table schema...');
    try {
      const { data: schemaData, error: schemaError } = await supabase
        .from('surveys')
        .select('*')
        .limit(1);
      
      if (!schemaError && schemaData.length > 0) {
        const columns = Object.keys(schemaData[0]);
        console.log('Available columns:', columns.join(', '));
        
        if (!columns.includes('blockchain_tx_hash')) {
          console.log('❌ ISSUE FOUND: blockchain_tx_hash column is missing from surveys table!');
          console.log('   This explains why TX hashes are not being saved.');
          console.log('   You need to add this column to your Supabase table.');
        } else {
          console.log('✅ blockchain_tx_hash column exists in surveys table');
        }
      }
    } catch (schemaError) {
      console.error('❌ Error checking schema:', schemaError.message);
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

// Run the debug
debugSurveyCreation();