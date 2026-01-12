import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePrivy } from '@privy-io/react-auth';
import { X, CheckCircle, Clock, Users, Gift, AlertCircle, ExternalLink } from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import { usePostStore } from '../stores/postStore';
import { useWalletStore } from '../stores/walletStore';
import { movementService } from '../services/movementService';
import { formatPrice } from '../utils/formatters';
import { scaleIn } from '../animations/fadeIn';
import { notify } from '../utils/notify';
import Button from './Button';

const SurveyModal = ({ isOpen, onClose, onSubmit, post }) => {
  const { user } = usePrivy();
  const { userRole } = useUserStore();
  const { completeSurvey, hasUserCompletedSurvey, completedSurveys } = usePostStore();
  const { wallet, fetchBalance } = useWalletStore();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [walletStatus, setWalletStatus] = useState(null);

  // Check if already completed using the postStore method
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [isCheckingCompletion, setIsCheckingCompletion] = useState(true);
  
  // Reset state when post changes or modal opens
  useEffect(() => {
    if (isOpen && post) {
      setCurrentStep(0);
      setResponses({});
      setIsCompleted(false);
      setAlreadyCompleted(false);
      setIsCheckingCompletion(true);
    }
  }, [isOpen, post?.id]);
  
  useEffect(() => {
    const checkCompletion = async () => {
      if (post && wallet?.address && isOpen) {
        setIsCheckingCompletion(true);
        try {
          console.log('🔍 Checking completion for survey:', post.id, 'wallet:', wallet.address);
          const completed = await hasUserCompletedSurvey(post.id, wallet.address);
          console.log('🔍 Completion result:', completed, 'for survey:', post.id);
          setAlreadyCompleted(completed);
        } catch (error) {
          console.error('Failed to check survey completion:', error);
          // Don't block the user if we can't check completion status
          setAlreadyCompleted(false);
        } finally {
          setIsCheckingCompletion(false);
        }
      } else {
        setIsCheckingCompletion(false);
      }
    };
    checkCompletion();
  }, [post?.id, wallet?.address, isOpen, hasUserCompletedSurvey]);

  // Check wallet status when modal opens
  useEffect(() => {
    const checkWalletStatus = async () => {
      if (wallet?.address && isOpen) {
        try {
          const status = await movementService.checkWalletStatus(wallet.address);
          setWalletStatus(status);
        } catch (error) {
          console.error('Failed to check wallet status:', error);
          setWalletStatus({ exists: false, needsFunding: true });
        }
      }
    };
    checkWalletStatus();
  }, [wallet?.address, isOpen]);

  // Show loading while checking completion
  if (isCheckingCompletion && isOpen) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />
        <div className="flex min-h-full items-center justify-center p-4">
          <motion.div
            {...scaleIn}
            className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full p-6"
          >
            <div className="text-center py-8">
              <div className="w-16 h-16 border-4 border-movement-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Loading Survey...</h3>
              <p className="text-gray-600">Checking your eligibility</p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Show message if already completed
  if (alreadyCompleted) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />
        <div className="flex min-h-full items-center justify-center p-4">
          <motion.div
            {...scaleIn}
            className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full p-6"
          >
            <div className="text-center py-8">
              <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-4">Already Completed</h3>
              <p className="text-gray-600 mb-4">
                You've already completed this survey. Each participant can only complete a survey once.
              </p>
              <Button onClick={onClose}>Close</Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Show wallet funding message if needed
  if (walletStatus && walletStatus.needsFunding) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />
        <div className="flex min-h-full items-center justify-center p-4">
          <motion.div
            {...scaleIn}
            className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full p-6"
          >
            <div className="text-center py-8">
              <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-4">Wallet Needs Funding</h3>
              <p className="text-gray-600 mb-4">
                Your wallet needs MOVE tokens to complete surveys. Get free testnet tokens from the Movement faucet.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-2">Your wallet address:</p>
                <p className="font-mono text-sm break-all">{wallet?.address}</p>
              </div>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => window.open(movementService.getFaucetUrl(), '_blank')}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Get Free Tokens
                </Button>
                <Button variant="secondary" onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!post.questions || post.questions.length === 0) {
    console.error('Survey has no questions:', post);
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />
        <div className="flex min-h-full items-center justify-center p-4">
          <motion.div
            {...scaleIn}
            className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full p-6"
          >
            <div className="text-center py-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Survey Error</h3>
              <p className="text-gray-600 mb-4">This survey has no questions configured.</p>
              <Button onClick={onClose}>Close</Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const handleResponse = (questionId, answer) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentStep < post.questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting || !wallet) return;
    
    setIsSubmitting(true);
    try {
      console.log('Completing survey on blockchain...', {
        surveyId: post.id,
        wallet: wallet.address,
        responses
      });

      // Complete survey on blockchain (this pays the participant)
      const result = await completeSurvey(post.id, wallet);
      
      console.log('✅ Survey completed on blockchain:', result);
      
      // Refresh wallet balance to show new tokens
      setTimeout(() => fetchBalance(), 2000);
      
      // Optional: Call onSubmit callback if provided
      if (onSubmit) {
        await onSubmit(responses);
      }
      
      notify.success(`Survey completed! You earned ${formatPrice(post.reward || post.rewardAmount)} MOVE`);
      setIsCompleted(true);
      
      // Store transaction hash for later reference
      if (result.transactionHash) {
        localStorage.setItem(`survey_completion_${post.id}_${wallet.address}`, JSON.stringify({
          transactionHash: result.transactionHash,
          completedAt: new Date().toISOString(),
          reward: post.reward || post.rewardAmount
        }));
      }
      
    } catch (error) {
      console.error('Failed to complete survey:', error);
      notify.error(`Failed to complete survey: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCurrentQuestionAnswered = () => {
    const currentQuestion = post.questions[currentStep];
    return responses[currentQuestion.id] !== undefined;
  };

  const renderQuestion = (question) => {
    switch (question.type) {
      case 'multiple-choice':
        return (
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleResponse(question.id, option)}
                className={`
                  w-full p-4 text-left rounded-lg border-2 transition-all
                  ${responses[question.id] === option
                    ? 'border-movement-500 bg-movement-50 text-movement-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }
                `}
              >
                {option}
              </button>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-3">
            {question.options.map((option, index) => {
              const currentResponses = responses[question.id] || [];
              const isSelected = currentResponses.includes(option);
              
              return (
                <button
                  key={index}
                  onClick={() => {
                    const newResponses = isSelected
                      ? currentResponses.filter(r => r !== option)
                      : [...currentResponses, option];
                    handleResponse(question.id, newResponses);
                  }}
                  className={`
                    w-full p-4 text-left rounded-lg border-2 transition-all flex items-center
                    ${isSelected
                      ? 'border-movement-500 bg-movement-50 text-movement-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }
                  `}
                >
                  <div className={`
                    w-4 h-4 rounded border-2 mr-3 flex items-center justify-center
                    ${isSelected ? 'bg-movement-500 border-movement-500' : 'border-gray-300'}
                  `}>
                    {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                  </div>
                  {option}
                </button>
              );
            })}
          </div>
        );

      case 'rating':
        return (
          <div className="flex justify-center space-x-2">
            {Array.from({ length: question.max }, (_, i) => i + 1).map((rating) => (
              <button
                key={rating}
                onClick={() => handleResponse(question.id, rating)}
                className={`
                  w-12 h-12 rounded-full border-2 font-semibold transition-all
                  ${responses[question.id] === rating
                    ? 'border-movement-500 bg-movement-500 text-white'
                    : 'border-gray-300 hover:border-movement-300 text-gray-600'
                  }
                `}
              >
                {rating}
              </button>
            ))}
          </div>
        );

      case 'text':
        return (
          <textarea
            value={responses[question.id] || ''}
            onChange={(e) => handleResponse(question.id, e.target.value)}
            placeholder="Type your answer here..."
            className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-movement-500 focus:outline-none resize-none"
            rows={4}
          />
        );

      default:
        return null;
    }
  };

  if (!isOpen || !post) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-4">
          <motion.div
            {...scaleIn}
            className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full p-6"
          >
            {!isCompleted ? (
              <>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <Gift className="w-6 h-6 text-movement-500 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {post.title}
                    </h3>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Survey Info */}
                <div className="bg-gradient-to-r from-movement-50 to-purple-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-1" />
                      {post.estimatedTime} min
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users className="w-4 h-4 mr-1" />
                      {post.responses}/{post.maxResponses} responses
                    </div>
                    <div className="font-semibold text-movement-600">
                      Earn {formatPrice(post.reward)}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Question {currentStep + 1} of {post.questions.length}</span>
                    <span>{Math.round(((currentStep + 1) / post.questions.length) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-movement-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentStep + 1) / post.questions.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Question */}
                <div className="mb-8">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    {post.questions[currentStep].question}
                  </h4>
                  {renderQuestion(post.questions[currentStep])}
                </div>

                {/* Navigation */}
                <div className="flex justify-between">
                  <Button
                    variant="secondary"
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                  >
                    Previous
                  </Button>
                  
                  <Button
                    onClick={handleNext}
                    disabled={!isCurrentQuestionAnswered()}
                    loading={isSubmitting && currentStep === post.questions.length - 1}
                  >
                    {currentStep === post.questions.length - 1 ? 'Submit Survey' : 'Next'}
                  </Button>
                </div>
              </>
            ) : (
              /* Completion Screen */
              <div className="text-center py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </motion.div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Survey Completed!
                </h3>
                
                <p className="text-gray-600 mb-4">
                  Thank you for your participation. You've earned:
                </p>
                
                <div className="text-3xl font-bold text-movement-600 mb-6">
                  {formatPrice(post.reward)}
                </div>
                
                <p className="text-sm text-gray-500 mb-6">
                  Rewards have been sent to your wallet
                </p>
                
                <Button onClick={onClose} size="lg">
                  Continue Exploring
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default SurveyModal;