import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, TrendingUp, Award, Star, Gift, FileText } from 'lucide-react';
import { fadeIn, slideUp } from '../animations/fadeIn';
import Card from '../components/Card';
import Button from '../components/Button';

const CreatorsPage = () => {
  const topCreators = [
    {
      id: 1,
      name: 'GameFi Research',
      address: '0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      speciality: 'Gaming & Web3',
      surveysCreated: 15,
      totalRewards: 12.5,
      followers: 2340,
      rating: 4.9,
      type: 'Survey Creator'
    },
    {
      id: 2,
      name: 'DeFi Labs',
      address: '0x8ba1f109551bD432803012645Hac136c0532925a3',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      speciality: 'DeFi Analysis',
      surveysCreated: 8,
      totalRewards: 8.2,
      followers: 1890,
      rating: 4.8,
      type: 'Survey Creator'
    },
    {
      id: 3,
      name: 'Movement Core Team',
      address: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef12',
      avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=100',
      speciality: 'Technical Analysis',
      postsCreated: 12,
      totalEarnings: 15.8,
      followers: 4560,
      rating: 4.9,
      type: 'Content Creator'
    },
    {
      id: 4,
      name: 'DeFi Research Pro',
      address: '0x2b3c4d5e6f7890abcdef1234567890abcdef1234',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100',
      speciality: 'Investment Research',
      postsCreated: 6,
      totalEarnings: 22.4,
      followers: 3210,
      rating: 4.7,
      type: 'Content Creator'
    }
  ];

  const CreatorCard = ({ creator }) => (
    <motion.div {...slideUp}>
      <Card className="p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-start space-x-4">
          <img
            src={creator.avatar}
            alt={creator.name}
            className="w-16 h-16 rounded-full object-cover"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{creator.name}</h3>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium text-gray-700">{creator.rating}</span>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-2">{creator.speciality}</p>
            
            <div className="flex items-center space-x-1 mb-3">
              <span className={`
                px-2 py-1 rounded-full text-xs font-medium
                ${creator.type === 'Survey Creator' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-purple-100 text-purple-700'
                }
              `}>
                {creator.type}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {creator.surveysCreated || creator.postsCreated}
                </div>
                <div className="text-xs text-gray-500">
                  {creator.type === 'Survey Creator' ? 'Surveys' : 'Posts'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-movement-600">
                  {creator.totalRewards || creator.totalEarnings} MOVE
                </div>
                <div className="text-xs text-gray-500">
                  {creator.type === 'Survey Creator' ? 'Distributed' : 'Earned'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {creator.followers.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">Followers</div>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button size="sm" className="flex-1">
                Follow
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                View Profile
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div {...fadeIn} className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Top Creators
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the best survey creators and content writers on PayPost. Follow your favorites and never miss their latest work.
          </p>
        </motion.div>

        {/* Stats Section */}
        <motion.div 
          {...fadeIn}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
        >
          <Card className="p-6 text-center">
            <Users className="w-8 h-8 text-blue-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900 mb-1">150+</div>
            <div className="text-sm text-gray-600">Active Creators</div>
          </Card>
          
          <Card className="p-6 text-center">
            <Gift className="w-8 h-8 text-green-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900 mb-1">2.5K</div>
            <div className="text-sm text-gray-600">MOVE Distributed</div>
          </Card>
          
          <Card className="p-6 text-center">
            <FileText className="w-8 h-8 text-purple-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900 mb-1">500+</div>
            <div className="text-sm text-gray-600">Content Created</div>
          </Card>
          
          <Card className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-orange-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900 mb-1">4.8</div>
            <div className="text-sm text-gray-600">Avg Rating</div>
          </Card>
        </motion.div>

        {/* Creator Types */}
        <motion.div 
          {...fadeIn}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-8">
              <div className="flex items-center mb-4">
                <Gift className="w-8 h-8 text-blue-500 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Survey Creators</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Researchers, companies, and organizations creating surveys to gather valuable insights from the community.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Market research surveys</li>
                <li>• Product feedback collection</li>
                <li>• Academic research studies</li>
                <li>• Community polls and voting</li>
              </ul>
            </Card>

            <Card className="p-8">
              <div className="flex items-center mb-4">
                <FileText className="w-8 h-8 text-purple-500 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Content Creators</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Writers, analysts, and experts sharing premium insights, research, and educational content.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Technical analysis and research</li>
                <li>• Investment insights and alpha</li>
                <li>• Educational tutorials</li>
                <li>• Exclusive interviews and news</li>
              </ul>
            </Card>
          </div>
        </motion.div>

        {/* Top Creators */}
        <motion.div 
          {...fadeIn}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Featured Creators</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {topCreators.map((creator) => (
              <CreatorCard key={creator.id} creator={creator} />
            ))}
          </div>
        </motion.div>

        {/* Become a Creator CTA */}
        <motion.div 
          {...fadeIn}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-movement-500 to-purple-600 rounded-xl p-8 text-center text-white"
        >
          <Award className="w-12 h-12 mx-auto mb-4 text-white" />
          <h2 className="text-2xl font-bold mb-4">Become a Creator</h2>
          <p className="text-lg mb-6 max-w-2xl mx-auto">
            Join our community of creators and start monetizing your expertise. Create surveys, publish premium content, and build your following.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/apply-creator">
              <Button
                variant="secondary"
                size="lg"
                className="bg-white text-movement-600 hover:bg-gray-100"
              >
                Apply as Creator
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-movement-600"
            >
              Learn More
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CreatorsPage;