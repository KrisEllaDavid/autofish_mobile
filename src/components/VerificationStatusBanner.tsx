import React from 'react';
import { useAuth } from '../context/AuthContext';

interface VerificationStatusBannerProps {
  className?: string;
}

const VerificationStatusBanner: React.FC<VerificationStatusBannerProps> = ({ className = '' }) => {
  const { userData } = useAuth();

  // Only show for producers with limited access
  if (!userData || userData.userRole !== 'producteur' || userData.access_level === 'full') {
    return null;
  }

  const getStatusColor = () => {
    if (!userData.email_verified) {
      return '#FF9500'; // Orange for email verification needed
    } else if (!userData.is_verified) {
      return '#34C759'; // Green for under review (positive but waiting)
    }
    return '#FF9500';
  };

  const getStatusMessage = () => {
    if (userData.status_message) {
      return userData.status_message;
    }

    if (!userData.email_verified) {
      return "Veuillez vérifier votre email pour accéder à toutes les fonctionnalités.";
    } else if (!userData.is_verified) {
      return "Votre compte producteur est en cours de vérification. Vous avez un accès limité.";
    }
    return "Votre compte est en cours de vérification.";
  };

  const getStatusIcon = () => {
    if (!userData.email_verified) {
      return "⚠️";
    } else if (!userData.is_verified) {
      return "⏳";
    }
    return "⚠️";
  };

  return (
    <div
      className={`verification-status-banner ${className}`}
      style={{
        backgroundColor: getStatusColor(),
        color: 'white',
        padding: '12px 16px',
        borderRadius: '8px',
        margin: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      <span style={{ marginRight: '8px', fontSize: '16px' }}>
        {getStatusIcon()}
      </span>
      <span style={{ flex: 1, lineHeight: '1.3' }}>
        {getStatusMessage()}
      </span>
    </div>
  );
};

export default VerificationStatusBanner;