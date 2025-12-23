import React, { useState } from "react";
import { toast } from "react-toastify";
import NavBar from "../components/NavBar";
import { apiClient } from "../services/api";

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

interface ForgotPasswordPageProps {
  onBack?: () => void;
  onSubmit?: () => void;
}

const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onBack, onSubmit }) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Veuillez entrer votre email");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error("Veuillez entrer un email valide");
      return;
    }

    setIsLoading(true);

    try {
      await apiClient.forgotPassword(email.trim());
      setEmailSent(true);
      toast.success("Un lien de réinitialisation a été envoyé à votre email");
    } catch (error: any) {
      console.error("Error sending password reset email:", error);
      toast.error(error?.message || "Erreur lors de l'envoi de l'email");
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
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
          <NavBar title="Email envoyé" onBack={onBack} />
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
            Email Envoyé !
          </div>
          <div
            style={{
              fontSize: 16,
              color: "#222",
              marginBottom: 32,
              textAlign: "center",
              maxWidth: 340,
              padding: "0 20px",
              fontFamily: "Arial, sans-serif",
              lineHeight: 1.5,
            }}
          >
            Un lien de réinitialisation de mot de passe a été envoyé à
            <br />
            <strong>{email}</strong>
            <br />
            <br />
            Vérifiez votre boîte mail et suivez les instructions pour réinitialiser votre mot de passe.
          </div>
          <button
            onClick={onSubmit}
            style={{
              width: "90vw",
              maxWidth: 340,
              background: "#009CB7",
              color: "#fff",
              fontWeight: 700,
              fontSize: 18,
              borderRadius: 15,
              border: "none",
              padding: "16px 0",
              marginTop: 20,
              cursor: "pointer",
            }}
          >
            Entrer le code
          </button>
          <div style={{ marginTop: 18, fontSize: 15, color: "#b0b0b0" }}>
            <span
              onClick={onBack}
              style={{
                color: "#009CB7",
                fontWeight: 600,
                textDecoration: "none",
                cursor: "pointer",
              }}
            >
              Retour à la connexion
            </span>
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
          paddingTop: 64,
        }}
      >
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
          Mot de passe oublié?
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
          Entrez votre email pour recevoir
          <br />
          un lien de réinitialisation
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
            disabled={isLoading}
            style={{
              width: "100%",
              background: isLoading ? "#ccc" : "#009CB7",
              color: "#fff",
              fontWeight: 700,
              fontSize: 18,
              borderRadius: 15,
              border: "none",
              padding: "16px 0",
              marginTop: 18,
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? "Envoi en cours..." : "Envoyer le lien"}
          </button>
        </form>
        <div style={{ marginTop: 18, fontSize: 15, color: "#b0b0b0" }}>
          <span
            onClick={onBack}
            style={{
              color: "#009CB7",
              fontWeight: 600,
              textDecoration: "none",
              cursor: "pointer",
            }}
          >
            Retour à la connexion
          </span>
        </div>
      </div>
    </>
  );
};

export default ForgotPasswordPage;
