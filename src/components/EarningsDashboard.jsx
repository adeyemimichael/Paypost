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
    availableSurveys: 0
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
        
        // Count completed surveys
        let completedCount = 0;
        for (const post of posts) {
          if (post.type === 'survey') {
            const hasCompleted = await movementService.hasCompletedSurvey(wallet.address, post.id);
            if (hasCompleted) completedCount++;
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
          availableSurveys
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
    </motion.div>
  );
};

export default EarningsDashboard;