// JWT Token Management for Restaurant Menu System
// Centralized token handling for API authentication

/**
 * JWT Token Manager
 * Handles storage, retrieval, and validation of JWT tokens
 */
const AuthManager = {
  TOKEN_KEY: 'jwt_token',
  
  /**
   * Save JWT token to localStorage
   * @param {string} token - JWT token string
   */
  setToken(token) {
    try {
      localStorage.setItem(this.TOKEN_KEY, token);
      console.log('✅ JWT token saved successfully');
      return true;
    } catch (error) {
      console.error('❌ Error saving JWT token:', error);
      return false;
    }
  },
  
  /**
   * Get JWT token from localStorage
   * @returns {string|null} JWT token or null if not found
   */
  getToken() {
    try {
      const token = localStorage.getItem(this.TOKEN_KEY);
      return token;
    } catch (error) {
      console.error('❌ Error getting JWT token:', error);
      return null;
    }
  },
  
  /**
   * Remove JWT token from localStorage
   */
  clearToken() {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
      console.log('✅ JWT token cleared successfully');
      return true;
    } catch (error) {
      console.error('❌ Error clearing JWT token:', error);
      return false;
    }
  },
  
  /**
   * Check if JWT token exists
   * @returns {boolean} True if token exists, false otherwise
   */
  hasToken() {
    const token = this.getToken();
    return token && token.length > 0;
  },
  
  /**
   * Get authentication headers for API requests
   * @returns {object} Headers object with Authorization token
   */
  getAuthHeaders() {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  },
  
  /**
   * Decode JWT token (without verification - for demo purposes)
   * @param {string} token - JWT token
   * @returns {object|null} Decoded payload or null
   */
  decodeToken(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('❌ Error decoding JWT token:', error);
      return null;
    }
  },
  
  /**
   * Check if token is expired
   * @returns {boolean} True if expired, false otherwise
   */
  isTokenExpired() {
    const token = this.getToken();
    if (!token) return true;
    
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) return true;
      
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch (error) {
      console.error('❌ Error checking token expiration:', error);
      return true;
    }
  },
  
  /**
   * Get user ID from token
   * @returns {string|null} User ID or null
   */
  getUserId() {
    try {
      const token = this.getToken();
      if (!token) return null;
      
      const decoded = this.decodeToken(token);
      return decoded ? decoded.userId || decoded.sub : null;
    } catch (error) {
      console.error('❌ Error getting user ID:', error);
      return null;
    }
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AuthManager;
}