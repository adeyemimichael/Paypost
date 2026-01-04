import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, CheckCircle, Gift, BookOpen, Unlock, ArrowRight, Loader2 } from 'lucide-react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useUserStore } from '../stores/userStore';
import { usePostStore } from '../stores/postStore';
import { useSurveyStore } from '../stores/surveyStore';
import { formatPrice } from '../utils/formatters';
import { fadeIn } from '../animations/fadeIn';
import Card from './Card';
import Button from './Button';

const EarningsDashboard = () => {
  const { isAuthenticated, isCreator } = useUserStore();
  const { getUserStats } = usePostStore();
  const { getParticipantStats, completedSurveys } = useSurveyStore();

  if (!isAuthenticated || isCreator()) return null;

  const postStats = getUserStats();
  const participantStats = getParticipantStats();

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
                {postStats.postsUnlocked}
              </div>
              <div className="text-movement-100 text-sm">Posts Unlocked</div>
            </div>
            
            {/* Available Content */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <BookOpen className="w-8 h-8 text-yellow-300" />
              </div>
              <div className="text-3xl font-bold mb-1">
                {postStats.availableSurveys + postStats.availablePosts}
              </div>
              <div className="text-movement-100 text-sm">Available Content</div>
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