import React from "react";

interface LoadingOverlayProps {
  isVisible: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 156, 183, 0.9)",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(4px)",
      }}
    >
      {/* Keyframes for animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes blink {
          0%, 80%, 100% { opacity: 0.2; }
          40% { opacity: 1; }
        }
        @keyframes logoPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.9; }
        }
      `}</style>

      {/* Content Container */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          animation: "fadeIn 0.3s cubic-bezier(.4,0,.2,1) forwards",
        }}
      >
        {/* Logo */}
        <img
          src="/icons/autofish_white_logo.svg"
          alt="AutoFish Logo"
          width={80}
          height={80}
          style={{ 
            display: "block",
            marginBottom: 16,
            animation: "logoPulse 2s ease-in-out infinite",
          }}
        />

        {/* Loading animation with 3 white dots */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 20,
            marginBottom: 8,
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: 8,
              height: 8,
              margin: "0 2px",
              borderRadius: "50%",
              background: "white",
              animation: "blink 1.4s infinite both",
              animationDelay: "0s",
            }}
          />
          <span
            style={{
              display: "inline-block",
              width: 8,
              height: 8,
              margin: "0 2px",
              borderRadius: "50%",
              background: "white",
              animation: "blink 1.4s infinite both",
              animationDelay: "0.2s",
            }}
          />
          <span
            style={{
              display: "inline-block",
              width: 8,
              height: 8,
              margin: "0 2px",
              borderRadius: "50%",
              background: "white",
              animation: "blink 1.4s infinite both",
              animationDelay: "0.4s",
            }}
          />
        </div>

        {/* Loading text */}
        <div
          style={{
            color: "white",
            fontSize: 16,
            fontWeight: 500,
            fontFamily: "Arial, sans-serif",
            opacity: 0.9,
          }}
        >
          Loading...
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay; 