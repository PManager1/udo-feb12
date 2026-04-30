// API layer for AddFoodItem - adapted from public/AddFoodItem/api-manager.js
import API_BASE from '../../config/api';
import { getToken, getHeaders } from './tokenHelper';

const REST_BASE = `${API_BASE}rest`;

async function fetchAPI(endpoint, options = {}) {
  const headers = getHeaders(options.headers);
  const fetchOptions = { ...options, headers };

  // Admin mode support
  let finalEndpoint = endpoint;
  if (typeof localStorage !== 'undefined' && localStorage.getItem('adminMode') === 'true') {
    const targetId = localStorage.getItem('adminTargetUserId');
    if (targetId && endpoint.includes('/rest/')) {
      const sep = endpoint.includes('?') ? '&' : '?';
      finalEndpoint = `${endpoint}${sep}userId=${targetId}`;
    }
  }

  const response = await fetch(finalEndpoint, fetchOptions);

  if (!response.ok) {
    if (response.status === 401) throw new Error('Unauthorized');
    if (response.status === 403) throw new Error('Forbidden');
    if (response.status === 404) throw new Error('Not Found');
    let errorMessage = 'API request failed';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {}
    throw new Error(errorMessage);
  }

  return response.json();
}

// ===== CATEGORIES =====
export async function getCategories() {
  const data = await fetchAPI(`${REST_BASE}/categories`, { method: 'GET' });
  return data.categories || data || [];
}

export async function createCategory(categoryData) {
  return fetchAPI(`${REST_BASE}/categories`, {
    method: 'POST',
    body: JSON.stringify(categoryData),
  });
}

export async function updateCategory(id, updates) {
  return fetchAPI(`${REST_BASE}/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteCategory(id) {
  await fetchAPI(`${REST_BASE}/categories/${id}`, { method: 'DELETE' });
  return true;
}

// ===== ITEMS =====
export async function getItems() {
  const data = await fetchAPI(`${REST_BASE}/items`, { method: 'GET' });
  return data.items || data || [];
}

export async function getItemsByCategory(categoryId) {
  const data = await fetchAPI(`${REST_BASE}/items?category_id=${categoryId}`, { method: 'GET' });
  return data.items || data || [];
}

export async function createItem(itemData) {
  return fetchAPI(`${REST_BASE}/items`, {
    method: 'POST',
    body: JSON.stringify(itemData),
  });
}

export async function updateItem(id, updates) {
  return fetchAPI(`${REST_BASE}/items/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteItem(id) {
  await fetchAPI(`${REST_BASE}/items/${id}`, { method: 'DELETE' });
  return true;
}

export async function toggleItemAvailability(id) {
  return fetchAPI(`${REST_BASE}/items/${id}/availability`, { method: 'PUT' });
}

// ===== MODIFIER GROUPS =====
export async function getModifierGroups() {
  const data = await fetchAPI(`${REST_BASE}/modifier-groups`, { method: 'GET' });
  return data.modifierGroups || data.modifier_groups || data || [];
}

export async function createModifierGroup(groupData) {
  return fetchAPI(`${REST_BASE}/modifier-groups`, {
    method: 'POST',
    body: JSON.stringify(groupData),
  });
}

export async function updateModifierGroup(id, updates) {
  return fetchAPI(`${REST_BASE}/modifier-groups/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteModifierGroup(id) {
  await fetchAPI(`${REST_BASE}/modifier-groups/${id}`, { method: 'DELETE' });
  return true;
}

// ===== FOOD CATEGORIES (System-wide) =====
export async function getFoodCategories() {
  try {
    const data = await fetchAPI(`${API_BASE}food-categories`, { method: 'GET' });
    return data || [];
  } catch {
    return [];
  }
}

// ===== PROFILE =====
export async function getProfile() {
  return fetchAPI(`${REST_BASE}/profile`, { method: 'GET' });
}

export async function updateProfile(profileData) {
  return fetchAPI(`${REST_BASE}/profile`, {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
}

// ===== IMAGE UPLOAD =====
export async function uploadImageToGCS(file) {
  const formData = new FormData();
  formData.append('image', file);
  const token = getToken();
  const response = await fetch(`${REST_BASE}/upload-image`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Image upload failed (${response.status}): ${errorBody}`);
  }
  const data = await response.json();
  return data.url;
}

// ===== HEALTH =====
export async function healthCheck() {
  try {
    await fetchAPI(`${API_BASE}health`, { method: 'GET' });
    return true;
  } catch {
    return false;
  }
}

// ===== MENU UPLOAD =====
export async function uploadMenu(file) {
  const formData = new FormData();
  formData.append('menuFile', file);
  const token = getToken();
  const res = await fetch(`${REST_BASE}/upload-menu`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) throw new Error('Upload failed: ' + res.status);
  return res.json();
}