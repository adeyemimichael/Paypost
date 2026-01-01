import { motion } from 'framer-motion';
import { 
  UserPlus, 
  Search, 
  FileText, 
  Coins, 
  Shield, 
  Zap,
  CheckCircle,
  ArrowRight,
  Play,
  Users,
  BarChart3,
  Wallet
} from 'lucide-react';
import { fadeIn, slideUp } from '../animations/fadeIn';
import Button from '../components/Button';

const HowItWorksPage = () => {
  const participantSteps = [
    {
      step: 1,
      icon: <UserPlus className="w-8 h-8" />,
      title: 'Sign Up & Connect Wallet',
      description: 'Create your account with just an email. We\'ll create a secure wallet for you automatically - no crypto knowledge needed!',
      details: [
        'Email, Google, or Twitter login',
        'Automatic wallet creation',
        'No seed phrases to remember',
        'Bank-level security'
      ]
    },
    {
      step: 2,
      icon: <Search className="w-8 h-8" />,
      title: 'Browse & Discover Surveys',
      description: 'Explore surveys that match your interests. Our AI algorithm shows you the most relevant opportunities.',
      details: [
        'Personalized recommendations',
        'Filter by reward amount',
        'See time estimates',
        'Preview survey topics'
      ]
    },
    {
      step: 3,
      icon: <FileText className="w-8 h-8" />,
      title: 'Complete Surveys',
      description: 'Answer questions honestly and thoughtfully. Quality responses earn higher rewards and unlock bonus opportunities.',
      details: [
        'Multiple question types',
        'Progress tracking',
        'Save and resume later',
        'Quality scoring system'
      ]
    },
    {
      step: 4,
      icon: <Coins className="w-8 h-8" />,
      title: 'Earn MOVE Tokens',
      description: 'Get paid instantly upon completion. Your MOVE tokens are automatically added to your wallet.',
      details: [
        'Instant payments',
        'No minimum withdrawal',
        'Track your earnings',
        'Bonus multipliers available'
      ]
    }
  ];

  const creatorSteps = [
    {
      step: 1,
      icon: <UserPlus className="w-8 h-8" />,
      title: 'Apply as Creator',
      description: 'Submit your creator application with your research background and goals. We review applications within 48 hours.',
      details: [
        'Simple application form',
        'Portfolio submission',
        'Experience verification',
        'Fast approval process'
      ]
    },
    {
      step: 2,
      icon: <FileText className="w-8 h-8" />,
      title: 'Create Your Survey',
      description: 'Use our intuitive survey builder to create engaging questionnaires. Set rewards and target audience.',
      details: [
        'Drag-and-drop builder',
        'Multiple question types',
        'Audience targeting',
        'Reward calculator'
      ]
    },
    {
      step: 3,
      icon: <Wallet className="w-8 h-8" />,
      title: 'Fund Your Survey',
      description: 'Add MOVE tokens to fund participant rewards. Our smart contract holds funds securely until completion.',
      details: [
        'Secure escrow system',
        'Transparent pricing',
        'Automatic distribution',
        'Refund unused funds'
      ]
    },
    {
      step: 4,
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Analyze Results',
      description: 'Get real-time analytics as responses come in. Export data and gain valuable insights.',
      details: [
        'Real-time dashboard',
        'Response analytics',
        'Data export options',
        'Quality metrics'
      ]
    }
  ];

  const features = [
    {
      icon: <Shield className="w-12 h-12 text-blue-500" />,
      title: 'Zero-Knowledge Privacy',
      description: 'Your personal data stays private while still enabling reward verification.',
      benefits: ['Anonymous responses', 'Encrypted data', 'GDPR compliant', 'No data selling']
    },
    {
      icon: <Zap className="w-12 h-12 text-yellow-500" />,
      title: 'Instant Payments',
      description: 'Get paid immediately when you complete a survey - no waiting periods.',
      benefits: ['Real-time transfers', 'No minimum payout', 'Low gas fees', 'Transparent costs']
    },
    {
      icon: <Users className="w-12 h-12 text-green-500" />,
      title: 'Quality Matching',
      description: 'AI-powered algorithm matches you with surveys that fit your profile.',
      benefits: ['Higher earnings', 'Relevant content', 'Better completion rates', 'Bonus opportunities']
    }
  ];

  const faqs = [
    {
      question: 'How much can I earn?',
      answer: 'Earnings vary by survey length and complexity. Most surveys pay 0.1-2 MOVE tokens (roughly $0.10-$2.00). Active users typically earn $20-100 per month.'
    },
    {
      question: 'Is my data safe?',
      answer: 'Yes! We use zero-knowledge proofs to protect your privacy. Your responses are anonymous and encrypted. We never sell personal data.'
    },
    {
      question: 'How do I withdraw my earnings?',
      answer: 'Your MOVE tokens are automatically in your wallet. You can exchange them for other cryptocurrencies or fiat currency on supported exchanges.'
    },
    {
      question: 'What if I don\'t finish a survey?',
      answer: 'No problem! You can save your progress and return later. You only get paid when you complete the entire survey.'
    },
    {
      question: 'How do I become a creator?',
      answer: 'Apply through our creator application form. We review applications based on research experience, goals, and quality standards.'
    },
    {
      question: 'What are the fees?',
      answer: 'Participants pay no fees. Creators pay a 2.5% platform fee on survey funding, which covers infrastructure and security costs.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      {/* Hero Section */}
      <motion.section {...fadeIn} className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1 
            {...slideUp}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6"
          >
            How <span className="text-transparent bg-clip-text bg-gradient-to-r from-movement-600 to-purple-600">PayPost</span> Works
          </motion.h1>
          <motion.p 
            {...slideUp}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto"
          >
            Simple, secure, and rewarding. Learn how PayPost connects researchers with participants 
            for fair, transparent market research.
          </motion.p>
          
          <motion.div 
            {...slideUp}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button size="lg" className="bg-gradient-to-r from-movement-600 to-purple-600">
              <Play className="w-5 h-5 mr-2" />
              Watch Demo Video
            </Button>
            <Button variant="outline" size="lg">
              Start Earning Now
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* For Participants Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              For Survey Participants
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Earn MOVE tokens by sharing your opinions. It's that simple.
            </p>
          </motion.div>
          
          <div className="grid lg:grid-cols-4 gap-8">
            {participantSteps.map((step, index) => (
              <motion.div
                key={step.step}
                {...fadeIn}
                transition={{ delay: index * 0.2 }}
                className="relative"
              >
                {/* Arrow between steps */}
                {index < participantSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 -right-4 z-10">
                    <ArrowRight className="w-8 h-8 text-movement-400" />
                  </div>
                )}
                
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 h-full">
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-movement-500 to-purple-500 rounded-2xl mb-6 mx-auto">
                    <div className="text-white">
                      {step.icon}
                    </div>
                  </div>
                  
                  <div className="text-center mb-4">
                    <div className="text-sm font-semibold text-movement-600 dark:text-movement-400 mb-2">
                      STEP {step.step}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {step.description}
                    </p>
                  </div>
                  
                  <ul className="space-y-2">
                    {step.details.map((detail, i) => (
                      <li key={i} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* For Creators Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              For Survey Creators
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Get quality insights from engaged participants. No intermediaries, fair pricing.
            </p>
          </motion.div>
          
          <div className="grid lg:grid-cols-4 gap-8">
            {creatorSteps.map((step, index) => (
              <motion.div
                key={step.step}
                {...fadeIn}
                transition={{ delay: index * 0.2 }}
                className="relative"
              >
                {/* Arrow between steps */}
                {index < creatorSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 -right-4 z-10">
                    <ArrowRight className="w-8 h-8 text-purple-400" />
                  </div>
                )}
                
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 h-full">
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mb-6 mx-auto">
                    <div className="text-white">
                      {step.icon}
                    </div>
                  </div>
                  
                  <div className="text-center mb-4">
                    <div className="text-sm font-semibold text-purple-600 dark:text-purple-400 mb-2">
                      STEP {step.step}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {step.description}
                    </p>
                  </div>
                  
                  <ul className="space-y-2">
                    {step.details.map((detail, i) => (
                      <li key={i} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Why PayPost is Different
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Advanced technology meets user-friendly design for the best survey experience
            </p>
          </motion.div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                {...fadeIn}
                transition={{ delay: index * 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 text-center"
              >
                <div className="flex justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {feature.description}
                </p>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Everything you need to know about PayPost
            </p>
          </motion.div>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                {...fadeIn}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-movement-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div {...fadeIn}>
            <h2 className="text-3xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of users already earning and creating on PayPost
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="secondary" 
                size="lg"
                className="bg-white text-movement-600 hover:bg-gray-100"
              >
                Start as Participant
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-white text-white hover:bg-white hover:text-movement-600"
              >
                Apply as Creator
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorksPage;