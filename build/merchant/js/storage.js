// Merchant Store API — Server-only, no localStorage for store data
// Only the auth token lives in localStorage (managed by tokenManager)

const STORE_API_BASE = `${API_BASE}rest/profile`;

/**
 * Get auth headers with token
 */
function getAuthHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  if (typeof tokenManager !== 'undefined' && tokenManager.hasValidToken()) {
    const token = tokenManager.getToken();
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Load store data from server
 * @returns {Promise<Object>} Store data
 */
async function loadStoreData() {
  try {
    const response = await fetch(STORE_API_BASE, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.log('No store data on server, using defaults');
        return { ...defaultStoreData };
      }
      throw new Error(`Server returned ${response.status}`);
    }

    const raw = await response.json();
    const serverData = raw.store || raw;
    console.log('Store data loaded from server:', serverData);
    return mapServerToUI(serverData);
  } catch (error) {
    console.error('Failed to load store data from server:', error);
    return { ...defaultStoreData };
  }
}

/**
 * Map server response format to UI-expected format
 * Server: { restaurantName, storeType, storeAddress, storeHours: { monday: "09:00-21:00" }, ... }
 * UI:     { storeName,     storeType, storeAddress, hours: { monday: { open, close } }, categories: [], ... }
 */
function mapServerToUI(serverData) {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const hours = {};

  // Convert storeHours "HH:MM-HH:MM" → { open, close } per day
  const serverHours = serverData.storeHours || serverData.hours || {};
  days.forEach(day => {
    const val = serverHours[day];
    if (val && typeof val === 'string' && val.includes('-')) {
      const [open, close] = val.split('-');
      hours[day] = { open: open.trim(), close: close.trim() };
    } else if (val && typeof val === 'object' && val.open) {
      hours[day] = { open: val.open, close: val.close };
    } else {
      hours[day] = { open: '09:00', close: '21:00' };
    }
  });

  return {
    storeName:      serverData.restaurantName || serverData.storeName || '',
    storeType:      serverData.storeType || '',
    storeAddress:   serverData.storeAddress || '',
    hours:          hours,
    emergencyPause: serverData.emergencyPause || false,
    categories:     serverData.categories || []
  };
}

/**
 * Save store data to server
 * @param {Object} data - Store data to save
 * @returns {Promise<boolean>} Success status
 */
async function saveStoreData(data) {
  try {
    // Map UI fields → backend field names before sending
    const storeHours = {};
    if (data.hours) {
      Object.keys(data.hours).forEach(day => {
        const h = data.hours[day];
        if (h && h.open && h.close) {
          storeHours[day] = `${h.open}-${h.close}`;
        }
      });
    }

    // Read category from whichever dropdown exists (desktop or mobile)
    const catDesktop = document.getElementById('restaurantCategory');
    const catMobile  = document.getElementById('restaurantCategoryMobile');
    const categoryVal = (catDesktop && catDesktop.value) || (catMobile && catMobile.value) || '';

    // Fetch current profile to preserve fields managed by other pages (logoURL, images, etc.)
    let existingProfile = {};
    try {
      const getResp = await fetch(STORE_API_BASE, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      if (getResp.ok) {
        const rawData = await getResp.json();
        existingProfile = rawData.store || rawData || {};
      }
    } catch (e) {
      console.warn('Could not load existing profile for merge, using defaults');
    }

    const payload = {
      restaurantName: data.storeName || '',
      storeType:      data.storeType || '',
      storeAddress:   data.storeAddress || '',
      storeHours:     storeHours,
      emergencyPause: data.emergencyPause || false,
      category:       categoryVal,
      // Preserve existing values for fields managed by other pages
      logoURL:        existingProfile.logoURL || '',
      images:         existingProfile.images || [],
      deliveryTime:   existingProfile.deliveryTime || 0,
      deliveryFee:    existingProfile.deliveryFee || 0,
      promoText:      existingProfile.promoText || '',
      latitude:       existingProfile.latitude || 0,
      longitude:      existingProfile.longitude || 0,
      isSponsored:    existingProfile.isSponsored || false
    };

    const response = await fetch(STORE_API_BASE, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server returned ${response.status}: ${errorText}`);
    }

    console.log('Store data saved to server');
    return true;
  } catch (error) {
    console.error('Failed to save store data to server:', error);
    return false;
  }
}

/**
 * Publish store to server
 * @param {Object} data - Store data to publish
 * @returns {Promise<boolean>} Success status
 */
async function publishStore(data) {
  try {
    const response = await fetch(`${STORE_API_BASE}/publish`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    console.log('Store published to server');
    return true;
  } catch (error) {
    console.error('Failed to publish store:', error);
    return false;
  }
}

// Default store data template (used when server has no data yet)
const defaultStoreData = {
  storeName: '',
  storeType: '',
  storeAddress: '',
  hours: {
    monday: { open: '09:00', close: '21:00' },
    tuesday: { open: '09:00', close: '21:00' },
    wednesday: { open: '09:00', close: '21:00' },
    thursday: { open: '09:00', close: '21:00' },
    friday: { open: '09:00', close: '21:00' },
    saturday: { open: '09:00', close: '21:00' },
    sunday: { open: '09:00', close: '21:00' }
  },
  emergencyPause: false,
  categories: []
};

// Smart defaults for store types
const storeTypeDefaults = {
  cafe: {
    categories: [
      { id: 'cat_1', name: 'Popular Items', products: [] },
      { id: 'cat_2', name: 'Drinks', products: [] },
      { id: 'cat_3', name: 'Pastries', products: [] },
      { id: 'cat_4', name: 'Breakfast', products: [] }
    ]
  },
  restaurant: {
    categories: [
      { id: 'cat_1', name: 'Appetizers', products: [] },
      { id: 'cat_2', name: 'Mains', products: [] },
      { id: 'cat_3', name: 'Sides', products: [] },
      { id: 'cat_4', name: 'Desserts', products: [] }
    ]
  },
  grocery: {
    categories: [
      { id: 'cat_1', name: 'Essentials', products: [] },
      { id: 'cat_2', name: 'Snacks', products: [] },
      { id: 'cat_3', name: 'Beverages', products: [] }
    ]
  },
  flowers: {
    categories: [
      { id: 'cat_1', name: 'Fresh Flowers', products: [] },
      { id: 'cat_2', name: 'Arrangements', products: [] },
      { id: 'cat_3', name: 'Gifts', products: [] }
    ]
  }
};

/**
 * Apply smart defaults for a store type
 */
function getStoreTypeDefaults(storeType) {
  return storeTypeDefaults[storeType]?.categories || [];
}

/**
 * Calculate progress (steps left to go live)
 * Products are managed on /AddFoodItem — not counted here
 */
function calculateStepsLeft(storeData) {
  let stepsLeft = 4;
  if (storeData.storeName) stepsLeft--;
  if (storeData.storeType) stepsLeft--;
  if (storeData.storeAddress) stepsLeft--;
  if (!storeData.emergencyPause) stepsLeft--;
  return stepsLeft;
}

/**
 * Generate unique ID
 */
function generateId() {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}