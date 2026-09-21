import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import NavBar from "../components/NavBar";
import { Banner, Button, PasswordField, TextField } from "../components/ui";
import { apiClient } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

const autofishBlueLogo = "/icons/autofish_blue_logo.svg";
const lockIcon = "/icons/Password.svg";
const lockIconBlue = "/icons/Password_blue.svg";

const MIN_LENGTH = 8;
const REDIRECT_DELAY_MS = 8000;

const CheckIcon: React.FC = () => (
  <svg
    viewBox="0 0 16 16"
    width="10"
    height="10"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3 8.5l3.2 3.2L13 5" />
  </svg>
);

const ShieldIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="var(--brand-700)"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 3l7 3v5.5c0 4.3-2.9 8.2-7 9.5-4.1-1.3-7-5.2-7-9.5V6z" />
    <path d="m8.8 12.2 2.2 2.2 4.2-4.6" />
  </svg>
);

/** Rules shown live under the password field: guidance while typing beats an
 *  error toast after submitting. */
const rules = [
  {
    id: "length",
    label: `Au moins ${MIN_LENGTH} caractères`,
    test: (v: string) => v.length >= MIN_LENGTH,
  },
  {
    id: "letter",
    label: "Une lettre",
    test: (v: string) => /[a-zA-Z]/.test(v),
  },
  {
    id: "digit",
    label: "Un chiffre",
    test: (v: string) => /\d/.test(v),
  },
];

const ResetPasswordPage: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { logout } = useAuth();

  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);

  const met = rules.map((rule) => rule.test(newPassword));
  const metCount = met.filter(Boolean).length;
  const strength =
    newPassword.length === 0
      ? null
      : metCount <= 1
      ? "weak"
      : metCount === 2
      ? "fair"
      : "strong";
  const strengthLabel =
    strength === "weak"
      ? "Mot de passe faible"
      : strength === "fair"
      ? "Mot de passe moyen"
      : strength === "strong"
      ? "Mot de passe solide"
      : "";

  const passwordsMatch =
    newPassword.length > 0 && newPassword === confirmPassword;
  const confirmError =
    confirmPassword.length > 0 && !passwordsMatch
      ? "Les deux mots de passe sont différents."
      : "";

  const canSubmit =
    code.trim().length > 0 && metCount === rules.length && passwordsMatch;

  // Sign out and return to login once the confirmation has been on screen
  // long enough to read.
  useEffect(() => {
    if (!resetComplete) return;

    const timer = setTimeout(async () => {
      try {
        await logout();
      } catch {
        // The user may not have been signed in; nothing to undo.
      }
      onBack?.();
    }, REDIRECT_DELAY_MS);

    return () => clearTimeout(timer);
  }, [resetComplete, logout, onBack]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsLoading(true);
    try {
      await apiClient.resetPassword(code.trim(), newPassword, confirmPassword);
      setResetComplete(true);
    } catch (error: any) {
      toast.error(
        error?.message ||
          "Réinitialisation impossible. Vérifiez le code et réessayez."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (resetComplete) {
    return (
      <div className="auth-screen fade-in-page">
        <NavBar title="Mot de passe modifié" onBack={onBack} />

        <div className="auth-body">
          <div className="auth-heading auth-heading--center">
            <div className="auth-plate">
              <ShieldIcon />
            </div>
            <h1 className="auth-heading__title">Mot de passe réinitialisé</h1>
            <p className="auth-heading__text">
              Vous pouvez maintenant vous connecter avec votre nouveau mot de
              passe.
            </p>
          </div>

          <Banner tone="info">
            Pour votre sécurité, votre session actuelle va se fermer et vous
            serez redirigé vers la page de connexion.
          </Banner>

          <div style={{ marginTop: "var(--space-8)" }}>
            <Button variant="outline" size="lg" block onClick={onBack}>
              Aller à la connexion
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-screen fade-in-page">
      <NavBar title="Nouveau mot de passe" onBack={onBack} />

      <div className="auth-body">
        <div className="auth-brand">
          <img src={autofishBlueLogo} alt="" className="auth-brand__logo" />
          <h1 className="auth-brand__name">Autofish Store</h1>
          <p className="auth-brand__tagline">
            Saisissez le code reçu par email, puis choisissez votre nouveau mot
            de passe.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <TextField
            label="Code de réinitialisation"
            inputMode="text"
            autoComplete="one-time-code"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="next"
            placeholder="Collez le code reçu"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            iconStart={<img src={code ? lockIconBlue : lockIcon} alt="" />}
          />

          <div className="af-stack af-stack--tight">
            <PasswordField
              label="Nouveau mot de passe"
              autoComplete="new-password"
              enterKeyHint="next"
              placeholder="Au moins 8 caractères"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              iconStart={
                <img src={newPassword ? lockIconBlue : lockIcon} alt="" />
              }
            />

            {newPassword.length > 0 && (
              <div className="auth-strength">
                <div className="auth-strength__track" aria-hidden="true">
                  {rules.map((rule, index) => (
                    <span
                      key={rule.id}
                      className="auth-strength__seg"
                      data-on={index < metCount ? strength : undefined}
                    />
                  ))}
                </div>
                <span className="auth-strength__label">{strengthLabel}</span>
              </div>
            )}

            <ul className="auth-rules">
              {rules.map((rule, index) => (
                <li
                  key={rule.id}
                  className="auth-rule"
                  data-met={met[index] ? "true" : "false"}
                >
                  <span className="auth-rule__mark">
                    <CheckIcon />
                  </span>
                  {rule.label}
                </li>
              ))}
            </ul>
          </div>

          <PasswordField
            label="Confirmez le mot de passe"
            autoComplete="new-password"
            enterKeyHint="go"
            placeholder="Retapez le mot de passe"
            value={confirmPassword}
            error={confirmError}
            valid={passwordsMatch}
            hint={passwordsMatch ? "Les mots de passe correspondent." : undefined}
            onChange={(e) => setConfirmPassword(e.target.value)}
            iconStart={
              <img src={confirmPassword ? lockIconBlue : lockIcon} alt="" />
            }
          />

          <Button
            type="submit"
            size="lg"
            block
            disabled={!canSubmit}
            loading={isLoading}
            loadingLabel="Réinitialisation…"
            className="auth-form__submit"
          >
            Réinitialiser le mot de passe
          </Button>

          <Button variant="ghost" size="lg" block onClick={onBack}>
            Retour à la connexion
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
