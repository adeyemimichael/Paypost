/**
 * Format token amounts for display
 */
export const formatTokenAmount = (amount, decimals = 2) => {
  if (typeof amount !== 'number') {
    return '0.00';
  }
  
  return amount.toFixed(decimals);
};

/**
 * Format price amounts (alias for formatTokenAmount)
 */
export const formatPrice = (amount, decimals = 2) => {
  return formatTokenAmount(amount, decimals);
};

/**
 * Format wallet addresses for display
 */
export const formatAddress = (address, startChars = 6, endChars = 4) => {
  if (!address || typeof address !== 'string') {
    return '';
  }
  
  if (address.length <= startChars + endChars) {
    return address;
  }
  
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};

/**
 * Format numbers with commas
 */
export const formatNumber = (num) => {
  if (typeof num !== 'number') {
    return '0';
  }
  
  return num.toLocaleString();
};

/**
 * Format time duration
 */
export const formatDuration = (minutes) => {
  if (typeof minutes !== 'number' || minutes < 0) {
    return '0 min';
  }
  
  if (minutes < 60) {
    return `${Math.round(minutes)} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
};

/**
 * Format time ago (e.g., "2 hours ago")
 */
export const formatTimeAgo = (timestamp) => {
  if (!timestamp) return 'Unknown';
  
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
};

/**
 * Truncate text to specified length
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || typeof text !== 'string') return '';
  
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Format percentage
 */
export const formatPercentage = (value, decimals = 1) => {
  if (typeof value !== 'number') {
    return '0%';
  }
  
  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Format currency amounts
 */
export const formatCurrency = (amount, currency = 'USD', decimals = 2) => {
  if (typeof amount !== 'number') {
    return '$0.00';
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(amount);
};