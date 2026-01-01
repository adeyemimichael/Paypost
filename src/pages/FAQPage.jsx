import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  HelpCircle,
  Coins,
  Shield,
  Users,
  Settings,
  MessageCircle
} from 'lucide-react';
import { fadeIn, slideUp } from '../animations/fadeIn';
import Button from '../components/Button';

const FAQPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [openItems, setOpenItems] = useState(new Set());

  const categories = [
    { id: 'all', label: 'All Questions', icon: <HelpCircle className="w-5 h-5" /> },
    { id: 'getting-started', label: 'Getting Started', icon: <Users className="w-5 h-5" /> },
    { id: 'earnings', label: 'Earnings & Payments', icon: <Coins className="w-5 h-5" /> },
    { id: 'privacy', label: 'Privacy & Security', icon: <Shield className="w-5 h-5" /> },
    { id: 'technical', label: 'Technical', icon: <Settings className="w-5 h-5" /> },
    { id: 'creators', label: 'For Creators', icon: <MessageCircle className="w-5 h-5" /> }
  ];

  const faqs = [
    // Getting Started
    {
      category: 'getting-started',
      question: 'How do I get started on PayPost?',
      answer: 'Getting started is simple! Click "Get Started" on our homepage, choose whether you want to be a participant (earn by taking surveys) or creator (create surveys), then sign up with your email, Google, or Twitter account. We\'ll automatically create a secure wallet for you - no crypto knowledge needed!'
    },
    {
      category: 'getting-started',
      question: 'Do I need to know about cryptocurrency?',
      answer: 'Not at all! PayPost is designed for everyone. We handle all the blockchain complexity behind the scenes. You just need to sign up, complete surveys, and earn rewards. Your wallet is created automatically and managed securely.'
    },
    {
      category: 'getting-started',
      question: 'What\'s the difference between participants and creators?',
      answer: 'Participants earn MOVE tokens by completing surveys and polls created by others. Creators are researchers, businesses, or individuals who create surveys to gather insights and pay participants for their responses. You can apply to become a creator after signing up as a participant.'
    },
    {
      category: 'getting-started',
      question: 'Is PayPost free to use?',
      answer: 'Yes! Signing up and participating in surveys is completely free. Participants never pay any fees. Creators pay a small 2.5% platform fee when funding surveys, which covers infrastructure, security, and development costs.'
    },

    // Earnings & Payments
    {
      category: 'earnings',
      question: 'How much can I earn on PayPost?',
      answer: 'Earnings vary based on survey length, complexity, and your participation level. Most surveys pay between 0.1-2 MOVE tokens (roughly $0.10-$2.00). Active users typically earn $20-100 per month. High-quality responses can unlock bonus multipliers and premium surveys with higher rewards.'
    },
    {
      category: 'earnings',
      question: 'When do I get paid?',
      answer: 'You get paid instantly! As soon as you complete a survey, MOVE tokens are automatically transferred to your wallet. There are no waiting periods, minimum payouts, or processing delays.'
    },
    {
      category: 'earnings',
      question: 'How do I withdraw my earnings?',
      answer: 'Your MOVE tokens are already in your wallet and ready to use. You can exchange them for other cryptocurrencies or fiat currency on supported exchanges like Coinbase, Binance, or other platforms that list MOVE tokens. We\'re also working on direct fiat withdrawal options.'
    },
    {
      category: 'earnings',
      question: 'What determines how much a survey pays?',
      answer: 'Survey rewards are set by creators based on factors like survey length, complexity, target audience, and budget. Longer surveys typically pay more. Our platform also uses quality scoring - participants who consistently provide thoughtful responses may receive bonus multipliers.'
    },
    {
      category: 'earnings',
      question: 'Can I complete the same survey multiple times?',
      answer: 'No, each survey can only be completed once per participant. This ensures data quality and prevents spam. However, some creators may create follow-up surveys or longitudinal studies where you can participate multiple times.'
    },

    // Privacy & Security
    {
      category: 'privacy',
      question: 'Is my personal data safe?',
      answer: 'Absolutely! We use zero-knowledge proofs and advanced encryption to protect your privacy. Your survey responses are anonymous and cannot be traced back to your identity. We never sell personal data and comply with GDPR, CCPA, and other privacy regulations.'
    },
    {
      category: 'privacy',
      question: 'Can creators see who completed their surveys?',
      answer: 'No, all responses are completely anonymous. Creators can see aggregate data and individual responses, but cannot identify which participant provided which answers. This ensures honest feedback and protects participant privacy.'
    },
    {
      category: 'privacy',
      question: 'What data do you collect?',
      answer: 'We only collect data necessary for platform functionality: email for account creation, wallet address for payments, and survey responses. We use minimal analytics to improve the platform. You can request data deletion at any time through your account settings.'
    },
    {
      category: 'privacy',
      question: 'How secure is my wallet?',
      answer: 'Your wallet uses bank-level security with multi-layer encryption. Private keys are stored securely and never shared. We use Privy\'s embedded wallet technology, which is audited and trusted by major Web3 companies. You can also connect external wallets if preferred.'
    },

    // Technical
    {
      category: 'technical',
      question: 'What blockchain does PayPost use?',
      answer: 'PayPost is built on Movement, a high-performance blockchain that offers fast transactions and low fees. Movement is compatible with Ethereum tools while providing better scalability and user experience.'
    },
    {
      category: 'technical',
      question: 'What if I lose access to my account?',
      answer: 'You can recover your account using your email address. For embedded wallets, we provide secure recovery options. If you\'re using an external wallet, you\'ll need your wallet\'s recovery phrase. Contact support if you need help with account recovery.'
    },
    {
      category: 'technical',
      question: 'Can I use PayPost on mobile?',
      answer: 'Yes! PayPost is fully responsive and works great on mobile browsers. We\'re also developing native mobile apps for iOS and Android, which will be available soon.'
    },
    {
      category: 'technical',
      question: 'What if a transaction fails?',
      answer: 'Transaction failures are rare but can happen due to network congestion. If a survey completion fails, you can retry without losing your progress. If payment fails, our smart contract will automatically retry. Contact support if you experience persistent issues.'
    },

    // For Creators
    {
      category: 'creators',
      question: 'How do I become a creator?',
      answer: 'Apply through our creator application form. We review applications based on research experience, goals, and quality standards. The process typically takes 24-48 hours. We look for researchers, businesses, students, and anyone with legitimate research needs.'
    },
    {
      category: 'creators',
      question: 'How much does it cost to create a survey?',
      answer: 'Survey costs depend on your reward amount and number of responses. For example, a survey paying 0.5 MOVE per response for 100 responses costs 50 MOVE plus a 2.5% platform fee (1.25 MOVE). Our survey builder includes a real-time cost calculator.'
    },
    {
      category: 'creators',
      question: 'What types of surveys can I create?',
      answer: 'You can create various survey types: market research, academic studies, product feedback, opinion polls, and more. We support multiple question formats including multiple choice, rating scales, text responses, and checkboxes. Content must comply with our community guidelines.'
    },
    {
      category: 'creators',
      question: 'How do I ensure quality responses?',
      answer: 'PayPost includes several quality features: participant scoring systems, attention check questions, response time analysis, and the ability to set qualification criteria. Our AI also helps match surveys with engaged, relevant participants.'
    },
    {
      category: 'creators',
      question: 'Can I edit or delete surveys after publishing?',
      answer: 'You can edit survey details before it goes live. Once participants start responding, major changes aren\'t allowed to maintain data integrity. You can close surveys early and get refunds for unused funds. Contact support for special circumstances.'
    }
  ];

  const toggleItem = (index) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = searchTerm === '' || 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      {/* Hero Section */}
      <motion.section {...fadeIn} className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1 
            {...slideUp}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6"
          >
            Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-movement-600 to-purple-600">Questions</span>
          </motion.h1>
          <motion.p 
            {...slideUp}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto"
          >
            Find answers to common questions about PayPost. Can't find what you're looking for? 
            Contact our support team.
          </motion.p>
          
          {/* Search Bar */}
          <motion.div 
            {...slideUp}
            transition={{ delay: 0.4 }}
            className="relative max-w-2xl mx-auto"
          >
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-movement-500 focus:border-transparent"
            />
          </motion.div>
        </div>
      </motion.section>

      {/* Categories */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category, index) => (
              <motion.button
                key={category.id}
                {...fadeIn}
                transition={{ delay: index * 0.1 }}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeCategory === category.id
                    ? 'bg-gradient-to-r from-movement-600 to-purple-600 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }`}
              >
                {category.icon}
                <span>{category.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Items */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {filteredFAQs.length === 0 ? (
            <motion.div {...fadeIn} className="text-center py-12">
              <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No questions found
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Try adjusting your search or category filter
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {filteredFAQs.map((faq, index) => (
                <motion.div
                  key={index}
                  {...fadeIn}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  <button
                    onClick={() => toggleItem(index)}
                    className="w-full px-6 py-6 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white pr-4">
                      {faq.question}
                    </h3>
                    <div className="flex-shrink-0">
                      {openItems.has(index) ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                  </button>
                  
                  <AnimatePresence>
                    {openItems.has(index) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 text-gray-600 dark:text-gray-300 leading-relaxed">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact Support Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-movement-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div {...fadeIn}>
            <h2 className="text-3xl font-bold text-white mb-6">
              Still Have Questions?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Our support team is here to help. Get personalized assistance with any questions 
              about PayPost.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="secondary" 
                size="lg"
                className="bg-white text-movement-600 hover:bg-gray-100"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Contact Support
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-white text-white hover:bg-white hover:text-movement-600"
              >
                Join Community Discord
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default FAQPage;