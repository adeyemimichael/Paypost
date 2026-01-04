import { motion } from 'framer-motion';
import { 
  Target, 
  Users, 
  Shield, 
  Zap, 
  Globe, 
  Award,
  Heart,
  TrendingUp,
  CheckCircle,
  Coins
} from 'lucide-react';
import { fadeIn, slideUp } from '../animations/fadeIn';
import Button from '../components/Button';

const AboutPage = () => {
  const milestones = [
    {
      date: '2024 Q1',
      title: 'Platform Launch',
      description: 'Launched PayPost on Movement testnet with core survey functionality',
      icon: <Zap className="w-6 h-6" />
    },
    {
      date: '2024 Q2',
      title: 'Community Growth',
      description: 'Reached 8,000+ active users and 15,000+ completed surveys',
      icon: <Users className="w-6 h-6" />
    },
    {
      date: '2024 Q3',
      title: 'Token Distribution',
      description: 'Distributed over 2,500 MOVE tokens to survey participants',
      icon: <Coins className="w-6 h-6" />
    },
    {
      date: '2024 Q4',
      title: 'Advanced Features',
      description: 'Launched AI-powered matching and zero-knowledge privacy',
      icon: <Shield className="w-6 h-6" />
    }
  ];

  const values = [
    {
      icon: <Heart className="w-8 h-8 text-red-500" />,
      title: 'User-First',
      description: 'Every decision we make prioritizes user experience and value creation.'
    },
    {
      icon: <Shield className="w-8 h-8 text-blue-500" />,
      title: 'Privacy-Focused',
      description: 'Your data belongs to you. We use zero-knowledge proofs to protect privacy.'
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-green-500" />,
      title: 'Transparency',
      description: 'Open-source smart contracts and transparent reward distribution.'
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-purple-500" />,
      title: 'Innovation',
      description: 'Pushing the boundaries of Web3 UX and blockchain technology.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      {/* Hero Section */}
      <motion.section {...fadeIn} className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1 
            {...slideUp}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6"
          >
            Democratizing <span className="text-transparent bg-clip-text bg-gradient-to-r from-movement-600 to-purple-600">Market Research</span>
          </motion.h1>
          <motion.p 
            {...slideUp}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto"
          >
            PayPost is revolutionizing how market research works by creating a fair, transparent, 
            and rewarding ecosystem where everyone wins - researchers get quality data, 
            participants get fairly compensated.
          </motion.p>
        </div>
      </motion.section>

      {/* Mission Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeIn}>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                Traditional market research is broken. Participants spend time providing valuable insights 
                but receive little to no compensation, while researchers pay high fees to intermediaries 
                who don't add real value.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                We're building a direct connection between researchers and participants, powered by 
                blockchain technology to ensure instant, fair payments and complete transparency.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-movement-600 mb-2">8K+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-movement-600 mb-2">2.5K</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">MOVE Distributed</div>
                </div>
              </div>
            </motion.div>
            <motion.div {...fadeIn} transition={{ delay: 0.3 }}>
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop" 
                  alt="Team collaboration" 
                  className="rounded-2xl shadow-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-movement-500/20 to-purple-500/20 rounded-2xl"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Our Values
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              These core principles guide everything we do at PayPost
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                {...fadeIn}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex justify-center mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Our Journey
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Key milestones in building the future of market research
            </p>
          </motion.div>
          
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-movement-500 to-purple-500 rounded-full"></div>
            
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.date}
                  {...fadeIn}
                  transition={{ delay: index * 0.2 }}
                  className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                >
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                      <div className="text-movement-600 dark:text-movement-400 font-semibold mb-2">
                        {milestone.date}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                        {milestone.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Timeline dot */}
                  <div className="relative z-10 flex items-center justify-center w-12 h-12 bg-white dark:bg-gray-800 border-4 border-movement-500 rounded-full">
                    <div className="text-movement-600 dark:text-movement-400">
                      {milestone.icon}
                    </div>
                  </div>
                  
                  <div className="w-1/2"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-movement-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div {...fadeIn}>
            <h2 className="text-3xl font-bold text-white mb-6">
              Ready to Join the Revolution?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Whether you're a researcher looking for quality insights or someone who wants to earn by sharing opinions, 
              PayPost is the platform for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="secondary" 
                size="lg"
                className="bg-white text-movement-600 hover:bg-gray-100"
              >
                Start Earning Now
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-white text-white hover:bg-white hover:text-movement-600"
              >
                Become a Creator
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;