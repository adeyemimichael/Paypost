import React, { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useWalletStore } from '../stores/walletStore';
import { useUserStore } from '../stores/userStore';

const WalletDebugPage = () => {
  const { user, authenticated } = usePrivy();
  const { wallet, initializeWallet } = useWalletStore();
  const { isAuthenticated } = useUserStore();
  const [debugInfo, setDebugInfo] = useState({});
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    if (authenticated && user) {
      setDebugInfo({
        privyUser: {
          id: user.id,
          wallet: user.wallet,
          linkedAccounts: user.linkedAccounts?.length || 0
        },
        storeWallet: wallet,
        isAuthenticated,
        authenticated
      });
    }
  }, [user, authenticated, wallet, isAuthenticated]);

  const handleInitializeWallet = async () => {
    if (!user?.id) {
      setTestResult({ error: 'No user ID available' });
      return;
    }

    try {
      setTestResult({ loading: true });
      const result = await initializeWallet(user.id);
      setTestResult({ success: true, wallet: result });
    } catch (error) {
      setTestResult({ error: error.message });
    }
  };

  const handleTestBackend = async () => {
    if (!wallet?.id) {
      setTestResult({ error: 'No wallet ID available' });
      return;
    }

    try {
      setTestResult({ loading: true });
      const response = await fetch('http://localhost:3001/api/debug/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletId: wallet.id })
      });
      
      const result = await response.json();
      setTestResult({ success: true, backendWallet: result });
    } catch (error) {
      setTestResult({ error: error.message });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Wallet Debug Page</h1>
        
        <div className="space-y-6">
          {/* Debug Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            <div className="space-x-4">
              <button
                onClick={handleInitializeWallet}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                disabled={!user?.id}
              >
                Initialize Wallet
              </button>
              
              <button
                onClick={handleTestBackend}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                disabled={!wallet?.id}
              >
                Test Backend
              </button>
            </div>
          </div>

          {/* Test Results */}
          {testResult && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Test Results</h2>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletDebugPage;