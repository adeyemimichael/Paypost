import { useEffect, useState } from 'react';
import { usePostStore } from '../stores/postStore';
import { useUserStore } from '../stores/userStore';
import { useMovementWallet } from '../hooks/useMovementWallet';
import { supabaseService } from '../services/supabaseService';
import { movementService } from '../services/movementService';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import Button from '../components/Button';

const StatusPage = () => {
  const [status, setStatus] = useState({
    postStore: 'checking...',
    userStore: 'checking...',
    supabase: 'checking...',
    blockchain: 'checking...',
    wallet: 'checking...'
  });

  const { posts, isLoading } = usePostStore();
  const { userRole } = useUserStore();
  const { wallet, balance, isConnected } = useMovementWallet();

  const checkStatus = async () => {
    const newStatus = {};

    // Check PostStore
    try {
      newStatus.postStore = {
        status: 'success',
        message: `Loaded ${posts.length} posts, Loading: ${isLoading}`,
        details: { postsCount: posts.length, isLoading }
      };
    } catch (error) {
      newStatus.postStore = {
        status: 'error',
        message: `PostStore error: ${error.message}`,
        details: { error: error.message }
      };
    }

    // Check UserStore
    try {
      newStatus.userStore = {
        status: 'success',
        message: `User role: ${userRole || 'Not set'}`,
        details: { userRole }
      };
    } catch (error) {
      newStatus.userStore = {
        status: 'error',
        message: `UserStore error: ${error.message}`,
        details: { error: error.message }
      };
    }

    // Check Supabase
    try {
      await supabaseService.initialize();
      const connected = await supabaseService.testConnection();
      newStatus.supabase = {
        status: connected ? 'success' : 'error',
        message: connected ? 'Supabase connected' : 'Supabase connection failed',
        details: { connected, initialized: supabaseService.initialized }
      };
    } catch (error) {
      newStatus.supabase = {
        status: 'error',
        message: `Supabase error: ${error.message}`,
        details: { error: error.message }
      };
    }

    // Check Blockchain
    try {
      const connected = await movementService.testConnection();
      newStatus.blockchain = {
        status: connected ? 'success' : 'error',
        message: connected ? 'Blockchain connected' : 'Blockchain connection failed',
        details: { connected }
      };
    } catch (error) {
      newStatus.blockchain = {
        status: 'error',
        message: `Blockchain error: ${error.message}`,
        details: { error: error.message }
      };
    }

    // Check Wallet
    try {
      newStatus.wallet = {
        status: isConnected ? 'success' : 'warning',
        message: isConnected 
          ? `Wallet connected: ${wallet?.address?.substring(0, 10)}... Balance: ${balance} MOVE`
          : 'Wallet not connected',
        details: { 
          isConnected, 
          address: wallet?.address, 
          balance,
          walletExists: !!wallet
        }
      };
    } catch (error) {
      newStatus.wallet = {
        status: 'error',
        message: `Wallet error: ${error.message}`,
        details: { error: error.message }
      };
    }

    setStatus(newStatus);
  };

  useEffect(() => {
    checkStatus();
  }, [posts.length, isLoading, userRole, wallet, balance, isConnected]);

  const getStatusIcon = (statusObj) => {
    if (!statusObj || typeof statusObj === 'string') {
      return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
    }

    switch (statusObj.status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
    }
  };

  const getStatusColor = (statusObj) => {
    if (!statusObj || typeof statusObj === 'string') {
      return 'border-blue-200 bg-blue-50';
    }

    switch (statusObj.status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  const statusItems = [
    {
      id: 'postStore',
      name: 'Post Store',
      description: 'Survey data management and state'
    },
    {
      id: 'userStore',
      name: 'User Store',
      description: 'User authentication and role management'
    },
    {
      id: 'supabase',
      name: 'Database (Supabase)',
      description: 'Database connection and data persistence'
    },
    {
      id: 'blockchain',
      name: 'Blockchain (Movement)',
      description: 'Movement blockchain connection and smart contracts'
    },
    {
      id: 'wallet',
      name: 'Wallet Connection',
      description: 'User wallet connection and balance'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">System Status</h1>
          <p className="text-gray-600 mt-2">Monitor the health of all system components</p>
        </div>

        {/* Status Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Component Status</h2>
            <Button
              onClick={checkStatus}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Status
            </Button>
          </div>

          <div className="space-y-4">
            {statusItems.map((item) => {
              const statusObj = status[item.id];
              return (
                <div
                  key={item.id}
                  className={`border rounded-lg p-4 transition-colors ${getStatusColor(statusObj)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      {getStatusIcon(statusObj)}
                      <div className="ml-3">
                        <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                        <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                        {statusObj && typeof statusObj === 'object' && (
                          <div className="text-sm">
                            <p className={`font-medium ${
                              statusObj.status === 'success' 
                                ? 'text-green-800' 
                                : statusObj.status === 'warning'
                                ? 'text-yellow-800'
                                : statusObj.status === 'error'
                                ? 'text-red-800'
                                : 'text-blue-800'
                            }`}>
                              {statusObj.message}
                            </p>
                            {statusObj.details && (
                              <details className="mt-2">
                                <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                                  View Details
                                </summary>
                                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                                  {JSON.stringify(statusObj.details, null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
                        )}
                        {typeof statusObj === 'string' && (
                          <p className="text-blue-800 text-sm font-medium">{statusObj}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* System Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Environment:</p>
              <p className="font-mono text-gray-900">{import.meta.env.MODE}</p>
            </div>
            <div>
              <p className="text-gray-600">API Base URL:</p>
              <p className="font-mono text-gray-900 break-all">{import.meta.env.VITE_API_BASE_URL}</p>
            </div>
            <div>
              <p className="text-gray-600">Movement RPC:</p>
              <p className="font-mono text-gray-900 break-all">{import.meta.env.VITE_MOVEMENT_RPC_URL}</p>
            </div>
            <div>
              <p className="text-gray-600">Contract Address:</p>
              <p className="font-mono text-gray-900 break-all">{import.meta.env.VITE_CONTRACT_ADDRESS}</p>
            </div>
            <div>
              <p className="text-gray-600">Supabase URL:</p>
              <p className="font-mono text-gray-900 break-all">{import.meta.env.VITE_SUPABASE_URL}</p>
            </div>
            <div>
              <p className="text-gray-600">Timestamp:</p>
              <p className="font-mono text-gray-900">{new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusPage;