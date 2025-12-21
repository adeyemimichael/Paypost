import { motion } from 'framer-motion';
import { ArrowRight, Zap, Shield, DollarSign } from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import { fadeIn, slideUp } from '../animations/fadeIn';
import Button from '../components/Button';

const Home = () => {
  const { isAuthenticated, login, isLoading } = useUserStore();

  const handleGetStarted = async () => {
    if (!isAuthenticated) {
      try {
        await login();
      } catch (error) {
        console.error('Failed to connect wallet:', error);
      }
    }
  };

  const features = [
    {
      icon: <Zap className="w-8 h-8 text-movement-500" />,
      title: 'Dual Earning Model',
      description: 'Earn MOVE tokens by completing surveys, or pay to unlock premium content. Choose your path!',
    },
    {
      icon: <Shield className="w-8 h-8 text-movement-500" />,
      title: 'Premium Insights',
      description: 'Access exclusive research, market analysis, and technical deep-dives from industry experts.',
    },
    {
      icon: <DollarSign className="w-8 h-8 text-movement-500" />,
      title: 'Fair Economics',
      description: 'Transparent pricing for content, instant survey rewards, and direct creator support through tips.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <motion.section 
        {...fadeIn}
        className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.h1 
              {...slideUp}
              className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6"
            >
              Earn & Learn with
              <span className="text-movement-600 block">Web3 Content</span>
            </motion.h1>
            
            <motion.p 
              {...slideUp}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
            >
              PayPost combines survey rewards with premium content access. Earn MOVE tokens by sharing your opinions, 
              or unlock exclusive articles and research. Your gateway to valuable Web3 insights and rewards.
            </motion.p>
            
            <motion.div 
              {...slideUp}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button
                size="lg"
                onClick={handleGetStarted}
                loading={isLoading}
                className="px-8 py-4"
              >
                {isAuthenticated ? 'Start Earning' : 'Get Started'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-4"
              >
                Learn More
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-20 left-10 w-20 h-20 bg-movement-200 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-purple-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-blue-200 rounded-full opacity-20 animate-pulse delay-2000"></div>
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
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose PayPost?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The ultimate Web3 platform combining survey rewards with premium content access. Earn while you learn!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                {...slideUp}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
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
        className="py-20 px-4 sm:px-6 lg:px-8 bg-movement-600"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Earn & Learn?
          </h2>
          <p className="text-xl text-movement-100 mb-8">
            Join thousands earning MOVE tokens through surveys and accessing premium Web3 content.
          </p>
          <Button
            variant="secondary"
            size="lg"
            onClick={handleGetStarted}
            loading={isLoading}
            className="px-8 py-4 bg-white text-movement-600 hover:bg-gray-100"
          >
            {isAuthenticated ? 'Start Earning' : 'Connect Wallet'}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </motion.section>
    </div>
  );
};

export default Home;