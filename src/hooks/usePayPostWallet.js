import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useState, useEffect, useRef } from "react";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

// Initialize Aptos SDK for Movement
const aptos = new Aptos(new AptosConfig({
  network: Network.CUSTOM,
  fullnode: import.meta.env.VITE_MOVEMENT_RPC_URL || 'https://testnet.movementnetwork.xyz/v1',
}));

/**
 * Unified wallet hook for PayPost - handles both Privy and Movement wallets
 */
export function usePayPostWallet() {
  const { authenticated, user, logout, login } = usePrivy();
  const { wallets } = useWallets();
  const {
    account,
    connected,
    disconnect,
    signAndSubmitTransaction: nativeSignAndSubmit,
  } = useWallet();

  const [walletAddress, setWalletAddress] = useState("");
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Helper to validate Aptos addresses (Movement compatible)
  const isValidAptosAddress = (address) => {
    return address && 
           address.toString().startsWith("0x") && 
           address.toString().length > 50;
  };

  // Determine wallet address and type
  useEffect(() => {
    const initWallet = async () => {
      if (authenticated && user) {
        console.log("🔍 Privy User:", user);
        console.log("🔍 Active Wallets:", wallets);

        // 1. Check for active Aptos wallet (best source)
        const aptosActiveWallet = wallets.find(w => 
          w.walletClientType === 'privy' && 
          w.chainType === 'aptos'
        );
        
        if (aptosActiveWallet && isValidAptosAddress(aptosActiveWallet.address)) {
          console.log("✅ Found active Aptos wallet:", aptosActiveWallet.address);
          setWalletAddress(aptosActiveWallet.address);
          await fetchBalance(aptosActiveWallet.address);
          return;
        }

        // 2. Check primary wallet if it's Aptos compatible
        if (user.wallet?.address && isValidAptosAddress(user.wallet.address)) {
          console.log("✅ Using primary wallet (Aptos):", user.wallet.address);
          setWalletAddress(user.wallet.address);
          await fetchBalance(user.wallet.address);
          return;
        }

        // 3. Check linked accounts for Aptos wallet
        const aptosLink = user.linkedAccounts?.find((acc) => 
          acc.type === "wallet" && acc.chainType === "aptos"
        );
        
        if (aptosLink?.address) {
          console.log("✅ Using Aptos linked wallet:", aptosLink.address);
          setWalletAddress(aptosLink.address);
          await fetchBalance(aptosLink.address);
          return;
        }

        // 4. Fallback to any valid Aptos wallet
        const anyAptosWallet = user.linkedAccounts?.find((acc) => 
          acc.type === "wallet" && isValidAptosAddress(acc.address)
        );
        
        if (anyAptosWallet?.address) {
          console.log("✅ Using fallback Aptos wallet:", anyAptosWallet.address);
          setWalletAddress(anyAptosWallet.address);
          await fetchBalance(anyAptosWallet.address);
          return;
        }

        console.warn("⚠️ No valid Aptos wallet found in Privy user");
      } else if (connected && account) {
        // Native wallet (Nightly, Petra, etc.)
        console.log("✅ Using native wallet:", account.address.toString());
        setWalletAddress(account.address.toString());
        await fetchBalance(account.address.toString());
      } else {
        setWalletAddress("");
        setBalance(0);
      }
    };

    initWallet();
  }, [authenticated, user, connected, account, wallets]);

  // Fetch real balance from Movement blockchain
  const fetchBalance = async (address) => {
    if (!address) return;
    
    try {
      setIsLoading(true);
      const resources = await aptos.getAccountResources({
        accountAddress: address
      });

      const aptResource = resources.find(resource => 
        resource.type === '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>'
      );

      if (aptResource && aptResource.data && aptResource.data.coin) {
        const balanceValue = parseInt(aptResource.data.coin.value);
        const moveBalance = balanceValue / 100000000; // Convert from Octas to MOVE
        setBalance(moveBalance);
        console.log(`💰 Balance fetched: ${moveBalance} MOVE`);
      } else {
        setBalance(0);
      }
    } catch (error) {
      console.error("❌ Failed to fetch balance:", error);
      setBalance(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Determine wallet types
  const isPrivyWallet = authenticated;
  const isNativeWallet = connected && !authenticated;
  const isConnected = authenticated || connected;

  // Get Movement wallet for Privy transactions
  const movementWallet = isPrivyWallet ? (
    wallets.find(w => w.walletClientType === 'privy' && w.chainType === 'aptos' && isValidAptosAddress(w.address)) ||
    user?.linkedAccounts?.find((acc) => acc.type === "wallet" && acc.chainType === "aptos") ||
    (user?.wallet && isValidAptosAddress(user.wallet.address) ? { ...user.wallet, publicKey: user.wallet.address } : null) ||
    user?.linkedAccounts?.find((acc) => acc.type === "wallet" && isValidAptosAddress(acc.address))
  ) : null;

  // Unified login function
  const connectWallet = async (method = 'auto') => {
    try {
      setIsLoading(true);
      
      if (method === 'privy' || method === 'auto') {
        await login();
      }
      // Native wallet connection is handled by useWallet hook
      
    } catch (error) {
      console.error("❌ Wallet connection failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Unified disconnect function
  const disconnectWallet = async () => {
    try {
      setIsLoading(true);
      
      if (authenticated) {
        await logout();
      } else if (connected) {
        await disconnect();
      }
      
      setWalletAddress("");
      setBalance(0);
    } catch (error) {
      console.error("❌ Disconnect failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Unified transaction signing
  const signAndSubmitTransaction = async (transactionPayload) => {
    try {
      if (isPrivyWallet && movementWallet) {
        console.log("🔐 Signing with Privy wallet:", movementWallet.address);
        
        if (!isValidAptosAddress(movementWallet.address)) {
          throw new Error(`Invalid Aptos address: ${movementWallet.address}`);
        }

        // For Privy wallets, we'll use a simplified approach
        // Since Privy doesn't support Aptos/Movement directly, we'll simulate for now
        console.warn("⚠️ Privy wallet detected - using simulation mode for transactions");
        
        // Simulate transaction for Privy users
        return new Promise((resolve) => {
          setTimeout(() => {
            const hash = `0x${Math.random().toString(16).substr(2, 16)}`;
            console.log("✅ Transaction simulated successfully");
            
            // Refresh balance after successful transaction
            fetchBalance(walletAddress);

            resolve({ 
              hash,
              success: true,
              isSimulated: true,
              message: "Transaction simulated - Privy wallet used"
            });
          }, 2000);
        });

      } else if (isNativeWallet && nativeSignAndSubmit) {
        console.log("🔐 Signing with native wallet:", account?.address);
        
        const transaction = {
          sender: account.address,
          data: transactionPayload,
        };

        const result = await nativeSignAndSubmit(transaction);
        console.log("✅ Native wallet transaction result:", result);
        
        // Refresh balance after successful transaction
        await fetchBalance(walletAddress);

        return result;
      } else {
        throw new Error("No wallet connected for transaction signing");
      }
    } catch (error) {
      console.error("❌ Transaction signing error:", error);
      throw error;
    }
  };

  // Get user info
  const getUser = () => {
    if (isPrivyWallet && user) {
      return {
        id: user.id,
        email: user.email?.address || `user@paypost.xyz`,
        wallet: {
          address: walletAddress,
          balance: balance,
          type: 'privy'
        },
        ...user
      };
    } else if (isNativeWallet && account) {
      return {
        id: account.address.toString(),
        email: `${account.address.toString().slice(0, 8)}@paypost.xyz`,
        wallet: {
          address: walletAddress,
          balance: balance,
          type: 'native'
        }
      };
    }
    return null;
  };

  return {
    // Connection state
    isConnected,
    isPrivyWallet,
    isNativeWallet,
    walletAddress,
    balance,
    isLoading,
    
    // User info
    user: getUser(),
    privyUser: user,
    nativeAccount: account,
    movementWallet,
    
    // Actions
    connectWallet,
    disconnectWallet,
    signAndSubmitTransaction,
    fetchBalance: () => fetchBalance(walletAddress),
    
    // Utilities
    canSignTransactions: () => isConnected && (movementWallet || account),
    getWalletType: () => isPrivyWallet ? 'privy' : isNativeWallet ? 'native' : null,
  };
}