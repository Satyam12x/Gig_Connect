/**
 * Debounce utility function
 * Delays the execution of a function until after a specified delay has elapsed
 * since the last time it was invoked.
 * 
 * @param {Function} func - The function to debounce
 * @param {number} delay - The delay in milliseconds (default: 500ms)
 * @returns {Function} The debounced function
 * 
 * @example
 * const handleSearch = debounce((query) => {
 *   console.log('Searching for:', query);
 * }, 500);
 */
export const debounce = (func, delay = 500) => {
  let timeoutId;
  
  return function debounced(...args) {
    // Clear the previous timeout
    clearTimeout(timeoutId);
    
    // Set a new timeout
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

/**
 * Throttle utility function
 * Ensures a function is called at most once in a specified time period
 * 
 * @param {Function} func - The function to throttle
 * @param {number} limit - The time limit in milliseconds (default: 500ms)
 * @returns {Function} The throttled function
 */
export const throttle = (func, limit = 500) => {
  let inThrottle;
  
  return function throttled(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};
