import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, CheckCircle, Gift, BookOpen, Unlock, ArrowRight, Loader2 } from 'lucide-react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useUserStore } from '../stores/userStore';
import { usePostStore } from '../stores/postStore';
import { formatPrice } from '../utils/formatters';
import { fadeIn } from '../animations/fadeIn';
import Card from './Card';
import Button from './Button';

const EarningsDashboard = () => {
  const { isAuthenticated } = useUserStore();
  const { getUserStats, getWithdrawPayload, refreshAfterAction } = usePostStore();
  const { wallets } = useWallets();
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  if (!isAuthenticated) return null;

  const stats = getUserStats();

  const handleWithdraw = async () => {
    const wallet = wallets[0];
    if (!wallet) {
      alert("No wallet connected");
      return;
    }

    const amount = stats.totalEarnings;
    if (amount <= 0) {
      alert("No earnings to withdraw");
      return;
    }

    // For demo/MVP, we'll withdraw to a hardcoded address or ask user. 
    // Since we don't have a UI for input address yet, let's assume we are "claiming" to the connected wallet 
    // (which doesn't make sense if it's already there) OR we are withdrawing from a "platform" balance?
    // Wait, the contract `complete_survey` pays the user directly.
    // So the user *already has* the tokens in their wallet.
    // The "Earnings" displayed are just a history of what they earned.
    // BUT, the user request says "users will need to be able to withdraw their token".
    // If the tokens are already in their wallet, they don't need to withdraw from the platform.
    // UNLESS the contract holds them in an escrow or "UserActivity" balance.
    // Let's check the contract `PayPost-Enhanced.move`.
    // `complete_survey` -> `coin::deposit(participant_addr, reward)`.
    // So the tokens ARE sent to the user immediately.
    // So "Withdraw" might mean "Transfer to another wallet" (e.g. from embedded to main).
    // I will implement it as a "Transfer" button then, or "Withdraw to External Wallet".
    
    const destinationAddress = prompt("Enter destination address to withdraw to:");
    if (!destinationAddress) return;

    setIsWithdrawing(true);
    try {
      const payload = getWithdrawPayload(destinationAddress, amount);
      
      // Sign and submit transaction
      // Privy wallet `signTransaction` or `sendTransaction`
      // For Aptos, we usually use the provider.
      // wallet.getProvider() returns the Aptos provider?
      // Let's try to use the standard Aptos way if possible, or Privy's generic way.
      // Privy docs say: await wallet.sendTransaction(transactionRequest, uiOptions)
      // For Aptos, transactionRequest is the payload.
      
      const txHash = await wallet.sendTransaction(payload);
      console.log("Withdrawal TX:", txHash);
      
      alert(`Withdrawal successful! TX: ${txHash}`);
      await refreshAfterAction(wallet.address);
    } catch (error) {
      console.error("Withdrawal failed:", error);
      alert("Withdrawal failed. See console for details.");
    } finally {
      setIsWithdrawing(false);
    }
  };

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
                {formatPrice(stats.totalEarnings)}
              </div>
              <div className="text-movement-100 text-sm">Total Earned</div>
            </div>
            
            {/* Surveys Completed */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Gift className="w-8 h-8 text-blue-300" />
              </div>
              <div className="text-3xl font-bold mb-1">
                {stats.surveysCompleted}
              </div>
              <div className="text-movement-100 text-sm">Surveys Done</div>
            </div>
            
            {/* Posts Unlocked */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Unlock className="w-8 h-8 text-purple-300" />
              </div>
              <div className="text-3xl font-bold mb-1">
                {stats.postsUnlocked}
              </div>
              <div className="text-movement-100 text-sm">Posts Unlocked</div>
            </div>
            
            {/* Available Content */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <BookOpen className="w-8 h-8 text-yellow-300" />
              </div>
              <div className="text-3xl font-bold mb-1">
                {stats.availableSurveys + stats.availablePosts}
              </div>
              <div className="text-movement-100 text-sm">Available Content</div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-movement-400 flex justify-between items-center">
            <div className="text-sm">
              <p className="text-movement-100 mb-1">
                Avg per survey: {stats.surveysCompleted > 0 ? formatPrice(stats.totalEarnings / stats.surveysCompleted) : '0 MOVE'}
              </p>
            </div>
            
            <Button 
              onClick={handleWithdraw} 
              disabled={isWithdrawing || stats.totalEarnings <= 0}
              className="bg-white text-movement-600 hover:bg-gray-100 border-none"
            >
              {isWithdrawing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Withdraw Funds
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default EarningsDashboard;