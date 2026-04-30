// Inline Validation System for Merchant Store Builder

/**
 * Validate store name
 * @param {string} name - Store name to validate
 * @returns {Object} Validation result with isValid and error message
 */
function validateStoreName(name) {
  if (!name || name.trim() === '') {
    return { isValid: false, error: 'Store name is required' };
  }
  if (name.trim().length < 2) {
    return { isValid: false, error: 'Store name must be at least 2 characters' };
  }
  if (name.trim().length > 100) {
    return { isValid: false, error: 'Store name must be less than 100 characters' };
  }
  return { isValid: true, error: null };
}

/**
 * Validate store type
 * @param {string} type - Store type to validate
 * @returns {Object} Validation result
 */
function validateStoreType(type) {
  const validTypes = ['cafe', 'restaurant', 'grocery', 'flowers'];
  if (!type) {
    return { isValid: false, error: 'Please select a store type' };
  }
  if (!validTypes.includes(type)) {
    return { isValid: false, error: 'Invalid store type' };
  }
  return { isValid: true, error: null };
}

/**
 * Validate store address
 * @param {string} address - Store address to validate
 * @returns {Object} Validation result
 */
function validateStoreAddress(address) {
  if (!address || address.trim() === '') {
    return { isValid: false, error: 'Store address is required' };
  }
  if (address.trim().length < 5) {
    return { isValid: false, error: 'Address must be at least 5 characters' };
  }
  return { isValid: true, error: null };
}

/**
 * Validate price
 * @param {number|string} price - Price to validate
 * @returns {Object} Validation result
 */
function validatePrice(price) {
  const numericPrice = parseFloat(price);
  if (!price || price === '') {
    return { isValid: false, error: 'Price is required' };
  }
  if (isNaN(numericPrice)) {
    return { isValid: false, error: 'Price must be a valid number' };
  }
  if (numericPrice <= 0) {
    return { isValid: false, error: 'Price must be greater than $0' };
  }
  if (numericPrice > 9999.99) {
    return { isValid: false, error: 'Price cannot exceed $9,999.99' };
  }
  return { isValid: true, error: null };
}

/**
 * Validate product name
 * @param {string} name - Product name to validate
 * @returns {Object} Validation result
 */
function validateProductName(name) {
  if (!name || name.trim() === '') {
    return { isValid: false, error: 'Product name is required' };
  }
  if (name.trim().length < 2) {
    return { isValid: false, error: 'Product name must be at least 2 characters' };
  }
  if (name.trim().length > 100) {
    return { isValid: false, error: 'Product name must be less than 100 characters' };
  }
  return { isValid: true, error: null };
}

/**
 * Validate tax rate
 * @param {number|string} taxRate - Tax rate to validate
 * @returns {Object} Validation result
 */
function validateTaxRate(taxRate) {
  const numericTax = parseFloat(taxRate);
  if (isNaN(numericTax)) {
    return { isValid: false, error: 'Tax rate must be a valid number' };
  }
  if (numericTax < 0) {
    return { isValid: false, error: 'Tax rate cannot be negative' };
  }
  if (numericTax > 100) {
    return { isValid: false, error: 'Tax rate cannot exceed 100%' };
  }
  return { isValid: true, error: null };
}

/**
 * Apply validation visual feedback to input element
 * @param {HTMLElement} input - Input element to validate
 * @param {Object} result - Validation result from validator functions
 */
function applyValidationFeedback(input, result) {
  if (!result.isValid) {
    // Remove success state if present
    input.classList.remove('border-green-500');
    
    // Add error state
    input.classList.add('border-red-500', 'shake-animation');
    
    // Remove shake animation after it completes
    setTimeout(() => {
      input.classList.remove('shake-animation');
    }, 500);
    
    // Show error message if error container exists
    const errorContainer = input.parentElement.querySelector('.error-message');
    if (errorContainer) {
      errorContainer.textContent = result.error;
      errorContainer.classList.remove('hidden');
    }
  } else {
    // Remove error state
    input.classList.remove('border-red-500');
    input.classList.add('border-green-500');
    
    // Hide error message
    const errorContainer = input.parentElement.querySelector('.error-message');
    if (errorContainer) {
      errorContainer.classList.add('hidden');
    }
  }
}

/**
 * Clear validation feedback from input element
 * @param {HTMLElement} input - Input element to clear validation from
 */
function clearValidationFeedback(input) {
  input.classList.remove('border-red-500', 'border-green-500', 'shake-animation');
  
  const errorContainer = input.parentElement.querySelector('.error-message');
  if (errorContainer) {
    errorContainer.classList.add('hidden');
  }
}

/**
 * Setup real-time validation for an input element
 * @param {HTMLElement} input - Input element to setup validation for
 * @param {Function} validator - Validator function to use
 * @param {boolean} validateOnBlur - Whether to validate on blur (default: true)
 * @param {number} debounceDelay - Debounce delay in milliseconds (default: 300)
 */
function setupRealTimeValidation(input, validator, validateOnBlur = true, debounceDelay = 300) {
  let debounceTimer;
  
  // Validate on input with debounce
  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    
    debounceTimer = setTimeout(() => {
      if (input.value) {
        const result = validator(input.value);
        applyValidationFeedback(input, result);
      } else {
        clearValidationFeedback(input);
      }
    }, debounceDelay);
  });
  
  // Validate on blur
  if (validateOnBlur) {
    input.addEventListener('blur', () => {
      if (input.value) {
        const result = validator(input.value);
        applyValidationFeedback(input, result);
      }
    });
  }
}

/**
 * Validate entire form
 * @param {Object} formData - Form data object
 * @returns {Object} Validation result with isValid and errors object
 */
function validateForm(formData) {
  const errors = {};
  let isValid = true;
  
  // Validate each field
  const nameResult = validateProductName(formData.name);
  if (!nameResult.isValid) {
    errors.name = nameResult.error;
    isValid = false;
  }
  
  const priceResult = validatePrice(formData.price);
  if (!priceResult.isValid) {
    errors.price = priceResult.error;
    isValid = false;
  }
  
  return { isValid, errors };
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    validateStoreName,
    validateStoreType,
    validateStoreAddress,
    validatePrice,
    validateProductName,
    validateTaxRate,
    applyValidationFeedback,
    clearValidationFeedback,
    setupRealTimeValidation,
    validateForm
  };
}