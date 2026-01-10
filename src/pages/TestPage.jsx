import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useMovementWallet } from '../hooks/useMovementWallet';
import { usePostStore } from '../stores/postStore';
import { movementService } from '../services/movementService';
import { supabaseService } from '../services/supabaseService';
import { Play, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import Button from '../components/Button';

const TestPage = () => {
  const { user, authenticated } = usePrivy();
  const { wallet, balance, isConnected } = useMovementWallet();
  const { posts, createSurvey, completeSurvey } = usePostStore();
  const [testResults, setTestResults] = useState({});
  const [isRunning, setIsRunning] = useState(false);

  const tests = [
    {
      id: 'auth',
      name: 'Authentication Test',
      description: 'Check if user is authenticated with Privy',
      test: async () => {
        return {
          success: authenticated,
          message: authenticated ? `Authenticated as ${user?.email?.address}` : 'Not authenticated'
        };
      }
    },
    {
      id: 'wallet',
      name: 'Wallet Connection Test',
      description: 'Check if wallet is connected and has balance',
      test: async () => {
        if (!isConnected) {
          return { success: false, message: 'Wallet not connected' };
        }
        return {
          success: true,
          message: `Wallet connected: ${wallet?.address?.substring(0, 10)}... Balance: ${balance} MOVE`
        };
      }
    },
    {
      id: 'blockchain',
      name: 'Blockchain Connection Test',
      description: 'Test connection to Movement blockchain',
      test: async () => {
        try {
          const isConnected = await movementService.testConnection();
          return {
            success: isConnected,
            message: isConnected ? 'Blockchain connection successful' : 'Blockchain connection failed'
          };
        } catch (error) {
          return { success: false, message: `Blockchain error: ${error.message}` };
        }
      }
    },
    {
      id: 'supabase',
      name: 'Database Connection Test',
      description: 'Test connection to Supabase database',
      test: async () => {
        try {
          await supabaseService.initialize();
          const connected = await supabaseService.testConnection();
          return {
            success: connected,
            message: connected ? 'Database connection successful' : 'Database connection failed'
          };
        } catch (error) {
          return { success: false, message: `Database error: ${error.message}` };
        }
      }
    },
    {
      id: 'surveys',
      name: 'Survey Loading Test',
      description: 'Test loading surveys from blockchain and database',
      test: async () => {
        try {
          const surveys = await movementService.getSurveys();
          return {
            success: true,
            message: `Loaded ${surveys.length} surveys from blockchain`
          };
        } catch (error) {
          return { success: false, message: `Survey loading error: ${error.message}` };
        }
      }
    },
    {
      id: 'balance',
      name: 'Balance Check Test',
      description: 'Check wallet balance on Movement blockchain',
      test: async () => {
        if (!wallet?.address) {
          return { success: false, message: 'No wallet address available' };
        }
        try {
          const balance = await movementService.getBalance(wallet.address);
          return {
            success: true,
            message: `Current balance: ${balance} MOVE`
          };
        } catch (error) {
          return { success: false, message: `Balance check error: ${error.message}` };
        }
      }
    }
  ];

  const runTest = async (test) => {
    setTestResults(prev => ({
      ...prev,
      [test.id]: { status: 'running', message: 'Running test...' }
    }));

    try {
      const result = await test.test();
      setTestResults(prev => ({
        ...prev,
        [test.id]: {
          status: result.success ? 'success' : 'error',
          message: result.message
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [test.id]: {
          status: 'error',
          message: `Test failed: ${error.message}`
        }
      }));
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults({});

    for (const test of tests) {
      await runTest(test);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running':
        return 'border-blue-200 bg-blue-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">System Test Page</h1>
          <p className="text-gray-600 mt-2">Test all system components and connections</p>
        </div>

        {/* Test Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Test Suite</h2>
              <p className="text-gray-600 mt-1">Run comprehensive tests to verify system functionality</p>
            </div>
            <Button
              onClick={runAllTests}
              disabled={isRunning}
              className="flex items-center"
            >
              <Play className="w-4 h-4 mr-2" />
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </Button>
          </div>
        </div>

        {/* Test Results */}
        <div className="space-y-4">
          {tests.map((test) => {
            const result = testResults[test.id];
            return (
              <div
                key={test.id}
                className={`border rounded-lg p-6 transition-colors ${getStatusColor(result?.status)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      {getStatusIcon(result?.status)}
                      <h3 className="text-lg font-semibold text-gray-900 ml-3">{test.name}</h3>
                    </div>
                    <p className="text-gray-600 mb-3">{test.description}</p>
                    {result?.message && (
                      <div className={`p-3 rounded-md text-sm ${
                        result.status === 'success' 
                          ? 'bg-green-100 text-green-800' 
                          : result.status === 'error'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {result.message}
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={() => runTest(test)}
                    disabled={isRunning || result?.status === 'running'}
                    variant="outline"
                    size="sm"
                  >
                    {result?.status === 'running' ? 'Running...' : 'Run Test'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* System Information */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">User ID:</p>
              <p className="font-mono text-gray-900">{user?.id || 'Not authenticated'}</p>
            </div>
            <div>
              <p className="text-gray-600">Email:</p>
              <p className="font-mono text-gray-900">{user?.email?.address || 'Not available'}</p>
            </div>
            <div>
              <p className="text-gray-600">Wallet Address:</p>
              <p className="font-mono text-gray-900 break-all">{wallet?.address || 'Not connected'}</p>
            </div>
            <div>
              <p className="text-gray-600">Balance:</p>
              <p className="font-mono text-gray-900">{balance} MOVE</p>
            </div>
            <div>
              <p className="text-gray-600">Loaded Surveys:</p>
              <p className="font-mono text-gray-900">{posts.length}</p>
            </div>
            <div>
              <p className="text-gray-600">Connection Status:</p>
              <p className={`font-mono ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;