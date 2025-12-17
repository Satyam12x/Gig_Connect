import { useState, useCallback } from 'react';

/**
 * Custom hook for API calls with loading and error states
 * Simplifies API call management across components
 * 
 * @param {Function} apiFunction - The API function to execute
 * @returns {Object} API state and execute function
 * 
 * @example
 * const fetchUserProfile = async (userId) => {
 *   const response = await axios.get(`/api/users/${userId}`);
 *   return response.data;
 * };
 * 
 * const ProfileComponent = ({ userId }) => {
 *   const { data, loading, error, execute } = useApi(fetchUserProfile);
 * 
 *   useEffect(() => {
 *     execute(userId);
 *   }, [userId]);
 * 
 *   if (loading) return <Loader />;
 *   if (error) return <Error message={error.message} />;
 *   return <Profile data={data} />;
 * };
 */
export const useApi = (apiFunction) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await apiFunction(...args);
        setData(result);
        
        return result;
      } catch (err) {
        console.error('API Error:', err);
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
};
