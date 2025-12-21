import { useState } from 'react';
import { motion } from 'framer-motion';
import { usePostStore } from '../stores/postStore';
import { staggerContainer, staggerItem } from '../animations/fadeIn';
import PostCard from './PostCard';
import ContentFilter from './ContentFilter';
import Loader from './Loader';

const Feed = () => {
  const { posts, isLoading } = usePostStore();
  const [activeFilter, setActiveFilter] = useState('all');

  const getStats = () => {
    const surveys = posts.filter(p => p.type === 'survey' || p.type === 'poll').length;
    const articles = posts.filter(p => p.type === 'premium-post' || p.type === 'free-post').length;
    
    return {
      total: posts.length,
      surveys,
      posts: articles
    };
  };

  const stats = getStats();

  const filteredPosts = posts.filter(post => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'surveys') return post.type === 'survey' || post.type === 'poll';
    if (activeFilter === 'posts') return post.type === 'premium-post' || post.type === 'free-post';
    return true;
  });

  if (isLoading) {
    return <Loader />;
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="max-w-2xl mx-auto"
    >
      <ContentFilter 
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        stats={stats}
      />
      
      {filteredPosts.map((post) => (
        <motion.div key={post.id} variants={staggerItem}>
          <PostCard post={post} />
        </motion.div>
      ))}
      
      {filteredPosts.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="text-gray-500 text-lg">
            No {activeFilter === 'surveys' ? 'surveys' : activeFilter === 'posts' ? 'posts' : 'content'} available
          </div>
          <div className="text-gray-400 text-sm mt-2">
            {activeFilter === 'surveys' ? 'Check back for new surveys and polls' : 
             activeFilter === 'posts' ? 'Check back for new articles and posts' :
             'Check back later for new content'}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Feed;