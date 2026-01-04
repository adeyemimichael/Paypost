// Quick script to add tokens to creator balance
// Run this in browser console if you need more tokens

// Option 1: Add 5000 tokens
useUserStore.setState({ balance: 5000 });

// Option 2: Add specific amount
useUserStore.setState({ balance: useUserStore.getState().balance + 1000 });

// Option 3: Reset to 10000 tokens
useUserStore.setState({ balance: 10000 });

console.log('Current balance:', useUserStore.getState().balance);
