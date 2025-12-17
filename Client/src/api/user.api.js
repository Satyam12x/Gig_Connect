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
 * User API service
 * Handles user profile and related operations
 */
export const userAPI = {
  /**
   * Get user profile by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User profile
   */
  getProfile: async (userId) => {
    const url = userId ? `${API_BASE}/users/${userId}` : `${API_BASE}/users/profile`;
    const { data } = await axios.get(url, {
      headers: getAuthHeaders(),
    });
    return data;
  },

  /**
   * Update user profile
   * @param {Object} profileData - Updated profile data
   * @returns {Promise<Object>} Updated profile
   */
  updateProfile: async (profileData) => {
    const { data } = await axios.put(`${API_BASE}/users/profile`, profileData, {
      headers: getAuthHeaders(),
    });
    return data;
  },

  /**
   * Upload profile picture
   * @param {FormData} formData - Form data with image
   * @returns {Promise<Object>} Updated profile with new image URL
   */
  uploadProfilePicture: async (formData) => {
    const { data } = await axios.post(`${API_BASE}/users/upload-picture`, formData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  /**
   * Update user settings
   * @param {Object} settings - User settings
   * @returns {Promise<Object>} Updated settings
   */
  updateSettings: async (settings) => {
    const { data } = await axios.put(`${API_BASE}/users/settings`, settings, {
      headers: getAuthHeaders(),
    });
    return data;
  },

  /**
   * Get user's gigs
   * @param {string} userId - User ID
   * @returns {Promise<Array>} List of user's gigs
   */
  getUserGigs: async (userId) => {
    const { data } = await axios.get(`${API_BASE}/users/${userId}/gigs`, {
      headers: getAuthToken() ? getAuthHeaders() : {},
    });
    return data;
  },

  /**
   * Add skill to user profile
   * @param {string} skill - Skill to add
   * @returns {Promise<Object>} Updated profile
   */
  addSkill: async (skill) => {
    const { data } = await axios.post(
      `${API_BASE}/users/skills`,
      { skill },
      { headers: getAuthHeaders() }
    );
    return data;
  },

  /**
   * Remove skill from user profile
   * @param {string} skill - Skill to remove
   * @returns {Promise<Object>} Updated profile
   */
  removeSkill: async (skill) => {
    const { data } = await axios.delete(`${API_BASE}/users/skills/${skill}`, {
      headers: getAuthHeaders(),
    });
    return data;
  },
};
