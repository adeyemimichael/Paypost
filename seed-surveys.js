#!/usr/bin/env node

// Simple script to seed sample surveys into Supabase
// Run with: node seed-surveys.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Sample survey data
const sampleSurveys = [
  {
    title: "Web3 Gaming Preferences Survey",
    description: "Help us understand what gamers want from blockchain-based games. Your insights will shape the future of Web3 gaming experiences.",
    category: "gaming",
    reward_amount: 2.5,
    max_responses: 150,
    estimated_time: 8,
    questions: [
      {
        text: "How often do you play video games?",
        type: "multiple-choice",
        options: ["Daily", "Several times a week", "Weekly", "Monthly", "Rarely"],
        required: true
      },
      {
        text: "What interests you most about blockchain gaming?",
        type: "multiple-choice", 
        options: ["True ownership of assets", "Play-to-earn mechanics", "Decentralized gameplay", "Community governance", "Cross-game compatibility"],
        required: true
      },
      {
        text: "Rate your experience with cryptocurrency (1-5 stars)",
        type: "rating",
        required: true
      },
      {
        text: "Which gaming genres do you prefer? (Select all that apply)",
        type: "checkbox",
        options: ["RPG", "Strategy", "Action", "Puzzle", "Sports", "Simulation"],
        required: true
      },
      {
        text: "What concerns do you have about Web3 gaming?",
        type: "text",
        required: false
      },
      {
        text: "How much would you spend monthly on in-game NFTs?",
        type: "multiple-choice",
        options: ["$0", "$1-25", "$26-50", "$51-100", "$100+"],
        required: true
      }
    ]
  },
  {
    title: "DeFi User Experience Research", 
    description: "Share your thoughts on decentralized finance platforms and help improve user experience across DeFi protocols.",
    category: "defi",
    reward_amount: 3.0,
    max_responses: 100,
    estimated_time: 10,
    questions: [
      {
        text: "How long have you been using DeFi protocols?",
        type: "multiple-choice",
        options: ["Less than 3 months", "3-6 months", "6-12 months", "1-2 years", "More than 2 years"],
        required: true
      },
      {
        text: "Which DeFi activities do you participate in? (Select all that apply)",
        type: "checkbox",
        options: ["Lending/Borrowing", "Yield Farming", "DEX Trading", "Staking", "Liquidity Providing", "NFT Trading"],
        required: true
      },
      {
        text: "Rate the importance of gas fees in your DeFi decisions (1-5 stars)",
        type: "rating",
        required: true
      },
      {
        text: "What's your biggest challenge with current DeFi platforms?",
        type: "text",
        required: true
      },
      {
        text: "How do you typically research new DeFi protocols?",
        type: "multiple-choice",
        options: ["Social media", "DeFi aggregators", "Community forums", "YouTube/tutorials", "Official documentation"],
        required: true
      },
      {
        text: "Rate your overall satisfaction with DeFi user interfaces (1-5 stars)",
        type: "rating",
        required: true
      }
    ]
  },
  {
    title: "NFT Marketplace Feedback Survey",
    description: "Help us understand NFT trading behaviors and preferences to build better marketplace experiences.",
    category: "nft", 
    reward_amount: 1.8,
    max_responses: 200,
    estimated_time: 6,
    questions: [
      {
        text: "How often do you buy or sell NFTs?",
        type: "multiple-choice",
        options: ["Daily", "Weekly", "Monthly", "Occasionally", "Never"],
        required: true
      },
      {
        text: "What types of NFTs interest you most? (Select all that apply)",
        type: "checkbox",
        options: ["Art", "Gaming items", "Music", "Sports collectibles", "Utility tokens", "Profile pictures"],
        required: true
      },
      {
        text: "Rate the importance of creator royalties (1-5 stars)",
        type: "rating",
        required: true
      },
      {
        text: "Which NFT marketplace do you use most frequently?",
        type: "multiple-choice",
        options: ["OpenSea", "Magic Eden", "Blur", "Foundation", "SuperRare", "Other"],
        required: true
      },
      {
        text: "What would make you more likely to purchase an NFT?",
        type: "text",
        required: false
      },
      {
        text: "How important is community engagement for NFT projects? (1-5 stars)",
        type: "rating",
        required: true
      }
    ]
  },
  {
    title: "Crypto Payment Adoption Study",
    description: "Research on cryptocurrency adoption for everyday payments and merchant acceptance.",
    category: "payments",
    reward_amount: 2.2,
    max_responses: 120,
    estimated_time: 7,
    questions: [
      {
        text: "Have you ever used cryptocurrency for purchases?",
        type: "multiple-choice",
        options: ["Yes, regularly", "Yes, occasionally", "Yes, but rarely", "No, but interested", "No, not interested"],
        required: true
      },
      {
        text: "What prevents you from using crypto for payments? (Select all that apply)",
        type: "checkbox",
        options: ["Volatility", "Limited merchant acceptance", "Transaction fees", "Complexity", "Regulatory concerns", "Security worries"],
        required: true
      },
      {
        text: "Rate your trust in crypto payment processors (1-5 stars)",
        type: "rating",
        required: true
      },
      {
        text: "Which cryptocurrencies would you prefer for payments?",
        type: "multiple-choice",
        options: ["Bitcoin", "Ethereum", "Stablecoins (USDC/USDT)", "Lightning Network", "Other altcoins"],
        required: true
      },
      {
        text: "What would encourage more crypto payment adoption?",
        type: "text",
        required: false
      },
      {
        text: "How important are instant settlements for crypto payments? (1-5 stars)",
        type: "rating",
        required: true
      }
    ]
  },
  {
    title: "Blockchain Developer Tools Survey",
    description: "Help improve developer experience in Web3 by sharing your thoughts on current blockchain development tools and infrastructure.",
    category: "development",
    reward_amount: 4.0,
    max_responses: 80,
    estimated_time: 12,
    questions: [
      {
        text: "What's your primary role in Web3 development?",
        type: "multiple-choice",
        options: ["Smart contract developer", "Frontend developer", "Full-stack developer", "DevOps/Infrastructure", "Product manager", "Other"],
        required: true
      },
      {
        text: "Which blockchain networks do you develop on? (Select all that apply)",
        type: "checkbox",
        options: ["Ethereum", "Polygon", "Solana", "Avalanche", "Arbitrum", "Optimism", "Other L2s"],
        required: true
      },
      {
        text: "Rate your satisfaction with current development tools (1-5 stars)",
        type: "rating",
        required: true
      },
      {
        text: "What's your biggest pain point in Web3 development?",
        type: "text",
        required: true
      },
      {
        text: "Which development framework do you prefer?",
        type: "multiple-choice",
        options: ["Hardhat", "Truffle", "Foundry", "Remix", "Anchor (Solana)", "Custom setup"],
        required: true
      },
      {
        text: "How important are testing tools for your workflow? (1-5 stars)",
        type: "rating",
        required: true
      }
    ]
  }
];

async function seedSurveys() {
  try {
    console.log('🌱 Starting survey seeding process...');
    
    // Test connection
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (testError) {
      throw new Error(`Supabase connection failed: ${testError.message}`);
    }
    
    console.log('✅ Supabase connection successful');

    // Create a default creator user
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', '0x1234567890abcdef1234567890abcdef12345678')
      .single();

    let defaultCreator = existingUser;
    
    if (!defaultCreator) {
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert([{
          wallet_address: '0x1234567890abcdef1234567890abcdef12345678',
          email: 'creator@paypost.xyz',
          role: 'creator',
          display_name: 'PayPost Team'
        }])
        .select()
        .single();

      if (userError) {
        throw new Error(`Failed to create default creator: ${userError.message}`);
      }
      
      defaultCreator = newUser;
    }

    console.log('✅ Default creator user ready:', defaultCreator.id);

    // Create each survey
    for (let i = 0; i < sampleSurveys.length; i++) {
      const surveyData = sampleSurveys[i];
      
      try {
        console.log(`📝 Creating survey ${i + 1}: ${surveyData.title}`);
        
        // Create the survey
        const { data: survey, error: surveyError } = await supabase
          .from('surveys')
          .insert([{
            title: surveyData.title,
            description: surveyData.description,
            category: surveyData.category,
            reward_amount: surveyData.reward_amount,
            max_responses: surveyData.max_responses,
            estimated_time: surveyData.estimated_time,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            creator_id: defaultCreator.id,
            is_active: true
          }])
          .select()
          .single();

        if (surveyError) {
          throw new Error(`Failed to create survey: ${surveyError.message}`);
        }

        // Create the questions for this survey
        const questionsData = surveyData.questions.map((question, index) => ({
          survey_id: survey.id,
          question_text: question.text,
          question_type: question.type,
          options: question.options ? JSON.stringify(question.options) : null,
          required: question.required !== false,
          order_index: index
        }));

        const { error: questionsError } = await supabase
          .from('survey_questions')
          .insert(questionsData);

        if (questionsError) {
          throw new Error(`Failed to create questions: ${questionsError.message}`);
        }

        console.log(`✅ Survey ${i + 1} created with ${surveyData.questions.length} questions`);
        
        // Small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`❌ Failed to create survey ${i + 1}:`, error.message);
      }
    }

    console.log('🎉 Survey seeding completed!');
    return true;
    
  } catch (error) {
    console.error('❌ Survey seeding failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 PayPost Survey Seeding Script');
  console.log('================================');
  
  const success = await seedSurveys();
  
  if (success) {
    console.log('\n✅ All done! Your Supabase database now has 5 sample surveys.');
    console.log('You can now test the PayPost app with real survey data.');
  } else {
    console.log('\n❌ Seeding failed. Check your Supabase configuration.');
    process.exit(1);
  }
}

main().catch(console.error);