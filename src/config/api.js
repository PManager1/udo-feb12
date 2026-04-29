// Central API Configuration for UDO Application

const API_BASE = 'http://localhost:3030/';

// Authentication Endpoints
export const AUTH_API = {
  google: `${API_BASE}auth/google/`,
  signin: `${API_BASE}signin`,
  me: `${API_BASE}me`,
  sendOtp: `${API_BASE}send-otp-aws`,
  verifyOtp: `${API_BASE}verify-otp`,
  sendEmailOtp: `${API_BASE}send-email-otp`,
  verifyEmailOtp: `${API_BASE}verify-email-otp`,
  sendSms: `${API_BASE}send-sms`
};

// User Profile Endpoints
export const USER_API = {
  getProfile: `${API_BASE}me`,
  updateProfile: `${API_BASE}meProfile`
};

// Restaurant Menu Endpoints
export const RESTAURANT_API = {
  baseURL: `${API_BASE}restaurant`,
  endpoints: {
    categories: '/categories',
    items: '/items',
    modifier_groups: '/modifier-groups',
    upload: '/upload'
  }
};

// Search Overlay Items Endpoints
export const SEARCH_OVERLAY_API = {
  publicItems: `${API_BASE}search-overlay-items`,
  adminItems: `${API_BASE}admin/search-overlay-items`
};

export default API_BASE;