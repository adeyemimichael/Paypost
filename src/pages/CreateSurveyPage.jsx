import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Trash2, 
  DollarSign, 
  Users, 
  FileText,
  AlertCircle,
  CheckCircle,
  Wallet,
  Upload,
  X
} from 'lucide-react';
import { useUserStore } from '../stores/newUserStore';
import { usePostStore } from '../stores/postStore';
import { usePayPostWallet } from '../hooks/usePayPostWallet';
import { fadeIn, slideUp } from '../animations/fadeIn';
import Button from '../components/Button';
import WalletBalance from '../components/WalletBalance';
import { notify } from '../utils/notify';

const CreateSurveyPage = () => {
  const navigate = useNavigate();
  const { 
    userRole, 
    isCreator, 
    canCreateSurveys, 
    requiresDatabaseRegistration,
    getBalance 
  } = useUserStore();
  
  const {
    isConnected,
    walletAddress,
    balance,
    user,
    signAndSubmitTransaction
  } = usePayPostWallet();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showRegistrationWarning, setShowRegistrationWarning] = useState(false);
  
  const [surveyData, setSurveyData] = useState({
    title: '',
    description: '',
    rewardAmount: 0.1,
    maxResponses: 100,
    durationDays: 7,
    image: null, // Add image field
    questions: [
      {
        id: 1,
        type: 'multiple-choice',
        question: '',
        options: ['', '']
      }
    ]
  });

  const needsRegistration = requiresDatabaseRegistration();

  // Show registration warning if needed
  useEffect(() => {
    if (needsRegistration) {
      setShowRegistrationWarning(true);
    }
  }, [needsRegistration]);

  // Redirect if not creator (using useEffect to avoid hooks rule violation)
  useEffect(() => {
    if (!isCreator()) {
      navigate('/feed');
    }
  }, [isCreator, navigate]);

  // Don't render if not creator
  if (!isCreator()) {
    return null;
  }

  const questionTypes = [
    { value: 'multiple-choice', label: 'Multiple Choice', icon: '📝' },
    { value: 'rating', label: 'Rating Scale', icon: '⭐' },
    { value: 'text', label: 'Text Response', icon: '💬' },
    { value: 'checkbox', label: 'Multiple Select', icon: '☑️' }
  ];

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      type: 'multiple-choice',
      question: '',
      options: ['', '']
    };
    setSurveyData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const removeQuestion = (questionId) => {
    setSurveyData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
  };

  const updateQuestion = (questionId, field, value) => {
    setSurveyData(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? { ...q, [field]: value } : q
      )
    }));
  };

  const addOption = (questionId) => {
    setSurveyData(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? { ...q, options: [...q.options, ''] } : q
      )
    }));
  };

  const removeOption = (questionId, optionIndex) => {
    setSurveyData(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId 
          ? { ...q, options: q.options.filter((_, i) => i !== optionIndex) }
          : q
      )
    }));
  };

  const updateOption = (questionId, optionIndex, value) => {
    setSurveyData(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId 
          ? { 
              ...q, 
              options: q.options.map((opt, i) => i === optionIndex ? value : opt)
            }
          : q
      )
    }));
  };

  const calculateTotalCost = () => {
    const totalRewards = surveyData.rewardAmount * surveyData.maxResponses;
    const platformFee = totalRewards * 0.025; // 2.5% platform fee
    return totalRewards + platformFee;
  };

  const validateSurvey = () => {
    if (!surveyData.title.trim()) return 'Survey title is required';
    if (!surveyData.description.trim()) return 'Survey description is required';
    if (surveyData.rewardAmount <= 0) return 'Reward amount must be greater than 0';
    if (surveyData.maxResponses <= 0) return 'Max responses must be greater than 0';
    
    // Check if user has sufficient balance
    const userBalance = balance;
    const totalCost = calculateTotalCost();
    
    if (userBalance < totalCost) {
      return `Insufficient balance. You need ${totalCost.toFixed(2)} MOVE but only have ${userBalance.toFixed(2)} MOVE`;
    }
    
    for (let question of surveyData.questions) {
      if (!question.question.trim()) return 'All questions must have text';
      if (['multiple-choice', 'checkbox'].includes(question.type)) {
        const validOptions = question.options.filter(opt => opt.trim());
        if (validOptions.length < 2) return 'Multiple choice questions need at least 2 options';
      }
    }
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateSurvey();
    if (validationError) {
      notify.error(validationError);
      return;
    }

    if (!walletAddress) {
      notify.error('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    
    try {
      const durationSeconds = surveyData.durationDays * 24 * 60 * 60;
      
      // Use the post store's createSurvey method which handles both Supabase and blockchain
      const { createSurvey } = usePostStore.getState();
      const { getDatabaseUserId } = useUserStore.getState();
      
      let databaseUserId = getDatabaseUserId();
      if (!databaseUserId && user?.dbId) {
        databaseUserId = user.dbId;
      }
      
      if (!databaseUserId) {
        // Try to re-register the user in database
        const { setUser } = useUserStore.getState();
        try {
          console.log('🔄 Registering user in database...');
          
          const { supabaseService } = await import('../services/supabaseService');
          const initialized = await supabaseService.initialize();
          if (!initialized) {
            throw new Error('Database service not available');
          }
          
          const dbUser = await supabaseService.getOrCreateUser(
            walletAddress,
            user?.email || `${walletAddress.slice(0, 8)}@paypost.xyz`,
            'creator',
            user?.id
          );
          
          if (dbUser) {
            // Update user with database info
            setUser({
              ...user,
              dbId: dbUser.id,
              dbUser
            });
            databaseUserId = dbUser.id;
            console.log('✅ User registered successfully');
          }
        } catch (regError) {
          throw new Error('User not properly registered in database. Please disconnect and reconnect your wallet, or check your internet connection.');
        }
      }
      
      const result = await createSurvey({
        title: surveyData.title,
        description: surveyData.description,
        rewardAmount: surveyData.rewardAmount,
        maxResponses: surveyData.maxResponses,
        durationSeconds,
        questions: surveyData.questions.map(q => ({
          text: q.question,
          type: q.type,
          options: q.options,
          required: true
        }))
      }, walletAddress, databaseUserId, signAndSubmitTransaction);

      if (result.success) {
        notify.success(`Survey created successfully! ID: ${result.surveyId}`);
        navigate('/feed');
      }
    } catch (error) {
      console.error('Failed to create survey:', error);
      notify.error(`Failed to create survey: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      notify.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      notify.error('Image size must be less than 5MB');
      return;
    }

    try {
      // For now, create a local URL for preview
      // In production, you would upload to Supabase storage
      const imageUrl = URL.createObjectURL(file);
      setSurveyData(prev => ({ ...prev, image: { file, url: imageUrl } }));
      notify.success('Image uploaded successfully');
    } catch (error) {
      console.error('Failed to upload image:', error);
      notify.error('Failed to upload image');
    }
  };

  const removeImage = () => {
    if (surveyData.image?.url) {
      URL.revokeObjectURL(surveyData.image.url);
    }
    setSurveyData(prev => ({ ...prev, image: null }));
  };

  const handleWalletConnected = async (wallet) => {
    console.log('✅ Movement wallet connected:', wallet);
    // Retry survey creation after wallet connection
    setTimeout(() => {
      handleSubmit({ preventDefault: () => {} });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Wallet Balance */}
        <motion.div {...fadeIn} className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Create New Survey
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Design your survey and set rewards to gather valuable insights from the community
          </p>
          
          {/* Registration Warning */}
          {showRegistrationWarning && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
            >
              <div className="flex items-center justify-center space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <div className="text-left">
                  <div className="text-sm font-medium text-yellow-800">
                    Database Registration Required
                  </div>
                  <div className="text-sm text-yellow-700">
                    You need to be registered in our database to create surveys. 
                    <button 
                      onClick={async () => {
                        try {
                          const { login } = useUserStore.getState();
                          await login('creator');
                          setShowRegistrationWarning(false);
                        } catch (error) {
                          notify.error('Registration failed. Please check your connection.');
                        }
                      }}
                      className="ml-2 underline hover:no-underline"
                    >
                      Click here to register
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Wallet Balance Display */}
          <div className="flex justify-center">
            <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl p-4 text-white shadow-lg">
              <div className="flex items-center justify-center space-x-3">
                <Wallet className="w-6 h-6" />
                <div className="text-left">
                  <div className="text-sm opacity-90">Available Balance</div>
                  <WalletBalance 
                    size="md" 
                    showLabel={false} 
                    className="bg-white/20 border-white/30 text-white [&>*]:text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <motion.div {...slideUp} className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-500" />
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Survey Title *
                </label>
                <input
                  type="text"
                  value={surveyData.title}
                  onChange={(e) => setSurveyData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Web3 Gaming Preferences Survey"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={surveyData.description}
                  onChange={(e) => setSurveyData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe what your survey is about and why responses are valuable..."
                  required
                />
              </div>

              {/* Image Upload */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Survey Image (Optional)
                </label>
                {!surveyData.image ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        Click to upload an image or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </label>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={surveyData.image.url}
                      alt="Survey preview"
                      className="w-full h-48 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Reward Settings */}
          <motion.div {...slideUp} transition={{ delay: 0.1 }} className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-green-500" />
              Reward Settings
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reward per Response (MOVE) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={surveyData.rewardAmount}
                  onChange={(e) => setSurveyData(prev => ({ ...prev, rewardAmount: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Responses *
                </label>
                <input
                  type="number"
                  min="1"
                  value={surveyData.maxResponses}
                  onChange={(e) => setSurveyData(prev => ({ ...prev, maxResponses: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (Days) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={surveyData.durationDays}
                  onChange={(e) => setSurveyData(prev => ({ ...prev, durationDays: parseInt(e.target.value) || 1 }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-medium text-blue-900 mb-2">Cost Breakdown</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Total Rewards:</span>
                  <span className="font-medium">{(surveyData.rewardAmount * surveyData.maxResponses).toFixed(2)} MOVE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Platform Fee (2.5%):</span>
                  <span className="font-medium">{(surveyData.rewardAmount * surveyData.maxResponses * 0.025).toFixed(2)} MOVE</span>
                </div>
                <div className="flex justify-between border-t border-blue-200 pt-1">
                  <span className="font-semibold text-blue-900">Total Cost:</span>
                  <span className="font-bold text-blue-900">{calculateTotalCost().toFixed(2)} MOVE</span>
                </div>
              </div>
              
              {/* Balance Warning */}
              {(() => {
                const userBalance = balance;
                const totalCost = calculateTotalCost();
                
                if (userBalance < totalCost) {
                  return (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center text-red-700">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        <span className="text-sm font-medium">
                          Insufficient Balance: Need {(totalCost - userBalance).toFixed(2)} more MOVE
                        </span>
                      </div>
                    </div>
                  );
                }
                
                return (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center text-green-700">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">
                        Sufficient Balance: {(userBalance - totalCost).toFixed(2)} MOVE remaining
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </motion.div>

          {/* Questions */}
          <motion.div {...slideUp} transition={{ delay: 0.2 }} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Users className="w-5 h-5 mr-2 text-purple-500" />
                Survey Questions
              </h2>
              <Button
                type="button"
                onClick={addQuestion}
                variant="outline"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </div>

            <div className="space-y-6">
              {surveyData.questions.map((question, index) => (
                <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-900">Question {index + 1}</h3>
                    {surveyData.questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(question.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Question Type
                      </label>
                      <select
                        value={question.type}
                        onChange={(e) => updateQuestion(question.id, 'type', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {questionTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.icon} {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Question Text *
                      </label>
                      <input
                        type="text"
                        value={question.question}
                        onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your question..."
                        required
                      />
                    </div>

                    {['multiple-choice', 'checkbox'].includes(question.type) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Answer Options
                        </label>
                        <div className="space-y-2">
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder={`Option ${optionIndex + 1}`}
                              />
                              {question.options.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => removeOption(question.id, optionIndex)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addOption(question.id)}
                            className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                          >
                            + Add Option
                          </button>
                        </div>
                      </div>
                    )}

                    {question.type === 'rating' && (
                      <div className="text-sm text-gray-600">
                        <AlertCircle className="w-4 h-4 inline mr-1" />
                        Rating questions will show a 1-5 star scale
                      </div>
                    )}

                    {question.type === 'text' && (
                      <div className="text-sm text-gray-600">
                        <AlertCircle className="w-4 h-4 inline mr-1" />
                        Text questions allow free-form responses
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Submit */}
          <motion.div {...slideUp} transition={{ delay: 0.3 }} className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/feed')}
              disabled={isLoading}
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              loading={isLoading}
              disabled={needsRegistration}
              className="px-8"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {needsRegistration 
                ? 'Registration Required' 
                : `Create & Fund Survey (${calculateTotalCost().toFixed(2)} MOVE)`
              }
            </Button>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

export default CreateSurveyPage;