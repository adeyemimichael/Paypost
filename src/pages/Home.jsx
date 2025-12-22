import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Zap, 
  Shield, 
  DollarSign, 
  Sparkles, 
  TrendingUp, 
  Users, 
  Star,
  CheckCircle,
  Coins,
  Globe,
  Lock
} from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { fadeIn, slideUp } from '../animations/fadeIn';
import Button from '../components/Button';

const Home = () => {
  const { ready, authenticated, login } = usePrivy();

  const handleGetStarted = async () => {
    if (!authenticated) {
      try {
        await login();
      } catch (error) {
        console.error('Failed to connect wallet:', error);
      }
    }
  };

  const features = [
    {
      icon: <Zap className="w-8 h-8 text-yellow-500" />,
      title: 'Instant Rewards',
      description: 'Complete surveys and polls to earn MOVE tokens instantly. Your opinions have real value in the Web3 economy.',
      highlight: '0.1-1.0 MOVE per survey'
    },
    {
      icon: <Shield className="w-8 h-8 text-blue-500" />,
      title: 'Secure & Private',
      description: 'Your responses are protected by blockchain security. Anonymous participation with embedded wallets.',
      highlight: 'No seed phrases needed'
    },
    {
      icon: <DollarSign className="w-8 h-8 text-green-500" />,
      title: 'Real Value',
      description: 'Earn real MOVE tokens that you can use, trade, or tip to support your favorite creators.',
      highlight: 'Instant withdrawals'
    },
  ];

  const stats = [
    { label: 'Active Users', value: '8K+', icon: <Users className="w-6 h-6" /> },
    { label: 'MOVE Distributed', value: '2.5K', icon: <Coins className="w-6 h-6" /> },
    { label: 'Surveys Completed', value: '15K+', icon: <CheckCircle className="w-6 h-6" /> },
    { label: 'Average Rating', value: '4.8', icon: <Star className="w-6 h-6" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 transition-colors duration-300 overflow-hidden">
      {/* Hero Section */}
      <motion.section 
        {...fadeIn}
        className="relative py-20 px-4 sm:px-6 lg:px-8"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating Blockchain Icons */}
          <motion.div 
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 5, 0]
            }}
            transition={{ 
              duration: 6, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute top-20 left-10 w-16 h-16 bg-gradient-to-br from-movement-400 to-movement-600 rounded-lg opacity-20 dark:opacity-30 flex items-center justify-center"
          >
            <Lock className="w-8 h-8 text-white" />
          </motion.div>
          
          <motion.div 
            animate={{ 
              y: [0, 15, 0],
              rotate: [0, -5, 0]
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 1
            }}
            className="absolute top-40 right-20 w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full opacity-20 dark:opacity-30 flex items-center justify-center"
          >
            <Globe className="w-10 h-10 text-white" />
          </motion.div>
          
          <motion.div 
            animate={{ 
              y: [0, -25, 0],
              x: [0, 10, 0]
            }}
            transition={{ 
              duration: 10, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 2
            }}
            className="absolute bottom-20 left-1/4 w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg opacity-20 dark:opacity-30 flex items-center justify-center"
          >
            <Coins className="w-6 h-6 text-white" />
          </motion.div>

          {/* Gradient Orbs */}
          <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-br from-movement-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse-slow" />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center">
            {/* Badge */}
            <motion.div 
              {...slideUp}
              className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-movement-100 to-purple-100 dark:from-movement-900 dark:to-purple-900 text-movement-700 dark:text-movement-300 text-sm font-medium mb-8 border border-movement-200 dark:border-movement-700"
            >
              <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
              Web3's First Survey Rewards Platform
              <TrendingUp className="w-4 h-4 ml-2" />
            </motion.div>

            {/* Main Headline */}
            <motion.h1 
              {...slideUp}
              transition={{ delay: 0.1 }}
              className="text-5xl sm:text-7xl font-bold text-gray-900 dark:text-white mb-8 leading-tight"
            >
              Turn Your
              <span className="bg-gradient-to-r from-movement-600 via-purple-600 to-pink-600 bg-clip-text text-transparent block animate-pulse-slow">
                Opinions Into Earnings
              </span>
            </motion.h1>
            
            {/* Subtitle */}
            <motion.p 
              {...slideUp}
              transition={{ delay: 0.2 }}
              className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
            >
              Join the Web3 revolution where your insights earn <span className="font-semibold text-movement-600 dark:text-movement-400">MOVE tokens</span> instantly. 
              Share your thoughts, shape the future, and get rewarded for your valuable opinions.
            </motion.p>
            
            {/* CTA Buttons */}
            <motion.div 
              {...slideUp}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
            >
              {authenticated ? (
                <Link to="/feed">
                  <Button size="lg" className="px-10 py-4 text-lg bg-gradient-to-r from-movement-500 to-movement-600 hover:from-movement-600 hover:to-movement-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Start Earning Now
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              ) : (
                <Button
                  size="lg"
                  onClick={handleGetStarted}
                  disabled={!ready}
                  className="px-10 py-4 text-lg bg-gradient-to-r from-movement-500 to-movement-600 hover:from-movement-600 hover:to-movement-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              )}
              
              <Button
                variant="outline"
                size="lg"
                className="px-10 py-4 text-lg border-2 border-gray-300 dark:border-gray-600 hover:border-movement-500 dark:hover:border-movement-400 group"
              >
                <Shield className="w-5 h-5 mr-2 group-hover:text-movement-500" />
                Learn More
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div 
              {...slideUp}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  {...slideUp}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="text-center group"
                >
                  <motion.div 
                    className="flex items-center justify-center mb-3 text-movement-500 dark:text-movement-400 group-hover:scale-110 transition-transform duration-200"
                    whileHover={{ rotate: 5 }}
                  >
                    {stat.icon}
                  </motion.div>
                  <div className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        {...fadeIn}
        transition={{ delay: 0.6 }}
        className="py-24 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <motion.h2 
              {...slideUp}
              className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6"
            >
              Why Choose PayPost?
            </motion.h2>
            <motion.p 
              {...slideUp}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
            >
              Experience the future of content monetization with our cutting-edge Web3 platform that rewards participation and values quality.
            </motion.p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                {...slideUp}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="group"
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:border-movement-300 dark:hover:border-movement-600 transition-all duration-300 h-full relative overflow-hidden">
                  {/* Background Pattern */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-movement-100/50 to-purple-100/50 dark:from-movement-900/50 dark:to-purple-900/50 rounded-full blur-2xl -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500" />
                  
                  <div className="relative">
                    <div className="mb-6 group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                      {feature.description}
                    </p>
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-movement-100 to-purple-100 dark:from-movement-900 dark:to-purple-900 text-movement-700 dark:text-movement-300 text-sm font-medium border border-movement-200 dark:border-movement-700">
                      <Sparkles className="w-3 h-3 mr-2" />
                      {feature.highlight}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        {...fadeIn}
        transition={{ delay: 0.9 }}
        className="py-24 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-movement-500 via-purple-600 to-pink-600 rounded-3xl p-12 text-white relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 opacity-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-4 right-4 w-16 h-16 border-2 border-white rounded-full"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-4 left-4 w-12 h-12 border-2 border-white rounded-lg"
              />
            </div>
            
            <div className="relative">
              <motion.div
                {...slideUp}
                className="mb-8"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-16 h-16 mx-auto mb-6" />
                </motion.div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                  Ready to Start Your Web3 Journey?
                </h2>
                <p className="text-xl opacity-90 max-w-2xl mx-auto">
                  Join thousands of users already earning MOVE tokens and shaping the future of decentralized content.
                </p>
              </motion.div>
              
              <motion.div
                {...slideUp}
                transition={{ delay: 0.1 }}
              >
                {authenticated ? (
                  <Link to="/feed">
                    <Button
                      size="lg"
                      className="bg-white text-movement-600 hover:bg-gray-100 px-10 py-4 text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                      <TrendingUp className="w-5 h-5 mr-2" />
                      Start Earning
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                ) : (
                  <Button
                    size="lg"
                    onClick={handleGetStarted}
                    disabled={!ready}
                    className="bg-white text-movement-600 hover:bg-gray-100 px-10 py-4 text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    <Users className="w-5 h-5 mr-2" />
                    Join PayPost
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default Home;