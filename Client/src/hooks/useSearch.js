import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from './useDebounce';

/**
 * Custom hook for search functionality with debouncing
 * Automatically handles search state, loading, and debouncing
 * 
 * @param {Function} searchFunction - Function to perform search (should return a Promise)
 * @param {number} delay - Debounce delay in milliseconds (default: 500ms)
 * @param {Object} options - Additional options
 * @returns {Object} Search state and handlers
 * 
 * @example
 * const searchGigs = async (query) => {
 *   const response = await axios.get(`/api/gigs?search=${query}`);
 *   return response.data;
 * };
 * 
 * const MyComponent = () => {
 *   const { query, setQuery, results, loading, error } = useSearch(searchGigs);
 * 
 *   return (
 *     <div>
 *       <input value={query} onChange={(e) => setQuery(e.target.value)} />
 *       {loading && <p>Loading...</p>}
 *       {results.map(item => <div key={item.id}>{item.name}</div>)}
 *     </div>
 *   );
 * };
 */
export const useSearch = (searchFunction, delay = 500, options = {}) => {
  const {
    minQueryLength = 1,
    initialResults = [],
  } = options;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState(initialResults);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const debouncedQuery = useDebounce(query, delay);

  useEffect(() => {
    // Don't search if query is too short
    if (debouncedQuery.length < minQueryLength) {
      setResults(initialResults);
      setLoading(false);
      return;
    }

    const performSearch = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await searchFunction(debouncedQuery);
        setResults(data);
      } catch (err) {
        console.error('Search error:', err);
        setError(err);
        setResults(initialResults);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery, searchFunction, minQueryLength, initialResults]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults(initialResults);
    setError(null);
  }, [initialResults]);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    clearSearch,
  };
};
