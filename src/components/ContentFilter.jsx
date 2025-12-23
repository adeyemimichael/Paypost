import { motion } from 'framer-motion';
import { Gift, FileText, Filter, Coins } from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import { fadeIn } from '../animations/fadeIn';

const ContentFilter = ({ activeFilter, onFilterChange, stats }) => {
  const { isCreator } = useUserStore();

  const filters = [
    {
      id: 'all',
      label: 'All Content',
      icon: <Filter className="w-4 h-4" />,
      count: stats.total,
      color: 'text-gray-600'
    },
    {
      id: 'surveys',
      label: isCreator() ? 'My Surveys' : 'Earn Rewards',
      icon: isCreator() ? <FileText className="w-4 h-4" /> : <Coins className="w-4 h-4" />,
      count: stats.surveys,
      color: 'text-blue-600',
      highlight: !isCreator() // Highlight for participants
    },
    {
      id: 'posts',
      label: 'Premium Posts',
      icon: <FileText className="w-4 h-4" />,
      count: stats.posts,
      color: 'text-purple-600'
    }
  ];

  return (
    <motion.div {...fadeIn} className="mb-8">
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        {/* Helper text for participants */}
        {!isCreator() && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">
              💡 <strong>Tip:</strong> Click "Earn Rewards" to see available surveys and start earning MOVE tokens!
            </p>
          </div>
        )}
        
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all relative
                ${activeFilter === filter.id
                  ? 'bg-movement-500 text-white shadow-md'
                  : filter.highlight
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-2 border-blue-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {filter.highlight && activeFilter !== filter.id && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              )}
              <span className={activeFilter === filter.id ? 'text-white' : filter.color}>
                {filter.icon}
              </span>
              <span>{filter.label}</span>
              <span className={`
                px-2 py-1 rounded-full text-xs font-semibold
                ${activeFilter === filter.id
                  ? 'bg-white bg-opacity-20 text-white'
                  : filter.highlight
                  ? 'bg-blue-200 text-blue-800'
                  : 'bg-gray-200 text-gray-600'
                }
              `}>
                {filter.count}
              </span>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ContentFilter;