import React from 'react';
import { Search, X } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';

/**
 * SearchBar component with built-in debouncing
 * Automatically debounces user input before triggering the onChange callback
 * 
 * @param {Object} props - Component props
 * @param {string} props.value - Current search value
 * @param {Function} props.onChange - Callback when debounced value changes
 * @param {string} props.placeholder - Input placeholder text
 * @param {number} props.delay - Debounce delay in ms (default: 500)
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.showClearButton - Show clear button (default: true)
 * @param {boolean} props.autoFocus - Auto focus on mount
 * 
 * @example
 * const MyComponent = () => {
 *   const [searchTerm, setSearchTerm] = useState('');
 * 
 *   const handleSearch = (debouncedValue) => {
 *     console.log('Searching for:', debouncedValue);
 *     // Perform API call here
 *   };
 * 
 *   return <SearchBar value={searchTerm} onChange={handleSearch} />;
 * };
 */
export const SearchBar = ({
  value = '',
  onChange,
  placeholder = 'Search...',
  delay = 500,
  className = '',
  showClearButton = true,
  autoFocus = false,
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
    if (onChange) {
      onChange(debouncedValue);
    }
  }, [debouncedValue, onChange]);

  const handleClear = () => {
    setLocalValue('');
  };

  return (
    <div className={`relative ${className}`}>
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        size={20}
      />
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
        {...rest}
      />
      {showClearButton && localValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Clear search"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};
