/**
 * Environment variable validation for frontend
 * Validates required environment variables and provides defaults
 */

/**
 * Validates and gets API base URL
 * @returns {string} API base URL
 */
export const getApiBaseUrl = () => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  
  if (!apiBaseUrl) {
    const mode = import.meta.env.MODE;
    const defaultUrl = mode === 'production' 
      ? 'http://localhost:3000/api/api'
      : 'http://localhost:3000/api/api';
    
    console.warn(
      '[Env Validation] ⚠️ VITE_API_BASE_URL is not set. Using default:',
      defaultUrl
    );
    return defaultUrl;
  }
  
  return apiBaseUrl;
};

/**
 * Validates environment variables on app startup
 * Logs warnings for missing optional variables
 */
export const validateFrontendEnv = () => {
  const warnings = [];
  
  // Check for API base URL (required)
  if (!import.meta.env.VITE_API_BASE_URL) {
    warnings.push('VITE_API_BASE_URL is not set. Using default value.');
  }
  
  // Optional variables
  if (!import.meta.env.VITE_SOCKET_IO_URL) {
    warnings.push('VITE_SOCKET_IO_URL is not set. WebSocket features may not work.');
  }
  
  if (warnings.length > 0 && import.meta.env.MODE === 'development') {
    console.warn('[Env Validation] Environment variable warnings:');
    warnings.forEach(warning => console.warn(`  - ${warning}`));
  }
  
  return {
    isValid: true,
    warnings,
  };
};

// Auto-validate on import (only in development)
if (import.meta.env.MODE === 'development') {
  validateFrontendEnv();
}
