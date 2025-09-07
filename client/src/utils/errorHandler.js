// 🛡️ ERROR HANDLING UTILITIES
// This file provides centralized error handling for the frontend
// Easy to modify and maintain

import logger from './logger';
import { toast } from 'react-toastify';

class ErrorHandler {
  constructor() {
    this.errorTypes = {
      NETWORK: 'NETWORK_ERROR',
      VALIDATION: 'VALIDATION_ERROR',
      AUTH: 'AUTH_ERROR',
      API: 'API_ERROR',
      UNKNOWN: 'UNKNOWN_ERROR'
    };
  }

  // Determine error type
  getErrorType(error) {
    if (!error) return this.errorTypes.UNKNOWN;
    
    if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
      return this.errorTypes.NETWORK;
    }
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      return this.errorTypes.AUTH;
    }
    
    if (error.response?.status >= 400 && error.response?.status < 500) {
      return this.errorTypes.VALIDATION;
    }
    
    if (error.response?.status >= 500) {
      return this.errorTypes.API;
    }
    
    return this.errorTypes.UNKNOWN;
  }

  // Get user-friendly error message
  getUserFriendlyMessage(error, errorType) {
    const messages = {
      [this.errorTypes.NETWORK]: 'Network connection failed. Please check your internet connection.',
      [this.errorTypes.AUTH]: 'Authentication failed. Please login again.',
      [this.errorTypes.VALIDATION]: 'Invalid data provided. Please check your input.',
      [this.errorTypes.API]: 'Server error occurred. Please try again later.',
      [this.errorTypes.UNKNOWN]: 'An unexpected error occurred. Please try again.'
    };

    return messages[errorType] || messages[this.errorTypes.UNKNOWN];
  }

  // Handle API errors
  handleApiError(error, context = '') {
    const errorType = this.getErrorType(error);
    const userMessage = this.getUserFriendlyMessage(error, errorType);
    
    // Log error details
    logger.error(`API Error in ${context}`, {
      errorType,
      status: error.response?.status,
      message: error.message,
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data
    });

    // Show user-friendly message
    toast.error(userMessage);

    // Return error info for further handling
    return {
      type: errorType,
      message: userMessage,
      originalError: error
    };
  }

  // Handle validation errors
  handleValidationError(errors, context = '') {
    logger.warn(`Validation Error in ${context}`, errors);
    
    // Show first validation error
    const firstError = Array.isArray(errors) ? errors[0] : errors;
    const message = firstError.message || 'Validation failed';
    
    toast.error(message);
    
    return {
      type: this.errorTypes.VALIDATION,
      message,
      errors
    };
  }

  // Handle network errors
  handleNetworkError(error, context = '') {
    logger.error(`Network Error in ${context}`, {
      message: error.message,
      online: navigator.onLine
    });

    const message = navigator.onLine 
      ? 'Network connection failed. Please try again.'
      : 'You are offline. Please check your internet connection.';

    toast.error(message);

    return {
      type: this.errorTypes.NETWORK,
      message,
      originalError: error
    };
  }

  // Handle authentication errors
  handleAuthError(error, context = '') {
    logger.error(`Auth Error in ${context}`, {
      status: error.response?.status,
      message: error.message
    });

    const message = 'Session expired. Please login again.';
    toast.error(message);

    // Redirect to login if needed
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.location.href = '/volunteer/login';
      }, 2000);
    }

    return {
      type: this.errorTypes.AUTH,
      message,
      originalError: error
    };
  }

  // Generic error handler
  handleError(error, context = '') {
    const errorType = this.getErrorType(error);
    
    switch (errorType) {
      case this.errorTypes.NETWORK:
        return this.handleNetworkError(error, context);
      case this.errorTypes.AUTH:
        return this.handleAuthError(error, context);
      case this.errorTypes.VALIDATION:
        return this.handleValidationError(error, context);
      case this.errorTypes.API:
        return this.handleApiError(error, context);
      default:
        return this.handleApiError(error, context);
    }
  }

  // Wrapper for async functions
  async wrapAsync(fn, context = '') {
    try {
      return await fn();
    } catch (error) {
      return this.handleError(error, context);
    }
  }

  // Wrapper for sync functions
  wrapSync(fn, context = '') {
    try {
      return fn();
    } catch (error) {
      return this.handleError(error, context);
    }
  }

  // Success handler
  handleSuccess(message, data = null) {
    logger.success(message, data);
    toast.success(message);
  }

  // Info handler
  handleInfo(message, data = null) {
    logger.info(message, data);
    toast.info(message);
  }
}

// Create singleton instance
const errorHandler = new ErrorHandler();

export default errorHandler;
