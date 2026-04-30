// Token helper for AddFoodItem API calls
// Matches the token storage used by public/shared/token-manager.js
import API_BASE from '../../config/api';

const TOKEN_KEY = 'udo_auth_token';
const LEGACY_TOKEN_KEY = 'jwt_token';

export function getToken() {
  try {
    // Primary: check udo_auth_token (JSON format: { token: "..." })
    const tokenData = localStorage.getItem(TOKEN_KEY);
    if (tokenData) {
      const parsed = JSON.parse(tokenData);
      if (parsed.token) {
        return parsed.token;
      }
    }

    // Fallback: check legacy jwt_token key
    const legacyToken = localStorage.getItem(LEGACY_TOKEN_KEY);
    if (legacyToken) {
      return legacyToken;
    }

    // Last resort: check plain 'token' key
    const plainToken = localStorage.getItem('token');
    if (plainToken) {
      return plainToken;
    }

    return '';
  } catch {
    return '';
  }
}

export function hasValidToken() {
  const token = getToken();
  return !!token && token.trim().length > 10;
}

export function getHeaders(extra = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...extra,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export function handleSignOut() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  localStorage.removeItem('token');
  localStorage.setItem('udo-signed-out', 'true');
  window.location.href = '/login/';
}