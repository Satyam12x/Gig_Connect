import axios from 'axios';
import { API_BASE } from '../constants/api';
import { getAuthToken } from '../utils/storage';

/**
 * Get authorization headers
 * @returns {Object} Headers with auth token
 */
const getAuthHeaders = () => ({
  Authorization: `Bearer ${getAuthToken()}`,
});

/**
 * Gig API service
 * Handles gig-related operations
 */
export const gigAPI = {
  /**
   * Get all gigs with optional filters
   * @param {Object} filters - Search, category, sort filters
   * @returns {Promise<Array>} List of gigs
   */
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const url = params ? `${API_BASE}/gigs?${params}` : `${API_BASE}/gigs`;
    const { data } = await axios.get(url);
    return data;
  },

  /**
   * Get gig by ID
   * @param {string} gigId - Gig ID
   * @returns {Promise<Object>} Gig details
   */
  getById: async (gigId) => {
    const { data } = await axios.get(`${API_BASE}/gigs/${gigId}`);
    return data;
  },

  /**
   * Create a new gig
   * @param {FormData} gigData - Gig data with images
   * @returns {Promise<Object>} Created gig
   */
  create: async (gigData) => {
    const { data } = await axios.post(`${API_BASE}/gigs`, gigData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  /**
   * Update a gig
   * @param {string} gigId - Gig ID
   * @param {Object} gigData - Updated gig data
   * @returns {Promise<Object>} Updated gig
   */
  update: async (gigId, gigData) => {
    const { data } = await axios.put(`${API_BASE}/gigs/${gigId}`, gigData, {
      headers: getAuthHeaders(),
    });
    return data;
  },

  /**
   * Delete a gig
   * @param {string} gigId - Gig ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  delete: async (gigId) => {
    const { data } = await axios.delete(`${API_BASE}/gigs/${gigId}`, {
      headers: getAuthHeaders(),
    });
    return data;
  },

  /**
   * Search gigs
   * @param {string} query - Search query
   * @returns {Promise<Array>} Search results
   */
  search: async (query) => {
    const { data } = await axios.get(`${API_BASE}/gigs?search=${encodeURIComponent(query)}`);
    return data;
  },

  /**
   * Apply to a gig
   * @param {string} gigId - Gig ID
   * @param {Object} applicationData - Application details
   * @returns {Promise<Object>} Application confirmation
   */
  apply: async (gigId, applicationData) => {
    const { data } = await axios.post(
      `${API_BASE}/gigs/${gigId}/apply`,
      applicationData,
      { headers: getAuthHeaders() }
    );
    return data;
  },
};
