import React from 'react';
import { useCameraPermission } from '../hooks/useCameraPermission';

interface CameraPermissionRequestProps {
  onPermissionGranted: () => void;
  onPermissionDenied: () => void;
}

const CameraPermissionRequest: React.FC<CameraPermissionRequestProps> = ({
  onPermissionGranted,
  onPermissionDenied,
}) => {
  const { hasPermission, isRequesting, error, requestPermission } = useCameraPermission();

  React.useEffect(() => {
    if (hasPermission) {
      onPermissionGranted();
    }
  }, [hasPermission, onPermissionGranted]);

  const handleRequestPermission = async () => {
    await requestPermission();
  };

  if (error) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.9)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <div
          style={{
            background: '#fff',
            borderRadius: 16,
            padding: 24,
            maxWidth: 400,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: '#e74c3c' }}>
            ❌ Erreur d'accès à la caméra
          </div>
          <div style={{ fontSize: 16, marginBottom: 24, color: '#666', lineHeight: 1.5 }}>
            {error}
          </div>
          <div style={{ fontSize: 14, marginBottom: 24, color: '#888', lineHeight: 1.4 }}>
            <strong>Solutions possibles :</strong>
            <br />
            • Vérifiez que votre appareil a une caméra
            <br />
            • Autorisez l'accès à la caméra dans les paramètres de votre navigateur
            <br />
            • Rechargez la page et réessayez
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button
              onClick={handleRequestPermission}
              style={{
                background: '#009cb7',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '12px 24px',
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Réessayer
            </button>
            <button
              onClick={onPermissionDenied}
              style={{
                background: '#f8f9fa',
                color: '#666',
                border: '1px solid #ddd',
                borderRadius: 8,
                padding: '12px 24px',
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isRequesting) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.9)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <div
          style={{
            background: '#fff',
            borderRadius: 16,
            padding: 24,
            maxWidth: 400,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: '#009cb7' }}>
            📷 Demande d'accès à la caméra
          </div>
          <div style={{ fontSize: 16, marginBottom: 24, color: '#666' }}>
            Votre navigateur demande l'autorisation d'accéder à votre caméra.
            <br />
            Veuillez autoriser l'accès pour continuer.
          </div>
          <div style={{ fontSize: 14, color: '#888' }}>
            Chargement...
          </div>
        </div>
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.9)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <div
          style={{
            background: '#fff',
            borderRadius: 16,
            padding: 24,
            maxWidth: 400,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: '#009cb7' }}>
            📷 Accès à la caméra requis
          </div>
          <div style={{ fontSize: 16, marginBottom: 24, color: '#666', lineHeight: 1.5 }}>
            Pour prendre des photos de vos documents d'identification, 
            nous avons besoin d'accéder à votre caméra.
          </div>
          <div style={{ fontSize: 14, marginBottom: 24, color: '#888', lineHeight: 1.4 }}>
            <strong>Vos photos restent privées et ne sont utilisées que pour la vérification.</strong>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button
              onClick={handleRequestPermission}
              style={{
                background: '#009cb7',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '12px 24px',
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Autoriser l'accès
            </button>
            <button
              onClick={onPermissionDenied}
              style={{
                background: '#f8f9fa',
                color: '#666',
                border: '1px solid #ddd',
                borderRadius: 8,
                padding: '12px 24px',
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default CameraPermissionRequest; 