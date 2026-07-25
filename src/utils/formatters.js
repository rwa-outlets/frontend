/**
 * Formatting Utilities
 * 
 * Provides consistent formatting for numbers, addresses, dates, and percentages
 * throughout the application.
 */

/**
 * Format USD currency value
 * @param {number|string} value - The value to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted USD string (e.g., "$1,234.56")
 */
export const formatUSD = (value, decimals = 2) => {
  if (value === undefined || value === null) return '$0.00';
  
  const num = Number(value);
  if (isNaN(num)) return '$0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

/**
 * Format percentage value
 * @param {number|string} value - The value to format (0-1 or 0-100)
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted percentage string (e.g., "5.30%" or "5.3%")
 */
export const formatPercent = (value, decimals = 2) => {
  if (value === undefined || value === null) return '0%';
  
  const num = Number(value);
  if (isNaN(num)) return '0%';
  
  // If value is between 0-1, multiply by 100
  const percentage = num < 1 ? num * 100 : num;
  
  return `${percentage.toFixed(decimals)}%`;
};

/**
 * Format basis points (bps)
 * @param {number|string} bps - Basis points value
 * @returns {string} Formatted bps string (e.g., "15 bps")
 */
export const formatBps = (bps) => {
  if (bps === undefined || bps === null) return '0 bps';
  
  const num = Number(bps);
  if (isNaN(num)) return '0 bps';
  
  return `${num.toFixed(0)} bps`;
};

/**
 * Format Ethereum address
 * @param {string} addr - Full address
 * @param {number} startChars - Characters to show at start (default: 6)
 * @param {number} endChars - Characters to show at end (default: 4)
 * @returns {string} Shortened address (e.g., "0x1234...5678")
 */
export const formatAddress = (addr, startChars = 6, endChars = 4) => {
  if (!addr) return '0x0000...0000';
  
  try {
    if (addr.length < startChars + endChars + 2) {
      return addr;
    }
    
    const start = addr.substring(0, startChars);
    const end = addr.substring(addr.length - endChars);
    return `${start}...${end}`;
  } catch {
    return '0x0000...0000';
  }
};

/**
 * Format date as "time ago"
 * @param {string|Date} timestamp - Date string or Date object
 * @returns {string} Relative time string (e.g., "2h ago", "3d ago")
 */
export const formatTimeAgo = (timestamp) => {
  if (!timestamp) return 'just now';
  
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return 'just now';
  
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1,
  };
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval}${unit[0]} ago`;
    }
  }
  
  return 'just now';
};

/**
 * Format date with specific format
 * @param {string|Date} timestamp - Date string or Date object
 * @param {string} format - Format string (e.g., "MMM d, yyyy")
 * @returns {string} Formatted date string
 */
export const formatDate = (timestamp, format = 'MMM d, yyyy') => {
  if (!timestamp) return '-';
  
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return '-';
  
  return new Intl.DateTimeFormat('en-US', {
    month: format.includes('MMM') ? 'short' : format.includes('MM') ? '2-digit' : undefined,
    day: format.includes('d') ? 'numeric' : undefined,
    year: format.includes('yyyy') ? 'numeric' : format.includes('yy') ? '2-digit' : undefined,
  }).format(date);
};

/**
 * Format a large number with abbreviation (K, M, B)
 * @param {number|string} value - The value to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Abbreviated number (e.g., "1.23M")
 */
export const formatNumber = (value, decimals = 2) => {
  if (value === undefined || value === null) return '0';
  
  const num = Number(value);
  if (isNaN(num)) return '0';
  
  if (num >= 1e12) {
    return `${(num / 1e12).toFixed(decimals)}T`;
  }
  if (num >= 1e9) {
    return `${(num / 1e9).toFixed(decimals)}B`;
  }
  if (num >= 1e6) {
    return `${(num / 1e6).toFixed(decimals)}M`;
  }
  if (num >= 1e3) {
    return `${(num / 1e3).toFixed(decimals)}K`;
  }
  
  return num.toFixed(decimals);
};

/**
 * Format token amount with symbol
 * @param {number|string} amount - Token amount
 * @param {string} symbol - Token symbol (e.g., "USDC", "RWA")
 * @param {number} decimals - Number of decimal places (default: 6 for tokens)
 * @returns {string} Formatted token amount (e.g., "123.456 USDC")
 */
export const formatTokenAmount = (amount, symbol = '', decimals = 6) => {
  if (amount === undefined || amount === null) return '0' + (symbol ? ` ${symbol}` : '');
  
  const num = Number(amount);
  if (isNaN(num)) return '0' + (symbol ? ` ${symbol}` : '');
  
  const formatted = num.toFixed(decimals).replace(/\.?0+$/, '');
  return formatted + (symbol ? ` ${symbol}` : '');
};

/**
 * Format price impact
 * @param {number|string} impact - Impact percentage (positive or negative)
 * @returns {string} Formatted impact with color indicator
 */
export const formatPriceImpact = (impact) => {
  if (impact === undefined || impact === null) return '0%';
  
  const num = Number(impact);
  if (isNaN(num)) return '0%';
  
  const sign = num >= 0 ? '+' : '';
  const colorClass = num >= 0 ? 'text-success' : num > -1 ? 'text-warning' : 'text-error';
  
  return {
    value: `${sign}${Math.abs(num).toFixed(2)}%`,
    className: colorClass,
  };
};

/**
 * Format NAV (Net Asset Value)
 * @param {number|string} nav - NAV value
 * @returns {string} Formatted NAV
 */
export const formatNAV = (nav) => {
  if (nav === undefined || nav === null) return '$1.00';
  
  const num = Number(nav);
  if (isNaN(num)) return '$1.00';
  
  return formatUSD(num, 4);
};

/**
 * Format spread/fee
 * @param {number|string} spread - Spread in basis points or percentage
 * @param {boolean} isBps - Whether the value is in basis points (default: true)
 * @returns {string} Formatted spread
 */
export const formatSpread = (spread, isBps = true) => {
  if (spread === undefined || spread === null) return '0 bps';
  
  const num = Number(spread);
  if (isNaN(num)) return '0 bps';
  
  if (isBps) {
    return formatBps(num);
  }
  return formatPercent(num, 2);
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} Truncated text
 */
export const truncate = (text, maxLength = 20) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Capitalize first letter
 * @param {string} text - Text to capitalize
 * @returns {string} Capitalized text
 */
export const capitalize = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/**
 * Format duration (e.g., "T+7", "T+90")
 * @param {string} duration - Duration string
 * @returns {string} Formatted duration
 */
export const formatDuration = (duration) => {
  if (!duration) return '-';
  return duration.replace('T+', 'T+').replace('T', 'T+');
};

/**
 * Format APY (Annual Percentage Yield)
 * @param {number|string} apy - APY value (0-1 or 0-100)
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted APY string (e.g., "5.30% APY" or "5.3% APY")
 */
export const formatAPY = (apy, decimals = 2) => {
  if (apy === undefined || apy === null) return '0% APY';
  
  const num = Number(apy);
  if (isNaN(num)) return '0% APY';
  
  // If value is between 0-1, multiply by 100
  const percentage = num < 1 ? num * 100 : num;
  
  return `${percentage.toFixed(decimals)}% APY`;
};

export default {
  formatUSD,
  formatPercent,
  formatBps,
  formatAddress,
  formatTimeAgo,
  formatDate,
  formatNumber,
  formatTokenAmount,
  formatPriceImpact,
  formatNAV,
  formatSpread,
  truncate,
  capitalize,
  formatDuration,
  formatAPY,
};
