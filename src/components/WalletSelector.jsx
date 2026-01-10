import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Wallet, LogIn, Mail, Chrome } from 'lucide-react';
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
      await login();
      if (onWalletConnected) {
        onWalletConnected();
      }
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const loginMethods = [
    {
      id: 'email',
      name: 'Email',
      description: 'Login with your email address',
      icon: <Mail className="w-6 h-6" />,
      color: 'blue'
    },
    {
      id: 'google',
      name: 'Google',
      description: 'Continue with Google account',
      icon: <Chrome className="w-6 h-6" />,
      color: 'red'
    },
    {
      id: 'wallet',
      name: 'Crypto Wallet',
      description: 'Connect existing Aptos wallet',
      icon: <Wallet className="w-6 h-6" />,
      color: 'purple'
    }
  ];

  if (authenticated && user) {
    return (
      <div className="text-center p-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Wallet className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Wallet Connected!</h3>
        <p className="text-gray-600 mb-4">
          {user.email?.address || 'Connected successfully'}
        </p>
        <Button onClick={onClose}>
          Continue
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Wallet className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Wallet</h2>
        <p className="text-gray-600">
          Choose your preferred login method to get started
        </p>
      </div>

      {showRoleInfo && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-1">
            {userRole === 'creator' ? 'Creator Account' : 'Participant Account'}
          </h3>
          <p className="text-sm text-blue-700">
            {userRole === 'creator' 
              ? 'Create surveys and reward participants with MOVE tokens'
              : 'Complete surveys and earn MOVE tokens instantly'
            }
          </p>
        </div>
      )}

      <div className="space-y-3 mb-6">
        {loginMethods.map((method) => (
          <button
            key={method.id}
            onClick={handleLogin}
            disabled={isConnecting}
            className={`w-full flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-${method.color}-300 hover:bg-${method.color}-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className={`w-12 h-12 bg-${method.color}-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-${method.color}-200 transition-colors`}>
              {method.icon}
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-gray-900">{method.name}</h3>
              <p className="text-sm text-gray-600">{method.description}</p>
            </div>
            <LogIn className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
          </button>
        ))}
      </div>

      <div className="text-center">
        <p className="text-xs text-gray-500 mb-4">
          By connecting, you agree to our Terms of Service and Privacy Policy
        </p>
        
        {isConnecting && (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
            <span className="text-sm text-gray-600">Connecting...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletSelector;