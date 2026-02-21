/**
 * Comprehensive error message mapping utility
 * Provides user-friendly error messages for various API errors
 */

export const getErrorMessage = (error, defaultMessage = 'An error occurred') => {
  // If error has a response message from backend, use it
  if (error.response?.data?.message) {
    return mapBackendError(error.response.data.message);
  }

  // Handle network errors
  if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
    return 'You are offline. Please check your internet connection.';
  }

  if (error.code === 'ECONNREFUSED') {
    return 'Unable to connect to server. Please try again later.';
  }

  if (error.code === 'ETIMEDOUT') {
    return 'Request timed out. Please try again.';
  }

  // Handle HTTP status codes
  if (error.response?.status) {
    return mapHttpStatus(error.response.status);
  }

  // Handle specific error types
  if (error.message) {
    return mapClientError(error.message);
  }

  return defaultMessage;
};

const mapBackendError = (backendMessage) => {
  const errorMap = {
    // Authentication errors
    'User already exists with this email': 'This email is already registered. Please use a different email or try logging in.',
    'Invalid credentials': 'Invalid email or password. Please check your credentials and try again.',
    'Account is deactivated': 'Your account has been deactivated. Please contact support.',
    'Email and password are required': 'Please enter both email and password.',
    'All fields are required': 'Please fill in all required fields.',
    'Current password is incorrect': 'Current password is incorrect. Please try again.',
    'New password must be at least 6 characters': 'Password must be at least 6 characters long.',
    'Current password and new password are required': 'Please enter both current and new passwords.',
    
    // Validation errors
    'validation failed': 'Please check your input and try again.',
    'required field': 'This field is required.',
    'invalid email': 'Please enter a valid email address.',
    'invalid phone': 'Please enter a valid phone number.',
    'password too short': 'Password must be at least 6 characters long.',
    'passwords do not match': 'Passwords do not match.',
    
    // Resource errors
    'User not found': 'User not found.',
    'Vehicle not found': 'Vehicle not found.',
    'Driver not found': 'Driver not found.',
    'Trip not found': 'Trip not found.',
    'Maintenance record not found': 'Maintenance record not found.',
    'Expense not found': 'Expense not found.',
    'Fuel log not found': 'Fuel log not found.',
    
    // Permission errors
    'Unauthorized': 'You are not authorized to perform this action.',
    'Forbidden': 'You do not have permission to access this resource.',
    'Access denied': 'Access denied. Please contact your administrator.',
    
    // Business logic errors
    'Vehicle already in use': 'This vehicle is currently in use and cannot be modified.',
    'Driver assigned to active trip': 'Cannot delete driver. Driver is assigned to an active trip.',
    'Insufficient fuel': 'Insufficient fuel for this trip.',
    'Maintenance overdue': 'Vehicle has overdue maintenance. Please service before use.',
    'Duplicate license plate': 'A vehicle with this license plate already exists.',
    'Duplicate driver license': 'A driver with this license number already exists.',
    
    // Database errors
    'Database connection failed': 'Database connection failed. Please try again later.',
    'Duplicate entry': 'This record already exists.',
    'Foreign key constraint': 'Cannot delete this record as it is referenced by other records.',
    
    // File upload errors
    'File too large': 'File size exceeds the maximum limit.',
    'Invalid file type': 'Invalid file type. Please upload a valid file.',
    'Upload failed': 'File upload failed. Please try again.',
    
    // General errors
    'Internal server error': 'Something went wrong on our end. Please try again later.',
    'Service unavailable': 'Service is currently unavailable. Please try again later.',
    'Rate limit exceeded': 'Too many requests. Please wait a moment and try again.',
    'Session expired': 'Your session has expired. Please log in again.',
    'Token invalid': 'Invalid authentication token. Please log in again.',
  };

  return errorMap[backendMessage] || backendMessage;
};

const mapHttpStatus = (status) => {
  const statusMap = {
    400: 'Bad request. Please check your input and try again.',
    401: 'You are not authorized. Please log in.',
    403: 'You do not have permission to perform this action.',
    404: 'The requested resource was not found.',
    408: 'Request timed out. Please try again.',
    409: 'Conflict with existing data. Please refresh and try again.',
    422: 'Invalid data provided. Please check your input.',
    429: 'Too many requests. Please wait a moment and try again.',
    500: 'Server error. Please try again later.',
    502: 'Service temporarily unavailable. Please try again later.',
    503: 'Service under maintenance. Please try again later.',
    504: 'Gateway timeout. Please try again later.',
  };

  return statusMap[status] || `Request failed with status ${status}.`;
};

const mapClientError = (message) => {
  const clientErrorMap = {
    'Failed to fetch': 'Network error. Please check your connection.',
    'Network Error': 'Network error. Please check your internet connection.',
    'timeout': 'Request timed out. Please try again.',
    'abort': 'Request was cancelled.',
    'JSON parse error': 'Invalid data format received from server.',
  };

  // Case-insensitive search
  const lowerMessage = message.toLowerCase();
  for (const [key, value] of Object.entries(clientErrorMap)) {
    if (lowerMessage.includes(key.toLowerCase())) {
      return value;
    }
  }

  return message;
};

// Specific error messages for different operations
export const getOperationErrorMessage = (operation, error) => {
  const operationMessages = {
    login: {
      default: 'Login failed. Please check your credentials and try again.',
      network: 'Login failed. Please check your internet connection.',
      server: 'Login service is currently unavailable. Please try again later.',
    },
    register: {
      default: 'Registration failed. Please try again.',
      network: 'Registration failed. Please check your internet connection.',
      server: 'Registration service is currently unavailable. Please try again later.',
    },
    fetch: {
      vehicles: 'Failed to load vehicles. Please refresh the page.',
      drivers: 'Failed to load drivers. Please refresh the page.',
      trips: 'Failed to load trips. Please refresh the page.',
      maintenance: 'Failed to load maintenance records. Please refresh the page.',
      expenses: 'Failed to load expenses. Please refresh the page.',
      fuel: 'Failed to load fuel logs. Please refresh the page.',
      dashboard: 'Failed to load dashboard data. Please refresh the page.',
      analytics: 'Failed to load analytics. Please refresh the page.',
      default: 'Failed to load data. Please refresh the page.',
    },
    create: {
      vehicle: 'Failed to add vehicle. Please check your input and try again.',
      driver: 'Failed to add driver. Please check your input and try again.',
      trip: 'Failed to create trip. Please check your input and try again.',
      maintenance: 'Failed to schedule maintenance. Please check your input and try again.',
      expense: 'Failed to add expense. Please check your input and try again.',
      fuel: 'Failed to add fuel log. Please check your input and try again.',
      default: 'Failed to create record. Please check your input and try again.',
    },
    update: {
      vehicle: 'Failed to update vehicle. Please check your input and try again.',
      driver: 'Failed to update driver. Please check your input and try again.',
      trip: 'Failed to update trip. Please check your input and try again.',
      maintenance: 'Failed to update maintenance record. Please check your input and try again.',
      expense: 'Failed to update expense. Please check your input and try again.',
      fuel: 'Failed to update fuel log. Please check your input and try again.',
      profile: 'Failed to update profile. Please check your input and try again.',
      default: 'Failed to update record. Please check your input and try again.',
    },
    delete: {
      vehicle: 'Failed to delete vehicle. Please try again.',
      driver: 'Failed to delete driver. Please try again.',
      trip: 'Failed to delete trip. Please try again.',
      maintenance: 'Failed to delete maintenance record. Please try again.',
      expense: 'Failed to delete expense. Please try again.',
      fuel: 'Failed to delete fuel log. Please try again.',
      default: 'Failed to delete record. Please try again.',
    },
  };

  const operationType = operationMessages[operation.type];
  if (!operationType) return getErrorMessage(error);

  // Check for network errors first
  if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
    return operationType.network || 'Network error. Please check your internet connection.';
  }

  // Check for server errors
  if (error.response?.status >= 500) {
    return operationType.server || 'Server error. Please try again later.';
  }

  // Use specific message if available, otherwise use backend message, then default
  const specificMessage = operationType[operation.resource];
  return specificMessage || operationType.default || getErrorMessage(error);
};

export default {
  getErrorMessage,
  getOperationErrorMessage,
};
