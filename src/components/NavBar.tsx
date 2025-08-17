import React from "react";

interface NavBarProps {
  title: string;
  onBack?: () => void;
}

const navBarStyle: React.CSSProperties = {
  width: "100vw",
  maxWidth: 480,
  height: 80,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderBottom: "1px solid rgb(255, 255, 255)",
  background: "#fff",
  position: "sticky",
  top: 0,
  left: 0,
  zIndex: 1000,
};

const titleStyle: React.CSSProperties = {
  fontWeight: 600,
  fontSize: 20,
  color: "#222",
  fontFamily: "Arial, sans-serif",
  textAlign: "center",
};

const NavBar: React.FC<NavBarProps> = ({ title, onBack }) => (
  <nav style={navBarStyle}>
    {onBack && (
      <button
        onClick={onBack}
        style={{
          position: "absolute",
          left: 16,
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          height: 56,
        }}
        aria-label="Back"
      >
        <svg
          width="26"
          height="26"
          fill="none"
          stroke="#222"
          strokeWidth="2.2"
          viewBox="0 0 24 24"
        >
          <path d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    )}
    <span style={titleStyle}>{title}</span>
  </nav>
);

export default NavBar;
