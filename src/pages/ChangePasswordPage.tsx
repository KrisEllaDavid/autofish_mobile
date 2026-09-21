import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import NavBar from "../components/NavBar";
import { apiClient } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Banner, Button, PasswordField } from "../components/ui";
import "./Auth.css";

const lockIcon = "/icons/Password.svg";
const lockIconBlue = "/icons/Password_blue.svg";

const MIN_LENGTH = 8;
const LOGOUT_DELAY_MS = 6000;

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

const rules = [
  {
    id: "length",
    label: `Au moins ${MIN_LENGTH} caractères`,
    test: (v: string) => v.length >= MIN_LENGTH,
  },
  { id: "letter", label: "Une lettre", test: (v: string) => /[a-zA-Z]/.test(v) },
  { id: "digit", label: "Un chiffre", test: (v: string) => /\d/.test(v) },
];

interface ChangePasswordPageProps {
  onBack?: () => void;
}

const ChangePasswordPage: React.FC<ChangePasswordPageProps> = ({ onBack }) => {
  const { logout } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [changeComplete, setChangeComplete] = useState(false);

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
  const isSameAsCurrent =
    newPassword.length > 0 && currentPassword === newPassword;

  const confirmError =
    confirmPassword.length > 0 && !passwordsMatch
      ? "Les deux mots de passe sont différents."
      : "";
  const newError = isSameAsCurrent
    ? "Choisissez un mot de passe différent de l'actuel."
    : "";

  const canSubmit =
    currentPassword.trim().length > 0 &&
    metCount === rules.length &&
    passwordsMatch &&
    !isSameAsCurrent;

  // Sign out once the confirmation has been readable for a moment.
  useEffect(() => {
    if (!changeComplete) return;
    const timer = setTimeout(() => logout(), LOGOUT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [changeComplete, logout]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsLoading(true);
    try {
      await apiClient.changePassword(
        currentPassword,
        newPassword,
        confirmPassword
      );
      setChangeComplete(true);
    } catch (error: any) {
      toast.error(
        error?.message ||
          "Le mot de passe n'a pas pu être modifié. Vérifiez votre mot de passe actuel."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (changeComplete) {
    return (
      <div className="auth-screen fade-in-page">
        <NavBar title="Mot de passe modifié" onBack={onBack} />

        <div className="auth-body">
          <div className="auth-heading auth-heading--center">
            <div className="auth-plate">
              <ShieldIcon />
            </div>
            <h1 className="auth-heading__title">Mot de passe modifié</h1>
            <p className="auth-heading__text">
              Votre nouveau mot de passe est actif.
            </p>
          </div>

          <Banner tone="info">
            Pour votre sécurité, votre session va se fermer. Reconnectez-vous
            avec votre nouveau mot de passe.
          </Banner>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-screen fade-in-page">
      <NavBar title="Modifier le mot de passe" onBack={onBack} />

      <div className="auth-body">
        <div className="auth-heading">
          <h1 className="auth-heading__title">Nouveau mot de passe</h1>
          <p className="auth-heading__text">
            Confirmez votre mot de passe actuel, puis choisissez-en un nouveau.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <PasswordField
            label="Mot de passe actuel"
            autoComplete="current-password"
            enterKeyHint="next"
            placeholder="Votre mot de passe actuel"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            iconStart={
              <img src={currentPassword ? lockIconBlue : lockIcon} alt="" />
            }
          />

          <div className="af-stack af-stack--tight">
            <PasswordField
              label="Nouveau mot de passe"
              autoComplete="new-password"
              enterKeyHint="next"
              placeholder="Au moins 8 caractères"
              value={newPassword}
              error={newError}
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
            label="Confirmez le nouveau mot de passe"
            autoComplete="new-password"
            enterKeyHint="go"
            placeholder="Retapez le mot de passe"
            value={confirmPassword}
            error={confirmError}
            valid={passwordsMatch}
            hint={
              passwordsMatch ? "Les mots de passe correspondent." : undefined
            }
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
            loadingLabel="Modification…"
            className="auth-form__submit"
          >
            Modifier le mot de passe
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
