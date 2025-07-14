import { useState, useEffect } from 'react';

export interface CameraPermissionState {
  hasPermission: boolean;
  isRequesting: boolean;
  error: string | null;
}

export const useCameraPermission = () => {
  const [permissionState, setPermissionState] = useState<CameraPermissionState>({
    hasPermission: false,
    isRequesting: false,
    error: null,
  });

  const requestPermission = async () => {
    setPermissionState(prev => ({ ...prev, isRequesting: true, error: null }));

    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported in this browser');
      }

      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });

      // Stop the stream immediately after getting permission
      stream.getTracks().forEach(track => track.stop());

      setPermissionState({
        hasPermission: true,
        isRequesting: false,
        error: null,
      });
    } catch (error) {
      let errorMessage = 'Impossible d\'accéder à la caméra';
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Accès à la caméra refusé. Veuillez autoriser l\'accès dans les paramètres de votre navigateur.';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'Aucune caméra trouvée sur cet appareil.';
        } else if (error.name === 'NotSupportedError') {
          errorMessage = 'Votre navigateur ne supporte pas l\'accès à la caméra.';
        } else {
          errorMessage = error.message;
        }
      }

      setPermissionState({
        hasPermission: false,
        isRequesting: false,
        error: errorMessage,
      });
    }
  };

  const checkPermission = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setPermissionState({
          hasPermission: false,
          isRequesting: false,
          error: 'Camera access is not supported in this browser',
        });
        return;
      }

      // Try to get camera stream to check permission
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      
      setPermissionState({
        hasPermission: true,
        isRequesting: false,
        error: null,
      });
    } catch (error) {
      setPermissionState({
        hasPermission: false,
        isRequesting: false,
        error: null,
      });
    }
  };

  useEffect(() => {
    checkPermission();
  }, []);

  return {
    ...permissionState,
    requestPermission,
    checkPermission,
  };
}; 