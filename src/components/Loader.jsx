import { motion } from 'framer-motion';

const Loader = ({ size = 'md', text = 'Loading...' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-12"
    >
      <div className={`${sizes[size]} border-4 border-gray-200 border-t-movement-500 rounded-full animate-spin mb-4`}></div>
      <p className="text-gray-600 text-sm">{text}</p>
    </motion.div>
  );
};

export default Loader;