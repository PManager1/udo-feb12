// Central API Configuration for UDO Application
// This file should be loaded in all HTML pages that need API access


// Base API URL


const API_BASE = 'https://tcdlm857gf.execute-api.us-east-1.amazonaws.com/dev/';

// const API_BASE = 'http://localhost:3030/';

// Restaurant Menu Endpoints (for AddFood feature)
const RESTAURANT_API = {
  baseURL: `${API_BASE}restaurant`,
  endpoints: {
    categories: '/categories',
    items: '/items',
    modifier_groups: '/modifier-groups',
    upload: '/upload'
  }
};

// Authentication Endpoints
const AUTH_API = {
  google: `${API_BASE}auth/google/`,
  signin: `${API_BASE}signin`,
  me: `${API_BASE}me`,
  sendOtp: `${API_BASE}send-otp-aws`,
  verifyOtp: `${API_BASE}verify-otp`,
  sendEmailOtp: `${API_BASE}send-email-otp`,
  verifyEmailOtp: `${API_BASE}verify-email-otp`,
  sendSms: `${API_BASE}send-sms`
};

// User Profile Endpoints (require authentication)
const USER_API = {
  getProfile: `${API_BASE}users/me`,
  updateProfile: `${API_BASE}users/me`
};

// Search Overlay Items Endpoints
const SEARCH_OVERLAY_API = {
  publicItems: `${API_BASE}search-overlay-items`,
  adminItems: `${API_BASE}admin/search-overlay-items`
};

// Image uploads are now proxied through the backend: POST /rest/upload-image
// No GCS credentials needed on the frontend — the server handles it securely

// Helper function to get full endpoint URL
function getRestaurantEndpoint(endpoint) {
  return RESTAURANT_API.baseURL + RESTAURANT_API.endpoints[endpoint];
}

// Log configuration (for debugging)
console.log('API Configuration Loaded:');
console.log('API_BASE:', API_BASE);
console.log('AUTH_API.google:', AUTH_API.google);
console.log('RESTAURANT_API.baseURL:', RESTAURANT_API.baseURL);