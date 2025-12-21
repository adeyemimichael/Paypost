import { create } from 'zustand';
import { movementService } from '../services/movementService';

// Mock data for hybrid survey and post system
const MOCK_POSTS = [
  {
    id: '1',
    title: 'Web3 Gaming Survey - Earn 0.5 MOVE',
    preview: 'Share your thoughts on blockchain gaming and earn rewards! Complete this 5-minute survey about your gaming preferences...',
    content: 'Thank you for participating! This survey helps us understand the Web3 gaming landscape.',
    author: 'GameFi Research',
    authorAddress: '0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4',
    reward: 0.5,
    type: 'survey',
    estimatedTime: 5,
    responses: 234,
    maxResponses: 1000,
    isActive: true,
    timestamp: Date.now() - 3600000,
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400',
    questions: [
      {
        id: 1,
        type: 'multiple-choice',
        question: 'How often do you play blockchain games?',
        options: ['Daily', 'Weekly', 'Monthly', 'Rarely', 'Never']
      },
      {
        id: 2,
        type: 'rating',
        question: 'Rate your interest in play-to-earn mechanics (1-5)',
        min: 1,
        max: 5
      },
      {
        id: 3,
        type: 'text',
        question: 'What features would you like to see in future Web3 games?'
      }
    ]
  },
  {
    id: '2',
    title: 'DeFi User Experience Study - Earn 0.3 MOVE',
    preview: 'Help improve DeFi platforms by sharing your experience. Quick 3-minute survey about DeFi usage patterns...',
    content: 'Your feedback is valuable! This research helps build better DeFi experiences.',
    author: 'DeFi Labs',
    authorAddress: '0x8ba1f109551bD432803012645Hac136c0532925a3',
    reward: 0.3,
    type: 'survey',
    estimatedTime: 3,
    responses: 156,
    maxResponses: 500,
    isActive: true,
    timestamp: Date.now() - 7200000,
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400',
    questions: [
      {
        id: 1,
        type: 'multiple-choice',
        question: 'Which DeFi protocols do you use most?',
        options: ['Uniswap', 'Aave', 'Compound', 'Curve', 'Other']
      },
      {
        id: 2,
        type: 'checkbox',
        question: 'What challenges do you face with DeFi? (Select all)',
        options: ['High gas fees', 'Complex UI', 'Security concerns', 'Lack of education']
      }
    ]
  },
  {
    id: '3',
    title: 'Community Poll: Favorite Blockchain - Earn 0.1 MOVE',
    preview: 'Quick poll about blockchain preferences. Takes 30 seconds, earn rewards instantly...',
    content: 'Thanks for voting! Community engagement helps shape the future.',
    author: 'Crypto Community',
    authorAddress: '0x9cb2f109551bD432803012645Hac136c0532925a4',
    reward: 0.1,
    type: 'poll',
    estimatedTime: 1,
    responses: 892,
    maxResponses: 2000,
    isActive: true,
    timestamp: Date.now() - 10800000,
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400',
    questions: [
      {
        id: 1,
        type: 'multiple-choice',
        question: 'Which blockchain do you prefer for DeFi?',
        options: ['Ethereum', 'Movement', 'Solana', 'Polygon', 'Arbitrum']
      }
    ]
  },
  {
    id: '4',
    title: 'Product Feedback: Mobile Wallet UX - Earn 0.4 MOVE',
    preview: 'Share your mobile wallet experience and help improve user interfaces. 4-minute survey with instant rewards...',
    content: 'Your insights drive better wallet experiences for everyone!',
    author: 'UX Research Team',
    authorAddress: '0x7cb2f109551bD432803012645Hac136c0532925a5',
    reward: 0.4,
    type: 'survey',
    estimatedTime: 4,
    responses: 67,
    maxResponses: 300,
    isActive: true,
    timestamp: Date.now() - 14400000,
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400',
    questions: [
      {
        id: 1,
        type: 'rating',
        question: 'Rate your current mobile wallet experience (1-5)',
        min: 1,
        max: 5
      },
      {
        id: 2,
        type: 'multiple-choice',
        question: 'What\'s most important in a mobile wallet?',
        options: ['Security', 'Speed', 'User Interface', 'Features', 'Support']
      },
      {
        id: 3,
        type: 'text',
        question: 'What feature would you add to your ideal mobile wallet?'
      }
    ]
  },
  // Premium Posts - Pay to unlock content
  {
    id: '5',
    title: 'Exclusive: Movement Blockchain Technical Deep Dive',
    preview: 'Get insider access to Movement\'s architecture, consensus mechanism, and upcoming features. This premium content includes...',
    content: 'FULL EXCLUSIVE CONTENT: Movement blockchain represents a significant advancement in Layer 1 technology. Built with a novel consensus mechanism that combines the security of Proof of Stake with the efficiency of practical Byzantine Fault Tolerance, Movement achieves transaction finality in under 2 seconds while maintaining decentralization. The architecture features a modular design where execution, consensus, and data availability layers can be upgraded independently. Key innovations include: 1) Parallel transaction processing using optimistic execution, 2) Dynamic validator selection based on stake and performance metrics, 3) Built-in MEV protection through encrypted mempools, 4) Native cross-chain communication protocols. Upcoming features in Q1 2024 include zkEVM compatibility, account abstraction, and gasless transactions for specific use cases. The economic model incentivizes long-term holding through staking rewards that increase with lock-up duration, while transaction fees are burned to create deflationary pressure. Developer tools include a comprehensive SDK, testing framework, and deployment automation. Enterprise partnerships are being established with major DeFi protocols and institutional trading firms.',
    author: 'Movement Core Team',
    authorAddress: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef12',
    price: 0.25,
    type: 'premium-post',
    isPremium: true,
    timestamp: Date.now() - 1800000,
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400',
    readTime: 8,
    category: 'Technical Analysis'
  },
  {
    id: '6',
    title: 'DeFi Alpha: Next 100x Opportunities',
    preview: 'Discover the hidden gems in DeFi that institutional investors are quietly accumulating. This premium research report covers...',
    content: 'PREMIUM RESEARCH REPORT: After analyzing over 500 DeFi protocols and conducting extensive due diligence, we\'ve identified 12 projects with 10-100x potential over the next 18 months. Key findings: 1) Real World Asset (RWA) tokenization protocols are seeing massive institutional adoption, with $2.3B in assets tokenized in Q4 2023 alone. Top picks: Centrifuge (CFG), Maple Finance (MPL), and TrueFi (TRU). 2) Cross-chain infrastructure plays are benefiting from multi-chain adoption. LayerZero (ZRO) and Axelar (AXL) have seen 400% growth in transaction volume. 3) Decentralized derivatives platforms are capturing market share from centralized exchanges. dYdX v4, GMX v2, and Gains Network show strong fundamentals. 4) Liquid staking derivatives beyond Ethereum are undervalued. Marinade Finance (MNDE) on Solana and Stride (STRD) on Cosmos offer compelling risk-adjusted returns. 5) Privacy-focused DeFi protocols are gaining traction as regulatory scrutiny increases. Aztec Network and Penumbra represent the future of private DeFi. Portfolio allocation recommendations: 40% established protocols (Uniswap, Aave, Compound), 35% emerging leaders (the 12 identified opportunities), 25% speculative high-risk/high-reward plays. Risk management strategies and entry/exit points included.',
    author: 'DeFi Research Pro',
    authorAddress: '0x2b3c4d5e6f7890abcdef1234567890abcdef1234',
    price: 0.5,
    type: 'premium-post',
    isPremium: true,
    timestamp: Date.now() - 3600000,
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400',
    readTime: 12,
    category: 'Investment Research'
  },
  {
    id: '7',
    title: 'Free: Getting Started with Web3 Development',
    preview: 'A comprehensive beginner\'s guide to Web3 development. Learn the fundamentals of blockchain programming, smart contracts, and dApp development...',
    content: 'Welcome to Web3 development! This free guide covers everything you need to know to start building on blockchain. Topics include: Setting up your development environment, understanding blockchain fundamentals, writing your first smart contract, connecting frontend to blockchain, best practices for security, and deployment strategies. Perfect for developers transitioning from Web2 to Web3.',
    author: 'Web3 Academy',
    authorAddress: '0x3c4d5e6f7890abcdef1234567890abcdef123456',
    price: 0,
    type: 'free-post',
    isPremium: false,
    timestamp: Date.now() - 7200000,
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400',
    readTime: 6,
    category: 'Education'
  },
  {
    id: '8',
    title: 'Premium: NFT Market Analysis & Predictions 2024',
    preview: 'Exclusive insights into the NFT market trends, upcoming collections, and investment strategies for 2024. Based on data from 50+ marketplaces...',
    content: 'EXCLUSIVE NFT MARKET REPORT 2024: The NFT landscape is evolving rapidly, with several key trends shaping the market. 1) Utility-driven NFTs are outperforming art collections by 300% in terms of floor price stability. Projects like Bored Ape Yacht Club, CryptoPunks, and Azuki maintain strong communities but face headwinds. 2) Gaming NFTs represent the fastest-growing segment, with play-to-earn mechanics driving adoption. Axie Infinity, The Sandbox, and Decentraland lead the space. 3) Music NFTs are gaining traction as artists seek direct fan monetization. Royal, Catalog, and Sound.xyz show promising growth. 4) Fractionalized NFTs enable broader participation in high-value assets. Fractional.art and NFTX lead this trend. 5) Cross-chain NFTs are becoming standard as users demand flexibility. Ethereum dominance is declining as Solana, Polygon, and other chains gain market share. Investment thesis: Focus on utility over speculation, prioritize strong communities, and diversify across chains and categories. Specific recommendations include 15 collections with detailed analysis, risk assessment, and price targets. Market predictions: Total NFT market cap to reach $80B by end of 2024, driven by mainstream adoption and institutional investment.',
    author: 'NFT Analytics',
    authorAddress: '0x4d5e6f7890abcdef1234567890abcdef12345678',
    price: 0.35,
    type: 'premium-post',
    isPremium: true,
    timestamp: Date.now() - 5400000,
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400',
    readTime: 10,
    category: 'Market Analysis'
  }
];

export const usePostStore = create((set, get) => ({
  posts: MOCK_POSTS,
  completedSurveys: new Set(),
  unlockedPosts: new Set(),
  userResponses: {},
  userEarnings: 0,
  isLoading: false,
  
  setPosts: (posts) => set({ posts }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  completeSurvey: async (postId, responses, walletAddress) => {
    const { posts, completedSurveys } = get();
    const post = posts.find(p => p.id === postId);
    
    if (!post) throw new Error('Survey not found');
    if (completedSurveys.has(postId)) throw new Error('Survey already completed');
    if (!post.isActive) throw new Error('Survey is no longer active');
    
    set({ isLoading: true });
    
    try {
      const result = await movementService.completeSurvey(postId, post.reward, walletAddress, responses);
      
      if (result.success) {
        const newCompletedSurveys = new Set(completedSurveys);
        newCompletedSurveys.add(postId);
        
        const { userResponses, userEarnings } = get();
        const newUserResponses = { ...userResponses, [postId]: responses };
        const newEarnings = userEarnings + post.reward;
        
        // Update post response count
        const updatedPosts = posts.map(p => 
          p.id === postId ? { ...p, responses: p.responses + 1 } : p
        );
        
        set({ 
          completedSurveys: newCompletedSurveys, 
          userResponses: newUserResponses,
          userEarnings: newEarnings,
          posts: updatedPosts,
          isLoading: false 
        });
        return result;
      }
      
      throw new Error('Transaction failed');
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  unlockPost: async (postId, walletAddress) => {
    const { posts, unlockedPosts } = get();
    const post = posts.find(p => p.id === postId);
    
    if (!post) throw new Error('Post not found');
    if (unlockedPosts.has(postId)) throw new Error('Post already unlocked');
    if (!post.isPremium) throw new Error('Post is free');
    
    set({ isLoading: true });
    
    try {
      const result = await movementService.unlockPost(postId, post.price, walletAddress);
      
      if (result.success) {
        const newUnlockedPosts = new Set(unlockedPosts);
        newUnlockedPosts.add(postId);
        
        set({ 
          unlockedPosts: newUnlockedPosts,
          isLoading: false 
        });
        return result;
      }
      
      throw new Error('Transaction failed');
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  
  tipCreator: async (creatorAddress, amount, walletAddress) => {
    set({ isLoading: true });
    
    try {
      const result = await movementService.tipCreator(creatorAddress, amount, walletAddress);
      
      if (result.success) {
        const { userEarnings } = get();
        const newEarnings = Math.max(0, userEarnings - amount); // Deduct tip from earnings
        set({ userEarnings: newEarnings, isLoading: false });
      } else {
        set({ isLoading: false });
      }
      
      return result;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  
  checkSurveyCompletion: async (postId, walletAddress) => {
    if (!walletAddress) return false;
    
    const { completedSurveys } = get();
    if (completedSurveys.has(postId)) return true;
    
    try {
      const hasCompleted = await movementService.hasSurveyCompleted(postId, walletAddress);
      if (hasCompleted) {
        const newCompletedSurveys = new Set(completedSurveys);
        newCompletedSurveys.add(postId);
        set({ completedSurveys: newCompletedSurveys });
      }
      return hasCompleted;
    } catch (error) {
      console.error('Failed to check survey completion:', error);
      return false;
    }
  },

  checkPostAccess: async (postId, walletAddress) => {
    if (!walletAddress) return false;
    
    const { unlockedPosts } = get();
    if (unlockedPosts.has(postId)) return true;
    
    try {
      const hasAccess = await movementService.hasPostAccess(postId, walletAddress);
      if (hasAccess) {
        const newUnlockedPosts = new Set(unlockedPosts);
        newUnlockedPosts.add(postId);
        set({ unlockedPosts: newUnlockedPosts });
      }
      return hasAccess;
    } catch (error) {
      console.error('Failed to check post access:', error);
      return false;
    }
  },
  
  getPost: (postId) => {
    const { posts } = get();
    return posts.find(p => p.id === postId);
  },
  
  isSurveyCompleted: (postId) => {
    const { completedSurveys } = get();
    return completedSurveys.has(postId);
  },

  isPostUnlocked: (postId) => {
    const { unlockedPosts } = get();
    return unlockedPosts.has(postId);
  },
  
  getUserResponses: (postId) => {
    const { userResponses } = get();
    return userResponses[postId] || null;
  },
  
  getActiveSurveys: () => {
    const { posts } = get();
    return posts.filter(p => p.isActive && p.responses < p.maxResponses);
  },
  
  getUserStats: () => {
    const { completedSurveys, unlockedPosts, userEarnings, posts } = get();
    const availableSurveys = posts.filter(p => p.type === 'survey' || p.type === 'poll').filter(p => p.isActive && p.responses < p.maxResponses).length;
    const availablePosts = posts.filter(p => p.type === 'premium-post' || p.type === 'free-post').length;
    
    return {
      surveysCompleted: completedSurveys.size,
      postsUnlocked: unlockedPosts.size,
      totalEarnings: userEarnings,
      availableSurveys,
      availablePosts
    };
  },

  getSurveys: () => {
    const { posts } = get();
    return posts.filter(p => p.type === 'survey' || p.type === 'poll');
  },

  getPosts: () => {
    const { posts } = get();
    return posts.filter(p => p.type === 'premium-post' || p.type === 'free-post');
  },
}));