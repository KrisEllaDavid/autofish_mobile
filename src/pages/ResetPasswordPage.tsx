import React, { useState } from "react";
import { toast } from "react-toastify";
import NavBar from "../components/NavBar";
import { apiClient } from "../services/api";
import { useAuth } from "../context/AuthContext";

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
  borderRadius: 15,
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
  const { logout } = useAuth();

  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const [savedPassword, setSavedPassword] = useState("");

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

  const validatePassword = (password: string): boolean => {
    if (password.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim()) {
      toast.error("Code de réinitialisation manquant");
      return;
    }

    if (!newPassword.trim()) {
      toast.error("Veuillez entrer un nouveau mot de passe");
      return;
    }

    if (!validatePassword(newPassword)) {
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    setIsLoading(true);

    try {
      await apiClient.resetPassword(code.trim(), newPassword, confirmPassword);

      // Save the new password to display it to the user
      setSavedPassword(newPassword);
      setResetComplete(true);
      toast.success("Mot de passe réinitialisé avec succès");

      // Wait 5 seconds to show the password, then logout and redirect
      setTimeout(async () => {
        // Log out user if they're logged in
        try {
          await logout();
        } catch (_error) {
          console.log("User was not logged in");
        }

        // Redirect to login
        if (onBack) {
          onBack();
        }
      }, 5000);
    } catch (error: any) {
      console.error("Error resetting password:", error);
      toast.error(error?.message || "Erreur lors de la réinitialisation du mot de passe");
    } finally {
      setIsLoading(false);
    }
  };

  if (resetComplete) {
    return (
      <>
        <style>{`
          .fade-in-page {
            opacity: 0;
            animation: fadeInPage 0.5s ease-in forwards;
          }
          @keyframes fadeInPage {
            to { opacity: 1; }
          }
        `}</style>
        <div
          className="fade-in-page"
          style={{
            minHeight: "100vh",
            background: "#fff",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: 64,
          }}
        >
          <NavBar title="Réinitialisation réussie" onBack={onBack} />
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
            Mot de passe réinitialisé !
          </div>
          <div
            style={{
              fontSize: 16,
              color: "#222",
              marginBottom: 20,
              textAlign: "center",
              maxWidth: 340,
              padding: "0 20px",
              fontFamily: "Arial, sans-serif",
              lineHeight: 1.5,
            }}
          >
            Votre mot de passe a été réinitialisé avec succès.
          </div>

          {/* Display the new password with warning */}
          <div
            style={{
              background: "#fafbfc",
              border: "2px solid #009CB7",
              borderRadius: 15,
              padding: "20px",
              marginBottom: 24,
              maxWidth: 340,
              width: "90vw",
            }}
          >
            <div
              style={{
                fontSize: 14,
                color: "#e74c3c",
                fontWeight: 700,
                marginBottom: 12,
                textAlign: "center",
                fontFamily: "Arial, sans-serif",
              }}
            >
              ⚠️ IMPORTANT - Gardez ce mot de passe
            </div>
            <div
              style={{
                fontSize: 14,
                color: "#666",
                marginBottom: 12,
                textAlign: "center",
                fontFamily: "Arial, sans-serif",
                lineHeight: 1.5,
              }}
            >
              Notez bien votre nouveau mot de passe avant de fermer cette page :
            </div>
            <div
              style={{
                background: "#fff",
                border: "1.5px solid #009CB7",
                borderRadius: 12,
                padding: "16px",
                fontSize: 18,
                fontWeight: 700,
                color: "#009CB7",
                textAlign: "center",
                fontFamily: "monospace",
                wordBreak: "break-all",
                letterSpacing: "1px",
              }}
            >
              {savedPassword}
            </div>
          </div>

          <div
            style={{
              fontSize: 14,
              color: "#666",
              marginBottom: 32,
              textAlign: "center",
              maxWidth: 340,
              padding: "0 20px",
              fontFamily: "Arial, sans-serif",
              lineHeight: 1.5,
            }}
          >
            Vous allez être redirigé vers la page de connexion dans quelques secondes...
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        .fade-in-page {
          opacity: 0;
          animation: fadeInPage 0.5s ease-in forwards;
        }
        @keyframes fadeInPage {
          to { opacity: 1; }
        }
        input::placeholder {
          color: #222;
          opacity: 0.3;
        }
      `}</style>
      <div
        className="fade-in-page"
        style={{
          minHeight: "100vh",
          background: "#fff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: 10,
          paddingBottom: 80,
        }}
      >
        <NavBar title="Réinitialiser le mot de passe" onBack={onBack} />
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
                style={{
                  width: 22,
                  height: 22,
                  opacity: newPassword ? 1 : 0.6,
                }}
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
            disabled={isLoading || !code}
            style={{
              width: "100%",
              background: isLoading || !code ? "#ccc" : "#009CB7",
              color: "#fff",
              fontWeight: 700,
              fontSize: 18,
              borderRadius: 15,
              border: "none",
              padding: "16px 0",
              marginBottom: 18,
              cursor: isLoading || !code ? "not-allowed" : "pointer",
              opacity: isLoading || !code ? 0.7 : 1,
            }}
          >
            {isLoading ? "Réinitialisation en cours..." : "Réinitialiser"}
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
    </>
  );
};

export default ResetPasswordPage;
