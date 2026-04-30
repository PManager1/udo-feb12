// Event Handlers - Manages all user interactions and event listeners
// This file connects the UI components to the data manager

// ===== APPLICATION INITIALIZATION =====

async function initializeApp() {
  // Check if user is logged in
  if (typeof tokenManager === 'undefined' || !tokenManager.hasValidToken()) {
    console.warn('⚠️  No valid token found, redirecting to login');
    window.location.href = '/login/index.html';
    return;
  }
  
  // Clear any stale sign-out flag (user has logged back in)
  localStorage.removeItem('udo-signed-out');
  
  // Production: No demo data - all data from backend
  
  // Initialize API mode with health check
  await dataManager.initializeApiMode();
  
  // Show dashboard
  await uiComponents.showDashboard();
  
  // Load and display restaurant name
  loadRestaurantName();
  
  // Load and display restaurant logo
  loadRestaurantLogo();
  
  // Setup search functionality
  setupSearch();
  
  // Setup form submissions
  setupForms();
  
  // Setup sync status updates
  setupSyncStatusUpdates();
  
  console.log('AddFood application initialized successfully');
}

// ===== RESTAURANT NAME =====

async function loadRestaurantName() {
  try {
    const profile = await apiManager.getProfile();
    const restaurantName = profile.restaurantName || profile.storeName || profile.name || '';
    const displayEl = document.getElementById('restaurantNameDisplay');
    if (displayEl && restaurantName) {
      displayEl.textContent = restaurantName;
    }
  } catch (error) {
    console.log('Could not load restaurant name (non-critical):', error.message);
  }
}

// ===== RESTAURANT LOGO =====

async function loadRestaurantLogo() {
  try {
    const profile = await apiManager.getProfile();
    const logoUrl = profile.logoURL || profile.logo || profile.storeLogo || '';
    if (logoUrl) {
      showLogoPreview(logoUrl);
    }
  } catch (error) {
    console.log('Could not load restaurant logo (non-critical):', error.message);
  }
}

function showLogoPreview(url) {
  const preview = document.getElementById('logoPreview');
  const placeholder = document.getElementById('logoPlaceholder');
  if (preview && url) {
    preview.src = url;
    preview.classList.remove('hidden');
    if (placeholder) placeholder.classList.add('hidden');
  }
}

async function handleLogoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  // Show loading state
  const placeholder = document.getElementById('logoPlaceholder');
  const area = document.getElementById('logoUploadArea');
  if (placeholder) {
    placeholder.innerHTML = `
      <svg class="w-7 h-7 text-orange-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    `;
  }
  
  try {
    // Upload to GCS
    const logoUrl = await uploadImageToGCS(file);
    
    // Save to profile
    await apiManager.updateProfile({ logoURL: logoUrl });
    
    // Show the logo
    showLogoPreview(logoUrl);
    
    uiComponents.showToast('Logo updated successfully!');
  } catch (error) {
    console.error('❌ Logo upload failed:', error);
    uiComponents.showToast('Failed to upload logo. Please try again.', 'error');
    // Restore placeholder
    if (placeholder) {
      placeholder.innerHTML = `
        <svg class="w-7 h-7 text-gray-400 group-hover:text-orange-500 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      `;
    }
  }
  
  // Reset file input
  event.target.value = '';
}

// ===== SYNC STATUS UPDATES =====

function setupSyncStatusUpdates() {
  // Listen for sync status changes from data manager
  const checkInterval = setInterval(() => {
    updateSyncStatus();
  }, 5000);
  
  // Initial check
  updateSyncStatus();
}

function updateSyncStatus() {
  const statusElement = document.getElementById('syncStatus');
  const textElement = document.getElementById('syncStatusText');
  const dotElement = statusElement?.querySelector('div');
  
  if (!statusElement || !textElement || !dotElement) return;
  
  const syncStatus = dataManager.getSyncStatus();
  
  // Determine status based on isOnline flag
  let status;
  if (syncStatus.isOnline) {
    status = 'online';
  } else if (syncStatus.lastError) {
    status = 'error';
  } else {
    status = 'offline';
  }
  
  switch (status) {
    case 'online':
      statusElement.className = 'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-700';
      dotElement.className = 'w-2 h-2 rounded-full bg-green-500 animate-pulse';
      textElement.textContent = 'Online';
      break;
    case 'offline':
      statusElement.className = 'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-600';
      dotElement.className = 'w-2 h-2 rounded-full bg-gray-400';
      textElement.textContent = 'Offline';
      break;
    case 'error':
      statusElement.className = 'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-red-100 text-red-700';
      dotElement.className = 'w-2 h-2 rounded-full bg-red-500';
      textElement.textContent = 'Error';
      break;
    default:
      statusElement.className = 'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-600';
      dotElement.className = 'w-2 h-2 rounded-full bg-gray-400';
      textElement.textContent = 'Checking...';
  }
}

// ===== SEARCH FUNCTIONALITY =====

function setupSearch() {
  const searchInput = document.getElementById('searchInput');
  
  let debounceTimer;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const query = e.target.value.trim();
      uiComponents.handleSearch(query);
    }, 300);
  });
}

// ===== FORM SUBMISSIONS =====

function setupForms() {
  // Item form
  document.getElementById('itemForm').addEventListener('submit', handleItemFormSubmit);
}

async function handleItemFormSubmit(e) {
  e.preventDefault();
  
  try {
    const name = document.getElementById('itemName').value;
    const categoryId = document.getElementById('itemCategory').value;
    const price = document.getElementById('itemPrice').value;
    const description = document.getElementById('itemDescription').value;
    const promoText = document.getElementById('itemPromoText').value;
    console.log('🔍 [promoDebug] event-handlers: promoText input value =', JSON.stringify(promoText));
    
    // Get selected modifier groups
    const modifierCheckboxes = document.querySelectorAll('#modifierGroupsList input[type="checkbox"]:checked');
    const modifierGroupIds = Array.from(modifierCheckboxes).map(cb => cb.value);
    
    // Store images as JSON array string (first image is the main one)
    // Backward-compatible: single image items still work as ["url"]
    const imageUrl = currentItemImages.length > 0 
      ? JSON.stringify(currentItemImages) 
      : '';
    
    const itemData = {
      name,
      category_id: categoryId,
      base_price: price,
      description,
      promo_text: promoText,
      image_url: imageUrl,
      modifier_group_ids: modifierGroupIds
    };
    
    // When editing, preserve the current availability from backend
    if (uiComponents.currentItem) {
      const currentItem = await dataManager.getItemById(uiComponents.currentItem);
      if (currentItem) {
        itemData.available = currentItem.isAvailable !== undefined ? currentItem.isAvailable : 
                             (currentItem.available !== undefined ? currentItem.available : true);
      }
    } else {
      itemData.available = true; // New items default to available
    }
    
    let item;
    if (uiComponents.currentItem) {
      item = await dataManager.updateItem(uiComponents.currentItem, itemData);
    } else {
      item = await dataManager.createItem(itemData);
    }
    
    if (item) {
      uiComponents.showToast(uiComponents.currentItem ? 'Item updated successfully!' : 'Item created successfully!');
      closeItemDrawer();
      
      // Refresh the current view
      if (uiComponents.currentCategory) {
        await uiComponents.showCategoryDetail(uiComponents.currentCategory);
      } else {
        await uiComponents.showDashboard();
      }
    } else {
      uiComponents.showToast('Failed to save item. Please try again.', 'error');
    }
  } catch (error) {
    console.error('Error saving item:', error);
    uiComponents.showToast(`Error: ${error.message}. Please check your connection and try again.`, 'error');
  }
}

// ===== VIEW NAVIGATION =====

async function showDashboard() {
  await uiComponents.showDashboard();
}

async function showCategoryDetail(categoryId) {
  await uiComponents.showCategoryDetail(categoryId);
}

// ===== ITEM DRAWER =====

async function openItemDrawer(itemId = null) {
  await uiComponents.populateCategorySelect();
  
  if (itemId) {
    await uiComponents.populateItemForm(itemId);
    const item = await dataManager.getItemById(itemId);
    // Pass the item's existing modifier group IDs so they're pre-checked
    const itemModifierIds = uiComponents._getModifierIds(item);
    await uiComponents.renderModifierGroupsForItem(item.category_id || item.categoryId, itemModifierIds);
  } else {
    await uiComponents.resetItemForm();
    if (uiComponents.currentCategory) {
      document.getElementById('itemCategory').value = uiComponents.currentCategory;
      await uiComponents.renderModifierGroupsForItem(uiComponents.currentCategory);
    } else {
      const categories = await dataManager.getAllCategories();
      if (categories.length > 0) {
        document.getElementById('itemCategory').value = categories[0].id;
        await uiComponents.renderModifierGroupsForItem(categories[0].id);
      }
    }
  }
  
  document.getElementById('itemDrawer').classList.remove('translate-x-full');
  document.getElementById('itemDrawerOverlay').classList.remove('hidden');
}

function closeItemDrawer() {
  document.getElementById('itemDrawer').classList.add('translate-x-full');
  document.getElementById('itemDrawerOverlay').classList.add('hidden');
  
  // Wait for animation to complete before resetting
  setTimeout(() => {
    uiComponents.resetItemForm();
  }, 300);
}

function editItem(itemId) {
  openItemDrawer(itemId);
}

async function deleteItem(itemId) {
  if (confirm('Are you sure you want to delete this item?')) {
    if (await dataManager.deleteItem(itemId)) {
      uiComponents.showToast('Item deleted successfully!');
      
      if (uiComponents.currentCategory) {
        await uiComponents.showCategoryDetail(uiComponents.currentCategory);
      } else {
        await uiComponents.showDashboard();
      }
    } else {
      uiComponents.showToast('Failed to delete item. Please try again.', 'error');
    }
  }
}

// ===== CATEGORY MODAL =====

async function openCategoryModal(categoryId = null) {
  // Cancel any pending reset from a previous modal close
  if (_categoryModalResetTimeout) {
    clearTimeout(_categoryModalResetTimeout);
    _categoryModalResetTimeout = null;
  }
  
  // Show modal FIRST for immediate feedback
  document.getElementById('categoryModal').classList.remove('hidden');
  document.getElementById('categoryModalOverlay').classList.remove('hidden');
  
  // Show FoodCategory browser only when creating a new category
  const browserEl = document.getElementById('foodCategoryBrowser');
  if (!categoryId) {
    browserEl.classList.remove('hidden');
    loadFoodCategoriesBrowser();
  } else {
    browserEl.classList.add('hidden');
  }
  
  if (categoryId) {
    try {
      await uiComponents.populateCategoryForm(categoryId);
      // Verify the name was set (debug for race condition)
      const nameEl = document.getElementById('categoryName');
      console.log('After populate - categoryName value:', nameEl?.value);
      if (!nameEl?.value) {
        console.warn('Category name was cleared! Re-applying...');
        const cat = await dataManager.getCategoryById(categoryId);
        if (cat) {
          nameEl.value = cat.name || cat.title || '';
          console.log('Re-applied name:', nameEl.value);
        }
      }
      // Delayed check: verify 200ms later if name survived
      setTimeout(() => {
        const val = document.getElementById('categoryName')?.value;
        console.log('Delayed check (200ms) - categoryName value:', val);
        if (!val) {
          console.warn('Name was cleared AFTER populate! Stack trace for debugging:');
          console.trace();
        }
      }, 200);
    } catch (error) {
      console.error('Error populating category form:', error);
      uiComponents.showToast('Failed to load category data', 'error');
    }
  } else {
    await uiComponents.resetCategoryForm();
  }
}

// Track the reset timeout so we can cancel it if modal reopens
let _categoryModalResetTimeout = null;

function closeCategoryModal() {
  document.getElementById('categoryModal').classList.add('hidden');
  document.getElementById('categoryModalOverlay').classList.add('hidden');
  
  // Clear any existing timeout
  if (_categoryModalResetTimeout) clearTimeout(_categoryModalResetTimeout);
  
  _categoryModalResetTimeout = setTimeout(() => {
    uiComponents.resetCategoryForm();
    _categoryModalResetTimeout = null;
  }, 300);
}

async function saveCategory() {
  const name = document.getElementById('categoryName').value;
  const description = document.getElementById('categoryDescription').value;
  const icon = document.getElementById('categoryIcon').value || '🍽️';
  const color = document.getElementById('categoryColor').value || '#f97316';
  
  // Get selected modifier groups
  const checkboxes = document.querySelectorAll('.category-modifier-group:checked');
  const modifierGroupIds = Array.from(checkboxes).map(cb => cb.value);
  
  const categoryData = {
    name,
    description,
    icon,
    color,
    modifier_group_ids: modifierGroupIds
  };
  
  // Save icon/color/description locally as backup (backend may not store these)
  if (uiComponents.currentCategory) {
    uiComponents._saveLocalMeta(uiComponents.currentCategory, { icon, color, description });
  }
  
  let category;
  if (uiComponents.currentCategory) {
    category = await dataManager.updateCategory(uiComponents.currentCategory, categoryData);
  } else {
    category = await dataManager.createCategory(categoryData);
    // Save metadata for newly created category too
    if (category && category.id) {
      uiComponents._saveLocalMeta(category.id, { icon, color, description });
    }
  }
  
  if (category) {
    uiComponents.showToast(uiComponents.currentCategory ? 'Category updated successfully!' : 'Category created successfully!');
    closeCategoryModal();
    await uiComponents.showDashboard();
  } else {
    uiComponents.showToast('Failed to save category. Please try again.', 'error');
  }
}

// ===== FOOD CATEGORY BROWSER =====

async function loadFoodCategoriesBrowser() {
  const container = document.getElementById('foodCategoryList');
  if (!container) return;
  
  try {
    const categories = await dataManager.getFoodCategories();
    
    if (!categories || categories.length === 0) {
      container.innerHTML = `
        <div class="col-span-3 text-center py-4 text-gray-400 text-sm">
          No shared categories yet. Create a custom one below!
        </div>`;
      return;
    }
    
    container.innerHTML = categories.map(cat => `
      <button type="button" onclick="selectFoodCategory('${cat.name}', '${cat.icon || '🍽️'}')"
              class="flex flex-col items-center gap-1 p-2 rounded-lg border border-gray-200 hover:border-orange-400 hover:bg-orange-50 transition cursor-pointer text-center">
        <span class="text-xl">${cat.icon || '🍽️'}</span>
        <span class="text-xs font-medium text-gray-700 leading-tight">${cat.name}</span>
      </button>
    `).join('');
  } catch (error) {
    console.error('Failed to load food categories:', error);
    container.innerHTML = `
      <div class="col-span-3 text-center py-4 text-gray-400 text-sm">
        Could not load categories. You can still type a custom name below.
      </div>`;
  }
}

function selectFoodCategory(name, icon) {
  document.getElementById('categoryName').value = name;
  if (icon && icon !== 'undefined') {
    document.getElementById('categoryIcon').value = icon;
    document.getElementById('selectedIconPreview').textContent = icon;
  }
}

// ===== SELECTION TYPE TOGGLE =====

/**
 * Set the selection type for modifier group (single or multiple choice)
 * @param {string} type - 'single' or 'multiple'
 * @param {boolean} updateFields - Whether to update the min/max input fields (default: true)
 */
function setSelectionType(type, updateFields = true) {
  const singleBtn = document.getElementById('selectionTypeSingle');
  const multipleBtn = document.getElementById('selectionTypeMultiple');
  const hint = document.getElementById('selectionTypeHint');
  const minInput = document.getElementById('modifierMinSelection');
  const maxInput = document.getElementById('modifierMaxSelection');
  const requiredInput = document.getElementById('modifierRequired');

  if (type === 'single') {
    singleBtn.className = 'flex-1 py-2.5 px-4 rounded-lg border-2 font-semibold text-sm transition text-center border-orange-500 bg-orange-50 text-orange-700';
    multipleBtn.className = 'flex-1 py-2.5 px-4 rounded-lg border-2 font-semibold text-sm transition text-center border-gray-200 bg-white text-gray-600 hover:border-orange-300';
    hint.innerHTML = 'Customer picks <strong>one</strong> option. Shows as radio buttons.';
    if (updateFields) {
      minInput.value = 1;
      maxInput.value = 1;
      requiredInput.checked = true;
    }
  } else {
    multipleBtn.className = 'flex-1 py-2.5 px-4 rounded-lg border-2 font-semibold text-sm transition text-center border-orange-500 bg-orange-50 text-orange-700';
    singleBtn.className = 'flex-1 py-2.5 px-4 rounded-lg border-2 font-semibold text-sm transition text-center border-gray-200 bg-white text-gray-600 hover:border-orange-300';
    hint.innerHTML = 'Customer can pick <strong>multiple</strong> options. Shows as checkboxes.';
    if (updateFields) {
      minInput.value = 0;
      maxInput.value = 5;
      requiredInput.checked = false;
    }
  }
}

/**
 * Update the selection type toggle visual state when user manually changes min/max in advanced mode
 */
function updateSelectionTypeFromAdvanced() {
  const minVal = parseInt(document.getElementById('modifierMinSelection').value) || 0;
  const maxVal = parseInt(document.getElementById('modifierMaxSelection').value) || 1;
  const isSingleChoice = (minVal === 1 && maxVal === 1);
  setSelectionType(isSingleChoice ? 'single' : 'multiple', false);
}

// ===== MODIFIER GROUP MODAL =====

async function openModifierGroupModal(groupId = null) {
  if (groupId) {
    await uiComponents.populateModifierGroupForm(groupId);
  } else {
    uiComponents.resetModifierGroupForm();
  }
  
  document.getElementById('modifierModal').classList.remove('hidden');
  document.getElementById('modifierModalOverlay').classList.remove('hidden');
}

function closeModifierGroupModal() {
  document.getElementById('modifierModal').classList.add('hidden');
  document.getElementById('modifierModalOverlay').classList.add('hidden');
  
  setTimeout(() => {
    uiComponents.resetModifierGroupForm();
  }, 300);
}

function addModifierOption() {
  uiComponents.tempModifierOptions.push({
    name: '',
    extraPrice: 0.00
  });
  uiComponents.renderModifierOptions();
}

function removeModifierOption(index) {
  uiComponents.tempModifierOptions.splice(index, 1);
  uiComponents.renderModifierOptions();
}

function updateModifierOptionValue(index, field, value) {
  uiComponents.tempModifierOptions[index][field] = value;
}

async function saveModifierGroup() {
  const name = document.getElementById('modifierGroupName').value;
  const minSelection = document.getElementById('modifierMinSelection').value;
  const maxSelection = document.getElementById('modifierMaxSelection').value;
  const required = document.getElementById('modifierRequired').checked;
  
  // Collect option values from DOM
  const nameInputs = document.querySelectorAll('.modifier-option-name');
  const priceInputs = document.querySelectorAll('.modifier-option-price');
  
  const options = Array.from(nameInputs).map((input, index) => ({
    id: 'opt_' + crypto.randomUUID().replace(/-/g, '').substring(0, 12),
    name: input.value,
    extraPrice: parseFloat(priceInputs[index].value) || 0,
    isAvailable: true,
    isDefault: false
  })).filter(opt => opt.name.trim() !== '');
  
  const groupData = {
    name,
    description: '',
    minSelection: parseInt(minSelection) || 0,
    maxSelection: parseInt(maxSelection) || 1,
    isRequired: required,
    options
  };
  
  let group;
  if (uiComponents.currentModifierGroup) {
    group = await dataManager.updateModifierGroup(uiComponents.currentModifierGroup, groupData);
  } else {
    group = await dataManager.createModifierGroup(groupData);
  }
  
  if (group) {
    uiComponents.showToast(uiComponents.currentModifierGroup ? 'Modifier group updated successfully!' : 'Modifier group created successfully!');
    closeModifierGroupModal();
    
    // Refresh the modifier groups list in the item drawer if it's open
    const itemDrawer = document.getElementById('itemDrawer');
    if (!itemDrawer.classList.contains('translate-x-full')) {
      // Drawer is open — save current checkbox states, re-render, then restore
      const currentChecked = Array.from(document.querySelectorAll('#modifierGroupsList input[type="checkbox"]:checked')).map(cb => cb.value);
      const categoryId = document.getElementById('itemCategory').value;
      if (categoryId) {
        // Include the newly created group ID so it's checked
        if (!uiComponents.currentModifierGroup && group.id) {
          currentChecked.push(group.id);
        }
        await uiComponents.renderModifierGroupsForItem(categoryId, currentChecked);
      }
    }
    
    // Refresh current view
    if (uiComponents.currentCategory) {
      await uiComponents.showCategoryDetail(uiComponents.currentCategory);
    }
  } else {
    uiComponents.showToast('Failed to save modifier group. Please try again.', 'error');
  }
}

// ===== AVAILABILITY TOGGLES (86ing) =====

async function toggleAvailability(type, id) {
  let result;
  
  if (type === 'category') {
    const category = await dataManager.getCategoryById(id);
    if (category) {
      const currentStatus = category.available !== undefined ? category.available : (category.isActive || false);
      const newStatus = !currentStatus;
      result = await dataManager.updateCategory(id, { available: newStatus });
      uiComponents.showToast(`${category.name} is now ${newStatus ? 'available' : 'unavailable'}`);
    }
  } else if (type === 'item') {
    const item = await dataManager.getItemById(id);
    if (item) {
      result = await dataManager.toggleItemAvailability(id);
      const isNowAvailable = result ? (result.available !== false) : true;
      uiComponents.showToast(`${item.name} is now ${isNowAvailable ? 'available' : 'unavailable'}`);
    }
  }
  
  // Refresh the current view
  if (uiComponents.currentCategory) {
    await uiComponents.showCategoryDetail(uiComponents.currentCategory);
  } else {
    await uiComponents.showDashboard();
  }
}

// ===== IMAGE HANDLING (Multiple Images) =====

// Track all current image URLs for the item being edited
let currentItemImages = [];

/**
 * Upload image to Google Cloud Storage via backend proxy
 */
async function uploadImageToGCS(file) {
  const formData = new FormData();
  formData.append('image', file);
  const token = tokenManager.getToken();
  const uploadURL = `${API_BASE}rest/upload-image`;
  console.log('Uploading image via backend proxy...');
  const response = await fetch(uploadURL, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Image upload failed (${response.status}): ${errorBody}`);
  }
  const data = await response.json();
  console.log('✅ Image uploaded successfully:', data.url);
  return data.url;
}

/** Render the image gallery from currentItemImages array — with reorder + make-main controls */
function renderImageGallery() {
  const container = document.getElementById('imageGalleryContainer');
  const gallery = document.getElementById('imageGallery');
  const countLabel = document.getElementById('imageCountLabel');
  
  if (currentItemImages.length === 0) {
    container.classList.add('hidden');
    gallery.innerHTML = '';
    return;
  }
  
  container.classList.remove('hidden');
  countLabel.textContent = `${currentItemImages.length} image${currentItemImages.length !== 1 ? 's' : ''} · first = main`;
  
  gallery.innerHTML = currentItemImages.map((url, index) => {
    const isMain = index === 0;
    const isLast = index === currentItemImages.length - 1;
    
    // Build control buttons row
    let controls = '';
    
    // ⭐ Make Main button — only for non-main images
    if (!isMain) {
      controls += `<button type="button" onclick="setAsMainImage(${index})" title="Make main image" class="flex items-center justify-center w-6 h-6 bg-white rounded-full shadow hover:bg-orange-50 transition"><svg class="w-3.5 h-3.5 text-orange-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></button>`;
    }
    // ◀ Move left — not for first image
    if (!isMain) {
      controls += `<button type="button" onclick="moveImageLeft(${index})" title="Move left" class="flex items-center justify-center w-6 h-6 bg-white rounded-full shadow hover:bg-gray-100 transition"><svg class="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/></svg></button>`;
    }
    // ▶ Move right — not for last image
    if (!isLast) {
      controls += `<button type="button" onclick="moveImageRight(${index})" title="Move right" class="flex items-center justify-center w-6 h-6 bg-white rounded-full shadow hover:bg-gray-100 transition"><svg class="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/></svg></button>`;
    }
    // ✕ Remove
    controls += `<button type="button" onclick="removeImage(${index})" title="Remove image" class="flex items-center justify-center w-6 h-6 bg-white rounded-full shadow hover:bg-red-100 transition"><svg class="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg></button>`;
    
    return `
      <div class="relative group fade-in">
        <img src="${url}" alt="Image ${index + 1}" class="w-full h-24 object-cover rounded-lg border ${isMain ? 'border-orange-400 ring-2 ring-orange-200' : 'border-gray-200'}">
        ${isMain ? '<span class="absolute bottom-1 left-1 bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold shadow">MAIN</span>' : ''}
        <div class="absolute top-1 right-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          ${controls}
        </div>
      </div>`;
  }).join('');
  
  container.classList.add('fade-in');
  setTimeout(() => container.classList.remove('fade-in'), 300);
}

/** Move image one position to the left (towards main) */
function moveImageLeft(index) {
  if (index <= 0) return;
  [currentItemImages[index - 1], currentItemImages[index]] = [currentItemImages[index], currentItemImages[index - 1]];
  renderImageGallery();
}

/** Move image one position to the right (away from main) */
function moveImageRight(index) {
  if (index >= currentItemImages.length - 1) return;
  [currentItemImages[index], currentItemImages[index + 1]] = [currentItemImages[index + 1], currentItemImages[index]];
  renderImageGallery();
}

/** Promote an image to be the main image (index 0) — instantly moves it to first position */
function setAsMainImage(index) {
  if (index <= 0) return;
  const image = currentItemImages.splice(index, 1)[0];
  currentItemImages.unshift(image);
  renderImageGallery();
}

/** Add an image URL to the gallery */
function addImageToGallery(url) {
  if (url && !currentItemImages.includes(url)) {
    currentItemImages.push(url);
    renderImageGallery();
  }
}

/** Remove a specific image by index */
function removeImage(index) {
  currentItemImages.splice(index, 1);
  renderImageGallery();
}

/** Remove all images */
function clearAllImages() {
  currentItemImages = [];
  renderImageGallery();
  // Clear file inputs
  const fileInput = document.querySelector('input[type="file"]');
  const urlInput = document.getElementById('imageUrlInput');
  if (fileInput) fileInput.value = '';
  if (urlInput) urlInput.value = '';
}

/** Handle multiple file uploads */
function handleFileUpload(event) {
  const files = Array.from(event.target.files);
  if (files.length === 0) return;
  
  // Show loading state in gallery
  const container = document.getElementById('imageGalleryContainer');
  const gallery = document.getElementById('imageGallery');
  container.classList.remove('hidden');
  
  // Add loading placeholders
  const loadingCount = files.length;
  const existingHTML = gallery.innerHTML;
  const loadingHTML = Array.from({length: loadingCount}, () => `
    <div class="w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center">
      <svg class="animate-spin h-6 w-6 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
  `).join('');
  gallery.innerHTML = existingHTML + loadingHTML;
  
  let uploaded = 0;
  let failed = 0;
  
  files.forEach((file) => {
    uploadImageToGCS(file)
      .then((publicURL) => {
        currentItemImages.push(publicURL);
        uploaded++;
        if (uploaded + failed === files.length) {
          renderImageGallery();
          if (uploaded > 0) {
            uiComponents.showToast(`${uploaded} image${uploaded > 1 ? 's' : ''} uploaded successfully!`);
          }
          if (failed > 0) {
            uiComponents.showToast(`${failed} image${failed > 1 ? 's' : ''} failed to upload.`, 'error');
          }
        }
      })
      .catch((error) => {
        console.error('❌ Image upload failed:', error);
        failed++;
        if (uploaded + failed === files.length) {
          renderImageGallery();
          if (uploaded > 0) {
            uiComponents.showToast(`${uploaded} image${uploaded > 1 ? 's' : ''} uploaded successfully!`);
          }
          if (failed > 0) {
            uiComponents.showToast(`${failed} image${failed > 1 ? 's' : ''} failed to upload.`, 'error');
          }
        }
      });
  });
  
  // Reset file input so same files can be selected again
  event.target.value = '';
}

function handleImageUrl(event) {
  const url = event.target.value;
  if (url) {
    addImageToGallery(url);
    event.target.value = '';
  }
}

function usePlaceholderImage() {
  const placeholderImages = [
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
    'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=800',
    'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=800'
  ];
  const randomImage = placeholderImages[Math.floor(Math.random() * placeholderImages.length)];
  addImageToGallery(randomImage);
}

// Keep backward-compat aliases
function showImagePreview(url) { addImageToGallery(url); }
function clearImage() { clearAllImages(); }

// ===== MODIFIER OPTION INPUT HANDLERS =====

// Add event listeners for modifier option inputs dynamically
document.addEventListener('input', (e) => {
  if (e.target.classList.contains('modifier-option-name')) {
    const index = parseInt(e.target.dataset.index);
    updateModifierOptionValue(index, 'name', e.target.value);
  } else if (e.target.classList.contains('modifier-option-price')) {
    const index = parseInt(e.target.dataset.index);
    updateModifierOptionValue(index, 'extraPrice', parseFloat(e.target.value) || 0);
  }
});

// ===== KEYBOARD SHORTCUTS =====

document.addEventListener('keydown', (e) => {
  // Escape key closes modals and drawers
  if (e.key === 'Escape') {
    closeItemDrawer();
    closeCategoryModal();
    closeModifierGroupModal();
    closeMenuUploadModal();
  }
});

// ===== MENU UPLOAD =====

function handleMenuUpload(input) {
  const file = input.files[0];
  if (!file) return;
  
  const fileName = file.name;
  const fileSize = (file.size / 1024).toFixed(1);
  
  console.log('Menu uploaded:', fileName, `(${fileSize} KB)`);
  
  // Build FormData and POST to backend
  const formData = new FormData();
  formData.append('menuFile', file);
  
  // Get auth headers (but NOT Content-Type — browser sets it with boundary for multipart)
  const headers = {};
  if (typeof tokenManager !== 'undefined') {
    const token = tokenManager.getToken();
    if (token) {
      headers['Authorization'] = 'Bearer ' + token;
    }
  }
  
  // POST the file to the backend — backend will email it to getabirdy@gmail.com
  fetch(API_BASE + 'rest/upload-menu', {
    method: 'POST',
    headers: headers,
    body: formData
  })
  .then(res => {
    if (!res.ok) throw new Error('Upload failed: ' + res.status);
    return res.json();
  })
  .then(data => {
    console.log('✅ Menu file sent successfully:', data);
    showMenuUploadConfirmation(fileName);
  })
  .catch(err => {
    console.error('❌ Menu upload failed:', err);
    uiComponents.showToast('Failed to upload menu. Please try again.', 'error');
  });
  
  // Reset the file input so the same file can be selected again
  input.value = '';
}

function showMenuUploadConfirmation(fileName) {
  // Create modal overlay
  const overlay = document.createElement('div');
  overlay.id = 'menuUploadOverlay';
  overlay.className = 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4';
  overlay.onclick = function(e) { if (e.target === overlay) closeMenuUploadModal(); };
  
  // Create modal content
  overlay.innerHTML = `
    <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center transform transition-all">
      <div class="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
        <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 class="text-2xl font-bold text-gray-900 mb-3">Menu Received!</h3>
      <p class="text-gray-500 text-sm mb-4">
        <span class="inline-flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          ${fileName}
        </span>
      </p>
      <p class="text-gray-600 mb-6 leading-relaxed">
        Awesome — we've got your menu! Our team will review it and get all your items, categories, and prices set up for you. 
        You'll receive an email notification once everything is ready to go. This typically takes just a few hours.
      </p>
      <p class="text-sm text-orange-600 font-medium mb-6">
        In the meantime, you can also add items manually using the "Add New Item" button.
      </p>
      <button onclick="closeMenuUploadModal()" 
              class="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg">
        Got it, thanks!
      </button>
    </div>
  `;
  
  document.body.appendChild(overlay);
  
  // Prevent background scrolling
  document.body.style.overflow = 'hidden';
}

function closeMenuUploadModal() {
  const overlay = document.getElementById('menuUploadOverlay');
  if (overlay) {
    overlay.remove();
    document.body.style.overflow = '';
  }
}

// ===== SIGN OUT =====

/**
 * Handle sign out - clear token, notify other tabs, redirect
 */
function handleSignOut() {
  console.log('Signing out...');
  
  // Clear the auth token first
  if (typeof tokenManager !== 'undefined') {
    tokenManager.clearToken();
  }
  
  // Notify other tabs via BroadcastChannel
  try {
    const channel = new BroadcastChannel('udo-auth-channel');
    channel.postMessage({ type: 'SIGN_OUT' });
    channel.close();
  } catch (e) {
    console.log('BroadcastChannel not supported');
  }
  
  // Set a persistent flag in localStorage so other tabs detect it on focus
  localStorage.setItem('udo-signed-out', 'true');
  
  // Redirect to login page
  window.location.href = '../login/';
}

// ===== CROSS-TAB AUTH LISTENER =====

(function setupCrossTabSignOut() {
  // Method 1: BroadcastChannel (modern browsers)
  try {
    const authChannel = new BroadcastChannel('udo-auth-channel');
    authChannel.onmessage = function(event) {
      if (event.data && event.data.type === 'SIGN_OUT') {
        console.log('Received sign-out from another tab');
        if (typeof tokenManager !== 'undefined') {
          tokenManager.clearToken();
        }
        window.location.href = '../login/';
      }
    };
  } catch (e) {
    console.log('BroadcastChannel not supported, using storage event fallback');
  }

  // Method 2: localStorage storage event (fires in OTHER tabs)
  window.addEventListener('storage', function(event) {
    if (event.key === 'udo-signed-out' && event.newValue === 'true') {
      console.log('Received sign-out via storage event');
      if (typeof tokenManager !== 'undefined') {
        tokenManager.clearToken();
      }
      window.location.href = '../login/';
    }
  });

  // Method 3: visibilitychange - check token when user focuses this tab
  // This catches the case where the other tab signed out before this tab loaded the listeners
  document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
      // Tab just became visible - check if user is still authenticated
      const signedOut = localStorage.getItem('udo-signed-out');
      if (signedOut === 'true') {
        console.log('Tab focused - user was signed out in another tab');
        if (typeof tokenManager !== 'undefined') {
          tokenManager.clearToken();
        }
        window.location.href = '../login/';
      }
    }
  });
})();
