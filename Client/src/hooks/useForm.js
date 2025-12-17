import { useState, useCallback } from 'react';
import { validateForm } from '../utils/validation';

/**
 * Custom hook for form management with validation
 * Handles form state, validation, and common form operations
 * 
 * @param {Object} initialValues - Initial form values
 * @param {Object} validationRules - Validation rules for each field
 * @returns {Object} Form state and handlers
 * 
 * @example
 * const LoginForm = () => {
 *   const { values, errors, touched, handleChange, handleBlur, handleSubmit, isValid } = useForm(
 *     { email: '', password: '' },
 *     {
 *       email: [
 *         { validator: validators.required, message: 'Email is required' },
 *         { validator: validators.email, message: 'Invalid email' }
 *       ],
 *       password: [
 *         { validator: validators.minLength(6), message: 'Min 6 characters' }
 *       ]
 *     }
 *   );
 * 
 *   const onSubmit = handleSubmit((values) => {
 *     console.log('Form submitted:', values);
 *   });
 * 
 *   return (
 *     <form onSubmit={onSubmit}>
 *       <input
 *         name="email"
 *         value={values.email}
 *         onChange={handleChange}
 *         onBlur={handleBlur}
 *       />
 *       {touched.email && errors.email && <span>{errors.email}</span>}
 *     </form>
 *   );
 * };
 */
export const useForm = (initialValues, validationRules = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Handle input change
   */
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    
    setValues((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  }, [errors]);

  /**
   * Handle input blur (mark field as touched)
   */
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  }, []);

  /**
   * Validate the entire form
   */
  const validate = useCallback(() => {
    const validationErrors = validateForm(values, validationRules);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  }, [values, validationRules]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(
    (onSubmit) => async (e) => {
      e?.preventDefault();
      
      // Mark all fields as touched
      const allTouched = Object.keys(values).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {});
      setTouched(allTouched);

      // Validate form
      const isValid = validate();
      
      if (isValid) {
        setIsSubmitting(true);
        try {
          await onSubmit(values);
        } catch (error) {
          console.error('Form submission error:', error);
        } finally {
          setIsSubmitting(false);
        }
      }
    },
    [values, validate]
  );

  /**
   * Reset form to initial values
   */
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  /**
   * Set specific field value
   */
  const setFieldValue = useCallback((name, value) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  /**
   * Set specific field error
   */
  const setFieldError = useCallback((name, error) => {
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  }, []);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    validate,
    reset,
    setValues,
    setFieldValue,
    setFieldError,
    isValid: Object.keys(errors).length === 0,
  };
};
