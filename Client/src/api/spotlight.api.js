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
 * Spotlight API service
 * Handles all Spotlight-related API calls
 */
export const spotlightAPI = {
  /**
   * Get all spotlight projects
   * @param {Object} filters - Optional filters (category, tags, etc.)
   * @returns {Promise<Array>} List of projects
   */
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const url = params ? `${API_BASE}/spotlight?${params}` : `${API_BASE}/spotlight`;
    const { data } = await axios.get(url);
    return data;
  },

  /**
   * Get a single spotlight project by ID
   * @param {string} projectId - Project ID
   * @returns {Promise<Object>} Project details
   */
  getById: async (projectId) => {
    const { data } = await axios.get(`${API_BASE}/spotlight/${projectId}`);
    return data;
  },

  /**
   * Create a new spotlight project
   * @param {FormData} formData - Form data with image, title, description, tags
   * @returns {Promise<Object>} Created project
   */
  create: async (formData) => {
    const { data } = await axios.post(`${API_BASE}/spotlight`, formData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  /**
   * Generate project details using AI based on title
   * @param {string} title - Project title for AI generation
   * @returns {Promise<Object>} AI-generated suggestions (description, tags)
   */
  generateWithAI: async (title) => {
    const { data } = await axios.post(
      `${API_BASE}/spotlight/generate`,
      { title },
      { headers: getAuthHeaders() }
    );
    return data;
  },

  /**
   * Like/unlike a spotlight project
   * @param {string} projectId - Project ID to like/unlike
   * @returns {Promise<Object>} Updated project
   */
  toggleLike: async (projectId) => {
    const { data } = await axios.put(
      `${API_BASE}/spotlight/${projectId}/like`,
      {},
      { headers: getAuthHeaders() }
    );
    return data;
  },

  /**
   * Delete a spotlight project
   * @param {string} projectId - Project ID to delete
   * @returns {Promise<Object>} Deletion confirmation
   */
  delete: async (projectId) => {
    const { data } = await axios.delete(`${API_BASE}/spotlight/${projectId}`, {
      headers: getAuthHeaders(),
    });
    return data;
  },
};
