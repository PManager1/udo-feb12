// Data Manager - Handles all CRUD operations and localStorage persistence

const STORAGE_KEY = 'restaurantMenuData';

class DataManager {
  /**
   * Initialize data manager with demo data if needed
   */
  static initialize() {
    if (!localStorage.getItem(STORAGE_KEY)) {
      console.log('Initializing with demo data...');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(demoData));
    }
  }

  /**
   * Get all data from localStorage
   */
  static getAllData() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  }

  /**
   * Save all data to localStorage
   */
  static saveAllData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  // ==================== SETTINGS ====================

  static getSettings() {
    const data = this.getAllData();
    return data ? data.settings : demoData.settings;
  }

  static updateSettings(settings) {
    const data = this.getAllData();
    data.settings = { ...data.settings, ...settings };
    this.saveAllData(data);
  }

  // ==================== CATEGORIES ====================

  static getCategories() {
    const data = this.getAllData();
    return data ? data.categories : [];
  }

  static getCategoryById(id) {
    const categories = this.getCategories();
    return categories.find(cat => cat.id === id);
  }

  static createCategory(categoryData) {
    const data = this.getAllData();
    const newCategory = {
      id: generateId('cat_'),
      name: categoryData.name,
      description: categoryData.description || '',
      image: categoryData.image || '',
      display_order: categoryData.display_order || data.categories.length + 1,
      inherited_modifier_group_ids: categoryData.inherited_modifier_group_ids || [],
      is_active: true,
      item_count: 0
    };
    data.categories.push(newCategory);
    this.saveAllData(data);
    return newCategory;
  }

  static updateCategory(id, categoryData) {
    const data = this.getAllData();
    const index = data.categories.findIndex(cat => cat.id === id);
    if (index !== -1) {
      data.categories[index] = { ...data.categories[index], ...categoryData };
      this.saveAllData(data);
      return data.categories[index];
    }
    return null;
  }

  static deleteCategory(id) {
    const data = this.getAllData();
    data.categories = data.categories.filter(cat => cat.id !== id);
    // Also delete items in this category
    data.items = data.items.filter(item => item.category_id !== id);
    this.saveAllData(data);
  }

  static assignModifierToCategory(categoryId, groupId) {
    const data = this.getAllData();
    const category = data.categories.find(cat => cat.id === categoryId);
    if (category && !category.inherited_modifier_group_ids.includes(groupId)) {
      category.inherited_modifier_group_ids.push(groupId);
      this.saveAllData(data);
    }
  }

  static removeModifierFromCategory(categoryId, groupId) {
    const data = this.getAllData();
    const category = data.categories.find(cat => cat.id === categoryId);
    if (category) {
      category.inherited_modifier_group_ids = category.inherited_modifier_group_ids.filter(id => id !== groupId);
      this.saveAllData(data);
    }
  }

  // ==================== ITEMS ====================

  static getItems(categoryId = null) {
    const data = this.getAllData();
    let items = data ? data.items : [];
    if (categoryId) {
      items = items.filter(item => item.category_id === categoryId);
    }
    return items;
  }

  static getItemById(id) {
    const items = this.getItems();
    return items.find(item => item.id === id);
  }

  static createItem(itemData) {
    const data = this.getAllData();
    const newItem = {
      id: generateId('item_'),
      name: itemData.name,
      description: itemData.description || '',
      base_price: parseFloat(itemData.base_price) || 0,
      category_id: itemData.category_id,
      image_url: itemData.image_url || '',
      is_available: true,
      local_modifier_group_ids: itemData.local_modifier_group_ids || [],
      excluded_modifier_group_ids: itemData.excluded_modifier_group_ids || [],
      created_at: getCurrentDate(),
      updated_at: getCurrentDate()
    };
    data.items.push(newItem);
    
    // Update category item count
    const category = data.categories.find(cat => cat.id === itemData.category_id);
    if (category) {
      category.item_count = data.items.filter(item => item.category_id === itemData.category_id).length;
    }
    
    this.saveAllData(data);
    return newItem;
  }

  static updateItem(id, itemData) {
    const data = this.getAllData();
    const index = data.items.findIndex(item => item.id === id);
    if (index !== -1) {
      data.items[index] = {
        ...data.items[index],
        ...itemData,
        id: data.items[index].id, // Preserve ID
        created_at: data.items[index].created_at, // Preserve created date
        updated_at: getCurrentDate()
      };
      this.saveAllData(data);
      return data.items[index];
    }
    return null;
  }

  static deleteItem(id) {
    const data = this.getAllData();
    const item = data.items.find(i => i.id === id);
    data.items = data.items.filter(item => item.id !== id);
    
    // Update category item count
    if (item) {
      const category = data.categories.find(cat => cat.id === item.category_id);
      if (category) {
        category.item_count = data.items.filter(i => i.category_id === item.category_id).length;
      }
    }
    
    this.saveAllData(data);
  }

  static toggleItemAvailability(id) {
    const data = this.getAllData();
    const item = data.items.find(i => i.id === id);
    if (item) {
      item.is_available = !item.is_available;
      item.updated_at = getCurrentDate();
      this.saveAllData(data);
      return item;
    }
    return null;
  }

  // ==================== MODIFIER GROUPS ====================

  static getModifierGroups() {
    const data = this.getAllData();
    return data ? data.modifier_groups : [];
  }

  static getModifierGroupById(id) {
    const groups = this.getModifierGroups();
    return groups.find(group => group.id === id);
  }

  static createModifierGroup(groupData) {
    const data = this.getAllData();
    const newGroup = {
      id: generateId('group_'),
      name: groupData.name,
      description: groupData.description || '',
      min_selection: parseInt(groupData.min_selection) || 0,
      max_selection: parseInt(groupData.max_selection) || 1,
      is_required: groupData.is_required || false,
      display_order: groupData.display_order || data.modifier_groups.length + 1,
      options: groupData.options || []
    };
    data.modifier_groups.push(newGroup);
    this.saveAllData(data);
    return newGroup;
  }

  static updateModifierGroup(id, groupData) {
    const data = this.getAllData();
    const index = data.modifier_groups.findIndex(group => group.id === id);
    if (index !== -1) {
      data.modifier_groups[index] = { ...data.modifier_groups[index], ...groupData };
      this.saveAllData(data);
      return data.modifier_groups[index];
    }
    return null;
  }

  static deleteModifierGroup(id) {
    const data = this.getAllData();
    data.modifier_groups = data.modifier_groups.filter(group => group.id !== id);
    // Remove from categories
    data.categories.forEach(cat => {
      cat.inherited_modifier_group_ids = cat.inherited_modifier_group_ids.filter(gid => gid !== id);
    });
    // Remove from items
    data.items.forEach(item => {
      item.local_modifier_group_ids = item.local_modifier_group_ids.filter(gid => gid !== id);
      item.excluded_modifier_group_ids = item.excluded_modifier_group_ids.filter(gid => gid !== id);
    });
    this.saveAllData(data);
  }

  // ==================== MODIFIER INHERITANCE LOGIC ====================

  /**
   * Get final modifier groups for an item (merges local + inherited, excludes specified)
   * @param {string} itemId - The item ID
   * @returns {Array} - Array of modifier group objects with type indicator
   */
  static getFinalItemModifiers(itemId) {
    const item = this.getItemById(itemId);
    if (!item) return [];

    const category = this.getCategoryById(item.category_id);
    if (!category) return [];

    const allGroups = this.getModifierGroups();
    
    // Combine local and inherited IDs, remove duplicates
    const combinedIds = new Set([
      ...item.local_modifier_group_ids,
      ...category.inherited_modifier_group_ids
    ]);

    // Filter out excluded modifiers
    const finalIds = Array.from(combinedIds).filter(id => 
      !item.excluded_modifier_group_ids.includes(id)
    );

    // Return full group objects with type indicator
    return finalIds.map(groupId => {
      const group = allGroups.find(g => g.id === groupId);
      if (!group) return null;
      
      return {
        ...group,
        type: item.local_modifier_group_ids.includes(groupId) ? 'local' : 'inherited'
      };
    }).filter(g => g !== null);
  }

  /**
   * Add local modifier group to item
   */
  static addLocalModifierToItem(itemId, groupId) {
    const data = this.getAllData();
    const item = data.items.find(i => i.id === itemId);
    if (item && !item.local_modifier_group_ids.includes(groupId)) {
      item.local_modifier_group_ids.push(groupId);
      // Remove from excluded if it was there
      item.excluded_modifier_group_ids = item.excluded_modifier_group_ids.filter(id => id !== groupId);
      item.updated_at = getCurrentDate();
      this.saveAllData(data);
    }
  }

  /**
   * Remove local modifier group from item
   */
  static removeLocalModifierFromItem(itemId, groupId) {
    const data = this.getAllData();
    const item = data.items.find(i => i.id === itemId);
    if (item) {
      item.local_modifier_group_ids = item.local_modifier_group_ids.filter(id => id !== groupId);
      item.updated_at = getCurrentDate();
      this.saveAllData(data);
    }
  }

  /**
   * Exclude inherited modifier group from item
   */
  static excludeModifierFromItem(itemId, groupId) {
    const data = this.getAllData();
    const item = data.items.find(i => i.id === itemId);
    if (item && !item.excluded_modifier_group_ids.includes(groupId)) {
      item.excluded_modifier_group_ids.push(groupId);
      // Remove from local if it was there
      item.local_modifier_group_ids = item.local_modifier_group_ids.filter(id => id !== groupId);
      item.updated_at = getCurrentDate();
      this.saveAllData(data);
    }
  }

  /**
   * Include excluded modifier group in item
   */
  static includeModifierInItem(itemId, groupId) {
    const data = this.getAllData();
    const item = data.items.find(i => i.id === itemId);
    if (item) {
      item.excluded_modifier_group_ids = item.excluded_modifier_group_ids.filter(id => id !== groupId);
      item.updated_at = getCurrentDate();
      this.saveAllData(data);
    }
  }

  // ==================== SEARCH ====================

  static searchItems(query) {
    const items = this.getItems();
    const categories = this.getCategories();
    
    if (!query || query.trim() === '') {
      return items;
    }
    
    const lowerQuery = query.toLowerCase();
    
    return items.filter(item => {
      const itemMatches = 
        item.name.toLowerCase().includes(lowerQuery) ||
        item.description.toLowerCase().includes(lowerQuery);
      
      const category = categories.find(cat => cat.id === item.category_id);
      const categoryMatches = category && category.name.toLowerCase().includes(lowerQuery);
      
      return itemMatches || categoryMatches;
    });
  }

  static searchCategories(query) {
    const categories = this.getCategories();
    
    if (!query || query.trim() === '') {
      return categories;
    }
    
    const lowerQuery = query.toLowerCase();
    
    return categories.filter(category => 
      category.name.toLowerCase().includes(lowerQuery) ||
      category.description.toLowerCase().includes(lowerQuery)
    );
  }
}

// Initialize on load
DataManager.initialize();