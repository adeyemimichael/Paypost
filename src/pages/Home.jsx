import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Shield, DollarSign } from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import { fadeIn, slideUp } from '../animations/fadeIn';
import Button from '../components/Button';
import { notify } from '../utils/notify';

const Home = () => {
  const { isAuthenticated, login, isLoading } = useUserStore();

  const handleGetStarted = async () => {
    if (!isAuthenticated) {
      // Show helpful toast before login
      notify.info('🚀 Connecting your wallet... This creates a secure account with just your email!');
      
      try {
        await login();
        notify.success('🎉 Welcome to PayPost! Start earning by completing surveys.');
      } catch (error) {
        console.error('Failed to connect wallet:', error);
      }
    }
  };

  const features = [
    {
      icon: <Zap className="w-8 h-8 text-movement-500" />,
      title: 'Instant Rewards',
      description: 'Complete surveys and polls to earn MOVE tokens instantly. Your opinions have value!',
    },
    {
      icon: <Shield className="w-8 h-8 text-movement-500" />,
      title: 'Secure & Anonymous',
      description: 'Your responses are secure and anonymous. Earn rewards while protecting your privacy.',
    },
    {
      icon: <DollarSign className="w-8 h-8 text-movement-500" />,
      title: 'Real Value',
      description: 'Earn real MOVE tokens that you can use, trade, or tip to support your favorite creators.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 transition-colors duration-300">
      {/* Hero Section */}
      <motion.section 
        {...fadeIn}
        className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.h1 
              {...slideUp}
              className="text-4xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-6"
            >
              Earn Rewards by Sharing
              <span className="text-movement-600 dark:text-movement-400 block">Your Opinions</span>
            </motion.h1>
            
            <motion.p 
              {...slideUp}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto"
            >
              PayPost rewards you for participating in surveys and polls. Share your thoughts, 
              help shape the future, and earn MOVE tokens instantly for your valuable insights.
            </motion.p>
            
            <motion.div 
              {...slideUp}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              {isAuthenticated ? (
                <Link to="/feed">
                  <Button size="lg" className="px-8 py-4">
                    Start Earning
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              ) : (
                <Button
                  size="lg"
                  onClick={handleGetStarted}
                  loading={isLoading}
                  className="px-8 py-4"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              )}
              
              <Link to="/how-it-works">
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-4"
                >
                  How It Works
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-20 left-10 w-20 h-20 bg-movement-200 dark:bg-movement-800 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-purple-200 dark:bg-purple-800 rounded-full opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-blue-200 dark:bg-blue-800 rounded-full opacity-20 animate-pulse delay-2000"></div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        {...fadeIn}
        transition={{ delay: 0.3 }}
        className="py-20 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Participate in PayPost?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Turn your opinions into earnings with our innovative survey rewards platform powered by Web3.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                {...slideUp}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        {...fadeIn}
        transition={{ delay: 0.6 }}
        className="py-20 px-4 sm:px-6 lg:px-8 bg-movement-600 dark:bg-movement-700"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Start Earning Rewards?
          </h2>
          <p className="text-xl text-movement-100 dark:text-movement-200 mb-8">
            Join thousands of users already earning MOVE tokens by sharing their opinions.
          </p>
          {isAuthenticated ? (
            <Link to="/feed">
              <Button
                variant="secondary"
                size="lg"
                className="px-8 py-4 bg-white text-movement-600 hover:bg-gray-100"
              >
                Start Earning
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          ) : (
            <Button
              variant="secondary"
              size="lg"
              onClick={handleGetStarted}
              loading={isLoading}
              className="px-8 py-4 bg-white text-movement-600 hover:bg-gray-100"
            >
              Connect Wallet
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          )}
        </div>
      </motion.section>
    </div>
  );
};

export default Home;