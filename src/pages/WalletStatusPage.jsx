import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useMovementWallet } from '../hooks/useMovementWallet';
import { movementService } from '../services/movementService';
import { Wallet, RefreshCw, Copy, ExternalLink } from 'lucide-react';
import Button from '../components/Button';

const WalletStatusPage = () => {
  const { user, authenticated } = usePrivy();
  const { wallet, balance, isConnected, fetchBalance } = useMovementWallet();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (wallet?.address) {
      loadTransactions();
    }
  }, [wallet?.address]);

  const loadTransactions = async () => {
    try {
      if (wallet?.address) {
        const activity = await movementService.getUserActivity(wallet.address);
        setTransactions(activity.transactions || []);
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchBalance();
      await loadTransactions();
    } catch (error) {
      console.error('Failed to refresh:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const copyAddress = () => {
    if (wallet?.address) {
      navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Wallet Status</h2>
          <p className="text-gray-600 mb-4">Please login to view your wallet status</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Wallet Status</h1>
          <p className="text-gray-600 mt-2">Monitor your wallet balance and transaction history</p>
        </div>

        {/* Wallet Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Wallet Overview</h2>
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Connection Status */}
            <div className="text-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                isConnected ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              }`}>
                <Wallet className="w-6 h-6" />
              </div>
              <p className="text-sm text-gray-600">Status</p>
              <p className={`font-semibold ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </p>
            </div>

            {/* Balance */}
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-2">
                <span className="text-lg font-bold">M</span>
              </div>
              <p className="text-sm text-gray-600">Balance</p>
              <p className="font-semibold text-gray-900">{balance} MOVE</p>
            </div>

            {/* User Info */}
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-2">
                <span className="text-lg font-bold">{user?.email?.address?.[0]?.toUpperCase() || 'U'}</span>
              </div>
              <p className="text-sm text-gray-600">Account</p>
              <p className="font-semibold text-gray-900">{user?.email?.address || 'Anonymous'}</p>
            </div>
          </div>
        </div>

        {/* Wallet Address */}
        {wallet?.address && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Wallet Address</h3>
            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">Address</p>
                <p className="font-mono text-sm text-gray-900 break-all">{wallet.address}</p>
              </div>
              <div className="flex space-x-2 ml-4">
                <Button
                  onClick={copyAddress}
                  variant="outline"
                  size="sm"
                >
                  <Copy className="w-4 h-4" />
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
                <Button
                  onClick={() => window.open(`https://explorer.testnet.movementnetwork.xyz/account/${wallet.address}`, '_blank')}
                  variant="outline"
                  size="sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  Explorer
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
          
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600">No transactions found</p>
              <p className="text-sm text-gray-500 mt-1">Complete surveys to see your transaction history</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((tx, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{tx.type}</p>
                    <p className="text-sm text-gray-600">{new Date(tx.timestamp).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount} MOVE
                    </p>
                    {tx.hash && (
                      <button
                        onClick={() => window.open(`https://explorer.testnet.movementnetwork.xyz/txn/${tx.hash}`, '_blank')}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        View Transaction
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletStatusPage;