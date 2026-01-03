import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePrivy } from '@privy-io/react-auth';
import { X, Users, PenTool, ArrowRight, CheckCircle } from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import { scaleIn } from '../animations/fadeIn';
import Button from './Button';
import WalletSelector from './WalletSelector';

const RoleSelectionModal = ({ isOpen, onClose }) => {
  const { setUserRole, setUser, isLoading } = useUserStore();
  const { authenticated, user } = usePrivy();
  const [selectedRole, setSelectedRole] = useState(null);
  const [step, setStep] = useState('role'); // 'role' or 'wallet'

  const roles = [
    {
      id: 'reader',
      title: 'Survey Participant',
      description: 'Complete surveys and earn MOVE tokens for sharing your opinions',
      icon: <Users className="w-8 h-8" />,
      benefits: [
        'Earn MOVE tokens instantly',
        'Complete surveys on topics you care about',
        'No minimum payout threshold',
        'Anonymous participation'
      ],
      color: 'blue'
    },
    {
      id: 'creator',
      title: 'Survey Creator',
      description: 'Create surveys and gather valuable insights from the community',
      icon: <PenTool className="w-8 h-8" />,
      benefits: [
        'Create custom surveys',
        'Set your own reward amounts',
        'Access detailed analytics',
        'Build engaged audience'
      ],
      color: 'purple'
    }
  ];

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
  };

  const handleContinue = async () => {
    if (!selectedRole) return;
    
    if (step === 'role') {
      setStep('wallet');
      return;
    }
    
    // If wallet is already connected, complete the setup
    if (authenticated && user) {
      try {
        setUserRole(selectedRole);
        setUser(user);
        onClose();
      } catch (error) {
        console.error('Failed to set user role:', error);
      }
    }
  };

  const handleWalletConnected = (walletUser) => {
    try {
      setUserRole(selectedRole);
      setUser(walletUser);
      onClose();
    } catch (error) {
      console.error('Failed to complete setup:', error);
    }
  };

  if (!isOpen) return null;

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
            className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full p-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {step === 'role' ? 'Choose Your Role' : 'Connect Your Wallet'}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  {step === 'role' 
                    ? 'How would you like to participate in PayPost?'
                    : 'Select a wallet to get started with PayPost'
                  }
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            {step === 'role' ? (
              <>
                {/* Role Cards */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  {roles.map((role) => (
                    <motion.div
                      key={role.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleRoleSelect(role.id)}
                      className={`
                        relative p-6 rounded-xl border-2 cursor-pointer transition-all
                        ${selectedRole === role.id
                          ? `border-${role.color}-500 bg-${role.color}-50 dark:bg-${role.color}-900/20`
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }
                      `}
                    >
                      {/* Selection Indicator */}
                      {selectedRole === role.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className={`absolute top-4 right-4 w-6 h-6 bg-${role.color}-500 rounded-full flex items-center justify-center`}
                        >
                          <CheckCircle className="w-4 h-4 text-white" />
                        </motion.div>
                      )}

                      {/* Icon */}
                      <div className={`
                        w-16 h-16 rounded-lg flex items-center justify-center mb-4
                        ${selectedRole === role.id
                          ? `bg-${role.color}-500 text-white`
                          : `bg-${role.color}-100 dark:bg-${role.color}-900/30 text-${role.color}-600 dark:text-${role.color}-400`
                        }
                      `}>
                        {role.icon}
                      </div>

                      {/* Content */}
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {role.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        {role.description}
                      </p>

                      {/* Benefits */}
                      <ul className="space-y-2">
                        {role.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                            <CheckCircle className={`w-4 h-4 mr-2 text-${role.color}-500`} />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
                </div>
              </>
            ) : (
              <>
                {/* Wallet Selection */}
                <div className="mb-8">
                  <WalletSelector 
                    userRole={selectedRole}
                    onWalletConnected={handleWalletConnected}
                    showRoleInfo={false}
                  />
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={step === 'wallet' ? () => setStep('role') : onClose}
                disabled={isLoading}
              >
                {step === 'wallet' ? 'Back' : 'Cancel'}
              </Button>
              
              {step === 'role' && (
                <Button
                  onClick={handleContinue}
                  disabled={!selectedRole || isLoading}
                  loading={isLoading}
                  className="px-8"
                >
                  Continue as {selectedRole === 'creator' ? 'Creator' : 'Participant'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>

            {/* Note */}
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
              You can switch roles anytime from your profile settings
            </p>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default RoleSelectionModal;