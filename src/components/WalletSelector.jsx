import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Wallet, LogIn } from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import Button from './Button';

const WalletSelector = ({ 
  onClose, 
  userRole = 'reader', 
  onWalletConnected,
  showRoleInfo = true 
}) => {
  const { login, user, authenticated } = usePrivy();
  const { setUser } = useUserStore();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleLogin = async () => {
    setIsConnecting(true);
    try {
      login();
      // The actual redirection or state update happens via Privy's callback or useEffect in App/Navbar
      // But we can try to handle success here if needed, though login() is usually void/async
    } catch (error) {
      console.error('Login failed:', error);
      setIsConnecting(false);
    }
  };

  // If already authenticated, trigger callback
  if (authenticated && user && onWalletConnected) {
    onWalletConnected(user);
  }

  return (
    <div className="space-y-4">
      {showRoleInfo && (
        <div className="text-center mb-6">
          <Wallet className="w-12 h-12 text-movement-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Sign In to PayPost
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Connect to start earning or creating surveys
          </p>
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={handleLogin}
          disabled={isConnecting}
          className={`
            w-full p-4 rounded-lg border-2 text-left transition-all
            border-gray-200 hover:border-movement-500 hover:bg-movement-50 dark:border-gray-600 dark:hover:border-movement-400
          `}
        >
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🔐</span>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Login with Email / Social
                </h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Secure login powered by Privy
              </p>
            </div>
            {isConnecting && (
              <div className="w-5 h-5 border-2 border-movement-500 border-t-transparent rounded-full animate-spin" />
            )}
          </div>
        </button>
      </div>

      {showRoleInfo && (
        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
          <p>
            By connecting, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      )}
    </div>
  );
};

export default WalletSelector;