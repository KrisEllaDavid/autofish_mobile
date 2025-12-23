/**
 * Security-aware logging utility
 * Only logs to console in development mode
 * In production, console logs are disabled to prevent sensitive data exposure
 */

const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';

/**
 * Safe console.log wrapper - only logs in development
 */
export const devLog = (...args: any[]): void => {
  if (isDevelopment) {
    console.log(...args);
  }
};

/**
 * Safe console.error wrapper - only logs in development
 */
export const devError = (...args: any[]): void => {
  if (isDevelopment) {
    console.error(...args);
  }
};

/**
 * Safe console.warn wrapper - only logs in development
 */
export const devWarn = (...args: any[]): void => {
  if (isDevelopment) {
    console.warn(...args);
  }
};

/**
 * Safe console.info wrapper - only logs in development
 */
export const devInfo = (...args: any[]): void => {
  if (isDevelopment) {
    console.info(...args);
  }
};

/**
 * Production-safe error logging
 * Logs error message only (not full error object which may contain sensitive data)
 */
export const logError = (message: string, error?: any): void => {
  if (isDevelopment) {
    console.error(message, error);
  } else {
    // In production, only log the message to avoid exposing sensitive data
    console.error(message);
  }
};

/**
 * Sanitize sensitive data from objects before logging
 */
export const sanitizeForLog = (obj: any): any => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const sensitiveKeys = [
    'password',
    'token',
    'accessToken',
    'refreshToken',
    'access_token',
    'refresh_token',
    'secret',
    'apiKey',
    'api_key',
    'auth',
    'authorization',
  ];

  const sanitized = { ...obj };

  Object.keys(sanitized).forEach(key => {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeForLog(sanitized[key]);
    }
  });

  return sanitized;
};

/**
 * Safe object logging - sanitizes sensitive data before logging
 */
export const devLogSafe = (message: string, obj: any): void => {
  if (isDevelopment) {
    console.log(message, sanitizeForLog(obj));
  }
};
