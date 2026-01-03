import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, CheckCircle, AlertCircle, User, FileText, DollarSign, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUserStore } from '../stores/userStore';
import { fadeIn, slideUp } from '../animations/fadeIn';
import Button from '../components/Button';
import Card from '../components/Card';
import { notify } from '../utils/notify';

const CreatorApplicationPage = () => {
  const { isAuthenticated, login } = useUserStore();
  const [formData, setFormData] = useState({
    creatorType: '',
    name: '',
    email: '',
    bio: '',
    experience: '',
    portfolio: '',
    socialLinks: {
      twitter: '',
      linkedin: '',
      website: ''
    },
    motivation: '',
    contentPlan: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      notify.error('Please connect your wallet first');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      notify.success('Application submitted successfully! We\'ll review it within 48 hours.');
      setSubmitted(true);
    } catch (error) {
      notify.error('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const creatorTypes = [
    {
      id: 'survey-creator',
      title: 'Survey Creator',
      description: 'Create surveys and polls to gather insights from the community',
      icon: <Target className="w-6 h-6" />,
      examples: ['Market research', 'Product feedback', 'Academic studies', 'Community polls']
    },
    {
      id: 'content-creator',
      title: 'Content Creator',
      description: 'Publish premium articles, analysis, and educational content',
      icon: <FileText className="w-6 h-6" />,
      examples: ['Technical analysis', 'Investment research', 'Tutorials', 'Industry insights']
    }
  ];

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <motion.div {...fadeIn} className="max-w-md w-full">
          <Card className="p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle className="w-8 h-8 text-green-500" />
            </motion.div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Application Submitted!
            </h2>
            
            <p className="text-gray-600 mb-6">
              Thank you for applying to become a PayPost creator. We'll review your application and get back to you within 48 hours.
            </p>
            
            <div className="space-y-3">
              <Link to="/creators">
                <Button className="w-full">
                  Back to Creators
                </Button>
              </Link>
              <Link to="/feed">
                <Button variant="outline" className="w-full">
                  Browse Feed
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div {...fadeIn} className="mb-8">
          <Link 
            to="/creators" 
            className="inline-flex items-center text-movement-600 hover:text-movement-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Creators
          </Link>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Apply as Creator
              </h1>
              <p className="text-lg text-gray-600">
                Join our community of creators and start monetizing your expertise on PayPost.
              </p>
            </div>
            
            {/* Show Balance for context */}
            {isAuthenticated && (
              <div className="hidden md:block">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                  <div className="text-sm text-gray-500 mb-1">Your Balance</div>
                  <div className="text-2xl font-bold text-movement-600">
                    {useUserStore.getState().balance.toFixed(2)} MOVE
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Auth Check */}
        {!isAuthenticated && (
          <motion.div {...slideUp} className="mb-8">
            <Card className="p-6 border-orange-200 bg-orange-50">
              <div className="flex items-center">
                <AlertCircle className="w-6 h-6 text-orange-500 mr-3" />
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-800">Wallet Required</h3>
                  <p className="text-orange-700 text-sm">
                    Please connect your wallet to submit a creator application.
                  </p>
                </div>
                <Button onClick={login} size="sm">
                  Connect Wallet
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Creator Type Selection */}
          <motion.div {...slideUp}>
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Choose Creator Type
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                {creatorTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => handleInputChange('creatorType', type.id)}
                    className={`
                      p-4 rounded-lg border-2 text-left transition-all
                      ${formData.creatorType === type.id
                        ? 'border-movement-500 bg-movement-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <div className="flex items-center mb-3">
                      <div className={`
                        p-2 rounded-lg mr-3
                        ${formData.creatorType === type.id
                          ? 'bg-movement-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                        }
                      `}>
                        {type.icon}
                      </div>
                      <h3 className="font-semibold text-gray-900">{type.title}</h3>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3">{type.description}</p>
                    
                    <div className="space-y-1">
                      {type.examples.map((example, index) => (
                        <div key={index} className="text-xs text-gray-500">
                          • {example}
                        </div>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Personal Information */}
          <motion.div {...slideUp} transition={{ delay: 0.1 }}>
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Personal Information
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-movement-500 focus:border-transparent"
                    placeholder="Your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-movement-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio *
                </label>
                <textarea
                  required
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-movement-500 focus:border-transparent"
                  placeholder="Tell us about yourself and your expertise..."
                />
              </div>
            </Card>
          </motion.div>

          {/* Experience & Portfolio */}
          <motion.div {...slideUp} transition={{ delay: 0.2 }}>
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Experience & Portfolio
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Relevant Experience *
                  </label>
                  <textarea
                    required
                    value={formData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-movement-500 focus:border-transparent"
                    placeholder="Describe your relevant experience in research, content creation, or your field of expertise..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Portfolio/Work Samples
                  </label>
                  <input
                    type="url"
                    value={formData.portfolio}
                    onChange={(e) => handleInputChange('portfolio', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-movement-500 focus:border-transparent"
                    placeholder="https://your-portfolio.com"
                  />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Social Links */}
          <motion.div {...slideUp} transition={{ delay: 0.3 }}>
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Social Links
              </h2>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Twitter
                  </label>
                  <input
                    type="url"
                    value={formData.socialLinks.twitter}
                    onChange={(e) => handleInputChange('socialLinks.twitter', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-movement-500 focus:border-transparent"
                    placeholder="https://twitter.com/username"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    value={formData.socialLinks.linkedin}
                    onChange={(e) => handleInputChange('socialLinks.linkedin', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-movement-500 focus:border-transparent"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.socialLinks.website}
                    onChange={(e) => handleInputChange('socialLinks.website', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-movement-500 focus:border-transparent"
                    placeholder="https://your-website.com"
                  />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Content Plan */}
          <motion.div {...slideUp} transition={{ delay: 0.4 }}>
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Content Plan
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Why do you want to become a creator on PayPost? *
                  </label>
                  <textarea
                    required
                    value={formData.motivation}
                    onChange={(e) => handleInputChange('motivation', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-movement-500 focus:border-transparent"
                    placeholder="Share your motivation and goals..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What type of content do you plan to create? *
                  </label>
                  <textarea
                    required
                    value={formData.contentPlan}
                    onChange={(e) => handleInputChange('contentPlan', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-movement-500 focus:border-transparent"
                    placeholder="Describe the surveys, posts, or content you plan to create..."
                  />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Submit Button */}
          <motion.div {...slideUp} transition={{ delay: 0.5 }}>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Ready to Submit?</h3>
                  <p className="text-sm text-gray-600">
                    We'll review your application within 48 hours and notify you via email.
                  </p>
                </div>
                
                <Button
                  type="submit"
                  size="lg"
                  loading={isSubmitting}
                  disabled={!isAuthenticated || !formData.creatorType || !formData.name || !formData.email}
                  className="px-8"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </Button>
              </div>
            </Card>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

export default CreatorApplicationPage;