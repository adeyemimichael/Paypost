import { motion } from 'framer-motion';
import { Gift, FileText, Filter } from 'lucide-react';
import { fadeIn } from '../animations/fadeIn';

const ContentFilter = ({ activeFilter, onFilterChange, stats }) => {
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
      label: 'Surveys & Polls',
      icon: <Gift className="w-4 h-4" />,
      count: stats.surveys,
      color: 'text-blue-600'
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
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all
                ${activeFilter === filter.id
                  ? 'bg-movement-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              <span className={activeFilter === filter.id ? 'text-white' : filter.color}>
                {filter.icon}
              </span>
              <span>{filter.label}</span>
              <span className={`
                px-2 py-1 rounded-full text-xs font-semibold
                ${activeFilter === filter.id
                  ? 'bg-white bg-opacity-20 text-white'
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