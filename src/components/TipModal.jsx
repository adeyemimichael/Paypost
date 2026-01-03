import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, DollarSign } from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import { usePostStore } from '../stores/postStore';
import { formatAddress } from '../utils/formatters';
import { scaleIn } from '../animations/fadeIn';
import Button from './Button';

const TipModal = ({ isOpen, onClose, creatorAddress, creatorName }) => {
  const { user } = useUserStore();
  const { tipCreator, isLoading } = usePostStore();
  const [selectedAmount, setSelectedAmount] = useState(0.1);
  const [customAmount, setCustomAmount] = useState('');

  const walletAddress = user?.wallet?.address || user?.email?.address;
  
  const predefinedAmounts = [0.1, 0.5, 1.0, 2.0];

  const handleTip = async () => {
    const amount = customAmount ? parseFloat(customAmount) : selectedAmount;
    
    if (amount <= 0) return;

    try {
      await tipCreator(creatorAddress, amount, walletAddress);
      onClose();
      setCustomAmount('');
      setSelectedAmount(0.1);
    } catch (error) {
      console.error('Failed to send tip:', error);
    }
  };

  const handleAmountSelect = (amount) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setCustomAmount(value);
      setSelectedAmount(0);
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
            className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Heart className="w-6 h-6 text-red-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Tip Creator
                </h3>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Creator Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="text-sm text-gray-600 mb-1">Sending tip to:</div>
              <div className="font-medium text-gray-900">{creatorName}</div>
              <div className="text-sm text-gray-500">{formatAddress(creatorAddress)}</div>
            </div>

            {/* Amount Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Amount (MOVE)
              </label>
              
              {/* Predefined Amounts */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {predefinedAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handleAmountSelect(amount)}
                    className={`
                      p-3 rounded-lg border-2 text-sm font-medium transition-all
                      ${selectedAmount === amount
                        ? 'border-movement-500 bg-movement-50 text-movement-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }
                    `}
                  >
                    {amount} MOVE
                  </button>
                ))}
              </div>

              {/* Custom Amount */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Or enter custom amount:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={customAmount}
                    onChange={handleCustomAmountChange}
                    placeholder="0.0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-movement-500 focus:border-transparent"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-gray-500 text-sm">MOVE</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleTip}
                loading={isLoading}
                disabled={!selectedAmount && !customAmount}
                className="flex-1"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Send Tip
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default TipModal;