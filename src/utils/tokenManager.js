// Token Manager - Centralized token management for UDO application

class TokenManager {
  constructor() {
    this.TOKEN_KEY = 'udo_auth_token';
  }

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

  getToken() {
    try {
      const tokenData = localStorage.getItem(this.TOKEN_KEY);
      if (tokenData) {
        const parsed = JSON.parse(tokenData);
        if (parsed.token) {
          return parsed.token;
        }
      }

      // Fallback: check legacy 'jwt_token' key
      const legacyToken = localStorage.getItem('jwt_token');
      if (legacyToken) {
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

  hasValidToken() {
    const token = this.getToken();
    return token !== null && token.trim() !== '';
  }

  getAuthHeaders() {
    const token = this.getToken();
    if (!token) return null;
    return { 'Authorization': `Bearer ${token}` };
  }

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

  getTokenMetadata() {
    try {
      const tokenData = localStorage.getItem(this.TOKEN_KEY);
      if (!tokenData) return null;
      return JSON.parse(tokenData);
    } catch (error) {
      console.error('TokenManager: Error retrieving token metadata:', error);
      return null;
    }
  }

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

  getExistingToken() {
    try {
      const tokenData = localStorage.getItem(this.TOKEN_KEY);
      return tokenData ? JSON.parse(tokenData) : null;
    } catch (error) {
      return null;
    }
  }

  getMaskedToken(showChars = 5) {
    const token = this.getToken();
    if (!token) return null;
    if (token.length <= showChars * 2) return token;
    return token.substring(0, showChars) + '...' + token.substring(token.length - showChars);
  }

  validateTokenFormat(token) {
    if (!token || typeof token !== 'string') return false;
    if (token.trim().length < 10) return false;
    return true;
  }
}

const tokenManager = new TokenManager();
export default tokenManager;