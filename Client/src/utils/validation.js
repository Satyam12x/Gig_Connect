/**
 * Form validation utilities
 */

/**
 * Common validators for form fields
 */
export const validators = {
  /**
   * Validates email format
   * @param {string} value - Email to validate
   * @returns {boolean} True if valid email
   */
  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },

  /**
   * Validates phone number (10 digits)
   * @param {string} value - Phone number to validate
   * @returns {boolean} True if valid phone
   */
  phone: (value) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(value);
  },

  /**
   * Checks if value is not empty
   * @param {*} value - Value to check
   * @returns {boolean} True if value exists
   */
  required: (value) => {
    if (value == null) return false;
    if (typeof value === 'string') return value.trim() !== '';
    if (Array.isArray(value)) return value.length > 0;
    return true;
  },

  /**
   * Validates minimum length
   * @param {number} min - Minimum length required
   * @returns {Function} Validator function
   */
  minLength: (min) => (value) => {
    if (!value) return false;
    return value.length >= min;
  },

  /**
   * Validates maximum length
   * @param {number} max - Maximum length allowed
   * @returns {Function} Validator function
   */
  maxLength: (max) => (value) => {
    if (!value) return true;
    return value.length <= max;
  },

  /**
   * Validates URL format
   * @param {string} value - URL to validate
   * @returns {boolean} True if valid URL
   */
  url: (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Validates number range
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {Function} Validator function
   */
  range: (min, max) => (value) => {
    const num = Number(value);
    return !isNaN(num) && num >= min && num <= max;
  },
};

/**
 * Validates a form object against validation rules
 * @param {Object} values - Form values to validate
 * @param {Object} rules - Validation rules for each field
 * @returns {Object} Object containing errors for invalid fields
 * 
 * @example
 * const errors = validateForm(
 *   { email: 'test@test.com', age: 25 },
 *   {
 *     email: [
 *       { validator: validators.required, message: 'Email is required' },
 *       { validator: validators.email, message: 'Invalid email format' }
 *     ],
 *     age: [
 *       { validator: validators.range(18, 100), message: 'Age must be 18-100' }
 *     ]
 *   }
 * );
 */
export const validateForm = (values, rules) => {
  const errors = {};

  Object.keys(rules).forEach((field) => {
    const fieldRules = rules[field];
    const value = values[field];

    // Check each rule for this field
    for (const rule of fieldRules) {
      if (!rule.validator(value)) {
        errors[field] = rule.message;
        break; // Stop at first error
      }
    }
  });

  return errors;
};

/**
 * Validates a single field
 * @param {*} value - Field value
 * @param {Array} rules - Array of validation rules
 * @returns {string|null} Error message or null if valid
 */
export const validateField = (value, rules) => {
  for (const rule of rules) {
    if (!rule.validator(value)) {
      return rule.message;
    }
  }
  return null;
};
