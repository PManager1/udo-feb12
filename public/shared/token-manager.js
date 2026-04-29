// Token Manager - Centralized token management for UDO application
// This module handles all token-related operations across the application

class TokenManager {
  constructor() {
    this.TOKEN_KEY = 'udo_auth_token';
  }

  /**
   * Save token to localStorage with metadata
   * @param {string} token - The authentication token
   * @returns {boolean} - Success status
   */
  saveToken(token) {
    try {
      if (!token || typeof token !== 'string' || token.trim() === '') {
        console.error('TokenManager: Invalid token provided');
        return false;
      }

      const tokenData = {
        token: token.trim(),
        updatedAt: new Date().toISOString(),
        createdAt: this.getExistingToken()?.createdAt || new Date().toISOString()
      };

      localStorage.setItem(this.TOKEN_KEY, JSON.stringify(tokenData));
      console.log('TokenManager: Token saved successfully');
      return true;
    } catch (error) {
      console.error('TokenManager: Error saving token:', error);
      return false;
    }
  }

  /**
   * Retrieve token from localStorage
   * Checks both the new 'udo_auth_token' key and legacy 'jwt_token' key
   * @returns {string|null} - The token or null if not found
   */
  getToken() {
    try {
      // First check the standard tokenManager key
      const tokenData = localStorage.getItem(this.TOKEN_KEY);
      if (tokenData) {
        const parsed = JSON.parse(tokenData);
        if (parsed.token) {
          return parsed.token;
        }
      }

      // Fallback: check legacy 'jwt_token' key (used by verifyotp page)
      const legacyToken = localStorage.getItem('jwt_token');
      if (legacyToken) {
        // Migrate to new format
        this.saveToken(legacyToken);
        console.log('TokenManager: Migrated legacy jwt_token to udo_auth_token');
        return legacyToken;
      }

      return null;
    } catch (error) {
      console.error('TokenManager: Error retrieving token:', error);
      return null;
    }
  }

  /**
   * Check if a token exists and is valid
   * @returns {boolean} - True if token exists and is not empty
   */
  hasValidToken() {
    const token = this.getToken();
    return token !== null && token.trim() !== '';
  }

  /**
   * Get Authorization header value with Bearer token
   * @returns {object|null} - Headers object with Authorization or null if no token
   */
  getAuthHeaders() {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    return {
      'Authorization': `Bearer ${token}`
    };
  }

  /**
   * Get complete headers including Authorization
   * @param {object} additionalHeaders - Additional headers to include
   * @returns {object} - Complete headers object
   */
  getHeaders(additionalHeaders = {}) {
    const authHeaders = this.getAuthHeaders();
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    return {
      ...defaultHeaders,
      ...additionalHeaders,
      ...(authHeaders || {})
    };
  }

  /**
   * Get token metadata (created at, updated at)
   * @returns {object|null} - Token metadata or null if not found
   */
  getTokenMetadata() {
    try {
      const tokenData = localStorage.getItem(this.TOKEN_KEY);
      if (!tokenData) {
        return null;
      }

      return JSON.parse(tokenData);
    } catch (error) {
      console.error('TokenManager: Error retrieving token metadata:', error);
      return null;
    }
  }

  /**
   * Clear token from localStorage
   * @returns {boolean} - Success status
   */
  clearToken() {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
      console.log('TokenManager: Token cleared successfully');
      return true;
    } catch (error) {
      console.error('TokenManager: Error clearing token:', error);
      return false;
    }
  }

  /**
   * Get existing token data helper
   * @returns {object|null} - Existing token data
   */
  getExistingToken() {
    try {
      const tokenData = localStorage.getItem(this.TOKEN_KEY);
      return tokenData ? JSON.parse(tokenData) : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get masked version of token for display
   * @param {number} showChars - Number of characters to show at start and end
   * @returns {string|null} - Masked token or null if not found
   */
  getMaskedToken(showChars = 5) {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    if (token.length <= showChars * 2) {
      return token;
    }

    return token.substring(0, showChars) + '...' + token.substring(token.length - showChars);
  }

  /**
   * Validate token format (basic validation)
   * @param {string} token - Token to validate
   * @returns {boolean} - True if token format appears valid
   */
  validateTokenFormat(token) {
    if (!token || typeof token !== 'string') {
      return false;
    }

    // Basic validation: token should be at least 10 characters
    if (token.trim().length < 10) {
      return false;
    }

    return true;
  }
}

// Create and export global instance
const tokenManager = new TokenManager();

// Make it available globally
if (typeof window !== 'undefined') {
  window.tokenManager = tokenManager;
}

// Export for module usage (if using modules)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = tokenManager;
}