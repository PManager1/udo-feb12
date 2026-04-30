// Data Manager - Production-Ready API-Only Data Layer
// All data comes from backend - no localStorage caching except auth token

class DataManager {
  constructor() {
    this.syncStatus = {
      lastSync: null,
      isOnline: false,
      lastError: null
    };
    
    // Don't initialize here - will be called explicitly in initializeApp()
  }
  
  /**
   * Initialize API mode - wait for token
   */
  async initializeApiMode() {
    // Retry multiple times to find token (handles race condition)
    const maxRetries = 10;
    const retryDelay = 200; // ms
    
    for (let i = 0; i < maxRetries; i++) {
      // Check if tokenManager exists and has valid token
      if (typeof tokenManager !== 'undefined') {
        if (tokenManager.hasValidToken()) {
          // Try health check
          try {
            const isHealthy = await apiManager.healthCheck();
            if (isHealthy) {
              this.syncStatus.isOnline = true;
              console.log('✅ DataManager: API mode initialized successfully');
              return;
            }
          } catch (error) {
            console.log(`DataManager: Backend health check failed, retry ${i + 1}/${maxRetries}`);
          }
        } else {
          console.log(`DataManager: tokenManager exists but no valid token, retry ${i + 1}/${maxRetries}`);
        }
      } else {
        console.log(`DataManager: tokenManager not available yet, retry ${i + 1}/${maxRetries}`);
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
    
    console.warn('⚠️  DataManager: Could not initialize API mode after', maxRetries, 'retries');
    this.syncStatus.isOnline = false;
  }
  
  /**
   * Ensure API mode is active
   * @throws {Error} If API mode is not available
   */
  async ensureApiMode() {
    if (typeof apiManager === 'undefined') {
      throw new Error('API Manager not available');
    }
    
    if (typeof tokenManager === 'undefined') {
      throw new Error('Token Manager not available');
    }
    
    if (!tokenManager.hasValidToken()) {
      throw new Error('No valid authentication token');
    }
    
    this.syncStatus.isOnline = true;
    this.updateSyncTimestamp();
  }
  
  /**
   * Update last sync timestamp
   */
  updateSyncTimestamp() {
    this.syncStatus.lastSync = new Date().toISOString();
    this.syncStatus.lastError = null;
  }
  
  /**
   * Handle API errors
   */
  handleApiError(error) {
    this.syncStatus.isOnline = false;
    this.syncStatus.lastError = error.message || 'Unknown error';
    throw error; // Re-throw to let caller handle it
  }

  // ===== CATEGORIES =====
  
  async getAllCategories() {
    await this.ensureApiMode();
    
    try {
      const categories = await apiManager.getCategories();
      this.updateSyncTimestamp();
      return categories;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }

  async getCategoryById(id) {
    const categories = await this.getAllCategories();
    return categories.find(cat => cat.id === id);
  }

  async createCategory(categoryData) {
    await this.ensureApiMode();
    
    try {
      const newCategory = await apiManager.createCategory(categoryData);
      this.updateSyncTimestamp();
      return newCategory;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }

  async updateCategory(id, updates) {
    await this.ensureApiMode();
    
    try {
      const updatedCategory = await apiManager.updateCategory(id, updates);
      this.updateSyncTimestamp();
      return updatedCategory;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }

  async deleteCategory(id) {
    await this.ensureApiMode();
    
    try {
      await apiManager.deleteCategory(id);
      this.updateSyncTimestamp();
      return true;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }

  // ===== ITEMS =====
  
  async getAllItems() {
    await this.ensureApiMode();
    
    try {
      const items = await apiManager.getItems();
      this.updateSyncTimestamp();
      return items;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }

  async getItemsByCategory(categoryId) {
    await this.ensureApiMode();
    
    try {
      const items = await apiManager.getItemsByCategory(categoryId);
      this.updateSyncTimestamp();
      return items;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }

  async getItemById(id) {
    const items = await this.getAllItems();
    return items.find(item => item.id === id);
  }

  async createItem(itemData) {
    await this.ensureApiMode();
    
    try {
      // Map frontend field names to backend field names
      const apiItemData = {
        name: itemData.name,
        description: itemData.description || '',
        promoText: itemData.promo_text || '',
        basePrice: parseFloat(itemData.base_price) || 0,
        categoryId: itemData.category_id || '',
        imageUrl: itemData.image_url || '',
        localModifierGroupIds: itemData.modifier_group_ids || [],
        isAvailable: itemData.available !== undefined ? itemData.available : true
      };
      
      console.log('DataManager: Creating item with mapped fields:', apiItemData);
      const newItem = await apiManager.createItem(apiItemData);
      this.updateSyncTimestamp();
      return newItem;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }

  async updateItem(id, updates) {
    await this.ensureApiMode();
    
    try {
      // Map frontend field names to backend field names
      const apiUpdates = {};
      
      if (updates.name !== undefined) apiUpdates.name = updates.name;
      if (updates.description !== undefined) apiUpdates.description = updates.description;
      if (updates.promo_text !== undefined) apiUpdates.promoText = updates.promo_text;
      console.log('🔍 [promoDebug] data-manager updateItem: promo_text=', JSON.stringify(updates.promo_text), '→ apiUpdates.promoText=', JSON.stringify(apiUpdates.promoText));
      if (updates.base_price !== undefined) apiUpdates.basePrice = parseFloat(updates.base_price) || 0;
      if (updates.category_id !== undefined) apiUpdates.categoryId = updates.category_id;
      if (updates.image_url !== undefined) apiUpdates.imageUrl = updates.image_url;
      if (updates.modifier_group_ids !== undefined) apiUpdates.localModifierGroupIds = updates.modifier_group_ids;
      if (updates.available !== undefined) apiUpdates.isAvailable = updates.available;
      
      console.log('DataManager: Updating item with mapped fields:', apiUpdates);
      console.log('DataManager: Modifier group IDs being sent:', apiUpdates.localModifierGroupIds);
      const updatedItem = await apiManager.updateItem(id, apiUpdates);
      console.log('DataManager: Update response from backend:', updatedItem);
      this.updateSyncTimestamp();
      return updatedItem;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }

  async deleteItem(id) {
    await this.ensureApiMode();
    
    try {
      await apiManager.deleteItem(id);
      this.updateSyncTimestamp();
      return true;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }

  async toggleItemAvailability(id) {
    await this.ensureApiMode();
    
    try {
      const result = await apiManager.toggleItemAvailability(id);
      this.updateSyncTimestamp();
      return result;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }

  // ===== MODIFIER GROUPS =====
  
  async getAllModifierGroups() {
    await this.ensureApiMode();
    
    try {
      const groups = await apiManager.getModifierGroups();
      this.updateSyncTimestamp();
      return groups;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }

  async getModifierGroupById(id) {
    const groups = await this.getAllModifierGroups();
    return groups.find(group => group.id === id);
  }

  async createModifierGroup(groupData) {
    await this.ensureApiMode();
    
    try {
      const newGroup = await apiManager.createModifierGroup(groupData);
      this.updateSyncTimestamp();
      return newGroup;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }

  async updateModifierGroup(id, updates) {
    await this.ensureApiMode();
    
    try {
      const updatedGroup = await apiManager.updateModifierGroup(id, updates);
      this.updateSyncTimestamp();
      return updatedGroup;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }

  async deleteModifierGroup(id) {
    await this.ensureApiMode();
    
    try {
      await apiManager.deleteModifierGroup(id);
      this.updateSyncTimestamp();
      return true;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }

  // ===== MODIFIER OPTIONS =====
  
  async addModifierOption(groupId, optionData) {
    const group = await this.getModifierGroupById(groupId);
    if (!group) {
      throw new Error('Modifier group not found');
    }
    
    const newOption = {
      id: 'opt_' + crypto.randomUUID().replace(/-/g, '').substring(0, 12),
      name: optionData.name,
      extraPrice: parseFloat(optionData.extraPrice) || 0,
      isAvailable: true
    };
    
    const updatedOptions = [...(group.options || []), newOption];
    return await this.updateModifierGroup(groupId, { options: updatedOptions });
  }

  async updateModifierOption(groupId, optionId, updates) {
    const group = await this.getModifierGroupById(groupId);
    if (!group) {
      throw new Error('Modifier group not found');
    }
    
    const optionIndex = group.options?.findIndex(opt => opt.id === optionId);
    if (optionIndex === undefined || optionIndex === -1) {
      throw new Error('Modifier option not found');
    }
    
    const updatedOptions = [...group.options];
    updatedOptions[optionIndex] = {
      ...updatedOptions[optionIndex],
      ...updates,
      extraPrice: updates.extraPrice !== undefined ? parseFloat(updates.extraPrice) : updatedOptions[optionIndex].extraPrice
    };
    
    return await this.updateModifierGroup(groupId, { options: updatedOptions });
  }

  async deleteModifierOption(groupId, optionId) {
    const group = await this.getModifierGroupById(groupId);
    if (!group) {
      throw new Error('Modifier group not found');
    }
    
    const updatedOptions = (group.options || []).filter(opt => opt.id !== optionId);
    return await this.updateModifierGroup(groupId, { options: updatedOptions });
  }

  async toggleModifierOptionAvailability(groupId, optionId) {
    const group = await this.getModifierGroupById(groupId);
    if (!group) {
      throw new Error('Modifier group not found');
    }
    
    const option = group.options?.find(opt => opt.id === optionId);
    if (!option) {
      throw new Error('Modifier option not found');
    }
    
    return await this.updateModifierOption(groupId, optionId, { isAvailable: !option.isAvailable });
  }

  // ===== FOOD CATEGORIES (System-wide shared categories) =====

  async getFoodCategories() {
    try {
      const categories = await apiManager.getFoodCategories();
      this.updateSyncTimestamp();
      return categories;
    } catch (error) {
      console.error('DataManager: Failed to fetch food categories:', error);
      return []; // Return empty on error so UI still works
    }
  }

  async createFoodCategory(categoryData) {
    await this.ensureApiMode();
    
    try {
      const newCategory = await apiManager.createFoodCategory(categoryData);
      this.updateSyncTimestamp();
      return newCategory;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }

  // ===== HELPER METHODS =====
  
  async getCategoryModifierGroups(categoryId) {
    const category = await this.getCategoryById(categoryId);
    if (!category) return [];
    
    const allGroups = await this.getAllModifierGroups();
    const categoryGroupIds = category.inheritedModifierGroupIds || category.localModifierGroupIds || [];
    
    return categoryGroupIds
      .map(id => allGroups.find(group => group.id === id))
      .filter(group => group !== undefined);
  }

  async getItemModifierGroups(itemId) {
    const item = await this.getItemById(itemId);
    if (!item) return [];
    
    const itemGroupIds = item.localModifierGroupIds || [];
    
    if (itemGroupIds.length === 0 && item.categoryId) {
      return this.getCategoryModifierGroups(item.categoryId);
    }
    
    const allGroups = await this.getAllModifierGroups();
    return itemGroupIds
      .map(id => allGroups.find(group => group.id === id))
      .filter(group => group !== undefined);
  }

  async searchItems(query) {
    const items = await this.getAllItems();
    const searchTerm = query.toLowerCase();
    
    return items.filter(item => 
      (item.name || '').toLowerCase().includes(searchTerm) ||
      (item.description || '').toLowerCase().includes(searchTerm)
    );
  }

  async getStatistics() {
    const [categories, items, modifierGroups] = await Promise.all([
      this.getAllCategories(),
      this.getAllItems(),
      this.getAllModifierGroups()
    ]);
    
    return {
      totalCategories: categories.length,
      availableCategories: categories.filter(cat => cat.isActive).length,
      totalItems: items.length,
      availableItems: items.filter(item => item.isAvailable).length,
      totalModifierGroups: modifierGroups.length,
      averagePrice: items.length > 0 
        ? (items.reduce((sum, item) => sum + item.basePrice, 0) / items.length).toFixed(2)
        : 0
    };
  }

  /**
   * Get current sync status
   */
  getSyncStatus() {
    return { ...this.syncStatus };
  }
}

// Create a global instance
const dataManager = new DataManager();