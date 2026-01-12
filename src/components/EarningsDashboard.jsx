import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, Gift, BookOpen, Unlock, Loader2, ExternalLink } from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import { usePostStore } from '../stores/postStore';
import { useWalletStore } from '../stores/walletStore';
import { formatPrice } from '../utils/formatters';
import { fadeIn } from '../animations/fadeIn';
import Card from './Card';

const EarningsDashboard = () => {
  const { isAuthenticated, isCreator } = useUserStore();
  const { posts, userEarnings, completedSurveys } = usePostStore();
  const { wallet, balance } = useWalletStore();
  const [completedSurveyDetails, setCompletedSurveyDetails] = useState([]);
  const [loading, setLoading] = useState(true);

  // Build completed survey details from posts and completedSurveys set
  useEffect(() => {
    const buildCompletedDetails = () => {
      if (!wallet?.address) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      
      const details = [];
      for (const post of posts) {
        if (post.type === 'survey' && completedSurveys.has(post.id)) {
          // Try to get stored completion data from localStorage
          const storedData = localStorage.getItem(`survey_completion_${post.id}_${wallet.address}`);
          let completionInfo = {};
          if (storedData) {
            try {
              completionInfo = JSON.parse(storedData);
            } catch (e) {}
          }
          
          details.push({
            id: post.id,
            title: post.title,
            reward: post.reward || post.rewardAmount || 0,
            completedAt: completionInfo.completedAt || null,
            transactionHash: completionInfo.transactionHash || null
          });
        }
      }
      
      setCompletedSurveyDetails(details);
      setLoading(false);
    };

    buildCompletedDetails();
  }, [wallet?.address, posts, completedSurveys]);

  // Count available surveys
  const availableSurveys = posts.filter(post => 
    post.type === 'survey' && post.isActive && !completedSurveys.has(post.id)
  ).length;

  const totalCompleted = completedSurveys.size;
  const avgEarnings = totalCompleted > 0 ? userEarnings / totalCompleted : 0;

  if (!isAuthenticated || isCreator()) return null;

  if (loading) {
    return (
      <motion.div {...fadeIn} className="mb-8">
        <Card className="bg-gradient-to-r from-movement-500 to-purple-600 text-white">
          <div className="p-6 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Loading your earnings...</p>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div {...fadeIn} className="mb-8">
      <Card className="bg-gradient-to-r from-movement-500 to-purple-600 text-white">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Your Earnings Dashboard</h3>
            <Wallet className="w-6 h-6" />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Total Earnings */}
            <div className="text-center p-3 bg-white/10 rounded-lg">
              <TrendingUp className="w-8 h-8 text-green-300 mx-auto mb-2" />
              <div className="text-2xl font-bold mb-1">
                {formatPrice(userEarnings)}
              </div>
              <div className="text-movement-100 text-sm">Total Earned</div>
            </div>
            
            {/* Surveys Completed */}
            <div className="text-center p-3 bg-white/10 rounded-lg">
              <Gift className="w-8 h-8 text-blue-300 mx-auto mb-2" />
              <div className="text-2xl font-bold mb-1">
                {totalCompleted}
              </div>
              <div className="text-movement-100 text-sm">Surveys Done</div>
            </div>
            
            {/* Wallet Balance */}
            <div className="text-center p-3 bg-white/10 rounded-lg">
              <Unlock className="w-8 h-8 text-purple-300 mx-auto mb-2" />
              <div className="text-2xl font-bold mb-1">
                {formatPrice(balance)}
              </div>
              <div className="text-movement-100 text-sm">Wallet Balance</div>
            </div>
            
            {/* Available Surveys */}
            <div className="text-center p-3 bg-white/10 rounded-lg">
              <BookOpen className="w-8 h-8 text-yellow-300 mx-auto mb-2" />
              <div className="text-2xl font-bold mb-1">
                {availableSurveys}
              </div>
              <div className="text-movement-100 text-sm">Available</div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-white/20 text-sm text-movement-100">
            <p>Avg per survey: {totalCompleted > 0 ? formatPrice(avgEarnings) : '0 MOVE'} • Rewards auto-deposited to wallet</p>
          </div>
        </div>
      </Card>
      
      {/* Completed Surveys List */}
      {completedSurveyDetails.length > 0 && (
        <Card className="mt-4">
          <div className="p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Completed Surveys</h4>
            <div className="space-y-2">
              {completedSurveyDetails.map((survey) => (
                <div key={survey.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{survey.title}</p>
                    <p className="text-sm text-green-600">+{formatPrice(survey.reward)} MOVE</p>
                  </div>
                  {survey.transactionHash && (
                    <button
                      onClick={() => window.open(`https://explorer.movementnetwork.xyz/txn/${survey.transactionHash}`, '_blank')}
                      className="flex items-center text-blue-600 hover:text-blue-700 text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </motion.div>
  );
};

export default EarningsDashboard;
