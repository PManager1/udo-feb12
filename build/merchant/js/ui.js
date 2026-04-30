// UI Management System for Merchant Store Builder

let currentStoreData = null;

/**
 * Initialize UI components
 */
function initializeUI() {
  renderHoursGrid();
  renderMobileHoursGrid();
  updateProgressRing(0);
}

/**
 * Update the entire UI with new store data
 * @param {Object} storeData - Store data to render
 */
function updateUI(storeData) {
  currentStoreData = storeData;
  
  // Update store info inputs
  updateStoreInfoInputs(storeData);
  
  // Update categories
  renderCategories(storeData.categories);
  renderCategories(storeData.categories, true); // Mobile version
  
  // Update preview
  updatePreview(storeData);
  
  // Update progress
  const stepsLeft = calculateStepsLeft(storeData);
  updateProgressRing(stepsLeft);
}

/**
 * Update store info inputs
 * @param {Object} storeData - Store data
 */
function updateStoreInfoInputs(storeData) {
  const storeNameInput = document.getElementById('storeName');
  const storeNameMobile = document.getElementById('storeNameMobile');
  const storeNameHeader = document.getElementById('storeNameHeader');
  const storeTypeInput = document.getElementById('storeType');
  const storeTypeMobile = document.getElementById('storeTypeMobile');
  const storeAddressInput = document.getElementById('storeAddress');
  const storeAddressMobile = document.getElementById('storeAddressMobile');
  const emergencyPause = document.getElementById('emergencyPause');
  const emergencyPauseMobile = document.getElementById('emergencyPauseMobile');
  
  if (storeNameInput) storeNameInput.value = storeData.storeName || '';
  if (storeNameMobile) storeNameMobile.value = storeData.storeName || '';
  if (storeNameHeader) storeNameHeader.value = storeData.storeName || 'My Store';
  if (storeTypeInput) storeTypeInput.value = storeData.storeType || '';
  if (storeTypeMobile) storeTypeMobile.value = storeData.storeType || '';
  if (storeAddressInput) storeAddressInput.value = storeData.storeAddress || '';
  if (storeAddressMobile) storeAddressMobile.value = storeData.storeAddress || '';
  
  if (storeData.emergencyPause) {
    emergencyPause?.classList.add('active');
    emergencyPauseMobile?.classList.add('active');
  } else {
    emergencyPause?.classList.remove('active');
    emergencyPauseMobile?.classList.remove('active');
  }
  
  // Update hours
  updateHoursInputs(storeData.hours);
}

/**
 * Render hours grid
 */
function renderHoursGrid() {
  const hoursGrid = document.getElementById('hoursGrid');
  if (!hoursGrid) return;
  
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  hoursGrid.innerHTML = dayLabels.map((label, index) => `
    <div class="hours-day">
      <div class="hours-day-label">${label}</div>
      <input type="time" class="hours-input" data-day="${dayNames[index]}" data-type="open">
      <input type="time" class="hours-input" data-day="${dayNames[index]}" data-type="close">
    </div>
  `).join('');
}

/**
 * Render mobile hours grid
 */
function renderMobileHoursGrid() {
  const hoursGridMobile = document.getElementById('hoursGridMobile');
  if (!hoursGridMobile) return;
  
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  hoursGridMobile.innerHTML = dayLabels.map((label, index) => `
    <div class="text-center p-1 bg-gray-50 rounded">
      <div class="font-semibold text-gray-600 mb-1 day-label">${label}</div>
      <input type="time" class="hours-input w-full text-xs px-1 py-1 border border-gray-300 rounded" data-day="${dayNames[index]}" data-type="open">
      <input type="time" class="hours-input w-full text-xs px-1 py-1 border border-gray-300 rounded mt-1" data-day="${dayNames[index]}" data-type="close">
    </div>
  `).join('');
}

/**
 * Update hours inputs
 * @param {Object} hours - Hours object
 */
function updateHoursInputs(hours) {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  days.forEach(day => {
    const openInput = document.querySelector(`input[data-day="${day}"][data-type="open"]`);
    const closeInput = document.querySelector(`input[data-day="${day}"][data-type="close"]`);
    
    if (openInput && hours[day]) {
      openInput.value = hours[day].open || '';
    }
    if (closeInput && hours[day]) {
      closeInput.value = hours[day].close || '';
    }
  });
}

/**
 * Get hours from inputs
 * @returns {Object} Hours object
 */
function getHoursFromInputs() {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const hours = {};
  
  days.forEach(day => {
    const openInput = document.querySelector(`input[data-day="${day}"][data-type="open"]`);
    const closeInput = document.querySelector(`input[data-day="${day}"][data-type="close"]`);
    
    hours[day] = {
      open: openInput?.value || '',
      close: closeInput?.value || ''
    };
  });
  
  return hours;
}

/**
 * Render categories
 * @param {Array} categories - Categories array
 * @param {boolean} isMobile - Whether rendering for mobile
 */
function renderCategories(categories, isMobile = false) {
  const containerId = isMobile ? 'categoriesContainerMobile' : 'categoriesContainer';
  const container = document.getElementById(containerId);
  if (!container) return;
  
  if (categories.length === 0) {
    container.innerHTML = `
      <div class="empty-product-slot">
        <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
        </svg>
        <p class="text-sm">No categories yet</p>
        <p class="text-xs mt-1">Add a category to get started</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = categories.map((category, catIndex) => `
    <div class="category-card" data-category-id="${category.id}" draggable="true">
      <div class="category-header">
        <div class="flex items-center gap-2">
          <span class="drag-handle">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"/>
            </svg>
          </span>
          <span class="category-title">${category.name}</span>
        </div>
        <div class="category-actions">
          <button onclick="editCategory('${category.id}')" class="text-gray-500 hover:text-orange-500 bg-gray-100 hover:bg-orange-100">
            Edit
          </button>
          <button onclick="deleteCategory('${category.id}')" class="text-gray-500 hover:text-red-500 bg-gray-100 hover:bg-red-100">
            Delete
          </button>
        </div>
      </div>
      <div class="space-y-2 category-products">
        ${category.products.length === 0 ? `
          <div class="empty-product-slot" onclick="openQuickAddModal('${category.id}')">
            <p class="text-sm">Add your first product</p>
          </div>
        ` : category.products.map((product, prodIndex) => `
          <div class="product-item" data-product-id="${product.id}" draggable="true">
            <span class="drag-handle">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"/>
              </svg>
            </span>
            ${product.image ? `
              <img src="${product.image}" alt="${product.name}" class="product-image">
            ` : `
              <div class="product-image">
                <svg class="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </div>
            `}
            <div class="product-info">
              <div class="product-name">${product.name}</div>
              <div class="product-price">$${parseFloat(product.price).toFixed(2)}</div>
              <span class="product-status ${getProductStatusClass(product.status)}">${product.status || 'Draft'}</span>
            </div>
            <div class="product-actions">
              <button onclick="toggleProductStatus('${category.id}', '${product.id}')" class="p-2 hover:bg-gray-100 rounded" title="Toggle Status">
                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
              </button>
              <button onclick="deleteProduct('${category.id}', '${product.id}')" class="p-2 hover:bg-red-100 rounded" title="Delete">
                <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          </div>
        `).join('')}
      </div>
      <button onclick="openQuickAddModal('${category.id}')" class="mt-3 w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-orange-500 hover:text-orange-500 transition">
        + Add Product
      </button>
    </div>
  `).join('');
  
  // Setup drag and drop
  setupDragAndDrop(container);
}

/**
 * Get product status CSS class
 * @param {string} status - Product status
 * @returns {string} CSS class
 */
function getProductStatusClass(status) {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'status-active';
    case 'out of stock':
      return 'status-out-of-stock';
    default:
      return 'status-draft';
  }
}

/**
 * Update preview
 * @param {Object} storeData - Store data
 */
function updatePreview(storeData) {
  const previewContent = document.getElementById('previewContent');
  const mobilePreviewContent = document.getElementById('mobilePreviewContent');
  
  const previewHTML = generatePreviewHTML(storeData);
  
  if (previewContent) {
    previewContent.innerHTML = previewHTML;
  }
  if (mobilePreviewContent) {
    mobilePreviewContent.innerHTML = previewHTML + `
      <button id="closePreviewBtn" class="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    `;
  }
}

/**
 * Generate preview HTML
 * @param {Object} storeData - Store data
 * @returns {string} Preview HTML
 */
function generatePreviewHTML(storeData) {
  const storeName = storeData.storeName || 'Your Store';
  const storeTypeLabel = {
    'cafe': 'Cafe',
    'restaurant': 'Restaurant',
    'grocery': 'Grocery Store',
    'flowers': 'Flower Shop'
  };
  
  return `
    <div class="preview-header">
      <div class="preview-store-name">${storeName}</div>
      <div class="preview-store-type">${storeTypeLabel[storeData.storeType] || 'Store'}</div>
    </div>
    <div class="preview-categories">
      ${storeData.categories.length === 0 ? `
        <div class="text-center py-8 text-gray-400">
          <svg class="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
          </svg>
          <p class="text-sm">No products yet</p>
          <p class="text-xs">Add products to see them here</p>
        </div>
      ` : storeData.categories.map(category => `
        <div class="preview-category">
          <div class="preview-category-title">${category.name}</div>
          <div class="preview-products">
            ${category.products.length === 0 ? `
              <div class="text-center py-4 text-gray-300 text-xs">
                No products in this category
              </div>
            ` : category.products.map(product => `
              <div class="preview-product">
                ${product.image ? `
                  <img src="${product.image}" alt="${product.name}" class="preview-product-image">
                ` : `
                  <div class="preview-product-image flex items-center justify-center">
                    <svg class="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                  </div>
                `}
                <div class="preview-product-info">
                  <div class="preview-product-name">${product.name}</div>
                  <div class="preview-product-price">$${parseFloat(product.price).toFixed(2)}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </div>
    <div class="preview-footer">
      <p class="preview-footer-text">Powered by UDO</p>
    </div>
  `;
}

/**
 * Update progress ring
 * @param {number} stepsLeft - Steps left to go live
 */
function updateProgressRing(stepsLeft) {
  const maxSteps = 5;
  const completedSteps = maxSteps - stepsLeft;
  const progress = completedSteps / maxSteps;
  
  const circumference = 2 * Math.PI * 20; // radius = 20
  const offset = circumference * (1 - progress);
  
  // Desktop
  const progressRing = document.getElementById('progressRing');
  const stepsLeftEl = document.getElementById('stepsLeft');
  if (progressRing) {
    progressRing.style.strokeDashoffset = offset;
  }
  if (stepsLeftEl) {
    stepsLeftEl.textContent = stepsLeft;
  }
  
  // Mobile
  const progressRingMobile = document.getElementById('progressRingMobile');
  const stepsLeftMobile = document.getElementById('stepsLeftMobile');
  if (progressRingMobile) {
    progressRingMobile.style.strokeDashoffset = offset;
  }
  if (stepsLeftMobile) {
    stepsLeftMobile.textContent = stepsLeft;
  }
}

/**
 * Setup drag and drop functionality
 * @param {HTMLElement} container - Container element
 */
function setupDragAndDrop(container) {
  let draggedItem = null;
  
  container.addEventListener('dragstart', (e) => {
    if (e.target.classList.contains('category-card') || e.target.classList.contains('product-item')) {
      draggedItem = e.target;
      e.target.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    }
  });
  
  container.addEventListener('dragend', (e) => {
    if (draggedItem) {
      draggedItem.classList.remove('dragging');
      draggedItem = null;
    }
  });
  
  container.addEventListener('dragover', (e) => {
    e.preventDefault();
    const target = e.target.closest('.category-card');
    if (target && target !== draggedItem) {
      target.classList.add('drag-over');
    }
  });
  
  container.addEventListener('dragleave', (e) => {
    const target = e.target.closest('.category-card');
    if (target) {
      target.classList.remove('drag-over');
    }
  });
  
  container.addEventListener('drop', (e) => {
    e.preventDefault();
    const target = e.target.closest('.category-card');
    if (target && target !== draggedItem) {
      target.classList.remove('drag-over');
      // Handle reordering logic would go here
    }
  });
}

/**
 * Show toast notification
 * @param {string} message - Toast message
 * @param {string} type - Toast type (success, error)
 */
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast toast-enter ${type}`;
  toast.innerHTML = `
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      ${type === 'success' 
        ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>'
        : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>'}
    </svg>
    <span>${message}</span>
  `;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

/**
 * Trigger confetti animation
 * @param {HTMLElement} element - Element to center animation on
 */
function triggerConfetti(element) {
  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  
  const colors = ['confetti-red', 'confetti-orange', 'confetti-yellow', 'confetti-green', 'confetti-blue', 'confetti-purple', 'confetti-pink'];
  
  for (let i = 0; i < 20; i++) {
    const confetti = document.createElement('div');
    confetti.className = `confetti-particle ${colors[Math.floor(Math.random() * colors.length)]}`;
    confetti.style.left = `${centerX + (Math.random() - 0.5) * 100}px`;
    confetti.style.top = `${centerY + (Math.random() - 0.5) * 50}px`;
    confetti.style.animationDelay = `${Math.random() * 0.2}s`;
    document.body.appendChild(confetti);
    
    setTimeout(() => confetti.remove(), 1000);
  }
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initializeUI,
    updateUI,
    updateStoreInfoInputs,
    renderHoursGrid,
    updateHoursInputs,
    getHoursFromInputs,
    renderCategories,
    getProductStatusClass,
    updatePreview,
    updateProgressRing,
    setupDragAndDrop,
    showToast,
    triggerConfetti
  };
}