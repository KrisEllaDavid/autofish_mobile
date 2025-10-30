import { useEffect, useRef, useState } from 'react';
import { apiClient } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

/**
 * Hook to monitor verification status changes for producers.
 * Polls the API every 30 seconds to check if the user's verification status has changed.
 * Shows a success notification when the user becomes verified.
 */
export const useVerificationStatus = () => {
  const { userData, updateUserData } = useAuth();
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const lastVerificationStatus = useRef<boolean | undefined>(userData?.is_verified);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only poll if user is a producer and not yet verified
    if (userData?.userRole !== 'producteur' || userData?.is_verified) {
      return;
    }

    const checkVerificationStatus = async () => {
      try {
        const currentUser = await apiClient.getCurrentUser();

        // Check if verification status changed from false to true
        if (currentUser?.is_verified && !lastVerificationStatus.current) {
          // Update user data
          updateUserData({
            is_verified: true,
            is_active: currentUser.is_active,
            email_verified: currentUser.email_verified
          });

          // Show verification success modal
          setShowVerificationModal(true);

          // Also show toast notification
          toast.success('Votre compte a été vérifié ! Vous avez maintenant accès à toutes les fonctionnalités.', {
            autoClose: 5000,
            position: 'top-center'
          });

          // Update ref
          lastVerificationStatus.current = true;

          // Stop polling once verified
          if (pollingInterval.current) {
            clearInterval(pollingInterval.current);
            pollingInterval.current = null;
          }
        }
      } catch (error) {
        console.error('Error checking verification status:', error);
      }
    };

    // Initial check
    checkVerificationStatus();

    // Poll every 30 seconds
    pollingInterval.current = setInterval(checkVerificationStatus, 30000);

    // Cleanup
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [userData?.userRole, userData?.is_verified, updateUserData]);

  const closeVerificationModal = () => {
    setShowVerificationModal(false);
  };

  return {
    showVerificationModal,
    closeVerificationModal
  };
};
