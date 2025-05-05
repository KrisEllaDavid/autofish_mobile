import React, { useState } from "react";
import { commonStyles } from "../components/styles";
import NavBar from "../components/NavBar";

const autofishBlueLogo = "/icons/autofish_blue_logo.svg";
const emailIcon = "/icons/Email.svg";
const passwordIcon = "/icons/Password.svg";
const eyeIcon = "/icons/Eye Slash.svg";
const eyeOpenIcon = "/icons/Eye Open.svg";
const emailIconBlue = "/icons/Email_blue.svg";
const passwordIconBlue = "/icons/Password_blue.svg";

const getInputStyle = (hasContent: boolean): React.CSSProperties => ({
  width: "100%",
  padding: "16px 48px 16px 55px",
  borderRadius: 24,
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

interface LoginPageProps {
  onForgotPassword?: () => void;
  onSignup?: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({
  onForgotPassword,
  onSignup,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
      <NavBar title="Login" />
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
        Bienvenue ! Entrez vos identifiants
        <br />
        pour vous connecter
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
        <div style={inputContainerStyle}>
          <span style={iconStyle}>
            <img
              src={password ? passwordIconBlue : passwordIcon}
              alt="password"
              style={{ width: 22, height: 22, opacity: password ? 1 : 0.6 }}
            />
          </span>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Entrez votre mdp"
            style={getInputStyle(!!password)}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <span style={eyeIconStyle} onClick={() => setShowPassword((s) => !s)}>
            <img
              src={showPassword ? eyeOpenIcon : eyeIcon}
              alt="toggle password visibility"
              style={{ width: 22, height: 22, opacity: 0.6 }}
            />
          </span>
        </div>
        <div style={{ width: "100%", textAlign: "right", marginBottom: 18 }}>
          <span
            onClick={onForgotPassword}
            style={{
              color: "#009CB7",
              fontWeight: 500,
              fontSize: 15,
              textDecoration: "none",
              cursor: "pointer",
            }}
          >
            Mot de passe oublié?
          </span>
        </div>
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
          Connexion
        </button>
      </form>
      <div style={{ marginTop: 8, fontSize: 15, color: "#b0b0b0" }}>
        Pas de compte ?{" "}
        <span
          onClick={onSignup}
          style={{
            color: "#009CB7",
            fontWeight: 600,
            textDecoration: "none",
            cursor: "pointer",
          }}
        >
          S'inscrire
        </span>
      </div>
    </div>
  );
};

export default LoginPage;
