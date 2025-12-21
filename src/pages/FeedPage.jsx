import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUserStore } from '../stores/userStore';
import { movementService } from '../services/movementService';
import { fadeIn } from '../animations/fadeIn';
import Feed from '../components/Feed';
import EarningsDashboard from '../components/EarningsDashboard';
import Button from '../components/Button';

const FeedPage = () => {
  const { isAuthenticated, login, isLoading } = useUserStore();

  useEffect(() => {
    // Initialize Movement service when component mounts
    movementService.initialize();
  }, []);

  const handleConnect = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div {...fadeIn} className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Content & Rewards Hub
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Earn MOVE tokens by completing surveys, or unlock premium articles and research. 
            Your one-stop destination for Web3 insights and rewards!
          </p>
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
                Unlock Full Experience
              </h3>
              <p className="text-gray-600 mb-6">
                Connect your wallet to earn from surveys and unlock premium content. 
                No seed phrases required - we use secure embedded wallets.
              </p>
              <Button
                onClick={handleConnect}
                loading={isLoading}
                size="lg"
              >
                Connect Wallet to Continue
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