import { useMovementWallet } from '../hooks/useMovementWallet';
import { usePrivy, useWallets } from '@privy-io/react-auth';

const WalletStatusPage = () => {
  const { authenticated, user } = usePrivy();
  const { wallets } = useWallets();
  const { wallet, balance, isLoading, fetchBalance } = useMovementWallet();

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Wallet Status</h1>
          <p>Please login first.</p>
        </div>
      </div>
    );
  }

  const aptosWallets = wallets.filter(w => w.chainType === 'aptos');
  const ethereumWallets = wallets.filter(w => w.chainType === 'ethereum');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Wallet Status</h1>
        
        <div className="grid gap-6">
          {/* Current Active Wallet */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Active Movement Wallet</h2>
            {wallet ? (
              <div className="space-y-2">
                <div><strong>Address:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{wallet.address}</code></div>
                <div><strong>Chain Type:</strong> {wallet.chainType}</div>
                <div><strong>Balance:</strong> {isLoading ? 'Loading...' : `${balance} MOVE`}</div>
                <button
                  onClick={fetchBalance}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Refresh Balance
                </button>
              </div>
            ) : (
              <p className="text-gray-600">No active wallet found</p>
            )}
          </div>

          {/* Aptos Wallets */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Aptos Wallets ({aptosWallets.length})</h2>
            {aptosWallets.length > 0 ? (
              <div className="space-y-4">
                {aptosWallets.map((wallet, index) => (
                  <div key={wallet.id} className="border rounded p-4">
                    <div className="space-y-2">
                      <div><strong>Wallet {index + 1}:</strong></div>
                      <div><strong>Address:</strong> <code className="bg-gray-100 px-2 py-1 rounded text-xs">{wallet.address}</code></div>
                      <div><strong>ID:</strong> {wallet.id}</div>
                      <div><strong>Created:</strong> {new Date(wallet.created_at || Date.now()).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No Aptos wallets found</p>
            )}
          </div>

          {/* Ethereum Wallets */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Ethereum Wallets ({ethereumWallets.length})</h2>
            {ethereumWallets.length > 0 ? (
              <div className="space-y-4">
                {ethereumWallets.map((wallet, index) => (
                  <div key={wallet.id} className="border rounded p-4">
                    <div className="space-y-2">
                      <div><strong>Wallet {index + 1}:</strong></div>
                      <div><strong>Address:</strong> <code className="bg-gray-100 px-2 py-1 rounded text-xs">{wallet.address}</code></div>
                      <div><strong>ID:</strong> {wallet.id}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No Ethereum wallets found</p>
            )}
          </div>

          {/* Funding Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">Fund Your Wallet</h2>
            <div className="space-y-3 text-blue-800">
              <p>To receive testnet tokens:</p>
              <ol className="list-decimal list-inside space-y-2">
                <li>Copy your Aptos wallet address above</li>
                <li>Visit: <a href="https://faucet.testnet.movementnetwork.xyz/" target="_blank" rel="noopener noreferrer" className="underline">Movement Testnet Faucet</a></li>
                <li>Paste your address and request tokens</li>
                <li>Wait 1-2 minutes for confirmation</li>
                <li>Click "Refresh Balance" above to see your tokens</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletStatusPage;