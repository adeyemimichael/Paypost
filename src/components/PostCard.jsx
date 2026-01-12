import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Gift, 
  CheckCircle, 
  Clock, 
  Users, 
  Timer, 
  Lock, 
  Unlock, 
  BookOpen,
  BarChart3,
  Eye,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import { usePostStore } from '../stores/postStore';
import { formatPrice, formatAddress, formatTimeAgo, truncateText } from '../utils/formatters';
import { fadeIn } from '../animations/fadeIn';
import Button from './Button';
import Card from './Card';
import LikeButton from './LikeButton';
import SurveyModal from './SurveyModal';

const PostCard = ({ post, onComplete }) => {
  const { isAuthenticated, user, isCreator } = useUserStore();
  const { isSurveyCompleted, isPostUnlocked, checkSurveyCompletion, checkPostAccess, unlockPost, isLoading } = usePostStore();
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [checking, setChecking] = useState(false);

  const walletAddress = user?.wallet?.address || user?.email?.address;
  const isCompleted = isSurveyCompleted(post.id) || hasCompleted;
  const isUnlocked = isPostUnlocked(post.id) || hasAccess || !post.isPremium;
  const isOwnPost = walletAddress && post.authorAddress === walletAddress;

  useEffect(() => {
    const checkStatus = async () => {
      if (walletAddress && !isCreator()) {
        setChecking(true);
        
        if (post.type === 'survey' || post.type === 'poll') {
          const completed = await checkSurveyCompletion(post.id, walletAddress);
          setHasCompleted(completed);
        } else if (post.isPremium) {
          const access = await checkPostAccess(post.id, walletAddress);
          setHasAccess(access);
        }
        
        setChecking(false);
      }
    };

    checkStatus();
  }, [post.id, post.type, post.isPremium, walletAddress, checkSurveyCompletion, checkPostAccess, isCreator]);

  const handleStartSurvey = () => {
    if (!isAuthenticated) {
      // Trigger wallet connection
      return;
    }
    setShowSurveyModal(true);
  };

  const handleSurveyComplete = async (responses) => {
    // This is called when the user finishes the survey in the modal
    // The SurveyModal handles the blockchain submission and balance update
    // We just need to update local state here
    
    setHasCompleted(true);
    setShowSurveyModal(false);
    
    if (onComplete) onComplete(post.id);
  };

  const handleUnlockPost = async () => {
    if (!isAuthenticated) {
      // Trigger wallet connection
      return;
    }

    try {
      await unlockPost(post.id, walletAddress);
      if (onComplete) onComplete(post.id);
    } catch (error) {
      console.error('Failed to unlock post:', error);
    }
  };

  const calculateEarnings = () => {
    if (post.type === 'survey' || post.type === 'poll') {
      return post.reward * post.responses;
    }
    return 0;
  };

  const getCompletionRate = () => {
    if (post.type === 'survey' || post.type === 'poll') {
      return Math.round((post.responses / post.maxResponses) * 100);
    }
    return 0;
  };

  // Creator View - Show Analytics
  if (isCreator() && isOwnPost) {
    return (
      <motion.div {...fadeIn}>
        <Card className="mb-6 border-l-4 border-l-purple-500">
          {/* Creator Header */}
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h3 className="text-xl font-semibold text-gray-900 mr-3">
                    {post.title}
                  </h3>
                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                    Your {post.type === 'survey' ? 'Survey' : post.type === 'poll' ? 'Poll' : 'Post'}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-500 space-x-4">
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {formatTimeAgo(post.timestamp)}
                  </span>
                  {post.category && (
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {post.category}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Analytics for Surveys/Polls */}
            {(post.type === 'survey' || post.type === 'poll') && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Responses</p>
                      <p className="text-2xl font-bold text-blue-900">{post.responses}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-medium">Completion</p>
                      <p className="text-2xl font-bold text-green-900">{getCompletionRate()}%</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-500" />
                  </div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600 font-medium">Paid Out</p>
                      <p className="text-2xl font-bold text-purple-900">{formatPrice(calculateEarnings())}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-purple-500" />
                  </div>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-orange-600 font-medium">Status</p>
                      <p className="text-sm font-bold text-orange-900">
                        {post.isActive ? 'Active' : 'Closed'}
                      </p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-orange-500" />
                  </div>
                </div>
              </div>
            )}

            {/* Content Preview */}
            <div className="mb-4">
              <p className="text-gray-700 leading-relaxed">
                {truncateText(post.preview || post.description, 150)}
              </p>
            </div>

            {/* Creator Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
                
                {(post.type === 'survey' || post.type === 'poll') && post.isActive && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview Survey
                  </Button>
                )}
              </div>

              <div className="text-sm text-gray-500">
                Created {formatTimeAgo(post.timestamp)}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  // Participant View - Show Interactive Content
  return (
    <>
      <motion.div {...fadeIn}>
        <Card className="mb-6">
          {/* Post Image */}
          {post.image && (
            <div className="relative h-48 overflow-hidden">
              <img 
                src={post.image} 
                alt={post.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <div className={`
                  px-3 py-1 rounded-full text-xs font-medium flex items-center
                  ${post.type === 'survey' ? 'bg-blue-500 text-white' : 
                    post.type === 'poll' ? 'bg-purple-500 text-white' :
                    post.type === 'premium-post' ? 'bg-orange-500 text-white' :
                    'bg-green-500 text-white'}
                `}>
                  {(post.type === 'survey' || post.type === 'poll') ? (
                    <Gift className="w-3 h-3 mr-1" />
                  ) : (
                    <Clock className="w-3 h-3 mr-1" />
                  )}
                  {post.type === 'survey' ? 'Survey' : 
                   post.type === 'poll' ? 'Poll' :
                   post.type === 'premium-post' ? 'Premium' : 'Free'}
                </div>
              </div>
              {(post.type === 'survey' || post.type === 'poll') && isCompleted && (
                <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center">
                  <div className="bg-white rounded-full p-2">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                </div>
              )}
              {(post.type === 'premium-post') && post.isPremium && !isUnlocked && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="bg-white rounded-full p-3">
                    <Lock className="w-8 h-8 text-gray-700" />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {post.title}
                </h3>
                <div className="flex items-center text-sm text-gray-500 space-x-4">
                  <span>By {post.author}</span>
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {formatTimeAgo(post.timestamp)}
                  </span>
                  {post.category && (
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {post.category}
                    </span>
                  )}
                </div>
              </div>
              
              {(post.type === 'survey' || post.type === 'poll') ? (
                <div className="flex items-center bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                  <Gift className="w-4 h-4 mr-1" />
                  {formatPrice(post.reward)}
                </div>
              ) : post.isPremium ? (
                <div className="flex items-center bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">
                  <Lock className="w-4 h-4 mr-1" />
                  {formatPrice(post.price)}
                </div>
              ) : (
                <div className="flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                  <BookOpen className="w-4 h-4 mr-1" />
                  Free
                </div>
              )}
            </div>

            {/* Stats */}
            {(post.type === 'survey' || post.type === 'poll') ? (
              <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center text-sm text-gray-600">
                  <Timer className="w-4 h-4 mr-1" />
                  {post.estimatedTime} min
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-1" />
                  {post.responses}/{post.maxResponses}
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {post.questions?.length || 1} questions
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center text-sm text-gray-600">
                  <BookOpen className="w-4 h-4 mr-1" />
                  {post.readTime} min read
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-1" />
                  Article
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {post.isPremium ? 'Premium Content' : 'Free Access'}
                </div>
              </div>
            )}

            {/* Content Preview */}
            <div className="mb-4">
              {(post.type === 'survey' || post.type === 'poll') ? (
                isCompleted ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800 font-medium mb-2">✅ Survey Completed!</p>
                    <p className="text-gray-700 leading-relaxed">
                      {post.content}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-700 leading-relaxed">
                    {truncateText(post.preview, 150)}
                  </p>
                )
              ) : (
                isUnlocked ? (
                  <div className="text-gray-700 leading-relaxed">
                    <p className="mb-3">{post.content}</p>
                  </div>
                ) : post.isPremium ? (
                  <div className="relative">
                    <p className="text-gray-700 leading-relaxed">
                      {truncateText(post.preview, 150)}
                    </p>
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
                  </div>
                ) : (
                  <p className="text-gray-700 leading-relaxed">
                    {post.content}
                  </p>
                )
              )}
            </div>

            {/* Actions - Only show interactive buttons for participants */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                {!isCreator() && (post.type === 'survey' || post.type === 'poll') ? (
                  !isCompleted && post.isActive && post.responses < post.maxResponses ? (
                    <Button
                      onClick={handleStartSurvey}
                      loading={isLoading || checking}
                      disabled={!isAuthenticated}
                      className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                    >
                      <Gift className="w-4 h-4 mr-2" />
                      {isAuthenticated ? `Start ${post.type === 'survey' ? 'Survey' : 'Poll'}` : 'Connect to Start'}
                    </Button>
                  ) : isCompleted ? (
                    <div className="flex items-center text-green-600 text-sm font-medium">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Completed - Earned {formatPrice(post.reward)}
                    </div>
                  ) : (
                    <div className="flex items-center text-gray-500 text-sm font-medium">
                      <Clock className="w-4 h-4 mr-1" />
                      Survey Closed
                    </div>
                  )
                ) : !isCreator() && post.isPremium && !isUnlocked ? (
                  <Button
                    onClick={handleUnlockPost}
                    loading={isLoading || checking}
                    disabled={!isAuthenticated}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  >
                    <Unlock className="w-4 h-4 mr-2" />
                    {isAuthenticated ? 'Unlock Post' : 'Connect to Unlock'}
                  </Button>
                ) : !isCreator() ? (
                  <div className="flex items-center text-green-600 text-sm font-medium">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    {post.isPremium ? 'Unlocked' : 'Free Access'}
                  </div>
                ) : (
                  <div className="flex items-center text-gray-500 text-sm font-medium">
                    <Eye className="w-4 h-4 mr-1" />
                    View Only (Creator Mode)
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                {/* Like Button */}
                <LikeButton 
                  postId={post.id}
                  initialLikes={post.likes || Math.floor(Math.random() * 50) + 5} // Random likes for demo
                  className="text-xs"
                />
                <span className="text-sm text-gray-500">
                  {formatAddress(post.authorAddress)}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Modals - Only for participants */}
      {!isCreator() && (post.type === 'survey' || post.type === 'poll') && (
        <SurveyModal
          isOpen={showSurveyModal}
          onClose={() => setShowSurveyModal(false)}
          onSubmit={handleSurveyComplete}
          post={post}
        />
      )}
    </>
  );
};

export default PostCard;