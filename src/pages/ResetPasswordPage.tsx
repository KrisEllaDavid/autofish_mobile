import React, { useState } from "react";
import { commonStyles } from "../components/styles";
import NavBar from "../components/NavBar";

const autofishBlueLogo = "/icons/autofish_blue_logo.svg";
const lockIcon = "/icons/Password.svg";
const eyeIcon = "/icons/Eye Slash.svg";
const eyeOpenIcon = "/icons/Eye Open.svg";
const lockIconBlue = "/icons/Password_blue.svg";

const getInputStyle = (
  hasContent: boolean,
  borderColor?: string
): React.CSSProperties => ({
  width: "100%",
  padding: "16px 48px 16px 55px",
  borderRadius: 24,
  border: `1.2px solid ${borderColor || (hasContent ? "#222" : "#e0e0e0")}`,
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

const eyeIconStyle: React.CSSProperties = {
  position: "absolute",
  right: 18,
  top: "40%",
  transform: "translateY(-50%)",
  width: 22,
  height: 22,
  opacity: 0.6,
  cursor: "pointer",
};

const ResetPasswordPage: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  const passwordsMatch =
    newPassword === confirmPassword && newPassword.length > 0;
  const showError = confirmPassword.length > 0 && !passwordsMatch;
  const showSuccess = passwordsMatch;
  const passwordBorderColor = showError
    ? "#e53935"
    : showSuccess
    ? "#43a047"
    : undefined;
  const message = showError
    ? "Les mots de passe ne correspondent pas"
    : showSuccess
    ? "Les mots de passe correspondent"
    : "";
  const messageColor = showError
    ? "#e53935"
    : showSuccess
    ? "#43a047"
    : undefined;

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
        Saisissez le code que vous avez reçu par email et entrez votre nouveau
        mot de passe
      </div>
      <form
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
              src={code ? lockIconBlue : lockIcon}
              alt="lock"
              style={{ width: 22, height: 22, opacity: code ? 1 : 0.6 }}
            />
          </span>
          <input
            type="text"
            placeholder="Entrez le code ici"
            style={getInputStyle(!!code)}
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>
        <div style={inputContainerStyle}>
          <span style={iconStyle}>
            <img
              src={newPassword ? lockIconBlue : lockIcon}
              alt="lock"
              style={{ width: 22, height: 22, opacity: newPassword ? 1 : 0.6 }}
            />
          </span>
          <input
            type={showNewPassword ? "text" : "password"}
            placeholder="Nouveau mot de passe"
            style={getInputStyle(!!newPassword, passwordBorderColor)}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <span
            style={eyeIconStyle}
            onClick={() => setShowNewPassword((s) => !s)}
          >
            <img
              src={showNewPassword ? eyeOpenIcon : eyeIcon}
              alt="toggle password visibility"
              style={{ width: 22, height: 22, opacity: 1 }}
            />
          </span>
        </div>
        <div style={inputContainerStyle}>
          <span style={iconStyle}>
            <img
              src={confirmPassword ? lockIconBlue : lockIcon}
              alt="lock"
              style={{
                width: 22,
                height: 22,
                opacity: confirmPassword ? 1 : 0.6,
              }}
            />
          </span>
          <input
            type={showNewPassword ? "text" : "password"}
            placeholder="Confirmez le mot de passe"
            style={getInputStyle(!!confirmPassword, passwordBorderColor)}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        {message && (
          <div
            style={{
              color: messageColor,
              fontSize: 14,
              marginBottom: 12,
              width: "100%",
              textAlign: "left",
              paddingLeft: 8,
            }}
          >
            {message}
          </div>
        )}
        <button
          type="submit"
          style={{
            width: "100%",
            background: "#009CB7",
            color: "#fff",
            fontWeight: 700,
            fontSize: 18,
            borderRadius: 16,
            border: "none",
            padding: "16px 0",
            marginBottom: 18,
            cursor: "pointer",
          }}
        >
          Valider
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
