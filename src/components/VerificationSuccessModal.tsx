import React from 'react';
import Modal from './Modal';

interface VerificationSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VerificationSuccessModal: React.FC<VerificationSuccessModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div style={{
        maxWidth: '400px',
        textAlign: 'center'
      }}>
        {/* Success Icon */}
        <div style={{
          fontSize: '64px',
          marginBottom: '20px',
          animation: 'bounceIn 0.6s ease-out'
        }}>
          ✅
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: '24px',
          fontWeight: 700,
          color: '#4CAF50',
          marginBottom: '16px',
          margin: '0 0 16px 0'
        }}>
          Compte Vérifié !
        </h2>

        {/* Message */}
        <p style={{
          fontSize: '16px',
          lineHeight: 1.6,
          color: '#555',
          marginBottom: '24px'
        }}>
          Félicitations ! Votre compte producteur a été vérifié par l'administrateur.
        </p>

        {/* Info Box */}
        <div style={{
          background: '#f0f9f0',
          border: '1px solid #c8e6c9',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          textAlign: 'left'
        }}>
          <p style={{
            fontSize: '14px',
            color: '#2e7d32',
            margin: 0,
            lineHeight: 1.5
          }}>
            <strong>Vous avez maintenant accès à :</strong><br />
            • Création de publications<br />
            • Gestion de vos produits<br />
            • Messagerie avec les clients<br />
            • Toutes les fonctionnalités de la plateforme
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '12px',
            border: 'none',
            background: 'linear-gradient(135deg, #009cb7 0%, #007a8f 100%)',
            color: '#fff',
            fontSize: '16px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'scale(0.97)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          Commencer à Utiliser
        </button>

        {/* Keyframe Animation */}
        <style>{`
          @keyframes bounceIn {
            0% {
              opacity: 0;
              transform: scale(0.3);
            }
            50% {
              opacity: 1;
              transform: scale(1.05);
            }
            70% {
              transform: scale(0.9);
            }
            100% {
              transform: scale(1);
            }
          }
        `}</style>
      </div>
    </Modal>
  );
};

export default VerificationSuccessModal;
