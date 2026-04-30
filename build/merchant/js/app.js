// Main Application Logic for Merchant Store Builder

let storeData = null;
let autosaveTimer = null;
let selectedCategoryId = null;
let uploadedImageURL = null;

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
});

/**
 * Initialize Google Places autocomplete (called by Google API)
 */
function initAutocomplete() {
  const addressInput = document.getElementById('storeAddress');
  if (addressInput && window.google && window.google.maps && window.google.maps.places) {
    const autocomplete = new google.maps.places.Autocomplete(
      addressInput,
      {
        types: ['address'],
        fields: ['formatted_address', 'geometry', 'name']
      }
    );
    
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.formatted_address) {
        handleStoreAddressChange(place.formatted_address);
      }
    });
    
    console.log('Google Places Autocomplete initialized');
  } else {
    console.log('Google Places API not loaded - will use manual address entry');
  }
}

/**
 * Initialize application
 */
async function initializeApp() {
  // Load existing data from server
  storeData = await loadStoreData();
  
  // Initialize UI
  initializeUI();
  
  // Render initial data
  updateUI(storeData);
  
  // Setup event listeners
  setupEventListeners();
  
  // Setup real-time validation
  setupValidation();
  
  // Populate category dropdown in modal
  populateCategoryDropdown();
  
  console.log('Merchant Store Builder initialized');
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
  // Store name inputs (desktop and mobile)
  const storeNameInput = document.getElementById('storeName');
  const storeNameMobile = document.getElementById('storeNameMobile');
  const storeNameHeader = document.getElementById('storeNameHeader');
  
  if (storeNameInput) {
    storeNameInput.addEventListener('input', (e) => handleStoreNameChange(e.target.value));
    storeNameInput.addEventListener('input', (e) => syncStoreNameMobile(e.target.value));
  }
  
  if (storeNameMobile) {
    storeNameMobile.addEventListener('input', (e) => handleStoreNameChange(e.target.value));
    storeNameMobile.addEventListener('input', (e) => syncStoreNameDesktop(e.target.value));
  }
  
  if (storeNameHeader) {
    storeNameHeader.addEventListener('input', (e) => handleStoreNameChange(e.target.value));
  }
  
  // Store type inputs
  const storeTypeInput = document.getElementById('storeType');
  const storeTypeMobile = document.getElementById('storeTypeMobile');
  
  if (storeTypeInput) {
    storeTypeInput.addEventListener('change', (e) => handleStoreTypeChange(e.target.value));
  }
  
  if (storeTypeMobile) {
    storeTypeMobile.addEventListener('change', (e) => handleStoreTypeChange(e.target.value));
  }
  
  // Store address inputs (desktop and mobile)
  const storeAddressInput = document.getElementById('storeAddress');
  const storeAddressMobile = document.getElementById('storeAddressMobile');
  
  if (storeAddressInput) {
    storeAddressInput.addEventListener('input', (e) => handleStoreAddressChange(e.target.value));
    storeAddressInput.addEventListener('input', (e) => syncStoreAddressMobile(e.target.value));
  }
  
  if (storeAddressMobile) {
    storeAddressMobile.addEventListener('input', (e) => handleStoreAddressChange(e.target.value));
    storeAddressMobile.addEventListener('input', (e) => syncStoreAddressDesktop(e.target.value));
  }
  
  // Hours inputs
  document.addEventListener('change', (e) => {
    if (e.target.classList.contains('hours-input')) {
      handleHoursChange();
    }
  });
  
  // Apply Standard Hours button
  const applyStandardHoursBtn = document.getElementById('applyStandardHours');
  if (applyStandardHoursBtn) {
    applyStandardHoursBtn.addEventListener('click', applyStandardHours);
  }
  
  // Clear All Hours button
  const clearAllHoursBtn = document.getElementById('clearAllHours');
  if (clearAllHoursBtn) {
    clearAllHoursBtn.addEventListener('click', clearAllHours);
  }
  
  // Save Hours button
  const saveHoursBtn = document.getElementById('saveHoursBtn');
  if (saveHoursBtn) {
    saveHoursBtn.addEventListener('click', saveHoursManually);
  }
  
  // Mobile Hours buttons
  const applyStandardHoursBtnMobile = document.getElementById('applyStandardHoursMobile');
  const clearAllHoursBtnMobile = document.getElementById('clearAllHoursMobile');
  const saveHoursBtnMobile = document.getElementById('saveHoursBtnMobile');
  
  if (applyStandardHoursBtnMobile) {
    applyStandardHoursBtnMobile.addEventListener('click', () => {
      const openTimeInput = document.getElementById('standardOpenTimeMobile');
      const closeTimeInput = document.getElementById('standardCloseTimeMobile');
      
      if (!openTimeInput || !closeTimeInput) return;
      
      const openTime = openTimeInput.value;
      const closeTime = closeTimeInput.value;
      
      if (!openTime || !closeTime) {
        showToast('Please enter both open and close times', 'error');
        return;
      }
      
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      
      days.forEach(day => {
        storeData.hours[day] = {
          open: openTime,
          close: closeTime
        };
      });
      
      updateHoursInputs(storeData.hours);
      showToast(`Hours applied: ${formatTime(openTime)} - ${formatTime(closeTime)}`);
      triggerAutosave();
    });
  }
  
  if (clearAllHoursBtnMobile) {
    clearAllHoursBtnMobile.addEventListener('click', clearAllHours);
  }
  
  if (saveHoursBtnMobile) {
    saveHoursBtnMobile.addEventListener('click', saveHoursManually);
  }
  
  // Emergency Pause toggle
  const emergencyPause = document.getElementById('emergencyPause');
  const emergencyPauseMobile = document.getElementById('emergencyPauseMobile');
  
  if (emergencyPause) {
    emergencyPause.addEventListener('click', () => toggleEmergencyPause());
  }
  
  if (emergencyPauseMobile) {
    emergencyPauseMobile.addEventListener('click', () => toggleEmergencyPause());
  }
  
  // Add Category buttons
  const addCategoryBtn = document.getElementById('addCategoryBtn');
  const addCategoryBtnMobile = document.getElementById('addCategoryBtnMobile');
  
  if (addCategoryBtn) {
    addCategoryBtn.addEventListener('click', () => promptAddCategory());
  }
  
  if (addCategoryBtnMobile) {
    addCategoryBtnMobile.addEventListener('click', () => promptAddCategory());
  }
  
  // Quick Add Product buttons
  const quickAddProductBtn = document.getElementById('quickAddProductBtn');
  const quickAddProductBtnMobile = document.getElementById('quickAddProductBtnMobile');
  
  if (quickAddProductBtn) {
    quickAddProductBtn.addEventListener('click', () => openQuickAddModal(null));
  }
  
  if (quickAddProductBtnMobile) {
    quickAddProductBtnMobile.addEventListener('click', () => openQuickAddModal(null));
  }
  
  // Quick Add Modal
  setupModalEventListeners();
  
  // Mobile Preview
  setupMobilePreview();
  
  // Publish & Save buttons are handled by inline script in index.html
  // (uses apiManager.updateProfile to save directly to backend)
  
  
  // Back button (thumb zone)
  const backBtn = document.getElementById('backBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to leave? Unsaved changes will be lost.')) {
        window.location.href = '../index.html';
      }
    });
  }
  
  // Back button (mobile header)
  const backBtnHeader = document.getElementById('backBtnHeader');
  if (backBtnHeader) {
    backBtnHeader.addEventListener('click', () => {
      if (confirm('Are you sure you want to leave? Unsaved changes will be lost.')) {
        window.location.href = '../index.html';
      }
    });
  }
}

/**
 * Setup real-time validation
 */
function setupValidation() {
  // Store name validation
  const storeNameInput = document.getElementById('storeName');
  if (storeNameInput) {
    setupRealTimeValidation(storeNameInput, validateStoreName);
  }
  
  // Store address validation
  const storeAddressInput = document.getElementById('storeAddress');
  if (storeAddressInput) {
    setupRealTimeValidation(storeAddressInput, validateStoreAddress);
  }
  
  // Product name validation in modal
  const productNameInput = document.getElementById('productName');
  if (productNameInput) {
    setupRealTimeValidation(productNameInput, validateProductName);
  }
  
  // Price validation in modal
  const productPriceInput = document.getElementById('productPrice');
  if (productPriceInput) {
    productPriceInput.addEventListener('input', (e) => {
      const result = validatePrice(e.target.value);
      if (!result.isValid && e.target.value !== '' && parseFloat(e.target.value) === 0) {
        // Special case for $0 - show error immediately
        applyValidationFeedback(e.target, result);
      }
    });
  }
}

/**
 * Setup modal event listeners
 */
function setupModalEventListeners() {
  const modal = document.getElementById('quickAddModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const quickAddForm = document.getElementById('quickAddForm');
  const imageUploadZone = document.getElementById('imageUploadZone');
  const productImageInput = document.getElementById('productImage');
  const toggleMoreOptions = document.getElementById('toggleMoreOptions');
  const moreOptions = document.getElementById('moreOptions');
  const moreOptionsIcon = document.getElementById('moreOptionsIcon');
  
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeQuickAddModal);
  }
  
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeQuickAddModal();
      }
    });
  }
  
  if (quickAddForm) {
    quickAddForm.addEventListener('submit', handleQuickAddSubmit);
  }
  
  if (imageUploadZone && productImageInput) {
    imageUploadZone.addEventListener('click', () => productImageInput.click());
    
    imageUploadZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      imageUploadZone.classList.add('drag-over');
    });
    
    imageUploadZone.addEventListener('dragleave', () => {
      imageUploadZone.classList.remove('drag-over');
    });
    
    imageUploadZone.addEventListener('drop', (e) => {
      e.preventDefault();
      imageUploadZone.classList.remove('drag-over');
      
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleImageUpload(files[0]);
      }
    });
    
    productImageInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        handleImageUpload(e.target.files[0]);
      }
    });
  }
  
  if (toggleMoreOptions && moreOptions && moreOptionsIcon) {
    toggleMoreOptions.addEventListener('click', () => {
      moreOptions.classList.toggle('hidden');
      moreOptionsIcon.classList.toggle('rotate-180');
    });
  }
}

/**
 * Setup mobile preview
 */
function setupMobilePreview() {
  const previewToggle = document.getElementById('previewToggle');
  const previewBtnMobile = document.getElementById('previewBtnMobile');
  const mobilePreviewOverlay = document.getElementById('mobilePreviewOverlay');
  const closePreviewBtn = document.getElementById('closePreviewBtn');
  
  if (previewToggle) {
    previewToggle.addEventListener('click', () => {
      mobilePreviewOverlay?.classList.remove('hidden');
    });
  }
  
  if (previewBtnMobile) {
    previewBtnMobile.addEventListener('click', () => {
      mobilePreviewOverlay?.classList.remove('hidden');
    });
  }
  
  if (closePreviewBtn) {
    closePreviewBtn.addEventListener('click', () => {
      mobilePreviewOverlay?.classList.add('hidden');
    });
  }
  
  if (mobilePreviewOverlay) {
    mobilePreviewOverlay.addEventListener('click', (e) => {
      if (e.target === mobilePreviewOverlay) {
        mobilePreviewOverlay.classList.add('hidden');
      }
    });
  }
}

/**
 * Handle store name change
 * @param {string} value - New store name
 */
function handleStoreNameChange(value) {
  storeData.storeName = value;
  updatePreview(storeData);
  updateProgressRing(calculateStepsLeft(storeData));
  triggerAutosave();
}

/**
 * Sync store name to mobile
 * @param {string} value - Store name
 */
function syncStoreNameMobile(value) {
  const storeNameMobile = document.getElementById('storeNameMobile');
  if (storeNameMobile) {
    storeNameMobile.value = value;
  }
}

/**
 * Sync store name to desktop
 * @param {string} value - Store name
 */
function syncStoreNameDesktop(value) {
  const storeNameInput = document.getElementById('storeName');
  const storeNameHeader = document.getElementById('storeNameHeader');
  if (storeNameInput) {
    storeNameInput.value = value;
  }
  if (storeNameHeader) {
    storeNameHeader.value = value;
  }
}

/**
 * Sync store address to mobile
 * @param {string} value - Store address
 */
function syncStoreAddressMobile(value) {
  const storeAddressMobile = document.getElementById('storeAddressMobile');
  if (storeAddressMobile) {
    storeAddressMobile.value = value;
  }
}

/**
 * Sync store address to desktop
 * @param {string} value - Store address
 */
function syncStoreAddressDesktop(value) {
  const storeAddressInput = document.getElementById('storeAddress');
  if (storeAddressInput) {
    storeAddressInput.value = value;
  }
}

/**
 * Handle store type change
 * @param {string} value - New store type
 */
function handleStoreTypeChange(value) {
  storeData.storeType = value;
  
  // Apply smart defaults for the store type
  if (value) {
    const defaultCategories = getStoreTypeDefaults(value);
    if (defaultCategories.length > 0) {
      storeData.categories = defaultCategories;
      renderCategories(storeData.categories);
    }
  }
  
  updatePreview(storeData);
  updateProgressRing(calculateStepsLeft(storeData));
  populateCategoryDropdown();
  triggerAutosave();
}

/**
 * Handle store address change
 * @param {string} value - New store address
 */
function handleStoreAddressChange(value) {
  storeData.storeAddress = value;
  updateProgressRing(calculateStepsLeft(storeData));
  triggerAutosave();
}

/**
 * Handle hours change
 */
function handleHoursChange() {
  storeData.hours = getHoursFromInputs();
  triggerAutosave();
}

/**
 * Apply custom standard hours to all days
 */
function applyStandardHours() {
  const openTimeInput = document.getElementById('standardOpenTime');
  const closeTimeInput = document.getElementById('standardCloseTime');
  
  if (!openTimeInput || !closeTimeInput) return;
  
  const openTime = openTimeInput.value;
  const closeTime = closeTimeInput.value;
  
  if (!openTime || !closeTime) {
    showToast('Please enter both open and close times', 'error');
    return;
  }
  
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  days.forEach(day => {
    storeData.hours[day] = {
      open: openTime,
      close: closeTime
    };
  });
  
  updateHoursInputs(storeData.hours);
  showToast(`Hours applied: ${formatTime(openTime)} - ${formatTime(closeTime)}`);
  triggerAutosave();
}

/**
 * Format time to readable format (e.g., 09:00 -> 9:00 AM)
 * @param {string} time - Time in HH:MM format
 * @returns {string} Formatted time
 */
function formatTime(time) {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

/**
 * Clear all hours for all days
 */
function clearAllHours() {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  days.forEach(day => {
    storeData.hours[day] = {
      open: '',
      close: ''
    };
  });
  
  updateHoursInputs(storeData.hours);
  showToast('All hours cleared');
  triggerAutosave();
}

/**
 * Save hours manually
 */
async function saveHoursManually() {
  storeData.hours = getHoursFromInputs();
  const saved = await saveStoreData(storeData);
  
  if (saved) {
    showToast('Hours saved successfully!');
  } else {
    showToast('Failed to save hours', 'error');
  }
}

/**
 * Toggle emergency pause
 */
function toggleEmergencyPause() {
  storeData.emergencyPause = !storeData.emergencyPause;
  
  const emergencyPause = document.getElementById('emergencyPause');
  const emergencyPauseMobile = document.getElementById('emergencyPauseMobile');
  
  if (storeData.emergencyPause) {
    emergencyPause?.classList.add('active');
    emergencyPauseMobile?.classList.add('active');
    showToast('Emergency pause activated - Orders stopped', 'error');
  } else {
    emergencyPause?.classList.remove('active');
    emergencyPauseMobile?.classList.remove('active');
    showToast('Emergency pause deactivated - Orders active');
  }
  
  updateProgressRing(calculateStepsLeft(storeData));
  triggerAutosave();
}

/**
 * Prompt to add a new category
 */
function promptAddCategory() {
  const categoryName = prompt('Enter category name:');
  if (categoryName && categoryName.trim()) {
    const newCategory = {
      id: generateId(),
      name: categoryName.trim(),
      products: []
    };
    
    storeData.categories.push(newCategory);
    renderCategories(storeData.categories);
    populateCategoryDropdown();
    updatePreview(storeData);
    triggerAutosave();
    showToast('Category added!');
  }
}

/**
 * Edit a category
 * @param {string} categoryId - Category ID
 */
function editCategory(categoryId) {
  const category = storeData.categories.find(cat => cat.id === categoryId);
  if (category) {
    const newName = prompt('Edit category name:', category.name);
    if (newName && newName.trim()) {
      category.name = newName.trim();
      renderCategories(storeData.categories);
      updatePreview(storeData);
      triggerAutosave();
      showToast('Category updated!');
    }
  }
}

/**
 * Delete a category
 * @param {string} categoryId - Category ID
 */
function deleteCategory(categoryId) {
  if (confirm('Are you sure you want to delete this category? All products in it will also be deleted.')) {
    storeData.categories = storeData.categories.filter(cat => cat.id !== categoryId);
    renderCategories(storeData.categories);
    populateCategoryDropdown();
    updatePreview(storeData);
    triggerAutosave();
    showToast('Category deleted');
  }
}

/**
 * Open quick add modal
 * @param {string} categoryId - Category ID (optional)
 */
function openQuickAddModal(categoryId) {
  selectedCategoryId = categoryId;
  uploadedImageURL = null;
  
  // Reset form
  document.getElementById('quickAddForm').reset();
  document.getElementById('imagePreview').classList.add('hidden');
  document.getElementById('imagePreview').src = '';
  document.getElementById('moreOptions').classList.add('hidden');
  document.getElementById('moreOptionsIcon').classList.remove('rotate-180');
  
  // Select category if provided
  if (categoryId) {
    document.getElementById('productCategory').value = categoryId;
  }
  
  // Show modal
  document.getElementById('quickAddModal').classList.remove('hidden');
  
  // Focus on name input
  setTimeout(() => {
    document.getElementById('productName').focus();
  }, 100);
}

/**
 * Close quick add modal
 */
function closeQuickAddModal() {
  document.getElementById('quickAddModal').classList.add('hidden');
  selectedCategoryId = null;
  uploadedImageURL = null;
}

/**
 * Handle image upload
 * @param {File} file - Uploaded file
 */
function handleImageUpload(file) {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    showToast('Please upload an image file', 'error');
    return;
  }
  
  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    showToast('Image must be less than 5MB', 'error');
    return;
  }
  
  // Create local preview URL using URL.createObjectURL()
  uploadedImageURL = URL.createObjectURL(file);
  
  // Show preview
  const imagePreview = document.getElementById('imagePreview');
  imagePreview.src = uploadedImageURL;
  imagePreview.classList.remove('hidden');
  
  showToast('Image uploaded successfully');
}

/**
 * Handle quick add form submit
 * @param {Event} e - Form submit event
 */
function handleQuickAddSubmit(e) {
  e.preventDefault();
  
  // Get form values
  const name = document.getElementById('productName').value.trim();
  const price = document.getElementById('productPrice').value;
  const description = document.getElementById('productDescription').value.trim();
  const category = document.getElementById('productCategory').value;
  const tax = document.getElementById('productTax').value;
  const tags = document.getElementById('productTags').value.trim();
  
  // Validate
  const validation = validateForm({ name, price });
  if (!validation.isValid) {
    if (validation.errors.name) {
      showToast(validation.errors.name, 'error');
      return;
    }
    if (validation.errors.price) {
      showToast(validation.errors.price, 'error');
      return;
    }
  }
  
  // Determine category to add to
  let targetCategoryId = selectedCategoryId;
  if (!targetCategoryId && category) {
    targetCategoryId = category;
  }
  
  // If no category selected, use first category or create one
  if (!targetCategoryId) {
    if (storeData.categories.length === 0) {
      // Create default category
      storeData.categories.push({
        id: generateId(),
        name: 'Products',
        products: []
      });
      targetCategoryId = storeData.categories[0].id;
    } else {
      targetCategoryId = storeData.categories[0].id;
    }
  }
  
  // Create new product
  const newProduct = {
    id: generateId(),
    name: name,
    price: parseFloat(price),
    image: uploadedImageURL,
    description: description,
    status: 'Draft',
    tax: parseFloat(tax) || 0,
    tags: tags ? tags.split(',').map(tag => tag.trim()) : []
  };
  
  // Add product to category
  const categoryData = storeData.categories.find(cat => cat.id === targetCategoryId);
  if (categoryData) {
    categoryData.products.push(newProduct);
  }
  
  // Update UI
  renderCategories(storeData.categories);
  updatePreview(storeData);
  updateProgressRing(calculateStepsLeft(storeData));
  
  // Close modal
  closeQuickAddModal();
  
  // Show success message
  showToast('Product added successfully!');
  triggerAutosave();
}

/**
 * Toggle product status
 * @param {string} categoryId - Category ID
 * @param {string} productId - Product ID
 */
function toggleProductStatus(categoryId, productId) {
  const category = storeData.categories.find(cat => cat.id === categoryId);
  if (category) {
    const product = category.products.find(prod => prod.id === productId);
    if (product) {
      // Toggle status: Draft -> Active -> Out of Stock -> Draft
      if (product.status === 'Draft') {
        product.status = 'Active';
        showToast('Product is now Active!');
        triggerConfetti(document.querySelector(`[data-product-id="${productId}"]`));
      } else if (product.status === 'Active') {
        product.status = 'Out of Stock';
        showToast('Product is now Out of Stock');
      } else {
        product.status = 'Draft';
        showToast('Product is now Draft');
      }
      
      renderCategories(storeData.categories);
      updatePreview(storeData);
      triggerAutosave();
    }
  }
}

/**
 * Delete a product
 * @param {string} categoryId - Category ID
 * @param {string} productId - Product ID
 */
function deleteProduct(categoryId, productId) {
  if (confirm('Are you sure you want to delete this product?')) {
    const category = storeData.categories.find(cat => cat.id === categoryId);
    if (category) {
      category.products = category.products.filter(prod => prod.id !== productId);
      renderCategories(storeData.categories);
      updatePreview(storeData);
      triggerAutosave();
      showToast('Product deleted');
    }
  }
}

/**
 * Populate category dropdown in modal
 */
function populateCategoryDropdown() {
  const dropdown = document.getElementById('productCategory');
  if (!dropdown) return;
  
  dropdown.innerHTML = storeData.categories.map(category => `
    <option value="${category.id}">${category.name}</option>
  `).join('');
}

/**
 * Trigger autosave with debounce
 */
function triggerAutosave() {
  // AUTOSAVE DISABLED — only saves when user clicks Save/Publish button
  // This prevents race conditions where stale data overwrites valid DB values
  console.log('Autosave disabled — use Save button to persist changes');
  return;
}

/**
 * Handle publish button click
 */
async function handlePublish() {
  const stepsLeft = calculateStepsLeft(storeData);
  
  if (stepsLeft > 0) {
    // Identify missing steps
    const missingSteps = [];
    
    if (!storeData.storeName || storeData.storeName.trim() === '') {
      missingSteps.push('• Store name is required');
    }
    
    if (!storeData.storeType) {
      missingSteps.push('• Store type must be selected');
    }
    
    if (!storeData.storeAddress || storeData.storeAddress.trim() === '') {
      missingSteps.push('• Store address is required');
    }
    
    // Products managed on /AddFoodItem — no product check here
    
    if (storeData.emergencyPause) {
      missingSteps.push('• Emergency pause is activated - disable it to accept orders');
    }
    
    // Create helpful message
    const message = `To publish your store, please complete these ${missingSteps.length} step(s):\n\n${missingSteps.join('\n')}\n\nComplete these items and try again.`;
    alert(message);
    return;
  }
  
  if (confirm('Are you ready to publish your store? Customers will be able to see your products.')) {
    // Save to server
    const saved = await saveStoreData(storeData);
    
    if (saved) {
      // Navigate to success page with store name
      const storeName = encodeURIComponent(storeData.storeName);
      window.location.href = `merchant_success_page_creation.html?storeName=${storeName}`;
    } else {
      showToast('Failed to publish. Please try again.', 'error');
    }
  }
}

// Make functions globally accessible for inline event handlers
window.openQuickAddModal = openQuickAddModal;
window.editCategory = editCategory;
window.deleteCategory = deleteCategory;
window.toggleProductStatus = toggleProductStatus;
window.deleteProduct = deleteProduct;