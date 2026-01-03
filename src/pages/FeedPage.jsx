import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet } from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import { fadeIn } from '../animations/fadeIn';
import Feed from '../components/Feed';
import EarningsDashboard from '../components/EarningsDashboard';
import WalletBalance from '../components/WalletBalance';
import Button from '../components/Button';

const FeedPage = () => {
  const { isAuthenticated, isCreator, login, isLoading } = useUserStore();

  useEffect(() => {
    // Any necessary initialization can go here
  }, []);

  const handleConnect = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const getPageTitle = () => {
    if (isCreator()) {
      return "My Surveys & Analytics";
    }
    return "Earn MOVE Tokens";
  };

  const getPageDescription = () => {
    if (isCreator()) {
      return "Manage your surveys, track responses, and analyze results from your research projects.";
    }
    return "Complete surveys and polls to earn MOVE tokens instantly. Share your opinions and get rewarded!";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Wallet Balance */}
        <motion.div {...fadeIn} className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {getPageTitle()}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            {getPageDescription()}
          </p>
          
          {/* Prominent Wallet Balance Display */}
          {isAuthenticated && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center mb-6"
            >
              <div className="bg-gradient-to-r from-movement-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-center space-x-3">
                  <Wallet className="w-8 h-8" />
                  <div className="text-left">
                    <div className="text-sm opacity-90">Your Balance</div>
                    <WalletBalance 
                      size="lg" 
                      showLabel={false} 
                      className="bg-white/20 border-white/30 text-white [&>*]:text-white"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Earnings Dashboard */}
        <EarningsDashboard />

        {/* Connection Prompt for Guests */}
        {!isAuthenticated && (
          <motion.div 
            {...fadeIn}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl border border-gray-200 p-8 mb-8 text-center"
          >
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Start Earning MOVE Tokens
              </h3>
              <p className="text-gray-600 mb-6">
                Connect your wallet to participate in surveys and earn rewards instantly. 
                Choose your role: Survey Participant or Creator.
              </p>
              <Button
                onClick={handleConnect}
                loading={isLoading}
                size="lg"
              >
                Choose Role & Connect Wallet
              </Button>
            </div>
          </motion.div>
        )}

        {/* Feed */}
        <motion.div 
          {...fadeIn}
          transition={{ delay: isAuthenticated ? 0.2 : 0.4 }}
        >
          <Feed />
        </motion.div>

        {/* Stats Section */}
        <motion.div 
          {...fadeIn}
          transition={{ delay: 0.6 }}
          className="mt-16 bg-white rounded-xl border border-gray-200 p-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-movement-600 mb-2">15K+</div>
              <div className="text-gray-600">Surveys Completed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-movement-600 mb-2">5K+</div>
              <div className="text-gray-600">Posts Unlocked</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-movement-600 mb-2">8K+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-movement-600 mb-2">2.5K</div>
              <div className="text-gray-600">MOVE Distributed</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FeedPage;