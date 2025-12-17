import React from 'react';
import { useDebounce } from '../../hooks/useDebounce';

/**
 * DebouncedInput component
 * A reusable input component with built-in debouncing
 * 
 * @param {Object} props - Component props
 * @param {string} props.value - Current input value
 * @param {Function} props.onChange - Callback when debounced value changes
 * @param {number} props.delay - Debounce delay in ms (default: 500)
 * @param {string} props.type - Input type (default: 'text')
 * @param {string} props.className - Additional CSS classes
 * 
 * @example
 * <DebouncedInput
 *   value={title}
 *   onChange={(debouncedValue) => console.log(debouncedValue)}
 *   placeholder="Enter title..."
 *   delay={300}
 * />
 */
export const DebouncedInput = ({
  value = '',
  onChange,
  delay = 500,
  type = 'text',
  className = '',
  ...rest
}) => {
  const [localValue, setLocalValue] = React.useState(value);
  const debouncedValue = useDebounce(localValue, delay);

  // Sync with parent value changes
  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Trigger onChange when debounced value changes
  React.useEffect(() => {
    if (onChange && debouncedValue !== value) {
      onChange(debouncedValue);
    }
  }, [debouncedValue, onChange, value]);

  return (
    <input
      type={type}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      className={className}
      {...rest}
    />
  );
};

/**
 * DebouncedTextarea component
 * A reusable textarea component with built-in debouncing
 */
export const DebouncedTextarea = ({
  value = '',
  onChange,
  delay = 500,
  className = '',
  ...rest
}) => {
  const [localValue, setLocalValue] = React.useState(value);
  const debouncedValue = useDebounce(localValue, delay);

  // Sync with parent value changes
  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Trigger onChange when debounced value changes
  React.useEffect(() => {
    if (onChange && debouncedValue !== value) {
      onChange(debouncedValue);
    }
  }, [debouncedValue, onChange, value]);

  return (
    <textarea
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      className={className}
      {...rest}
    />
  );
};
