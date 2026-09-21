import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../services/api";
import { Button } from "../components/ui";
import "./Auth.css";

const emailIcon = "/icons/Email.svg";
const checkIcon = "/icons/Check.svg";

const RESEND_COOLDOWN_S = 60;

interface EmailVerificationPageProps {
  email: string;
  onVerified: () => void;
}

const steps = [
  "Ouvrez votre boîte email.",
  "Cliquez sur le lien de vérification.",
  "Vous reviendrez automatiquement dans l'application.",
];

const EmailVerificationPage: React.FC<EmailVerificationPageProps> = ({
  email,
  onVerified,
}) => {
  const { updateUserData, login, userData } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isChecking, setIsChecking] = useState(false);

  const checkVerification = useCallback(async () => {
    if (isChecking) return;
    setIsChecking(true);

    try {
      // Without stored credentials we can only read the current profile.
      if (!userData?.email || !userData?.password) {
        const currentUser = await apiClient.getCurrentUser();

        if (currentUser?.email_verified) {
          updateUserData({ email_verified: true });
          toast.success("Email vérifié avec succès !");
          onVerified();
        } else {
          toast.info(
            "Pas encore vérifié. Ouvrez le lien envoyé à votre adresse."
          );
        }
        return;
      }

      const loginResult = await login({
        email: userData.email,
        password: userData.password,
      });

      if (loginResult?.email_verified) {
        updateUserData({ password: undefined });
        toast.success("Email vérifié. Connexion en cours…");
        onVerified();
      } else {
        toast.info("Pas encore vérifié. Ouvrez le lien envoyé à votre adresse.");
      }
    } catch (error: any) {
      const detail = error?.message || error?.response?.detail || "";
      if (detail.includes("not activated")) {
        toast.error(
          "Pas encore vérifié. Ouvrez le lien envoyé à votre adresse."
        );
      } else {
        toast.error(detail || "Vérification impossible pour le moment.");
      }
    } finally {
      setIsChecking(false);
    }
  }, [isChecking, userData, login, updateUserData, onVerified]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleResendVerification = async () => {
    if (isResending || resendCooldown > 0) return;

    setIsResending(true);
    try {
      await apiClient.resendVerificationEmail(email);
      toast.success("Email de vérification renvoyé !");
      setResendCooldown(RESEND_COOLDOWN_S);
    } catch {
      toast.error("Envoi impossible. Réessayez dans un instant.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="auth-screen fade-in-page">
      <div className="auth-body">
        <div className="auth-heading auth-heading--center">
          <div className="auth-plate" style={{ width: 96, height: 96 }}>
            <img src={emailIcon} alt="" style={{ width: 42, height: 42 }} />
          </div>
          <h1 className="auth-heading__title">Vérifiez votre email</h1>
          <p className="auth-heading__text">
            Nous avons envoyé un lien de vérification à <strong>{email}</strong>.
          </p>
        </div>

        <ol className="verify-steps">
          {steps.map((step, index) => (
            <li key={step} className="verify-step">
              <span className="verify-step__num">{index + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>

        <p className="verify-tip">
          Rien reçu ? Regardez aussi dans vos courriers indésirables.
        </p>

        <div className="af-stack af-stack--tight" style={{ marginTop: "var(--space-9)" }}>
          <Button
            size="lg"
            block
            loading={isChecking}
            loadingLabel="Vérification…"
            onClick={checkVerification}
            iconStart={<img src={checkIcon} alt="" />}
          >
            J&apos;ai vérifié mon email
          </Button>

          <Button
            variant="outline"
            size="lg"
            block
            disabled={resendCooldown > 0}
            loading={isResending}
            loadingLabel="Envoi…"
            onClick={handleResendVerification}
          >
            {resendCooldown > 0
              ? `Renvoyer dans ${resendCooldown}s`
              : "Renvoyer l'email"}
          </Button>
        </div>

        <p className="auth-footer auth-footer__spacer">
          Toujours rien ? Vérifiez votre adresse ou contactez le support.
        </p>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
