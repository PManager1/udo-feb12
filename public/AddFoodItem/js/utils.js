// Utility functions for restaurant menu management system

/**
 * Compress image to reduce localStorage usage
 * @param {string} base64String - The base64 image string
 * @param {number} maxWidth - Maximum width in pixels (default: 800)
 * @param {number} quality - Image quality 0-1 (default: 0.7)
 * @returns {Promise<string>} - Compressed base64 string
 */
async function compressImage(base64String, maxWidth = 800, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Calculate new dimensions
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = reject;
    img.src = base64String;
  });
}

/**
 * Check localStorage space usage
 * @returns {Object} - { used: number, available: number, percentage: number }
 */
function checkStorageSpace() {
  let total = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += (localStorage[key].length + key.length) * 2;
    }
  }
  
  const maxStorage = 5 * 1024 * 1024; // 5MB in bytes
  const used = total;
  const available = maxStorage - used;
  const percentage = (used / maxStorage) * 100;
  
  return { used, available, percentage };
}

/**
 * Show storage warning if approaching limit
 */
function showStorageWarningIfNeeded() {
  const storage = checkStorageSpace();
  if (storage.percentage > 80) {
    console.warn(`⚠️ Storage usage: ${storage.percentage.toFixed(1)}%`);
    // Could show a UI warning here
    return true;
  }
  return false;
}

/**
 * Calculate take-home amount after commission
 * @param {number} basePrice - The base price
 * @returns {Object} - { udo: number, competitor: number, savings: number }
 */
function calculateTakeHome(basePrice) {
  const settings = DataManager.getSettings();
  const udoAmount = basePrice * (1 - settings.commission_rate);
  const competitorAmount = basePrice * (1 - settings.competitor_rate);
  const savings = udoAmount - competitorAmount;
  
  return {
    udo: udoAmount,
    competitor: competitorAmount,
    savings: savings
  };
}

/**
 * Format currency
 * @param {number} amount - The amount to format
 * @returns {string} - Formatted currency string
 */
function formatCurrency(amount) {
  const settings = DataManager.getSettings();
  return settings.currency + amount.toFixed(2);
}

/**
 * Generate unique ID
 * @param {string} prefix - ID prefix (e.g., 'item_', 'cat_')
 * @returns {string} - Unique ID
 */
function generateId(prefix) {
  return prefix + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Get current date in YYYY-MM-DD format
 * @returns {string} - Current date
 */
function getCurrentDate() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Debounce function to limit execution rate
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} - Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Validate price input
 * @param {string} value - Price value to validate
 * @returns {boolean} - True if valid
 */
function isValidPrice(value) {
  const price = parseFloat(value);
  return !isNaN(price) && price >= 0;
}

/**
 * Validate required fields
 * @param {Object} data - Data object to validate
 * @param {Array} requiredFields - Array of required field names
 * @returns {Object} - { valid: boolean, errors: Array }
 */
function validateRequired(data, requiredFields) {
  const errors = [];
  
  requiredFields.forEach(field => {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      errors.push(`${field} is required`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
}