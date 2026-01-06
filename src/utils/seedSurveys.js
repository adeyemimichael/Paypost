import { supabaseService } from '../services/supabaseService.js';

// Sample survey data with 6 questions each
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

export async function seedSurveys() {
  try {
    console.log('🌱 Starting survey seeding process...');
    
    // Initialize Supabase service
    const initialized = await supabaseService.initialize();
    if (!initialized) {
      throw new Error('Failed to initialize Supabase service');
    }

    // Create a default creator user if needed
    const defaultCreator = await supabaseService.getOrCreateUser(
      '0x1234567890abcdef1234567890abcdef12345678',
      'creator@paypost.xyz',
      'creator',
      'PayPost Team'
    );

    if (!defaultCreator) {
      throw new Error('Failed to create default creator user');
    }

    console.log('✅ Default creator user ready:', defaultCreator.id);

    // Create each survey
    for (let i = 0; i < sampleSurveys.length; i++) {
      const surveyData = sampleSurveys[i];
      
      try {
        console.log(`📝 Creating survey ${i + 1}: ${surveyData.title}`);
        
        // Create the survey
        const survey = await supabaseService.createSurvey({
          ...surveyData,
          creatorId: defaultCreator.id
        });

        if (survey) {
          // Create the questions for this survey
          await supabaseService.createSurveyQuestions(survey.id, surveyData.questions);
          console.log(`✅ Survey ${i + 1} created with ${surveyData.questions.length} questions`);
        }
        
        // Small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`❌ Failed to create survey ${i + 1}:`, error);
      }
    }

    console.log('🎉 Survey seeding completed!');
    return true;
    
  } catch (error) {
    console.error('❌ Survey seeding failed:', error);
    return false;
  }
}

// Export individual surveys for testing
export { sampleSurveys };