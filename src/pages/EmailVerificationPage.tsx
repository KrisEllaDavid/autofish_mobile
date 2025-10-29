import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../services/api";

const emailIcon = "/icons/Email.svg";
const checkIcon = "/icons/Check.svg";

interface EmailVerificationPageProps {
  email: string;
  onVerified: () => void;
}

const EmailVerificationPage: React.FC<EmailVerificationPageProps> = ({
  email,
  onVerified,
}) => {
  const { updateUserData } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isChecking, setIsChecking] = useState(false);

  // Check verification status only when user manually clicks
  const checkVerification = async () => {
    if (isChecking) return;

    setIsChecking(true);
    try {
      // Check if the user is now verified by trying to get current user
      const currentUser = await apiClient.getCurrentUser();
      if (currentUser && currentUser.email_verified) {
        updateUserData({ email_verified: true });
        toast.success("Email vérifié avec succès !");
        onVerified();
        return;
      } else {
        toast.info("Email pas encore vérifié. Veuillez cliquer sur le lien dans votre email.");
      }
    } catch (error) {
      toast.error("Erreur lors de la vérification. Veuillez réessayer.");
    } finally {
      setIsChecking(false);
    }
  };

  // Countdown for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResendVerification = async () => {
    if (isResending || resendCooldown > 0) return;

    try {
      setIsResending(true);
      await apiClient.resendVerificationEmail(email);
      toast.success("Email de vérification renvoyé !");
      setResendCooldown(60); // 60 second cooldown
    } catch (error) {
      toast.error("Erreur lors de l'envoi de l'email de vérification");
    } finally {
      setIsResending(false);
    }
  };

  const handleCheckAgain = () => {
    // Manual check
    checkVerification();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "90vw",
          maxWidth: 400,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Email Icon */}
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "#f0f9ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 32,
            border: "2px solid #00B2D6",
          }}
        >
          <img
            src={emailIcon}
            alt="email"
            style={{
              width: 60,
              height: 60,
              opacity: 0.8,
            }}
          />
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#222",
            marginBottom: 16,
            lineHeight: 1.2,
          }}
        >
          Vérifiez votre email
        </h1>

        {/* Description */}
        <p
          style={{
            fontSize: 16,
            color: "#666",
            lineHeight: 1.5,
            marginBottom: 8,
          }}
        >
          Nous avons envoyé un lien de vérification à :
        </p>

        <div
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: "#00B2D6",
            marginBottom: 32,
            padding: "12px 20px",
            background: "#f0f9ff",
            borderRadius: 12,
            border: "1px solid #e0f2fe",
            wordBreak: "break-word",
          }}
        >
          {email}
        </div>

        {/* Instructions */}
        <div
          style={{
            background: "#f8f9fa",
            border: "1px solid #e9ecef",
            borderRadius: 12,
            padding: "20px",
            marginBottom: 32,
            textAlign: "left",
          }}
        >
          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#495057",
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            📝 Instructions
          </div>

          <div style={{ fontSize: 14, color: "#6c757d", lineHeight: 1.5 }}>
            <div style={{ marginBottom: 8, display: "flex", alignItems: "flex-start" }}>
              <span style={{ marginRight: 8, fontWeight: 600 }}>1.</span>
              <span>Ouvrez votre boîte email</span>
            </div>
            <div style={{ marginBottom: 8, display: "flex", alignItems: "flex-start" }}>
              <span style={{ marginRight: 8, fontWeight: 600 }}>2.</span>
              <span>Cliquez sur le lien de vérification</span>
            </div>
            <div style={{ marginBottom: 8, display: "flex", alignItems: "flex-start" }}>
              <span style={{ marginRight: 8, fontWeight: 600 }}>3.</span>
              <span>Vous serez automatiquement redirigé vers l'application</span>
            </div>
          </div>

          <div
            style={{
              fontSize: 12,
              color: "#868e96",
              marginTop: 12,
              textAlign: "center",
              fontStyle: "italic",
            }}
          >
            💡 Vérifiez aussi votre dossier spam/courrier indésirable
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ width: "100%" }}>
          {/* Check Again Button */}
          <button
            onClick={handleCheckAgain}
            disabled={isChecking}
            style={{
              width: "100%",
              background: "#00B2D6",
              color: "#fff",
              fontWeight: 600,
              fontSize: 16,
              borderRadius: 12,
              border: "none",
              padding: "16px 0",
              marginBottom: 16,
              cursor: isChecking ? "not-allowed" : "pointer",
              opacity: isChecking ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {isChecking ? (
              <>
                <div
                  style={{
                    width: "16px",
                    height: "16px",
                    border: "2px solid #ffffff40",
                    borderTop: "2px solid #ffffff",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                />
                Vérification...
              </>
            ) : (
              <>
                <img src={checkIcon} alt="check" style={{ width: 18, height: 18 }} />
                J'ai vérifié mon email
              </>
            )}
          </button>

          {/* Resend Button */}
          <button
            onClick={handleResendVerification}
            disabled={isResending || resendCooldown > 0}
            style={{
              width: "100%",
              background: resendCooldown > 0 ? "#f5f5f5" : "#fff",
              color: resendCooldown > 0 ? "#999" : "#00B2D6",
              fontWeight: 600,
              fontSize: 16,
              borderRadius: 12,
              border: "2px solid #00B2D6",
              padding: "16px 0",
              cursor: isResending || resendCooldown > 0 ? "not-allowed" : "pointer",
              opacity: isResending || resendCooldown > 0 ? 0.7 : 1,
            }}
          >
            {isResending
              ? "Envoi en cours..."
              : resendCooldown > 0
                ? `Renvoyer dans ${resendCooldown}s`
                : "Renvoyer l'email"
            }
          </button>
        </div>

        {/* Help Text */}
        <div
          style={{
            fontSize: 14,
            color: "#999",
            marginTop: 24,
            lineHeight: 1.4,
          }}
        >
          Vous ne recevez pas l'email ? Vérifiez votre adresse email ou contactez le support.
        </div>
      </div>

      {/* Spinner Animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default EmailVerificationPage;