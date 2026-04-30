// UI Components - Handles all rendering logic for the restaurant menu interface
// This file manages the display of categories, items, modifier groups, and other UI elements

class UIComponents {
  constructor(dataManager) {
    this.dataManager = dataManager;
    this.currentCategory = null;
    this.currentItem = null;
    this.currentModifierGroup = null;
    this.tempModifierOptions = [];
  }

  // ===== HELPERS =====
  // Normalize field names between API (snake_case) and localStorage (snake_case)

  _getAvailability(obj) { return obj.available !== undefined ? obj.available : (obj.isAvailable !== undefined ? obj.isAvailable : true); }
  _getPrice(obj) { return parseFloat(obj.base_price || obj.basePrice || 0); }
  _getImage(obj) { 
    const raw = obj.image_url || obj.imageUrl || '';
    // Try parsing as JSON array (new multi-image format)
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
    } catch {}
    // Fallback: return raw string (old single-image format)
    return raw;
  }
  
  /** Get all images as an array (handles both JSON array and single URL) */
  _getImages(obj) {
    const raw = obj.image_url || obj.imageUrl || '';
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
    // Single URL or empty
    return raw ? [raw] : [];
  }
  _getCategoryId(obj) { return obj.category_id || obj.categoryId || ''; }
  _getMinSel(obj) { return obj.min_selection !== undefined ? obj.min_selection : (obj.minSelection || 0); }
  _getMaxSel(obj) { return obj.max_selection !== undefined ? obj.max_selection : (obj.maxSelection || 1); }
  _isRequired(obj) { return obj.required !== undefined ? obj.required : (obj.isRequired || false); }
  _getModifierIds(obj) { 
    if (!obj) return [];
    const ids = obj.localModifierGroupIds || obj.modifier_group_ids || obj.inheritedModifierGroupIds || obj.modifierGroupIds || [];
    if (ids.length > 0) {
      console.log('_getModifierIds:', obj.name, '→', ids, '(from field:', obj.localModifierGroupIds ? 'localModifierGroupIds' : obj.modifier_group_ids ? 'modifier_group_ids' : obj.inheritedModifierGroupIds ? 'inheritedModifierGroupIds' : 'modifierGroupIds', ')');
    }
    return ids;
  }

  // ===== VIEW MANAGEMENT =====

  async showDashboard() {
    document.getElementById('dashboardView').classList.remove('hidden');
    document.getElementById('categoryDetailView').classList.add('hidden');
    await this.renderAllItems();
    await this.renderCategories();
  }

  async showCategoryDetail(categoryId) {
    this.currentCategory = categoryId;
    document.getElementById('dashboardView').classList.add('hidden');
    document.getElementById('categoryDetailView').classList.remove('hidden');
    const category = await this.dataManager.getCategoryById(categoryId);
    if (category) {
      document.getElementById('categoryTitle').textContent = category.name;
      document.getElementById('categoryDescription').textContent = this._getCategoryDescription(category);
    }
    await this.renderItems(categoryId);
  }

  // ===== CATEGORY RENDERING =====

  async renderCategories() {
    const categories = await this.dataManager.getAllCategories();
    const container = document.getElementById('categoriesGrid');
    const categoryCards = await Promise.all(
      categories.map(async (category) => {
        const items = await this.dataManager.getItemsByCategory(category.id);
        const availableItems = items.filter(item => this._getAvailability(item));
        return this.renderCategoryCard(category, items, availableItems);
      })
    );
    container.innerHTML = categoryCards.join('');
  }

  renderCategoryCard(category, items, availableItems) {
    const icon = this._getCategoryIcon(category);
    const color = this._getCategoryColor(category);
    const desc = this._getCategoryDescription(category);
    const available = this._getAvailability(category);
    return `
      <div class="category-card bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 cursor-pointer ${!available ? 'opacity-60' : ''}"
           onclick="showCategoryDetail('${category.id}')">
        <div class="h-32 flex items-center justify-center text-6xl relative" style="background-color: ${color}20">
          ${icon}
          <button onclick="event.stopPropagation(); openCategoryModal('${category.id}')"
                  class="absolute top-3 right-3 w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow-md flex items-center justify-center text-gray-500 hover:text-orange-500 transition" title="Edit category">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        </div>
        <div class="p-5">
          <div class="flex justify-between items-start mb-2">
            <h3 class="text-xl font-bold text-gray-900">${category.name}</h3>
            ${this.renderAvailabilityToggle('category', category.id, available)}
          </div>
          <p class="text-sm text-gray-600 mb-3">${desc || 'No description'}</p>
          <div class="flex justify-between items-center text-sm">
            <span class="text-gray-500">${availableItems.length} of ${items.length} items available</span>
            <span class="text-orange-500 font-medium">View items →</span>
          </div>
        </div>
      </div>
    `;
  }

  renderAvailabilityToggle(type, id, available) {
    return `
      <button onclick="event.stopPropagation(); toggleAvailability('${type}', '${id}')"
              class="availability-toggle w-12 h-6 rounded-full relative transition-all duration-200 ${available ? 'available' : 'unavailable'}">
        <div class="absolute top-1 ${available ? 'left-7' : 'left-1'} w-4 h-4 bg-white rounded-full shadow transition-all duration-200"></div>
      </button>
    `;
  }

  // ===== ITEM RENDERING =====

  async renderAllItems() {
    const items = await this.dataManager.getAllItems();
    const container = document.getElementById('allItemsGrid');
    if (items.length === 0) {
      container.innerHTML = `
        <div class="col-span-full text-center py-12 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <p class="text-lg font-medium">No items yet</p>
          <p class="text-sm mt-1 mb-6">Add items one by one, or upload your restaurant menu below</p>
          <button onclick="document.getElementById('menuUploadInput').click()" 
                  class="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload Your Menu
          </button>
          <input type="file" id="menuUploadInput" class="hidden" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.txt" onchange="handleMenuUpload(this)">
          <p class="text-xs mt-3 text-gray-400">Supports PDF, Images, and Word documents</p>
        </div>`;
    } else {
      container.innerHTML = items.map(item => this.renderItemCard(item)).join('');
    }
    this.updateCounts();
  }

  async renderItems(categoryId) {
    const items = await this.dataManager.getItemsByCategory(categoryId);
    const container = document.getElementById('itemsGrid');
    container.innerHTML = items.map(item => this.renderItemCard(item)).join('');
  }

  renderItemCard(item) {
    if (!item) return '';
    const available = this._getAvailability(item);
    const price = this._getPrice(item);
    const images = this._getImages(item);
    const carouselId = `carousel-${item.id}`;
    
    // Build the image area: carousel for multi-image, static for single/none
    let imageArea;
    if (images.length <= 1) {
      const imageUrl = images[0] || '';
      imageArea = `
        <div class="relative h-48 bg-gray-200">
          ${imageUrl 
            ? `<img src="${imageUrl}" alt="${item.name}" class="w-full h-full object-cover">`
            : `<div class="w-full h-full flex items-center justify-center text-4xl text-gray-400">🍽️</div>`
          }
          <div class="absolute top-3 right-3">
            ${this.renderAvailabilityToggle('item', item.id, available)}
          </div>
        </div>`;
    } else {
      // Multi-image carousel
      const slides = images.map((url, i) => `
        <div class="img-carousel-slide h-48">
          <img src="${url}" alt="${item.name} ${i + 1}">
        </div>
      `).join('');
      const dots = images.map((_, i) => `
        <span class="carousel-dot ${i === 0 ? 'active' : ''}" data-carousel="${carouselId}" data-index="${i}"></span>
      `).join('');
      
      imageArea = `
        <div class="relative h-48 bg-gray-200">
          <div id="${carouselId}" class="img-carousel h-full" onscroll="updateCarouselDots('${carouselId}')">
            ${slides}
          </div>
          <button type="button" onclick="carouselScroll('${carouselId}', -1)" class="carousel-arrow left">
            <svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <button type="button" onclick="carouselScroll('${carouselId}', 1)" class="carousel-arrow right">
            <svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </button>
          <div class="carousel-dots" id="dots-${carouselId}">${dots}</div>
          <div class="absolute top-3 right-3">
            ${this.renderAvailabilityToggle('item', item.id, available)}
          </div>
        </div>`;
    }
    
    return `
      <div class="item-card bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 ${!available ? 'opacity-60' : ''}">
        ${imageArea}
        <div class="p-5">
          <div class="flex justify-between items-start mb-2">
            <h3 class="text-lg font-bold text-gray-900">${item.name}</h3>
            <span class="text-xl font-bold text-orange-500">$${price.toFixed(2)}</span>
          </div>
          <p class="text-sm text-gray-600 mb-3 line-clamp-2">${item.description || 'No description'}</p>
          <div class="flex gap-2">
            <button onclick="editItem('${item.id}')" class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg transition text-sm">Edit</button>
            <button onclick="deleteItem('${item.id}')" class="bg-red-100 hover:bg-red-200 text-red-600 font-semibold py-2 px-4 rounded-lg transition text-sm">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        </div>
      </div>`;
  }

  // ===== MODIFIER GROUP RENDERING =====

  async renderModifierGroupsForItem(categoryId, selectedItemIds = []) {
    // Show ALL modifier groups, with category-linked ones pre-checked
    const allGroups = await this.dataManager.getAllModifierGroups();
    const categoryGroups = await this.dataManager.getCategoryModifierGroups(categoryId);
    const categoryGroupIds = categoryGroups.map(g => g.id);
    const container = document.getElementById('modifierGroupsList');
    
    if (allGroups.length === 0) {
      container.innerHTML = `<div class="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200"><p class="text-sm">No modifier groups yet</p><p class="text-xs mt-1">Click "+ Create New Group" to make one</p></div>`;
      return;
    }
    
    container.innerHTML = allGroups.map(group => {
      // Pre-check if: editing item and group was on item, OR new item and group is category-linked
      const isChecked = selectedItemIds.includes(group.id) || 
        (!this.currentItem && categoryGroupIds.includes(group.id));
      const isCategoryLinked = categoryGroupIds.includes(group.id);
      const minSel = this._getMinSel(group);
      const maxSel = this._getMaxSel(group);
      const isRequired = minSel > 0;
      const isSingleChoice = (minSel === 1 && maxSel === 1);
      const options = group.options || [];
      
      // Build options preview (max 4 shown, then "+N more")
      const maxPreview = 4;
      const visibleOptions = options.slice(0, maxPreview);
      const extraCount = options.length - maxPreview;
      const optionsHTML = visibleOptions.map(opt => {
        const price = parseFloat(opt.extraPrice || opt.extraPrice || 0);
        const priceTag = price > 0 ? `<span class="text-green-600 font-medium">+$${price.toFixed(2)}</span>` : '<span class="text-gray-400">Free</span>';
        return `<div class="flex justify-between items-center text-xs py-0.5">
          <span class="text-gray-700">${opt.name}</span>
          ${priceTag}
        </div>`;
      }).join('');
      const moreHTML = extraCount > 0 ? `<p class="text-xs text-gray-400 mt-1">+${extraCount} more option${extraCount > 1 ? 's' : ''}</p>` : '';
      
      return `
        <div class="rounded-xl border ${isChecked ? 'border-orange-300 bg-orange-50/50' : 'border-gray-200 bg-white'} hover:border-orange-300 transition overflow-hidden">
          <!-- Card Header -->
          <label class="flex items-center gap-3 p-3 cursor-pointer">
            <input type="checkbox" value="${group.id}" ${isChecked ? 'checked' : ''} class="w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500 flex-shrink-0">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-bold text-gray-900 text-sm">${group.name}</span>
                ${isRequired ? '<span class="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide">Required</span>' : ''}
                ${isSingleChoice ? '<span class="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-semibold">🔘 Single</span>' : '<span class="text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full font-semibold">☑️ Multi</span>'}
                ${isCategoryLinked ? '<span class="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full font-semibold">Category</span>' : ''}
              </div>
            </div>
            <button type="button" onclick="event.preventDefault(); event.stopPropagation(); openModifierGroupModal('${group.id}')" 
                    class="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition" title="Edit group">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
            </button>
          </label>
          <!-- Card Body: Options Preview -->
          ${options.length > 0 ? `
          <div class="px-3 pb-2 pt-0">
            <div class="border-t border-gray-100 pt-2">
              ${optionsHTML}
              ${moreHTML}
            </div>
          </div>` : ''}
        </div>`;
    }).join('');
  }

  async renderCategoryModifierGroups() {
    const groups = await this.dataManager.getAllModifierGroups();
    const category = this.currentCategory ? await this.dataManager.getCategoryById(this.currentCategory) : null;
    const selectedIds = category ? this._getModifierIds(category) : [];
    const container = document.getElementById('categoryModifierGroups');
    container.innerHTML = groups.map(group => `
      <label class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-orange-300 cursor-pointer transition">
        <input type="checkbox" value="${group.id}" ${selectedIds.includes(group.id) ? 'checked' : ''} class="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500 category-modifier-group">
        <div class="flex-1">
          <span class="font-medium text-gray-900">${group.name}</span>
          <span class="text-xs text-gray-500 ml-2">(${group.options.length} options)</span>
        </div>
      </label>`).join('');
  }

  // ===== MODIFIER GROUP OPTIONS RENDERING =====

  renderModifierOptions() {
    const container = document.getElementById('modifierOptionsList');
    if (this.tempModifierOptions.length === 0) {
      container.innerHTML = `<div class="text-center py-4 text-gray-500 text-sm">No options added yet. Click "+ Add Option" to get started.</div>`;
      return;
    }
    container.innerHTML = this.tempModifierOptions.map((option, index) => this.renderModifierOptionInput(option, index)).join('');
  }

  renderModifierOptionInput(option, index) {
    return `
      <div class="flex gap-3 items-start p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div class="flex-1 space-y-2">
          <input type="text" value="${option.name}" placeholder="Option name" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm modifier-option-name" data-index="${index}">
          <div class="flex gap-3">
            <div class="flex-1 relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
              <input type="number" value="${option.extraPrice}" step="0.01" min="0" placeholder="0.00" class="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm modifier-option-price" data-index="${index}">
            </div>
            <button onclick="removeModifierOption(${index})" class="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition text-sm font-medium">Remove</button>
          </div>
        </div>
      </div>`;
  }

  // ===== LOCAL METADATA CACHE =====
  // The backend may not store icon/color/description, so we cache them locally

  _getLocalMeta(categoryId) {
    try {
      const meta = JSON.parse(localStorage.getItem('udo-category-meta') || '{}');
      return meta[categoryId] || {};
    } catch { return {}; }
  }

  _saveLocalMeta(categoryId, data) {
    try {
      const meta = JSON.parse(localStorage.getItem('udo-category-meta') || '{}');
      meta[categoryId] = {
        ...(meta[categoryId] || {}),
        ...data
      };
      localStorage.setItem('udo-category-meta', JSON.stringify(meta));
    } catch (e) {
      console.warn('Could not save category metadata:', e);
    }
  }

  _getCategoryDescription(category) {
    if (!category) return '';
    // Check backend data first, then local cache
    return category.description || category.desc || this._getLocalMeta(category.id).description || '';
  }

  _getCategoryIcon(category) {
    if (!category) return '🍽️';
    return category.icon || this._getLocalMeta(category.id).icon || '🍽️';
  }

  _getCategoryColor(category) {
    if (!category) return '#f97316';
    return category.color || this._getLocalMeta(category.id).color || '#f97316';
  }

  // ===== FORM POPULATION =====

  async populateCategoryForm(categoryId) {
    console.log('populateCategoryForm: Looking for category:', categoryId);
    const category = await this.dataManager.getCategoryById(categoryId);
    console.log('populateCategoryForm: Found category:', JSON.stringify(category));
    if (!category) {
      console.warn('populateCategoryForm: Category not found!');
      return;
    }
    // Try multiple possible field names, with local metadata fallback
    const catName = category.name || category.title || category.categoryName || '';
    const catDesc = this._getCategoryDescription(category);
    const icon = this._getCategoryIcon(category);
    const color = this._getCategoryColor(category);
    
    console.log('populateCategoryForm: name:', catName, 'desc:', catDesc, 'icon:', icon, 'color:', color);
    
    document.getElementById('categoryName').value = catName;
    document.getElementById('categoryDescription').value = catDesc;
    document.getElementById('categoryIcon').value = icon;
    document.getElementById('selectedIconPreview').textContent = icon;
    document.getElementById('categoryColor').value = color;
    document.getElementById('categoryColorText').value = color;
    
    this.currentCategory = categoryId;
    await this.renderCategoryModifierGroups();
  }

  async populateItemForm(itemId) {
    const item = await this.dataManager.getItemById(itemId);
    if (!item) return;
    document.getElementById('itemName').value = item.name;
    document.getElementById('itemCategory').value = this._getCategoryId(item);
    document.getElementById('itemPrice').value = this._getPrice(item);
    document.getElementById('itemDescription').value = item.description || '';
    const promoVal = item.promoText || item.promo_text || '';
    console.log('🔍 [promoDebug] ui-components populateItemForm: item.promoText=', JSON.stringify(item.promoText), 'item.promo_text=', JSON.stringify(item.promo_text), '→ setting to', JSON.stringify(promoVal));
    document.getElementById('itemPromoText').value = promoVal;
    document.getElementById('drawerTitle').textContent = 'Edit Item';
    
    // Load images into the multi-image gallery
    const images = this._getImages(item);
    currentItemImages = [...images];
    renderImageGallery();
    
    this.currentItem = itemId;
    this.updateProfitCalculator();
  }

  async populateModifierGroupForm(groupId) {
    const group = await this.dataManager.getModifierGroupById(groupId);
    if (!group) return;
    document.getElementById('modifierGroupName').value = group.name;
    const minSel = this._getMinSel(group);
    const maxSel = this._getMaxSel(group);
    document.getElementById('modifierMinSelection').value = minSel;
    document.getElementById('modifierMaxSelection').value = maxSel;
    document.getElementById('modifierRequired').checked = this._isRequired(group);
    document.getElementById('modifierModalTitle').textContent = 'Edit Modifier Group';
    // Set the selection type toggle based on min/max values
    const isSingleChoice = (minSel === 1 && maxSel === 1);
    if (typeof setSelectionType === 'function') {
      setSelectionType(isSingleChoice ? 'single' : 'multiple', false);
    }
    this.tempModifierOptions = JSON.parse(JSON.stringify(group.options));
    this.renderModifierOptions();
    this.currentModifierGroup = groupId;
  }

  // ===== CATEGORY SELECT POPULATION =====

  async populateCategorySelect(selectedId = null) {
    const categories = await this.dataManager.getAllCategories();
    const select = document.getElementById('itemCategory');
    select.innerHTML = categories.map(category =>
      `<option value="${category.id}" ${selectedId === category.id ? 'selected' : ''}>${category.name}</option>`
    ).join('');
  }

  // ===== PROFIT CALCULATOR =====

  updateProfitCalculator() {
    const priceInput = document.getElementById('itemPrice');
    if (!priceInput) return;
    const price = parseFloat(priceInput.value) || 0;
    const udoProfit = price * 0.85;
    const competitorProfit = price * 0.70;
    const savings = udoProfit - competitorProfit;
    document.getElementById('profitAmount').textContent = `$${udoProfit.toFixed(2)}`;
    document.getElementById('competitorProfit').textContent = `$${competitorProfit.toFixed(2)}`;
    document.getElementById('savingsAmount').textContent = `Save $${savings.toFixed(2)} per order!`;
  }

  // ===== TOAST NOTIFICATIONS =====

  showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastContent = document.getElementById('toastContent');
    const toastMessage = document.getElementById('toastMessage');
    toastMessage.textContent = message;
    toastContent.className = `px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 ${
      type === 'success' ? 'bg-green-600 text-white' :
      type === 'error' ? 'bg-red-600 text-white' :
      'bg-gray-900 text-white'
    }`;
    toast.classList.remove('hidden');
    toast.classList.add('fade-in');
    setTimeout(() => { toast.classList.add('hidden'); toast.classList.remove('fade-in'); }, 3000);
  }

  // ===== SEARCH FUNCTIONALITY =====

  async handleSearch(query) {
    const results = await this.dataManager.searchItems(query);
    if (query.length === 0) { await this.showDashboard(); return; }
    const container = document.getElementById('categoriesGrid');
    if (results.length === 0) {
      container.innerHTML = `<div class="col-span-full text-center py-12 text-gray-500"><svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><p class="text-lg font-medium">No items found</p><p class="text-sm mt-1">Try a different search term</p></div>`;
      return;
    }
    const resultsWithCategories = await Promise.all(
      results.map(async (item) => {
        const category = await this.dataManager.getCategoryById(this._getCategoryId(item));
        return { ...item, categoryName: category?.name || 'Unknown' };
      })
    );
    container.innerHTML = `
      <div class="col-span-full mb-6"><h2 class="text-2xl font-bold text-gray-900">Search Results</h2><p class="text-gray-600">${results.length} item(s) found</p></div>
    ` + resultsWithCategories.map(item => {
      const available = this._getAvailability(item);
      const price = this._getPrice(item);
      const imageUrl = this._getImage(item);
      const catId = this._getCategoryId(item);
      return `
      <div class="item-card bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 ${!available ? 'opacity-60' : ''}" onclick="showCategoryDetail('${catId}')">
        <div class="relative h-48 bg-gray-200">
          ${imageUrl ? `<img src="${imageUrl}" alt="${item.name}" class="w-full h-full object-cover">` : `<div class="w-full h-full flex items-center justify-center text-4xl text-gray-400">🍽️</div>`}
          <div class="absolute top-3 right-3">${this.renderAvailabilityToggle('item', item.id, available)}</div>
        </div>
        <div class="p-5">
          <div class="flex justify-between items-start mb-2">
            <h3 class="text-lg font-bold text-gray-900">${item.name}</h3>
            <span class="text-xl font-bold text-orange-500">$${price.toFixed(2)}</span>
          </div>
          <p class="text-sm text-gray-600 mb-3 line-clamp-2">${item.description || 'No description'}</p>
          <div class="flex gap-2"><span class="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">${item.categoryName}</span></div>
        </div>
      </div>`;
    }).join('');
  }

  // ===== COUNTS =====

  async updateCounts() {
    const items = await this.dataManager.getAllItems();
    const categories = await this.dataManager.getAllCategories();
    const itemsCount = document.getElementById('totalItemsCount');
    const categoriesCount = document.getElementById('totalCategoriesCount');
    if (itemsCount) itemsCount.textContent = `${items.length} item${items.length !== 1 ? 's' : ''}`;
    if (categoriesCount) categoriesCount.textContent = `${categories.length} categor${categories.length !== 1 ? 'ies' : 'y'}`;
  }

  // ===== FORM HELPERS =====

  async resetItemForm() {
    document.getElementById('itemForm').reset();
    document.getElementById('drawerTitle').textContent = 'Add New Item';
    // Clear multi-image gallery
    currentItemImages = [];
    renderImageGallery();
    this.currentItem = null;
    this.tempModifierOptions = [];
    await this.populateCategorySelect();
    this.updateProfitCalculator();
  }

  async resetCategoryForm() {
    document.getElementById('categoryName').value = '';
    document.getElementById('categoryDescription').value = '';
    document.getElementById('categoryIcon').value = '';
    document.getElementById('selectedIconPreview').textContent = '🍽️';
    document.getElementById('categoryColor').value = '#f97316';
    document.getElementById('categoryColorText').value = '#f97316';
    this.currentCategory = null;
    await this.renderCategoryModifierGroups();
  }

  resetModifierGroupForm() {
    document.getElementById('modifierGroupName').value = '';
    document.getElementById('modifierMinSelection').value = '1';
    document.getElementById('modifierMaxSelection').value = '1';
    document.getElementById('modifierRequired').checked = false;
    document.getElementById('modifierModalTitle').textContent = 'Create Modifier Group';
    // Reset selection type toggle to Single (default)
    if (typeof setSelectionType === 'function') {
      setSelectionType('single', false);
    }
    // Hide advanced rules
    const advRules = document.getElementById('advancedSelectionRules');
    if (advRules) advRules.classList.add('hidden');
    this.tempModifierOptions = [];
    this.renderModifierOptions();
    this.currentModifierGroup = null;
  }

  getFormData(formId) {
    const form = document.getElementById(formId);
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => { data[key] = value; });
    return data;
  }
}

// Create a global instance
const uiComponents = new UIComponents(dataManager);

// ===== GLOBAL WRAPPER FUNCTIONS =====
// These functions are needed for HTML event handlers that can't call class methods directly

function updateProfitCalculator() {
  uiComponents.updateProfitCalculator();
}

// ===== CATEGORY ICON & COLOR HELPERS =====

function pickCategoryIcon(icon) {
  document.getElementById('categoryIcon').value = icon;
  document.getElementById('selectedIconPreview').textContent = icon;
}

function setCategoryColor(color) {
  document.getElementById('categoryColor').value = color;
  document.getElementById('categoryColorText').value = color;
}

function syncCategoryColor(value) {
  // Validate hex color format
  if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
    document.getElementById('categoryColor').value = value;
  }
}

// ===== IMAGE CAROUSEL FUNCTIONS =====

/** Scroll a carousel by one slide in the given direction (-1 = left, 1 = right) */
function carouselScroll(carouselId, direction) {
  const el = document.getElementById(carouselId);
  if (!el) return;
  const slideWidth = el.offsetWidth;
  el.scrollBy({ left: slideWidth * direction, behavior: 'smooth' });
}

/** Update dot indicators based on scroll position */
function updateCarouselDots(carouselId) {
  const el = document.getElementById(carouselId);
  const dotsContainer = document.getElementById('dots-' + carouselId);
  if (!el || !dotsContainer) return;
  const slideWidth = el.offsetWidth;
  const currentIndex = Math.round(el.scrollLeft / slideWidth);
  const dots = dotsContainer.querySelectorAll('.carousel-dot');
  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === currentIndex);
  });
}
