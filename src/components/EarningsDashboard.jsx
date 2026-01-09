import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, CheckCircle, Gift, BookOpen, Unlock, ArrowRight, Loader2 } from 'lucide-react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useUserStore } from '../stores/userStore';
import { usePostStore } from '../stores/postStore';
import { useWalletStore } from '../stores/walletStore';
import { movementService } from '../services/movementService';
import { formatPrice } from '../utils/formatters';
import { fadeIn } from '../animations/fadeIn';
import Card from './Card';
import Button from './Button';

const EarningsDashboard = () => {
  const { isAuthenticated, isCreator } = useUserStore();
  const { posts } = usePostStore();
  const { wallet } = useWalletStore();
  const [participantStats, setParticipantStats] = useState({
    totalEarnings: 0,
    totalCompleted: 0,
    avgEarnings: 0,
    availableSurveys: 0,
    completedSurveys: []
  });
  const [loading, setLoading] = useState(true);

  // Load participant stats from blockchain
  useEffect(() => {
    const loadParticipantStats = async () => {
      if (!wallet?.address) return;
      
      setLoading(true);
      try {
        // Get user activity from blockchain
        const activity = await movementService.getUserActivity(wallet.address);
        
        // Count completed surveys and get their details
        let completedCount = 0;
        const completedSurveyDetails = [];
        
        for (const post of posts) {
          if (post.type === 'survey') {
            const hasCompleted = await movementService.hasCompletedSurvey(wallet.address, post.id);
            if (hasCompleted) {
              completedCount++;
              completedSurveyDetails.push({
                id: post.id,
                title: post.title,
                reward: post.reward || post.rewardAmount,
                completedAt: new Date(), // You might want to get this from blockchain
                // transactionHash would need to be retrieved from blockchain or database
              });
            }
          }
        }
        
        // Count available surveys (not completed)
        const availableSurveys = posts.filter(post => 
          post.type === 'survey' && post.isActive
        ).length - completedCount;
        
        const avgEarnings = completedCount > 0 ? activity.totalEarnings / completedCount : 0;
        
        setParticipantStats({
          totalEarnings: activity.totalEarnings,
          totalCompleted: completedCount,
          avgEarnings,
          availableSurveys,
          completedSurveys: completedSurveyDetails
        });
        
      } catch (error) {
        console.error('Failed to load participant stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadParticipantStats();
  }, [wallet?.address, posts]);

  if (!isAuthenticated || isCreator()) return null;

  if (loading) {
    return (
      <motion.div {...fadeIn} className="mb-8">
        <Card className="bg-gradient-to-r from-movement-500 to-purple-600 text-white">
          <div className="p-6 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Loading your earnings data...</p>
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
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Total Earnings */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-8 h-8 text-green-300" />
              </div>
              <div className="text-3xl font-bold mb-1">
                {formatPrice(participantStats.totalEarnings)}
              </div>
              <div className="text-movement-100 text-sm">Total Earned</div>
            </div>
            
            {/* Surveys Completed */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Gift className="w-8 h-8 text-blue-300" />
              </div>
              <div className="text-3xl font-bold mb-1">
                {participantStats.totalCompleted}
              </div>
              <div className="text-movement-100 text-sm">Surveys Done</div>
            </div>
            
            {/* Posts Unlocked */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Unlock className="w-8 h-8 text-purple-300" />
              </div>
              <div className="text-3xl font-bold mb-1">
                {participantStats.totalCompleted}
              </div>
              <div className="text-movement-100 text-sm">Content Unlocked</div>
            </div>
            
            {/* Available Content */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <BookOpen className="w-8 h-8 text-yellow-300" />
              </div>
              <div className="text-3xl font-bold mb-1">
                {participantStats.availableSurveys}
              </div>
              <div className="text-movement-100 text-sm">Available Surveys</div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-movement-400">
            <div className="text-sm">
              <p className="text-movement-100 mb-1">
                Avg per survey: {participantStats.totalCompleted > 0 ? formatPrice(participantStats.avgEarnings) : '0 MOVE'}
              </p>
              <p className="text-movement-100 text-xs">
                💡 Earnings are automatically deposited to your wallet
              </p>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Completed Surveys Section */}
      {participantStats.completedSurveys.length > 0 && (
        <Card className="mt-6">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Completed Surveys</h3>
            <div className="space-y-3">
              {participantStats.completedSurveys.slice(0, 5).map((survey) => (
                <div key={survey.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{survey.title}</p>
                    <p className="text-sm text-gray-600">Earned: {formatPrice(survey.reward)}</p>
                  </div>
                  {survey.transactionHash && (
                    <button
                      onClick={() => window.open(`https://explorer.movementnetwork.xyz/txn/${survey.transactionHash}`, '_blank')}
                      className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      View Transaction
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