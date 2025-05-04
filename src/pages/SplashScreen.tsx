import React from "react";

const SplashScreen: React.FC = () => {
  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* Keyframes and styles for animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes blink {
          0%, 80%, 100% { opacity: 0.2; }
          40% { opacity: 1; }
        }
      `}</style>
      {/* Background Image */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
      >
        <img
          src="/images/splash image.svg"
          alt="Splash Background"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            position: "absolute",
            inset: 0,
          }}
        />
        {/* Blue overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(21, 94, 117, 0.7)",
          }}
        />
      </div>

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          animation: "fadeIn 1s cubic-bezier(.4,0,.2,1) forwards",
          opacity: 0,
          animationDelay: "0.2s",
          animationFillMode: "forwards",
        }}
      >
        {/* Logo and Text Block */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src="/icons/autofish_white_logo.svg"
            alt="AutoFish Logo"
            width={120}
            height={120}
            style={{ display: "block" }}
          />
          <div
            style={{
              marginTop: 16,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: 160,
            }}
          >
            <span
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "white",
                lineHeight: 1,
                textAlign: "right",
                width: "fit-content",
              }}
            >
              Autofish <br />
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 400,
                  color: "white",
                  lineHeight: 1,
                  textAlign: "right",
                  width: "100%",
                }}
              >
                Store
              </span>
            </span>
          </div>
        </div>
        {/* Loading animation with 3 dots */}
        <div
          style={{
            marginTop: 100,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 24,
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
      </div>
    </div>
  );
};

export default SplashScreen;
