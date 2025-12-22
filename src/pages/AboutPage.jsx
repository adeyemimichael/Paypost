import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Target, 
  Users, 
  Zap, 
  Shield, 
  Globe, 
  Coins,
  TrendingUp,
  Heart,
  Award,
  Sparkles,
  CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { fadeIn, slideUp } from '../animations/fadeIn';
import Card from '../components/Card';
import Button from '../components/Button';

const AboutPage = () => {
  const values = [
    {
      icon: <Target className="w-8 h-8 text-blue-500" />,
      title: 'Transparency',
      description: 'Every transaction, reward, and interaction is recorded on the blockchain for complete transparency.'
    },
    {
      icon: <Users className="w-8 h-8 text-green-500" />,
      title: 'Community First',
      description: 'We put our community at the center of everything we do, ensuring fair rewards and quality content.'
    },
    {
      icon: <Zap className="w-8 h-8 text-yellow-500" />,
      title: 'Innovation',
      description: 'Pioneering the future of content monetization through cutting-edge Web3 technology.'
    },
    {
      icon: <Shield className="w-8 h-8 text-purple-500" />,
      title: 'Security',
      description: 'Your data and earnings are protected by industry-leading blockchain security protocols.'
    }
  ];

  const team = [
    {
      name: 'Alex Chen',
      role: 'Founder & CEO',
      bio: 'Former blockchain engineer at Coinbase with 8+ years in Web3',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
    },
    {
      name: 'Sarah Kim',
      role: 'CTO',
      bio: 'Ex-Google engineer specializing in distributed systems and smart contracts',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150'
    },
    {
      name: 'Marcus Johnson',
      role: 'Head of Product',
      bio: 'Product leader from Meta with expertise in user experience and growth',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
    },
    {
      name: 'Lisa Zhang',
      role: 'Head of Research',
      bio: 'PhD in Economics, former researcher at Stanford focusing on digital economies',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'
    }
  ];

  const milestones = [
    {
      date: 'Q1 2024',
      title: 'Platform Launch',
      description: 'PayPost launches on Movement testnet with core survey functionality'
    },
    {
      date: 'Q2 2024',
      title: 'Creator Program',
      description: 'Launch creator application system and premium content features'
    },
    {
      date: 'Q3 2024',
      title: 'Mainnet Deployment',
      description: 'Full deployment on Movement mainnet with enhanced features'
    },
    {
      date: 'Q4 2024',
      title: 'Global Expansion',
      description: 'Multi-language support and international creator partnerships'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div {...fadeIn} className="mb-12">
          <Link 
            to="/" 
            className="inline-flex items-center text-movement-600 dark:text-movement-400 hover:text-movement-700 dark:hover:text-movement-300 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          
          <div className="text-center">
            <motion.h1 
              {...slideUp}
              className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6"
            >
              About PayPost
            </motion.h1>
            <motion.p 
              {...slideUp}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
            >
              We're revolutionizing how people earn from their opinions and access quality content through Web3 technology.
            </motion.p>
          </div>
        </motion.div>

        {/* Mission Section */}
        <motion.section {...slideUp} transition={{ delay: 0.2 }} className="mb-20">
          <Card className="p-12 text-center bg-gradient-to-r from-movement-50 to-purple-50 dark:from-movement-900 dark:to-purple-900 border-movement-200 dark:border-movement-700">
            <Sparkles className="w-16 h-16 text-movement-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Our Mission
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              To create a fair, transparent, and rewarding ecosystem where people's opinions have real value, 
              creators are properly compensated, and quality content thrives through blockchain technology. 
              We believe everyone deserves to be rewarded for their contributions to the digital economy.
            </p>
          </Card>
        </motion.section>

        {/* Values Section */}
        <motion.section {...slideUp} transition={{ delay: 0.3 }} className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Our Values
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                {...slideUp}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <Card className="p-6 text-center h-full hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700">
                  <div className="mb-4">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {value.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Team Section */}
        <motion.section {...slideUp} transition={{ delay: 0.5 }} className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Meet Our Team
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Experienced builders from top tech companies and Web3 projects
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                {...slideUp}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <Card className="p-6 text-center hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
                  />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {member.name}
                  </h3>
                  <p className="text-movement-600 dark:text-movement-400 text-sm font-medium mb-3">
                    {member.role}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {member.bio}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Roadmap Section */}
        <motion.section {...slideUp} transition={{ delay: 0.7 }} className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Our Roadmap
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Building the future of Web3 content monetization
            </p>
          </div>

          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                {...slideUp}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="flex items-start space-x-6"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-movement-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                </div>
                <Card className="flex-1 p-6 dark:bg-gray-800 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {milestone.title}
                    </h3>
                    <span className="text-sm font-medium text-movement-600 dark:text-movement-400 bg-movement-100 dark:bg-movement-900 px-3 py-1 rounded-full">
                      {milestone.date}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    {milestone.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Stats Section */}
        <motion.section {...slideUp} transition={{ delay: 0.9 }} className="mb-20">
          <Card className="p-12 bg-gradient-to-r from-movement-500 to-purple-600 text-white text-center">
            <h2 className="text-3xl font-bold mb-8">PayPost by the Numbers</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <div className="text-4xl font-bold mb-2">8K+</div>
                <div className="text-movement-100">Active Users</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">15K+</div>
                <div className="text-movement-100">Surveys Completed</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">2.5K</div>
                <div className="text-movement-100">MOVE Distributed</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">150+</div>
                <div className="text-movement-100">Content Creators</div>
              </div>
            </div>
          </Card>
        </motion.section>

        {/* CTA Section */}
        <motion.section {...slideUp} transition={{ delay: 1.0 }} className="text-center">
          <Card className="p-12 dark:bg-gray-800 dark:border-gray-700">
            <Heart className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Join Our Community
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Be part of the Web3 revolution. Start earning from your opinions and help shape the future of decentralized content.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/feed">
                <Button size="lg" className="px-8 py-3">
                  <Coins className="w-5 h-5 mr-2" />
                  Start Earning
                </Button>
              </Link>
              <Link to="/creators">
                <Button variant="outline" size="lg" className="px-8 py-3">
                  <Award className="w-5 h-5 mr-2" />
                  Become a Creator
                </Button>
              </Link>
            </div>
          </Card>
        </motion.section>
      </div>
    </div>
  );
};

export default AboutPage;