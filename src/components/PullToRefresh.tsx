import React from 'react';

interface PullToRefreshIndicatorProps {
  show: boolean;
  text: string;
  opacity: number;
  isRefreshing: boolean;
}

const PullToRefreshIndicator: React.FC<PullToRefreshIndicatorProps> = ({
  show,
  text,
  opacity,
  isRefreshing
}) => {
  if (!show) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: '-60px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '12px 20px',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
        opacity: opacity,
        transition: 'opacity 0.2s ease',
        fontSize: '14px',
        color: '#666',
        fontWeight: '500',
        zIndex: 1000,
        backdropFilter: 'blur(10px)',
      }}
    >
      {isRefreshing ? (
        <div
          style={{
            width: '16px',
            height: '16px',
            border: '2px solid #e0e0e0',
            borderTop: '2px solid #00B2D6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
      ) : (
        <div
          style={{
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            background: `conic-gradient(#00B2D6 ${opacity * 360}deg, #e0e0e0 0deg)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              background: 'white',
              borderRadius: '50%',
            }}
          />
        </div>
      )}
      <span>{text}</span>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default PullToRefreshIndicator;
