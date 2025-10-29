import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/api';

export const useTokenValidation = () => {
  const { logout, isAuthenticated } = useAuth();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isValidatingRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const validateToken = async () => {
      if (isValidatingRef.current) {
        return;
      }

      isValidatingRef.current = true;

      try {
        const isValid = await apiClient.validateToken();
        if (!isValid) {
          if (import.meta.env.DEV) {
            console.log('🚨 Token invalid, logging out user');
          }
          logout();
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('❌ Token validation error:', error);
        }
        logout();
      } finally {
        isValidatingRef.current = false;
      }
    };

    // Validate immediately
    validateToken();

    // Set up periodic validation every 5 minutes
    intervalRef.current = setInterval(validateToken, 5 * 60 * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAuthenticated, logout]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
};