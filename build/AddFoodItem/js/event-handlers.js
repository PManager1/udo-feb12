// Event Handlers - All event listeners and user interactions

// ==================== DASHBOARD EVENTS ====================

/**
 * Handle dashboard search
 */
function handleDashboardSearch(query) {
  const categories = DataManager.searchCategories(query);
  const dashboardContainer = document.getElementById('dashboardContainer');
  
  if (!dashboardContainer) return;
  
  let html = `
    <div class="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Restaurant Menu</h1>
        <p class="text-gray-600 mt-1">Manage your menu items and modifiers</p>
      </div>
      <button onclick="openItemDrawer()" class="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center shadow-sm hover:shadow-md">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
        </svg>
        Add New Item
      </button>
    </div>
    
    <div class="mb-6">
      <div class="relative">
        <input
          type="text"
          id="dashboardSearch"
          placeholder="Search categories and items..."
          class="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition"
          oninput="handleDashboardSearch(this.value)"
          value="${escapeHtml(query)}"
        />
        <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
      </div>
    </div>
    
    <div id="categoriesGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  `;
  
  categories.forEach(category => {
    html += renderCategoryCard(category);
  });
  
  html += `
    </div>
    
    <button onclick="openCategoryDrawer()" class="w-full mt-4 p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all group">
      <div class="flex flex-col items-center justify-center text-gray-400 group-hover:text-orange-500">
        <svg class="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
        </svg>
        <span class="font-semibold">Add New Category</span>
      </div>
    </button>
  `;
  
  dashboardContainer.innerHTML = html;
}

/**
 * Open category view
 */
function openCategoryView(categoryId) {
  renderCategoryView(categoryId);
}

// ==================== ITEM DRAWER EVENTS ====================

/**
 * Open item drawer (add or edit)
 */
function openItemDrawer(itemId = null, categoryId = null) {
  renderItemDrawer(itemId, categoryId);
}

/**
 * Close item drawer
 */
function closeItemDrawer() {
  const drawer = document.getElementById('itemDrawer');
  const overlay = document.getElementById('drawerOverlay');
  
  drawer.classList.add('translate-x-full');
  overlay.classList.add('hidden');
}

/**
 * Save item (create or update)
 */
function saveItem(event, itemId) {
  event.preventDefault();
  
  const name = document.getElementById('itemName').value.trim();
  const category_id = document.getElementById('itemCategory').value;
  const base_price = document.getElementById('itemPrice').value;
  const description = document.getElementById('itemDescription').value.trim();
  const image_url = document.getElementById('imageUrl').value;
  
  // Validation
  if (!name || !category_id || !base_price) {
    alert('Please fill in all required fields');
    return;
  }
  
  if (!isValidPrice(base_price)) {
    alert('Please enter a valid price');
    return;
  }
  
  const itemData = {
    name,
    category_id,
    base_price: parseFloat(base_price),
    description,
    image_url
  };
  
  let savedItem;
  if (itemId === 'new') {
    savedItem = DataManager.createItem(itemData);
    console.log('Item created:', savedItem);
  } else {
    savedItem = DataManager.updateItem(itemId, itemData);
    console.log('Item updated:', savedItem);
  }
  
  closeItemDrawer();
  
  // Refresh view
  if (savedItem) {
    renderCategoryView(savedItem.category_id);
  } else {
    renderDashboard();
  }
}

/**
 * Add modifier to item
 */
function addModifierToItem(itemId, groupId) {
  if (!groupId) return;
  
  if (itemId === 'new') {
    // For new items, we'll need to handle this differently
    // For now, just show a message
    alert('Please save the item first, then you can add modifiers');
    return;
  }
  
  DataManager.addLocalModifierToItem(itemId, groupId);
  renderItemDrawer(itemId); // Re-render drawer
}

/**
 * Remove modifier from item
 */
function removeModifierFromItem(itemId, groupId) {
  if (itemId === 'new') {
    alert('Please save the item first');
    return;
  }
  
  if (confirm('Remove this modifier group from this item?')) {
    DataManager.removeLocalModifierFromItem(itemId, groupId);
    renderItemDrawer(itemId); // Re-render drawer
  }
}

// ==================== MODIFIER GROUP MODAL EVENTS ====================

/**
 * Open modifier group modal
 */
function openModifierGroupModal(groupId = null) {
  renderModifierGroupModal(groupId);
}

/**
 * Close modifier group modal
 */
function closeModifierGroupModal() {
  const modal = document.getElementById('modifierModal');
  const overlay = document.getElementById('modalOverlay');
  
  modal.classList.add('hidden');
  overlay.classList.add('hidden');
}

/**
 * Save modifier group (create or update)
 */
function saveModifierGroup(event, groupId) {
  event.preventDefault();
  
  const name = document.getElementById('groupName').value.trim();
  const description = document.getElementById('groupDescription').value.trim();
  const min_selection = document.getElementById('minSelection').value;
  const max_selection = document.getElementById('maxSelection').value;
  const is_required = document.getElementById('isRequired').checked;
  
  // Collect options
  const optionRows = document.querySelectorAll('#modifierOptions > div');
  const options = [];
  
  optionRows.forEach(row => {
    const inputs = row.querySelectorAll('input');
    const nameInput = inputs[1]; // Skip checkbox
    const priceInput = inputs[2];
    
    if (nameInput.value.trim()) {
      options.push({
        id: generateId('opt_'),
        name: nameInput.value.trim(),
        extraPrice: parseFloat(priceInput.value) || 0,
        is_available: inputs[0].checked,
        is_default: false
      });
    }
  });
  
  if (!name) {
    alert('Please enter a group name');
    return;
  }
  
  if (options.length === 0) {
    alert('Please add at least one option');
    return;
  }
  
  const groupData = {
    name,
    description,
    min_selection: parseInt(min_selection) || 0,
    max_selection: parseInt(max_selection) || 1,
    is_required,
    options
  };
  
  let savedGroup;
  if (groupId === 'new') {
    savedGroup = DataManager.createModifierGroup(groupData);
    console.log('Modifier group created:', savedGroup);
  } else {
    savedGroup = DataManager.updateModifierGroup(groupId, groupData);
    console.log('Modifier group updated:', savedGroup);
  }
  
  closeModifierGroupModal();
  
  // Refresh item drawer if open
  const itemDrawer = document.getElementById('itemDrawer');
  if (!itemDrawer.classList.contains('translate-x-full')) {
    // Find current item ID from the save button's onclick
    const saveBtn = document.querySelector('#itemForm button[type="submit"]');
    const currentItemId = saveBtn ? saveBtn.getAttribute('onclick').match(/'([^']+)'/)[1] : null;
    if (currentItemId && currentItemId !== 'new') {
      renderItemDrawer(currentItemId);
    }
  }
}

// ==================== CATEGORY DRAWER EVENTS ====================

/**
 * Open category drawer
 */
function openCategoryDrawer(categoryId = null) {
  renderCategoryDrawer(categoryId);
}

/**
 * Close category drawer
 */
function closeCategoryDrawer() {
  const drawer = document.getElementById('categoryDrawer');
  const overlay = document.getElementById('drawerOverlay');
  
  drawer.classList.add('translate-x-full');
  overlay.classList.add('hidden');
}

/**
 * Save category (create or update)
 */
function saveCategory(event, categoryId) {
  event.preventDefault();
  
  const name = document.getElementById('categoryName').value.trim();
  const description = document.getElementById('categoryDescription').value.trim();
  const image = document.getElementById('categoryImage').value.trim();
  
  if (!name) {
    alert('Please enter a category name');
    return;
  }
  
  const categoryData = {
    name,
    description,
    image
  };
  
  let savedCategory;
  if (categoryId === 'new') {
    savedCategory = DataManager.createCategory(categoryData);
    console.log('Category created:', savedCategory);
  } else {
    savedCategory = DataManager.updateCategory(categoryId, categoryData);
    console.log('Category updated:', savedCategory);
  }
  
  closeCategoryDrawer();
  renderDashboard();
}

/**
 * Assign modifier to category
 */
function assignModifierToCategory(categoryId, groupId) {
  if (!groupId) return;
  
  if (categoryId === 'new') {
    alert('Please save the category first');
    return;
  }
  
  DataManager.assignModifierToCategory(categoryId, groupId);
  renderCategoryDrawer(categoryId); // Re-render drawer
}

/**
 * Remove modifier from category
 */
function removeModifierFromCategory(categoryId, groupId) {
  if (categoryId === 'new') {
    alert('Please save the category first');
    return;
  }
  
  if (confirm('Remove this modifier group from this category?')) {
    DataManager.removeModifierFromCategory(categoryId, groupId);
    renderCategoryDrawer(categoryId); // Re-render drawer
  }
}

// ==================== DRAWER OVERLAY ====================

/**
 * Handle drawer overlay click (close drawers)
 */
function handleDrawerOverlayClick() {
  closeItemDrawer();
  closeCategoryDrawer();
}

// ==================== MODAL OVERLAY ====================

/**
 * Handle modal overlay click (close modals)
 */
function handleModalOverlayClick() {
  closeModifierGroupModal();
}

// ==================== KEYBOARD EVENTS ====================

/**
 * Handle escape key (close drawers/modals)
 */
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeItemDrawer();
    closeCategoryDrawer();
    closeModifierGroupModal();
  }
});

// ==================== SIGN OUT ====================

/**
 * Handle sign out - clear token, notify other tabs, redirect
 */
function handleSignOut() {
  console.log('👋 Signing out...');
  
  // Clear the auth token
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
  
  // Also use localStorage event as fallback (works across tabs)
  localStorage.setItem('udo-signout-event', Date.now().toString());
  localStorage.removeItem('udo-signout-event');
  
  // Redirect to login page
  window.location.href = '../login/';
}

// ==================== CROSS-TAB AUTH LISTENER ====================

// Listen for sign-out events from other tabs
(function setupCrossTabSignOut() {
  // Method 1: BroadcastChannel (modern browsers)
  try {
    const authChannel = new BroadcastChannel('udo-auth-channel');
    authChannel.onmessage = function(event) {
      if (event.data && event.data.type === 'SIGN_OUT') {
        console.log('👋 Received sign-out from another tab');
        if (typeof tokenManager !== 'undefined') {
          tokenManager.clearToken();
        }
        window.location.href = '../login/';
      }
    };
  } catch (e) {
    console.log('BroadcastChannel not supported, using storage event fallback');
  }

  // Method 2: localStorage storage event (works in all browsers)
  window.addEventListener('storage', function(event) {
    if (event.key === 'udo-signout-event' && event.newValue) {
      console.log('👋 Received sign-out via storage event');
      if (typeof tokenManager !== 'undefined') {
        tokenManager.clearToken();
      }
      window.location.href = '../login/';
    }
  });
})();

// ==================== INITIALIZATION ====================

/**
 * Initialize event listeners when DOM is ready
 */
document.addEventListener('DOMContentLoaded', function() {
  // Setup drawer overlay
  const drawerOverlay = document.getElementById('drawerOverlay');
  if (drawerOverlay) {
    drawerOverlay.addEventListener('click', handleDrawerOverlayClick);
  }
  
  // Setup modal overlay
  const modalOverlay = document.getElementById('modalOverlay');
  if (modalOverlay) {
    modalOverlay.addEventListener('click', handleModalOverlayClick);
  }
  
  // Initialize dashboard
  renderDashboard();
  
  console.log('Restaurant Menu Management System initialized');
});
