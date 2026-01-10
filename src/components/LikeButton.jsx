import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import { notify } from '../utils/notify';

const LikeButton = ({ postId, initialLikes = 0, className = '' }) => {
  const { isAuthenticated, user } = useUserStore();
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const walletAddress = user?.wallet?.address || user?.email?.address;

  // Check if user has already liked this post
  useEffect(() => {
    if (walletAddress && postId) {
      const likedPosts = JSON.parse(localStorage.getItem('paypost_liked_posts') || '{}');
      setIsLiked(!!likedPosts[postId]);
    }
  }, [walletAddress, postId]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      notify.error('Please login to like posts');
      return;
    }

    if (isAnimating) return;

    setIsAnimating(true);

    try {
      const likedPosts = JSON.parse(localStorage.getItem('paypost_liked_posts') || '{}');
      
      if (isLiked) {
        // Unlike
        delete likedPosts[postId];
        setLikes(prev => Math.max(0, prev - 1));
        setIsLiked(false);
        notify.success('Post unliked');
      } else {
        // Like
        likedPosts[postId] = {
          timestamp: Date.now(),
          userAddress: walletAddress
        };
        setLikes(prev => prev + 1);
        setIsLiked(true);
        notify.success('Post liked!');
      }

      localStorage.setItem('paypost_liked_posts', JSON.stringify(likedPosts));
    } catch (error) {
      console.error('Failed to toggle like:', error);
      notify.error('Failed to update like status');
    } finally {
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  return (
    <motion.button
      onClick={handleLike}
      disabled={isAnimating}
      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
        isLiked 
          ? 'bg-red-50 text-red-600 hover:bg-red-100' 
          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
      } ${className}`}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
    >
      <motion.div
        animate={isAnimating ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <Heart 
          className={`w-5 h-5 transition-colors ${
            isLiked ? 'fill-current text-red-500' : 'text-gray-500'
          }`} 
        />
      </motion.div>
      <span className="text-sm font-medium">
        {likes > 0 ? likes : ''}
      </span>
    </motion.button>
  );
};

export default LikeButton;