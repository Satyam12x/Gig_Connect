/**
 * Central export for all API services
 * Import API functions from here for consistent usage across the app
 * 
 * @example
 * import { authAPI, gigAPI, spotlightAPI } from '../api';
 * 
 * const login = async (credentials) => {
 *   const user = await authAPI.login(credentials);
 *   console.log('Logged in:', user);
 * };
 */

export { authAPI } from './auth.api';
export { userAPI } from './user.api';
export { gigAPI } from './gig.api';
export { spotlightAPI } from './spotlight.api';
