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
 * Authentication API service
 * Handles user authentication and registration
 */
export const authAPI = {
  /**
   * User login
   * @param {Object} credentials - Email and password
   * @returns {Promise<Object>} User data and token
   */
  login: async (credentials) => {
    const { data } = await axios.post(`${API_BASE}/auth/login`, credentials);
    return data;
  },

  /**
   * User signup
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} User data and token
   */
  signup: async (userData) => {
    const { data } = await axios.post(`${API_BASE}/auth/signup`, userData);
    return data;
  },

  /**
   * Verify OTP
   * @param {Object} otpData - Email and OTP code
   * @returns {Promise<Object>} Verification result
   */
  verifyOTP: async (otpData) => {
    const { data } = await axios.post(`${API_BASE}/auth/verify-otp`, otpData);
    return data;
  },

  /**
   * Resend OTP
   * @param {string} email - User email
   * @returns {Promise<Object>} Resend confirmation
   */
  resendOTP: async (email) => {
    const { data } = await axios.post(`${API_BASE}/auth/resend-otp`, { email });
    return data;
  },

  /**
   * Google OAuth callback
   * @param {string} code - OAuth code
   * @returns {Promise<Object>} User data and token
   */
  googleCallback: async (code) => {
    const { data } = await axios.get(`${API_BASE}/auth/google/callback?code=${code}`);
    return data;
  },

  /**
   * Get current user profile
   * @returns {Promise<Object>} User profile data
   */
  getCurrentUser: async () => {
    const { data } = await axios.get(`${API_BASE}/users/profile`, {
      headers: getAuthHeaders(),
    });
    return data;
  },

  /**
   * Logout (client-side token removal)
   * @returns {Promise<void>}
   */
  logout: async () => {
    // Just a placeholder - actual logout removes token from localStorage
    return Promise.resolve();
  },
};
