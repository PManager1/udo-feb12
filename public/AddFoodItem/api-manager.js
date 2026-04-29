// API Manager - Handles all backend API calls for restaurant menu
// This module provides a clean API for CRUD operations with automatic token authentication

class APIManager {
  constructor(tokenManager, apiBase) {
    this.tokenManager = tokenManager;
    // Use provided apiBase, or fall back to global API_BASE from config.js, then localhost
    this.apiBase = apiBase || (typeof API_BASE !== 'undefined' ? API_BASE : 'http://localhost:3030/');
    this.restaurantBase = `${this.apiBase}rest`;
    this.useApiFallback = true; // Fallback to localStorage if API fails

    // 👑 Admin mode: if set, all /rest/* calls get ?userId=<target> appended
    // so the admin can operate on behalf of any restaurant owner
    this.adminTargetUserId = null;
    if (typeof localStorage !== 'undefined' && localStorage.getItem('adminMode') === 'true') {
      const targetId = localStorage.getItem('adminTargetUserId');
      if (targetId) {
        this.adminTargetUserId = targetId;
        console.log(`👑 Admin mode active — targeting userId: ${targetId}`);
      }
    }
  }

  /**
   * Generic fetch wrapper with error handling and token authentication
   * @param {string} endpoint - API endpoint
   * @param {object} options - Fetch options
   * @returns {Promise} - Fetch response
   */
  async fetchAPI(endpoint, options = {}) {
    try {
      // Add authentication headers if token exists
      const headers = this.tokenManager.getHeaders(options.headers);
      
      const fetchOptions = {
        ...options,
        headers
      };

      console.log(`APIManager: ${options.method || 'GET'} ${endpoint}`, fetchOptions);

      // 👑 Admin mode: append ?userId= to all /rest/* calls
      let finalEndpoint = endpoint;
      if (this.adminTargetUserId && endpoint.includes('/rest/')) {
        const sep = endpoint.includes('?') ? '&' : '?';
        finalEndpoint = `${endpoint}${sep}userId=${this.adminTargetUserId}`;
      }

      const response = await fetch(finalEndpoint, fetchOptions);
      
      // Handle different response statuses
      if (!response.ok) {
        if (response.status === 401) {
          console.error('APIManager: Unauthorized - Token may be invalid');
          throw new Error('Unauthorized: Please check your token');
        }
        if (response.status === 403) {
          console.error('APIManager: Forbidden - Insufficient permissions');
          throw new Error('Forbidden: You don\'t have permission');
        }
        if (response.status === 404) {
          console.error('APIManager: Resource not found');
          throw new Error('Not Found: The requested resource was not found');
        }
        
        // Try to get error message from response body
        let errorMessage = 'API request failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          errorMessage = `API request failed with status ${response.status}`;
        }
        
        throw new Error(errorMessage);
      }

      // Parse and return response
      const data = await response.json();
      console.log(`APIManager: Success - ${endpoint}`, data);
      return data;

    } catch (error) {
      console.error(`APIManager: Error for ${endpoint}:`, error);
      
      // If fallback is enabled and it's a network error, rethrow for fallback handling
      if (this.useApiFallback && error.message.includes('Failed to fetch')) {
        console.log('APIManager: Network error, will use localStorage fallback');
        throw error;
      }
      
      throw error;
    }
  }

  // ===== CATEGORIES =====

  /**
   * Get all categories
   * @returns {Promise<Array>} - Array of categories
   */
  async getCategories() {
    try {
      const data = await this.fetchAPI(`${this.restaurantBase}/categories`, {
        method: 'GET'
      });
      return data.categories || data || [];
    } catch (error) {
      console.error('APIManager: Failed to fetch categories:', error);
      throw error;
    }
  }

  /**
   * Get category by ID
   * @param {string} id - Category ID
   * @returns {Promise<object>} - Category object
   */
  async getCategoryById(id) {
    try {
      return await this.fetchAPI(`${this.restaurantBase}/categories/${id}`, {
        method: 'GET'
      });
    } catch (error) {
      console.error('APIManager: Failed to fetch category:', error);
      throw error;
    }
  }

  /**
   * Create new category
   * @param {object} categoryData - Category data
   * @returns {Promise<object>} - Created category
   */
  async createCategory(categoryData) {
    try {
      return await this.fetchAPI(`${this.restaurantBase}/categories`, {
        method: 'POST',
        body: JSON.stringify(categoryData)
      });
    } catch (error) {
      console.error('APIManager: Failed to create category:', error);
      throw error;
    }
  }

  /**
   * Update category
   * @param {string} id - Category ID
   * @param {object} updates - Category updates
   * @returns {Promise<object>} - Updated category
   */
  async updateCategory(id, updates) {
    try {
      return await this.fetchAPI(`${this.restaurantBase}/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
    } catch (error) {
      console.error('APIManager: Failed to update category:', error);
      throw error;
    }
  }

  /**
   * Delete category
   * @param {string} id - Category ID
   * @returns {Promise<boolean>} - Success status
   */
  async deleteCategory(id) {
    try {
      await this.fetchAPI(`${this.restaurantBase}/categories/${id}`, {
        method: 'DELETE'
      });
      return true;
    } catch (error) {
      console.error('APIManager: Failed to delete category:', error);
      throw error;
    }
  }

  // ===== ITEMS =====

  /**
   * Get all items
   * @returns {Promise<Array>} - Array of items
   */
  async getItems() {
    try {
      const data = await this.fetchAPI(`${this.restaurantBase}/items`, {
        method: 'GET'
      });
      return data.items || data || [];
    } catch (error) {
      console.error('APIManager: Failed to fetch items:', error);
      throw error;
    }
  }

  /**
   * Get items by category ID
   * @param {string} categoryId - Category ID
   * @returns {Promise<Array>} - Array of items
   */
  async getItemsByCategory(categoryId) {
    try {
      const data = await this.fetchAPI(`${this.restaurantBase}/items?category_id=${categoryId}`, {
        method: 'GET'
      });
      return data.items || data || [];
    } catch (error) {
      console.error('APIManager: Failed to fetch items by category:', error);
      throw error;
    }
  }

  /**
   * Get item by ID
   * @param {string} id - Item ID
   * @returns {Promise<object>} - Item object
   */
  async getItemById(id) {
    try {
      return await this.fetchAPI(`${this.restaurantBase}/items/${id}`, {
        method: 'GET'
      });
    } catch (error) {
      console.error('APIManager: Failed to fetch item:', error);
      throw error;
    }
  }

  /**
   * Create new item
   * @param {object} itemData - Item data
   * @returns {Promise<object>} - Created item
   */
  async createItem(itemData) {
    try {
      return await this.fetchAPI(`${this.restaurantBase}/items`, {
        method: 'POST',
        body: JSON.stringify(itemData)
      });
    } catch (error) {
      console.error('APIManager: Failed to create item:', error);
      throw error;
    }
  }

  /**
   * Update item
   * @param {string} id - Item ID
   * @param {object} updates - Item updates
   * @returns {Promise<object>} - Updated item
   */
  async updateItem(id, updates) {
    try {
      return await this.fetchAPI(`${this.restaurantBase}/items/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
    } catch (error) {
      console.error('APIManager: Failed to update item:', error);
      throw error;
    }
  }

  /**
   * Delete item
   * @param {string} id - Item ID
   * @returns {Promise<boolean>} - Success status
   */
  async deleteItem(id) {
    try {
      await this.fetchAPI(`${this.restaurantBase}/items/${id}`, {
        method: 'DELETE'
      });
      return true;
    } catch (error) {
      console.error('APIManager: Failed to delete item:', error);
      throw error;
    }
  }

  /**
   * Toggle item availability
   * @param {string} id - Item ID
   * @param {boolean} available - New availability status
   * @returns {Promise<object>} - Updated item
   */
  async toggleItemAvailability(id) {
    try {
      return await this.fetchAPI(`${this.restaurantBase}/items/${id}/availability`, {
        method: 'PUT'
      });
    } catch (error) {
      console.error('APIManager: Failed to toggle item availability:', error);
      throw error;
    }
  }

  // ===== MODIFIER GROUPS =====

  /**
   * Get all modifier groups
   * @returns {Promise<Array>} - Array of modifier groups
   */
  async getModifierGroups() {
    try {
      const data = await this.fetchAPI(`${this.restaurantBase}/modifier-groups`, {
        method: 'GET'
      });
      return data.modifierGroups || data.modifier_groups || data || [];
    } catch (error) {
      console.error('APIManager: Failed to fetch modifier groups:', error);
      throw error;
    }
  }

  /**
   * Get modifier group by ID
   * @param {string} id - Modifier group ID
   * @returns {Promise<object>} - Modifier group object
   */
  async getModifierGroupById(id) {
    try {
      return await this.fetchAPI(`${this.restaurantBase}/modifier-groups/${id}`, {
        method: 'GET'
      });
    } catch (error) {
      console.error('APIManager: Failed to fetch modifier group:', error);
      throw error;
    }
  }

  /**
   * Create new modifier group
   * @param {object} groupData - Modifier group data
   * @returns {Promise<object>} - Created modifier group
   */
  async createModifierGroup(groupData) {
    try {
      return await this.fetchAPI(`${this.restaurantBase}/modifier-groups`, {
        method: 'POST',
        body: JSON.stringify(groupData)
      });
    } catch (error) {
      console.error('APIManager: Failed to create modifier group:', error);
      throw error;
    }
  }

  /**
   * Update modifier group
   * @param {string} id - Modifier group ID
   * @param {object} updates - Modifier group updates
   * @returns {Promise<object>} - Updated modifier group
   */
  async updateModifierGroup(id, updates) {
    try {
      return await this.fetchAPI(`${this.restaurantBase}/modifier-groups/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
    } catch (error) {
      console.error('APIManager: Failed to update modifier group:', error);
      throw error;
    }
  }

  /**
   * Delete modifier group
   * @param {string} id - Modifier group ID
   * @returns {Promise<boolean>} - Success status
   */
  async deleteModifierGroup(id) {
    try {
      await this.fetchAPI(`${this.restaurantBase}/modifier-groups/${id}`, {
        method: 'DELETE'
      });
      return true;
    } catch (error) {
      console.error('APIManager: Failed to delete modifier group:', error);
      throw error;
    }
  }

  // ===== FOOD CATEGORIES (System-wide shared categories) =====

  /**
   * Get all system-wide FoodCategories (public endpoint)
   * @returns {Promise<Array>} - Array of FoodCategory objects
   */
  async getFoodCategories() {
    try {
      const data = await this.fetchAPI(`${this.apiBase}food-categories`, {
        method: 'GET'
      });
      return data || [];
    } catch (error) {
      console.error('APIManager: Failed to fetch food categories:', error);
      throw error;
    }
  }

  /**
   * Create a new system-wide FoodCategory (authenticated)
   * @param {object} categoryData - { name, icon }
   * @returns {Promise<object>} - Created or existing FoodCategory
   */
  async createFoodCategory(categoryData) {
    try {
      return await this.fetchAPI(`${this.restaurantBase}/food-categories`, {
        method: 'POST',
        body: JSON.stringify(categoryData)
      });
    } catch (error) {
      console.error('APIManager: Failed to create food category:', error);
      throw error;
    }
  }

  /**
   * Update a system-wide FoodCategory (authenticated)
   * @param {string} id - FoodCategory ID
   * @param {object} updates - { name, icon, isActive }
   * @returns {Promise<object>} - Updated FoodCategory
   */
  async updateFoodCategory(id, updates) {
    try {
      return await this.fetchAPI(`${this.restaurantBase}/food-categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
    } catch (error) {
      console.error('APIManager: Failed to update food category:', error);
      throw error;
    }
  }

  /**
   * Delete a system-wide FoodCategory (authenticated)
   * @param {string} id - FoodCategory ID
   * @returns {Promise<boolean>} - Success status
   */
  async deleteFoodCategory(id) {
    try {
      await this.fetchAPI(`${this.restaurantBase}/food-categories/${id}`, {
        method: 'DELETE'
      });
      return true;
    } catch (error) {
      console.error('APIManager: Failed to delete food category:', error);
      throw error;
    }
  }

  /**
   * Toggle a system-wide FoodCategory active status (authenticated)
   * @param {string} id - FoodCategory ID
   * @param {boolean} isActive - New active status
   * @returns {Promise<object>} - Updated FoodCategory
   */
  async toggleFoodCategory(id, isActive) {
    try {
      return await this.fetchAPI(`${this.restaurantBase}/food-categories/${id}/toggle`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive })
      });
    } catch (error) {
      console.error('APIManager: Failed to toggle food category:', error);
      throw error;
    }
  }

  // ===== MERCHANT PROFILE =====

  /**
   * Update merchant store profile
   * @param {object} profileData - Store profile data
   * @returns {Promise<object>} - Update result
   */
  async updateProfile(profileData) {
    try {
      return await this.fetchAPI(`${this.apiBase}rest/profile`, {
        method: 'PUT',
        body: JSON.stringify(profileData)
      });
    } catch (error) {
      console.error('APIManager: Failed to update profile:', error);
      throw error;
    }
  }

  /**
   * Get merchant store profile
   * @returns {Promise<object>} - Store profile data
   */
  async getProfile() {
    try {
      return await this.fetchAPI(`${this.apiBase}rest/profile`, {
        method: 'GET'
      });
    } catch (error) {
      console.error('APIManager: Failed to get profile:', error);
      throw error;
    }
  }

  // ===== HEALTH CHECK =====

  /**
   * Check if API is accessible
   * @returns {Promise<boolean>} - API status
   */
  async healthCheck() {
    try {
      await this.fetchAPI(`${this.apiBase}health`, {
        method: 'GET'
      });
      return true;
    } catch (error) {
      console.error('APIManager: Health check failed:', error);
      return false;
    }
  }

  /**
   * Check if user is authenticated
   * @returns {Promise<boolean>} - Authentication status
   */
  async checkAuth() {
    try {
      await this.fetchAPI(`${this.apiBase}auth/verify`, {
        method: 'GET'
      });
      return true;
    } catch (error) {
      console.error('APIManager: Auth check failed:', error);
      return false;
    }
  }
}

// Create and export global instance
const apiManager = new APIManager(tokenManager);

// Make it available globally
if (typeof window !== 'undefined') {
  window.apiManager = apiManager;
}

// Export for module usage (if using modules)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = apiManager;
}