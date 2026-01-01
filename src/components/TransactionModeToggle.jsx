import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Zap, AlertTriangle } from 'lucide-react';
import { realMovementService } from '../services/realMovementService';
import Button from './Button';

const TransactionModeToggle = () => {
  const [isSimulationMode, setIsSimulationMode] = useState(realMovementService.isInSimulationMode());
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleToggleMode = () => {
    if (isSimulationMode) {
      // Switching to real mode - show confirmation
      setShowConfirmation(true);
    } else {
      // Switching to simulation mode - no confirmation needed
      realMovementService.isSimulationMode = true;
      setIsSimulationMode(true);
    }
  };

  const confirmRealMode = () => {
    realMovementService.enableRealTransactions();
    setIsSimulationMode(false);
    setShowConfirmation(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4"
      >
        <div className="flex items-center space-x-3 mb-3">
          <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          <span className="font-medium text-gray-900 dark:text-white">
            Transaction Mode
          </span>
        </div>
        
        <div className="flex items-center space-x-3 mb-3">
          <div className={`
            flex items-center space-x-2 px-3 py-2 rounded-lg
            ${isSimulationMode 
              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' 
              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            }
          `}>
            {isSimulationMode ? (
              <>
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">Simulation</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span className="text-sm font-medium">Real Transactions</span>
              </>
            )}
          </div>
        </div>

        <Button
          onClick={handleToggleMode}
          size="sm"
          variant={isSimulationMode ? "primary" : "outline"}
          className="w-full"
        >
          {isSimulationMode ? 'Enable Real Transactions' : 'Switch to Simulation'}
        </Button>

        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
          >
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                  Enable Real Transactions?
                </p>
                <p className="text-xs text-red-600 dark:text-red-300 mb-3">
                  This will use real MOVE tokens. Make sure you have sufficient balance.
                </p>
                <div className="flex space-x-2">
                  <Button
                    onClick={confirmRealMode}
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Confirm
                  </Button>
                  <Button
                    onClick={() => setShowConfirmation(false)}
                    size="sm"
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          {isSimulationMode ? (
            'Transactions are simulated for testing'
          ) : (
            'Real blockchain transactions enabled'
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default TransactionModeToggle;