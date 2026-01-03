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
      notify.error('Please connect your wallet to like posts');
      return;
    }

    if (isAnimating) return;

    setIsAnimating(true);

    try {
      const likedPosts = JSON.parse(localStorage.getItem('paypost_liked_posts') || '{}');
      
      if (isLiked) {
        // Unlike
        setLikes(prev => prev - 1);
        setIsLiked(false);
        delete likedPosts[postId];
        notify.success('Removed like');
      } else {
        // Like
        setLikes(prev => prev + 1);
        setIsLiked(true);
        likedPosts[postId] = true;
        notify.success('Added like ❤️');
      }

      // Save to localStorage
      localStorage.setItem('paypost_liked_posts', JSON.stringify(likedPosts));

      // In a real implementation, you would also save to database/blockchain
      // await supabaseService.toggleLike(postId, walletAddress);

    } catch (error) {
      console.error('Failed to toggle like:', error);
      notify.error('Failed to update like');
    } finally {
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  return (
    <motion.button
      onClick={handleLike}
      disabled={!isAuthenticated || isAnimating}
      className={`
        inline-flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200
        ${isLiked 
          ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' 
          : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
        }
        ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
        ${className}
      `}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        animate={isAnimating ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <Heart 
          className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} 
        />
      </motion.div>
      <span className="text-sm font-medium">
        {likes > 0 ? likes : ''}
        {likes === 1 ? ' Like' : likes > 1 ? ' Likes' : 'Like'}
      </span>
    </motion.button>
  );
};

export default LikeButton;