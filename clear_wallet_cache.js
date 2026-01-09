// Run this in browser console to clear wallet cache
console.log('Clearing wallet cache...');

// Clear localStorage wallet entries
Object.keys(localStorage).forEach(key => {
  if (key.startsWith('paypost_wallet_') || key === 'paypost-wallet-store') {
    localStorage.removeItem(key);
    console.log('Removed:', key);
  }
});

console.log('Wallet cache cleared! Please refresh the page.');