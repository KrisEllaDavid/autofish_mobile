import React, { useState } from "react";
import { toast } from "react-toastify";
import NavBar from "../components/NavBar";
import { Button, TextField } from "../components/ui";
import { apiClient } from "../services/api";
import "./Auth.css";

const autofishBlueLogo = "/icons/autofish_blue_logo.svg";
const emailIcon = "/icons/Email.svg";
const emailIconBlue = "/icons/Email_blue.svg";

interface ForgotPasswordPageProps {
  onBack?: () => void;
  onSubmit?: () => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MailSentIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="var(--brand-700)"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h13A2.5 2.5 0 0 1 21 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 16.5z" />
    <path d="m3.6 7 7.3 5.2a2 2 0 0 0 2.2 0L20.4 7" />
  </svg>
);

const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({
  onBack,
  onSubmit,
}) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [fieldError, setFieldError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const value = email.trim();
    if (!value) {
      setFieldError("Entrez votre email.");
      return;
    }
    if (!EMAIL_RE.test(value)) {
      setFieldError("Cet email ne semble pas valide.");
      return;
    }

    setFieldError("");
    setIsLoading(true);

    try {
      await apiClient.forgotPassword(value);
      setEmailSent(true);
    } catch (error: any) {
      toast.error(
        error?.message || "Envoi impossible. Réessayez dans un instant."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="auth-screen fade-in-page">
        <NavBar title="Email envoyé" onBack={onBack} />

        <div className="auth-body">
          <div className="auth-heading auth-heading--center">
            <div className="auth-plate">
              <MailSentIcon />
            </div>
            <h1 className="auth-heading__title">Vérifiez votre boîte mail</h1>
            <p className="auth-heading__text">
              Un lien de réinitialisation vient d&apos;être envoyé à{" "}
              <strong>{email}</strong>. Suivez les instructions du message pour
              choisir un nouveau mot de passe.
            </p>
          </div>

          <Button size="lg" block onClick={onSubmit}>
            Entrer le code
          </Button>

          <p className="auth-footer auth-footer__spacer">
            <button type="button" className="af-link" onClick={onBack}>
              Retour à la connexion
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-screen fade-in-page">
      <NavBar title="Mot de passe oublié" onBack={onBack} />

      <div className="auth-body">
        <div className="auth-brand">
          <img src={autofishBlueLogo} alt="" className="auth-brand__logo" />
          <h1 className="auth-brand__name">Mot de passe oublié ?</h1>
          <p className="auth-brand__tagline">
            Entrez votre email et nous vous enverrons un lien pour le
            réinitialiser.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <TextField
            label="Email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect="off"
            enterKeyHint="send"
            placeholder="vous@exemple.com"
            value={email}
            error={fieldError}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldError) setFieldError("");
            }}
            iconStart={<img src={email ? emailIconBlue : emailIcon} alt="" />}
          />

          <Button
            type="submit"
            size="lg"
            block
            loading={isLoading}
            loadingLabel="Envoi…"
            className="auth-form__submit"
          >
            Envoyer le lien
          </Button>
        </form>

        <p className="auth-footer auth-footer__spacer">
          <button type="button" className="af-link" onClick={onBack}>
            Retour à la connexion
          </button>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
