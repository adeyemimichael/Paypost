import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Wallet, 
  Search, 
  CheckCircle, 
  Coins, 
  Users, 
  FileText,
  Gift,
  TrendingUp,
  Shield,
  Zap
} from 'lucide-react';
import { fadeIn, slideUp } from '../animations/fadeIn';
import Button from '../components/Button';
import Card from '../components/Card';

const HowItWorksPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const steps = [
    {
      id: 1,
      title: 'Connect Your Wallet',
      description: 'Sign up with just your email or social account. No complex wallet setup required.',
      icon: <Wallet className="w-8 h-8" />,
      details: [
        'One-click signup with email or Google',
        'Secure embedded wallet created automatically',
        'No seed phrases to remember',
        'Start earning immediately'
      ],
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 2,
      title: 'Browse & Discover',
      description: 'Explore surveys to earn rewards and premium posts to unlock valuable insights.',
      icon: <Search className="w-8 h-8" />,
      details: [
        'Browse available surveys and polls',
        'Discover premium content from experts',
        'Filter by category and reward amount',
        'Preview content before unlocking'
      ],
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 3,
      title: 'Participate & Earn',
      description: 'Complete surveys to earn MOVE tokens instantly. Your opinions have real value.',
      icon: <Gift className="w-8 h-8" />,
      details: [
        'Answer survey questions honestly',
        'Earn 0.1-1.0 MOVE per completion',
        'Instant rewards to your wallet',
        'Track your earnings in real-time'
      ],
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 4,
      title: 'Unlock Premium Content',
      description: 'Use your earned tokens to access exclusive insights and premium content.',
      icon: <FileText className="w-8 h-8" />,
      details: [
        'Pay 0.1-1.5 MOVE to unlock posts',
        'Access expert analysis and insights',
        'Keep content forever once unlocked',
        'Support quality content creators'
      ],
      color: 'from-orange-500 to-red-500'
    }
  ];

  const benefits = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Instant Rewards',
      description: 'Get paid immediately after completing surveys'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Secure & Private',
      description: 'Your data is protected with blockchain security'
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Growing Economy',
      description: 'Be part of the future of content monetization'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [steps.length]);

  useEffect(() => {
    setProgress(((activeStep + 1) / steps.length) * 100);
  }, [activeStep, steps.length]);

  const StepCard = ({ step, index, isActive }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: isActive ? 1 : 0.7, 
        y: 0,
        scale: isActive ? 1.02 : 1
      }}
      transition={{ duration: 0.3 }}
      className={`
        relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300
        ${isActive 
          ? 'border-movement-500 bg-white dark:bg-gray-800 shadow-lg' 
          : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 hover:border-gray-300'
        }
      `}
      onClick={() => setActiveStep(index)}
    >
      <div className="flex items-start space-x-4">
        <div className={`
          p-3 rounded-lg bg-gradient-to-r ${step.color} text-white
          ${isActive ? 'shadow-lg' : ''}
        `}>
          {step.icon}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <span className="text-sm font-medium text-movement-600 dark:text-movement-400 mr-2">
              Step {step.id}
            </span>
            {isActive && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-2 h-2 bg-movement-500 rounded-full"
              />
            )}
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {step.title}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
            {step.description}
          </p>
          
          {isActive && (
            <motion.ul
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-2"
            >
              {step.details.map((detail, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center text-sm text-gray-600 dark:text-gray-300"
                >
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  {detail}
                </motion.li>
              ))}
            </motion.ul>
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div {...fadeIn} className="mb-12">
          <Link 
            to="/" 
            className="inline-flex items-center text-movement-600 dark:text-movement-400 hover:text-movement-700 dark:hover:text-movement-300 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              How PayPost Works
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Join the Web3 revolution where your opinions earn rewards and quality content gets the recognition it deserves.
            </p>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <motion.div {...slideUp} className="mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Progress Through Steps
              </h3>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {Math.round(progress)}% Complete
              </span>
            </div>
            
            <div className="relative">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <motion.div
                  className="bg-gradient-to-r from-movement-500 to-movement-600 h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              
              <div className="flex justify-between mt-2">
                {steps.map((_, index) => (
                  <motion.div
                    key={index}
                    className={`
                      w-3 h-3 rounded-full transition-colors duration-300
                      ${index <= activeStep 
                        ? 'bg-movement-500' 
                        : 'bg-gray-300 dark:bg-gray-600'
                      }
                    `}
                    animate={{
                      scale: index === activeStep ? 1.2 : 1,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Steps */}
        <motion.div {...slideUp} transition={{ delay: 0.2 }} className="mb-16">
          <div className="grid gap-6">
            {steps.map((step, index) => (
              <StepCard
                key={step.id}
                step={step}
                index={index}
                isActive={activeStep === index}
              />
            ))}
          </div>
        </motion.div>

        {/* Benefits */}
        <motion.div {...slideUp} transition={{ delay: 0.4 }} className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            Why Choose PayPost?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                {...slideUp}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <Card className="p-6 text-center h-full dark:bg-gray-800 dark:border-gray-700">
                  <div className="w-12 h-12 bg-movement-100 dark:bg-movement-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <div className="text-movement-600 dark:text-movement-400">
                      {benefit.icon}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {benefit.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div 
          {...slideUp} 
          transition={{ delay: 0.6 }}
          className="text-center bg-gradient-to-r from-movement-500 to-movement-600 rounded-xl p-12 text-white"
        >
          <Users className="w-16 h-16 mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of users already earning and learning on PayPost.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/feed">
              <Button
                size="lg"
                className="bg-white text-movement-600 hover:bg-gray-100 px-8 py-4"
              >
                Start Earning Now
              </Button>
            </Link>
            <Link to="/creators">
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-movement-600 px-8 py-4"
              >
                Become a Creator
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HowItWorksPage;