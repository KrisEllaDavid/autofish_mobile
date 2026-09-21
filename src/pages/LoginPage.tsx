import React, { useState } from "react";
import { toast } from "react-toastify";
import NavBar from "../components/NavBar";
import { Button, Checkbox, PasswordField, TextField } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import HomePage from "./HomePage";
import "./Auth.css";

const autofishBlueLogo = "/icons/autofish_blue_logo.svg";
const emailIcon = "/icons/Email.svg";
const emailIconBlue = "/icons/Email_blue.svg";
const passwordIcon = "/icons/Password.svg";
const passwordIconBlue = "/icons/Password_blue.svg";

interface LoginPageProps {
  onForgotPassword?: () => void;
  onSignup?: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({
  onForgotPassword,
  onSignup,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [touched, setTouched] = useState(false);
  const [showHomePage, setShowHomePage] = useState(false);

  const { login, isLoading, error, clearError, isAuthenticated } = useAuth();

  // Errors appear only after a submit attempt, so the form is not red while
  // the user is still filling it in.
  const emailError = touched && !email.trim() ? "Entrez votre email." : "";
  const passwordError =
    touched && !password.trim() ? "Entrez votre mot de passe." : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    clearError();

    if (!email.trim() || !password.trim()) return;

    try {
      const loginResult = await login({
        email: email.trim(),
        password,
        remember_me: rememberMe,
      });

      toast.success("Connexion réussie !");

      if (loginResult?.status_message) {
        setTimeout(() => {
          toast.info(loginResult.status_message, { autoClose: 8000 });
        }, 1000);
      }

      setShowHomePage(true);
    } catch {
      toast.error(error || "Connexion impossible. Vérifiez vos identifiants.");
    }
  };

  if (isAuthenticated || showHomePage) return <HomePage />;

  return (
    <div className="auth-screen fade-in-page">
      <NavBar title="Connexion" />

      <div className="auth-body">
        <div className="auth-brand">
          <img src={autofishBlueLogo} alt="" className="auth-brand__logo" />
          <h1 className="auth-brand__name">Autofish Store</h1>
          <p className="auth-brand__tagline">
            Bienvenue ! Entrez vos identifiants pour vous connecter.
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
            enterKeyHint="next"
            placeholder="vous@exemple.com"
            value={email}
            error={emailError}
            onChange={(e) => setEmail(e.target.value)}
            iconStart={
              <img src={email ? emailIconBlue : emailIcon} alt="" />
            }
          />

          <PasswordField
            label="Mot de passe"
            autoComplete="current-password"
            enterKeyHint="go"
            placeholder="Votre mot de passe"
            value={password}
            error={passwordError}
            onChange={(e) => setPassword(e.target.value)}
            iconStart={
              <img src={password ? passwordIconBlue : passwordIcon} alt="" />
            }
          />

          <div className="auth-form__row">
            <Checkbox
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              label="Rester connecté"
            />
            <button
              type="button"
              className="af-link"
              onClick={onForgotPassword}
            >
              Mot de passe oublié ?
            </button>
          </div>

          <Button
            type="submit"
            size="lg"
            block
            loading={isLoading}
            loadingLabel="Connexion…"
            className="auth-form__submit"
          >
            Se connecter
          </Button>
        </form>

        <p className="auth-footer auth-footer__spacer">
          Pas encore de compte ?{" "}
          <button type="button" className="af-link" onClick={onSignup}>
            Créer un compte
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
