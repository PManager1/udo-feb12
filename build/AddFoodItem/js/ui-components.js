// UI Components - All rendering functions

// ==================== DASHBOARD VIEW ====================

function renderDashboard() {
  const categories = DataManager.getCategories();
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
    
    <!-- Add Category Card -->
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

function renderCategoryCard(category) {
  const itemCount = DataManager.getItems(category.id).length;
  const availableCount = DataManager.getItems(category.id).filter(item => item.is_available).length;
  
  return `
    <div onclick="openCategoryView('${category.id}')" class="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer border border-gray-100">
      <div class="relative h-48">
        <img src="${category.image || 'https://via.placeholder.com/400x300?text=' + encodeURIComponent(category.name)}" 
             alt="${category.name}" 
             class="w-full h-full object-cover"/>
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div class="absolute bottom-4 left-4 right-4">
          <h3 class="text-2xl font-bold text-white">${escapeHtml(category.name)}</h3>
          <p class="text-white/80 text-sm mt-1">${escapeHtml(category.description)}</p>
        </div>
      </div>
      <div class="p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-gray-600 text-sm">
              <span class="font-semibold text-gray-900">${itemCount}</span> items
            </span>
            ${itemCount > availableCount ? `
              <span class="bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded-full">
                ${itemCount - availableCount} 86'd
              </span>
            ` : ''}
          </div>
          <button onclick="event.stopPropagation(); openCategoryDrawer('${category.id}')" class="text-gray-400 hover:text-orange-500 transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;
}

// ==================== CATEGORY VIEW ====================

function renderCategoryView(categoryId) {
  const category = DataManager.getCategoryById(categoryId);
  const items = DataManager.getItems(categoryId);
  
  if (!category) {
    renderDashboard();
    return;
  }
  
  const dashboardContainer = document.getElementById('dashboardContainer');
  
  let html = `
    <div class="mb-6 flex items-center gap-4">
      <button onclick="renderDashboard()" class="text-gray-600 hover:text-orange-500 transition flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
        </svg>
        Back to Dashboard
      </button>
    </div>
    
    <div class="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div class="flex items-center gap-4">
        <img src="${category.image || 'https://via.placeholder.com/100x100?text=' + encodeURIComponent(category.name)}" 
             alt="${category.name}" 
             class="w-16 h-16 rounded-xl object-cover"/>
        <div>
          <h1 class="text-3xl font-bold text-gray-900">${escapeHtml(category.name)}</h1>
          <p class="text-gray-600 mt-1">${escapeHtml(category.description)}</p>
        </div>
      </div>
      <div class="flex gap-3">
        <button onclick="openCategoryDrawer('${category.id}')" class="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 px-5 rounded-xl transition-colors">
          Manage Category
        </button>
        <button onclick="openItemDrawer(null, '${category.id}')" class="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 px-5 rounded-xl transition-colors">
          Add Item
        </button>
      </div>
    </div>
    
    <div id="itemsGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  `;
  
  items.forEach(item => {
    html += renderItemCard(item, category);
  });
  
  html += `
    </div>
    
    ${items.length === 0 ? `
      <div class="text-center py-16">
        <svg class="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
        </svg>
        <h3 class="text-xl font-semibold text-gray-500 mb-2">No items yet</h3>
        <p class="text-gray-400 mb-4">Add your first item to get started</p>
        <button onclick="openItemDrawer(null, '${category.id}')" class="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 px-5 rounded-xl transition-colors">
          Add First Item
        </button>
      </div>
    ` : ''}
  `;
  
  dashboardContainer.innerHTML = html;
}

function renderItemCard(item, category) {
  const modifiers = DataManager.getFinalItemModifiers(item.id);
  const profit = calculateTakeHome(item.base_price);
  const is86 = !item.is_available;
  
  return `
    <div class="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 ${is86 ? 'opacity-50 grayscale' : ''} relative">
      <!-- SOLD OUT Overlay -->
      ${is86 ? `
        <div class="absolute inset-0 z-10 bg-red-600/20 flex items-center justify-center pointer-events-none">
          <div class="bg-red-600 text-white font-bold px-6 py-3 rounded-xl transform -rotate-12 shadow-lg">
            SOLD OUT
          </div>
        </div>
      ` : ''}
      
      <div class="relative h-48">
        <img src="${item.image_url || 'https://via.placeholder.com/400x300?text=' + encodeURIComponent(item.name)}" 
             alt="${item.name}" 
             class="w-full h-full object-cover"/>
        <button onclick="openItemDrawer('${item.id}')" class="absolute top-3 right-3 bg-white/90 hover:bg-white text-gray-700 hover:text-orange-500 p-2 rounded-full transition-all shadow-sm">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
          </svg>
        </button>
        <button onclick="show86Confirmation('${item.id}')" class="absolute top-3 left-3 bg-white/90 hover:bg-white p-2 rounded-full transition-all shadow-sm ${is86 ? 'text-red-500 hover:text-green-500' : 'text-green-500 hover:text-red-500'}">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            ${is86 
              ? '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>'
              : '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>'
            }
          </svg>
        </button>
      </div>
      
      <div class="p-4">
        <h3 class="text-xl font-bold text-gray-900 mb-1">${escapeHtml(item.name)}</h3>
        <div class="flex items-baseline gap-2 mb-3">
          <span class="text-2xl font-bold text-orange-500">${formatCurrency(item.base_price)}</span>
          <span class="text-sm text-gray-500">💰 You keep: ${formatCurrency(profit.udo)}</span>
        </div>
        
        ${modifiers.length > 0 ? `
          <div class="flex flex-wrap gap-1 mb-3">
            ${modifiers.slice(0, 3).map(m => `
              <span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                ${m.type === 'inherited' ? '📂 ' : ''}${escapeHtml(m.name)}
              </span>
            `).join('')}
            ${modifiers.length > 3 ? `
              <span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                +${modifiers.length - 3} more
              </span>
            ` : ''}
          </div>
        ` : ''}
        
        <p class="text-gray-600 text-sm line-clamp-2">${escapeHtml(item.description)}</p>
      </div>
    </div>
  `;
}

// ==================== ITEM DRAWER ====================

function renderItemDrawer(itemId = null, categoryId = null) {
  const item = itemId ? DataManager.getItemById(itemId) : null;
  const categories = DataManager.getCategories();
  const allModifierGroups = DataManager.getModifierGroups();
  const currentModifiers = itemId ? DataManager.getFinalItemModifiers(itemId) : [];
  
  const drawer = document.getElementById('itemDrawer');
  const drawerOverlay = document.getElementById('drawerOverlay');
  
  let categoryOptions = categories.map(cat => `
    <option value="${cat.id}" ${item && item.category_id === cat.id || categoryId === cat.id ? 'selected' : ''}>
      ${escapeHtml(cat.name)}
    </option>
  `).join('');
  
  let modifierGroupsHtml = currentModifiers.map(mod => {
    const isLocal = mod.type === 'local';
    return `
      <div class="bg-gray-50 rounded-lg p-4 mb-3 border ${isLocal ? 'border-orange-200' : 'border-gray-200'}">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <span class="${isLocal ? 'text-orange-500' : 'text-gray-500'}">
              ${isLocal ? '☑️' : '📂'}
            </span>
            <span class="font-semibold text-gray-900">${escapeHtml(mod.name)}</span>
            <span class="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
              ${isLocal ? 'Local' : 'Category'}
            </span>
          </div>
          <div class="flex items-center gap-2">
            ${!isLocal ? `
              <span class="text-xs text-gray-400">🔒 Inherited</span>
            ` : `
              <button onclick="removeModifierFromItem('${itemId || 'new'}', '${mod.id}')" class="text-red-400 hover:text-red-600 transition">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            `}
          </div>
        </div>
        <p class="text-sm text-gray-600 mb-2">${escapeHtml(mod.description)}</p>
        <div class="text-xs text-gray-500">
          ${mod.is_required ? 'Required' : 'Optional'} | Min: ${mod.min_selection}, Max: ${mod.max_selection}
        </div>
        <div class="mt-2 flex flex-wrap gap-1">
          ${mod.options.slice(0, 4).map(opt => `
            <span class="text-xs bg-white border border-gray-200 px-2 py-1 rounded">
              ${escapeHtml(opt.name)} ${opt.extraPrice > 0 ? '(+' + formatCurrency(opt.extraPrice) + ')' : ''}
            </span>
          `).join('')}
          ${mod.options.length > 4 ? `<span class="text-xs text-gray-400">+${mod.options.length - 4} more</span>` : ''}
        </div>
      </div>
    `;
  }).join('');
  
  drawer.innerHTML = `
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-gray-900">${item ? 'Edit Item' : 'Add New Item'}</h2>
      <button onclick="closeItemDrawer()" class="text-gray-400 hover:text-gray-600 transition">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>
    
    <form id="itemForm" onsubmit="saveItem(event, '${itemId || 'new'}')">
      <!-- Image Upload -->
      <div class="mb-6">
        <label class="block text-sm font-semibold text-gray-700 mb-2">📷 ADD IMAGE</label>
        <div class="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-orange-500 transition-colors">
          <input type="file" id="imageInput" accept="image/*" class="hidden" onchange="handleImageUpload(event)">
          <div class="flex flex-col items-center gap-2">
            <img id="imagePreview" src="${item ? item.image_url : ''}" 
                 class="w-32 h-32 object-cover rounded-lg ${item ? '' : 'hidden'}" 
                 alt="Preview"/>
            <div id="imageUploadArea" class="${item ? 'hidden' : ''}">
              <button type="button" onclick="document.getElementById('imageInput').click()" class="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors mb-2">
                Upload Image
              </button>
              <p class="text-xs text-gray-500">or</p>
              <input type="url" id="imageUrl" placeholder="Paste image URL" 
                     class="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                     value="${item ? item.image_url : ''}"
                     onchange="updateImagePreview(this.value)">
            </div>
          </div>
        </div>
      </div>
      
      <!-- Item Details -->
      <div class="mb-6">
        <label class="block text-sm font-semibold text-gray-700 mb-2">ITEM DETAILS</label>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Item Name *</label>
            <input type="text" id="itemName" required
                   class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                   value="${item ? escapeHtml(item.name) : ''}"
                   oninput="updateProfitCalculator()">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Category *</label>
            <select id="itemCategory" required
                    class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500">
              <option value="">Select Category</option>
              ${categoryOptions}
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Base Price ($) *</label>
            <input type="number" id="itemPrice" required step="0.01" min="0"
                   class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                   value="${item ? item.base_price : ''}"
                   oninput="updateProfitCalculator()">
            <div id="profitCalculator" class="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
              <p class="text-sm text-green-800">
                💰 You take home: <span id="takeHomeAmount" class="font-bold">${item ? formatCurrency(calculateTakeHome(item.base_price).udo) : '$0.00'}</span> on UDO
              </p>
              <p class="text-xs text-green-700 mt-1">
                (vs. <span id="competitorAmount" class="font-semibold">${item ? formatCurrency(calculateTakeHome(item.base_price).competitor) : '$0.00'}</span> on competitor)
                ${item && calculateTakeHome(item.base_price).savings > 0 ? ` 🎉 Save ${formatCurrency(calculateTakeHome(item.base_price).savings)}` : ''}
              </p>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Description</label>
            <textarea id="itemDescription" rows="3"
                      class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 resize-none"
                      placeholder="Describe your item...">${item ? escapeHtml(item.description) : ''}</textarea>
          </div>
        </div>
      </div>
      
      <!-- Modifier Groups -->
      <div class="mb-6">
        <div class="flex items-center justify-between mb-2">
          <label class="block text-sm font-semibold text-gray-700">MODIFIER GROUPS</label>
          <button type="button" onclick="openModifierGroupModal()" class="text-orange-500 hover:text-orange-600 text-sm font-medium">
            + Create New Group
          </button>
        </div>
        
        <div id="modifierGroupsContainer">
          ${modifierGroupsHtml}
        </div>
        
        <div class="mt-4">
          <label class="block text-sm font-medium text-gray-600 mb-2">Add Existing Modifier Group</label>
          <select id="addModifierGroup"
                  onchange="addModifierToItem('${itemId || 'new'}', this.value); this.value='';"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500">
            <option value="">Select modifier group...</option>
            ${allModifierGroups.filter(mg => !currentModifiers.find(cm => cm.id === mg.id)).map(mg => `
              <option value="${mg.id}">${escapeHtml(mg.name)}</option>
            `).join('')}
          </select>
        </div>
      </div>
      
      <!-- Actions -->
      <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button type="button" onclick="closeItemDrawer()" class="px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <button type="submit" class="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors">
          ${item ? 'Save Changes' : 'Create Item'}
        </button>
      </div>
    </form>
  `;
  
  drawer.classList.remove('translate-x-full');
  drawerOverlay.classList.remove('hidden');
}

function updateProfitCalculator() {
  const price = parseFloat(document.getElementById('itemPrice').value) || 0;
  const profit = calculateTakeHome(price);
  
  document.getElementById('takeHomeAmount').textContent = formatCurrency(profit.udo);
  document.getElementById('competitorAmount').textContent = formatCurrency(profit.competitor);
}

function updateImagePreview(url) {
  const preview = document.getElementById('imagePreview');
  const uploadArea = document.getElementById('imageUploadArea');
  
  if (url) {
    preview.src = url;
    preview.classList.remove('hidden');
    uploadArea.classList.add('hidden');
  } else {
    preview.classList.add('hidden');
    uploadArea.classList.remove('hidden');
  }
}

function handleImageUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      let base64 = e.target.result;
      
      // Compress image if too large
      if (base64.length > 500000) { // ~500KB threshold
        try {
          base64 = await compressImage(base64);
          console.log('Image compressed');
        } catch (err) {
          console.error('Compression failed:', err);
        }
      }
      
      // Check storage
      showStorageWarningIfNeeded();
      
      updateImagePreview(base64);
      document.getElementById('imageUrl').value = base64;
    };
    reader.readAsDataURL(file);
  }
}

// ==================== MODIFIER GROUP MODAL ====================

function renderModifierGroupModal(groupId = null) {
  const group = groupId ? DataManager.getModifierGroupById(groupId) : null;
  const modal = document.getElementById('modifierModal');
  
  let optionsHtml = '';
  if (group && group.options) {
    optionsHtml = group.options.map((opt, index) => `
      <div class="flex items-center gap-3 mb-2 p-3 bg-gray-50 rounded-lg">
        <input type="checkbox" ${opt.is_available ? 'checked' : ''} class="w-4 h-4 text-orange-500 rounded">
        <input type="text" value="${escapeHtml(opt.name)}" 
               class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
               placeholder="Option name">
        <input type="number" value="${opt.extraPrice}" step="0.01" min="0"
               class="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
               placeholder="$0.00">
        <button type="button" onclick="removeModifierOption(this)" class="text-red-400 hover:text-red-600 transition">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </button>
      </div>
    `).join('');
  }
  
  modal.innerHTML = `
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-gray-900">${group ? 'Edit Modifier Group' : 'Create Modifier Group'}</h2>
      <button onclick="closeModifierGroupModal()" class="text-gray-400 hover:text-gray-600 transition">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>
    
    <form id="modifierGroupForm" onsubmit="saveModifierGroup(event, '${groupId || 'new'}')">
      <div class="space-y-6">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">GROUP NAME *</label>
          <input type="text" id="groupName" required
                 class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                 value="${group ? escapeHtml(group.name) : ''}">
        </div>
        
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">DESCRIPTION</label>
          <input type="text" id="groupDescription"
                 class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                 value="${group ? escapeHtml(group.description) : ''}">
        </div>
        
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">SELECTION RULES</label>
          <div class="flex items-center gap-4">
            <div>
              <label class="text-sm text-gray-600">Min:</label>
              <input type="number" id="minSelection" min="0" value="${group ? group.min_selection : 0}"
                     class="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50">
            </div>
            <div>
              <label class="text-sm text-gray-600">Max:</label>
              <input type="number" id="maxSelection" min="0" value="${group ? group.max_selection : 1}"
                     class="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50">
            </div>
            <label class="flex items-center gap-2">
              <input type="checkbox" id="isRequired" ${group && group.is_required ? 'checked' : ''} 
                     class="w-4 h-4 text-orange-500 rounded">
              <span class="text-sm text-gray-600">Required</span>
            </label>
          </div>
        </div>
        
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="block text-sm font-semibold text-gray-700">OPTIONS</label>
            <button type="button" onclick="addModifierOption()" class="text-orange-500 hover:text-orange-600 text-sm font-medium">
              + Add Option
            </button>
          </div>
          <div id="modifierOptions" class="space-y-2">
            ${optionsHtml}
          </div>
        </div>
      </div>
      
      <div class="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
        <button type="button" onclick="closeModifierGroupModal()" class="px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <button type="submit" class="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors">
          ${group ? 'Save Changes' : 'Create Group'}
        </button>
      </div>
    </form>
  `;
  
  modal.classList.remove('hidden');
  document.getElementById('modalOverlay').classList.remove('hidden');
}

function addModifierOption() {
  const container = document.getElementById('modifierOptions');
  const optionHtml = `
    <div class="flex items-center gap-3 mb-2 p-3 bg-gray-50 rounded-lg">
      <input type="checkbox" checked class="w-4 h-4 text-orange-500 rounded">
      <input type="text" placeholder="Option name" 
             class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50">
      <input type="number" step="0.01" min="0" placeholder="$0.00"
             class="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50">
      <button type="button" onclick="removeModifierOption(this)" class="text-red-400 hover:text-red-600 transition">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
        </svg>
      </button>
    </div>
  `;
  container.insertAdjacentHTML('beforeend', optionHtml);
}

function removeModifierOption(button) {
  button.closest('.flex').remove();
}

// ==================== 86 CONFIRMATION ====================

function show86Confirmation(itemId) {
  const item = DataManager.getItemById(itemId);
  if (!item) return;
  
  const message = item.is_available 
    ? `Are you sure you want to mark "${item.name}" as out of stock (86)?`
    : `Are you sure you want to make "${item.name}" available again?`;
  
  if (confirm(message)) {
    const updated = DataManager.toggleItemAvailability(itemId);
    const currentView = document.getElementById('itemsGrid') ? 'category' : 'dashboard';
    
    if (currentView === 'category') {
      renderCategoryView(item.category_id);
    } else {
      renderDashboard();
    }
  }
}

// ==================== CATEGORY DRAWER ====================

function renderCategoryDrawer(categoryId = null) {
  const category = categoryId ? DataManager.getCategoryById(categoryId) : null;
  const allModifierGroups = DataManager.getModifierGroups();
  const drawer = document.getElementById('categoryDrawer');
  
  let assignedModifiersHtml = '';
  if (category && category.inherited_modifier_group_ids) {
    assignedModifiersHtml = category.inherited_modifier_group_ids.map(groupId => {
      const group = DataManager.getModifierGroupById(groupId);
      if (!group) return '';
      return `
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2">
          <span class="font-medium text-gray-900">${escapeHtml(group.name)}</span>
          <button onclick="removeModifierFromCategory('${categoryId}', '${groupId}')" class="text-red-400 hover:text-red-600 transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      `;
    }).join('');
  }
  
  drawer.innerHTML = `
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-gray-900">${category ? 'Edit Category' : 'Add New Category'}</h2>
      <button onclick="closeCategoryDrawer()" class="text-gray-400 hover:text-gray-600 transition">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>
    
    <form id="categoryForm" onsubmit="saveCategory(event, '${categoryId || 'new'}')">
      <div class="space-y-6">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">CATEGORY NAME *</label>
          <input type="text" id="categoryName" required
                 class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                 value="${category ? escapeHtml(category.name) : ''}">
        </div>
        
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">DESCRIPTION</label>
          <textarea id="categoryDescription" rows="3"
                    class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 resize-none"
                    placeholder="Describe this category...">${category ? escapeHtml(category.description) : ''}</textarea>
        </div>
        
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">IMAGE URL</label>
          <input type="url" id="categoryImage"
                 class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                 placeholder="https://example.com/image.jpg"
                 value="${category ? category.image : ''}">
        </div>
        
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">MODIFIER GROUPS (Applies to all items)</label>
          <div id="assignedModifiers" class="mb-3">
            ${assignedModifiersHtml}
          </div>
          <select id="addCategoryModifier"
                  onchange="assignModifierToCategory('${categoryId || 'new'}', this.value); this.value='';"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500">
            <option value="">Add modifier group...</option>
            ${allModifierGroups.filter(mg => !category || !category.inherited_modifier_group_ids.includes(mg.id)).map(mg => `
              <option value="${mg.id}">${escapeHtml(mg.name)}</option>
            `).join('')}
          </select>
        </div>
      </div>
      
      <div class="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
        <button type="button" onclick="closeCategoryDrawer()" class="px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <button type="submit" class="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors">
          ${category ? 'Save Changes' : 'Create Category'}
        </button>
      </div>
    </form>
  `;
  
  drawer.classList.remove('translate-x-full');
  document.getElementById('drawerOverlay').classList.remove('hidden');
}