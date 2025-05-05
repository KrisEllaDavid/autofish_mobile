import React, { useState } from "react";
import { commonStyles } from "../components/styles";
import NavBar from "../components/NavBar";

const autofishBlueLogo = "/icons/autofish_blue_logo.svg";
const emailIcon = "/icons/Email.svg";
const emailIconBlue = "/icons/Email_blue.svg";

const getInputStyle = (hasContent: boolean): React.CSSProperties => ({
  width: "100%",
  padding: "16px 48px 16px 55px",
  borderRadius: 15,
  border: hasContent ? "1.2px solid #222" : "1.2px solid #e0e0e0",
  background: "#fafbfc",
  fontSize: 16,
  color: "#222",
  marginBottom: 12,
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
  fontWeight: 500,
});

const inputContainerStyle: React.CSSProperties = {
  position: "relative",
  width: "100%",
  marginBottom: 12,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "row",
};

const iconStyle: React.CSSProperties = {
  position: "absolute",
  left: 18,
  top: "40%",
  transform: "translateY(-50%)",
  width: 22,
  height: 22,
  opacity: 0.6,
};

const ForgotPasswordPage: React.FC<{
  onBack?: () => void;
  onSubmit?: () => void;
}> = ({ onBack, onSubmit }) => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) onSubmit();
  };

  return (
    <div
      style={{ ...commonStyles.pageContainer, justifyContent: "flex-start" }}
    >
      <style>{`
        input::placeholder {
          color: #222;
          opacity: 0.3;
        }
      `}</style>
      <NavBar title="Mot de passe oublié" onBack={onBack} />
      <div style={{ height: 16 }} />
      <img
        src={autofishBlueLogo}
        alt="Autofish Logo"
        style={{ width: 90, height: 90, margin: "18px 0 8px 0" }}
      />
      <div
        style={{
          fontSize: 26,
          fontWeight: 700,
          color: "#009CB7",
          marginBottom: 10,
          fontFamily: "Arial Rounded MT Bold",
        }}
      >
        Autofish Store
      </div>
      <div
        style={{
          fontSize: 16,
          color: "#222",
          marginBottom: 32,
          textAlign: "center",
          maxWidth: 320,
          fontFamily: "Arial, sans-serif",
        }}
      >
        Entrez votre email pour réinitialiser
        <br />
        votre mot de passe
      </div>
      <form
        onSubmit={handleSubmit}
        style={{
          width: "90vw",
          maxWidth: 340,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div style={inputContainerStyle}>
          <span style={iconStyle}>
            <img
              src={email ? emailIconBlue : emailIcon}
              alt="email"
              style={{ width: 22, height: 22, opacity: email ? 1 : 0.6 }}
            />
          </span>
          <input
            type="email"
            placeholder="Entrez votre email"
            style={getInputStyle(!!email)}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>
        <button
          type="submit"
          style={{
            width: "100%",
            background: "#009CB7",
            color: "#fff",
            fontWeight: 700,
            fontSize: 18,
            borderRadius: 15,
            border: "none",
            padding: "16px 0",
            marginBottom: 18,
            cursor: "pointer",
          }}
        >
          Envoyer
        </button>
        <button
          type="button"
          onClick={onBack}
          style={{
            width: "100%",
            background: "#fff",
            color: "#222",
            fontWeight: 700,
            fontSize: 18,
            borderRadius: 15,
            border: "1.2px solid #e0e0e0",
            padding: "12px 0",
            marginBottom: 18,
            cursor: "pointer",
          }}
        >
          Retour à la connexion
        </button>
      </form>
    </div>
  );
};

export default ForgotPasswordPage;
