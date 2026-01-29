/**
 * Standardized error handling utility for API responses
 * Provides consistent error message extraction and formatting
 */

/**
 * Extracts error message from API response
 * @param {Response} response - Fetch response object
 * @param {Object} data - Parsed JSON response data
 * @returns {string} - User-friendly error message
 */
export const extractErrorMessage = async (response, data = null) => {
  // If data is not provided, try to parse it
  if (!data && response) {
    try {
      const text = await response.text();
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          // If not JSON, use text as error message
          return text || 'An unknown error occurred';
        }
      }
    } catch (err) {
      console.error('Error parsing response:', err);
    }
  }

  // Handle different error response formats
  if (data) {
    // Check for array of messages (NestJS format)
    if (Array.isArray(data.message)) {
      return data.message.join(', ') || data.error || 'An error occurred';
    }
    
    // Check for single message string
    if (typeof data.message === 'string' && data.message.trim()) {
      return data.message;
    }
    
    // Check for error field
    if (data.error) {
      return typeof data.error === 'string' ? data.error : 'An error occurred';
    }
    
    // Check for errors array (validation errors)
    if (data.errors && Array.isArray(data.errors)) {
      return data.errors.map(err => err.message || err).join(', ');
    }
  }

  // Fallback to status-based messages
  const statusMessages = {
    400: 'Invalid request. Please check your input.',
    401: 'Authentication required. Please log in.',
    403: 'Access denied. You do not have permission.',
    404: 'Resource not found.',
    409: 'Conflict. This resource already exists.',
    422: 'Validation error. Please check your input.',
    500: 'Server error. Please try again later.',
    503: 'Service unavailable. Please try again later.',
  };

  return statusMessages[response?.status] || 'An unexpected error occurred';
};

/**
 * Handles API error response with standardized error extraction
 * @param {Response} response - Fetch response object
 * @returns {Promise<string>} - User-friendly error message
 */
export const handleApiError = async (response) => {
  if (!response) {
    return 'Network error. Please check your connection.';
  }

  try {
    const data = await response.json().catch(() => ({}));
    return await extractErrorMessage(response, data);
  } catch (err) {
    console.error('Error handling API response:', err);
    return 'An unexpected error occurred. Please try again.';
  }
};

/**
 * Creates a standardized error object
 * @param {string} message - Error message
 * @param {number} status - HTTP status code
 * @param {any} originalError - Original error object
 * @returns {Object} - Standardized error object
 */
export const createError = (message, status = null, originalError = null) => {
  return {
    message,
    status,
    originalError,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Logs error for debugging (only in development)
 * @param {string} context - Context where error occurred
 * @param {Error|Object} error - Error object
 */
export const logError = (context, error) => {
  if (import.meta.env.MODE === 'development') {
    console.error(`[${context}]`, error);
  }
};
