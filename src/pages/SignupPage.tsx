import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import NavBar from "../components/NavBar";
import UnifiedDropdown from "../components/UnifiedDropdown";
import IDVerificationPage from "./IDVerificationPage";
import CategoriesPage from "./CategoriesPage/CategoriesPage";
import TermsOfUsePage from "./TermsOfUsePage";
import { Banner, Button, PasswordField, TextField } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { compressImage, validateImage } from "../utils/imageCompression";
import {
  validateCity,
  validateCountry,
  validateEmail,
  validateName,
  validatePassword,
  validatePasswordConfirmation,
  validatePhone,
} from "../utils/formValidation";
import "./Auth.css";

const userIcon = "/icons/account.svg";
const cameraIcon = "/icons/camera_icon.svg";
const emailIcon = "/icons/Email.svg";
const emailIconBlue = "/icons/Email_blue.svg";
const passwordIcon = "/icons/Password.svg";
const passwordIconBlue = "/icons/Password_blue.svg";
const googleIcon = "/icons/Google_icon.svg";
const userOutline = "/icons/User-Outline.svg";
const userOutlineBlue = "/icons/User-Outline_blue.svg";

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password2: string;
  phone: string;
  city: string;
  country: string;
  user_type: "producer" | "consumer";
  profile_picture: File | null;
}

const countryOptions = [
  { value: "Cameroun", label: "Cameroun" },
  { value: "République du Congo", label: "République du Congo" },
];

const codeOptions = [
  { value: "+237", label: "+237" },
  { value: "+242", label: "+242" },
];

const REQUIRED_FIELDS = [
  "first_name",
  "last_name",
  "email",
  "phone",
  "city",
  "country",
  "password",
  "password2",
] as const;

const SignupPage: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { updateUserData } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    password2: "",
    phone: "",
    city: "",
    country: "",
    user_type: "consumer",
    profile_picture: null,
  });

  const [countryCode, setCountryCode] = useState("+237");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [goToIDVerification, setGoToIDVerification] = useState(false);
  const [goToCategories, setGoToCategories] = useState(false);
  const [showTermsPage, setShowTermsPage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Object URLs for the avatar preview are revoked on replace and unmount;
  // the old code created one per render and leaked every single one.
  useEffect(() => {
    if (!formData.profile_picture) {
      setAvatarPreview(null);
      return;
    }
    const url = URL.createObjectURL(formData.profile_picture);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [formData.profile_picture]);

  const validateFieldValue = (field: string, value: string): string => {
    switch (field) {
      case "first_name":
        return validateName(value, "Prénom").error || "";
      case "last_name":
        return validateName(value, "Nom").error || "";
      case "email":
        return validateEmail(value).error || "";
      case "phone":
        return validatePhone(value).error || "";
      case "city":
        return validateCity(value).error || "";
      case "password":
        return validatePassword(value).error || "";
      case "password2":
        return (
          validatePasswordConfirmation(formData.password, value).error || ""
        );
      case "country":
        return validateCountry(value).error || "";
      default:
        return "";
    }
  };

  /** Shows a field error only once that field has been left or the form
   *  submitted, so the page is not red while the user is still typing. */
  const errorFor = (field: string) =>
    touched[field] || submitted ? errors[field] || "" : "";

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clearing as the user corrects means the error goes away on the
    // keystroke that fixes it, not on the next blur.
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const error = validateFieldValue(field, value);
      if (error) return prev;
      const { [field]: _removed, ...rest } = prev;
      return rest;
    });
  };

  const handleBlur = (field: keyof FormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateFieldValue(field, String(formData[field] ?? ""));
    setErrors((prev) => {
      if (error) return { ...prev, [field]: error };
      const { [field]: _removed, ...rest } = prev;
      return rest;
    });
  };

  const completion = useMemo(() => {
    const filled = REQUIRED_FIELDS.filter((field) =>
      String(formData[field] ?? "").trim()
    ).length;
    return Math.round(((filled + (acceptTerms ? 1 : 0)) / 9) * 100);
  }, [formData, acceptTerms]);

  const handleAvatarChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file?.type.startsWith("image")) return;

    try {
      validateImage(file);
      const compressed = await compressImage(file, {
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.8,
      });

      setFormData((prev) => ({ ...prev, profile_picture: compressed }));

      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(compressed);
      });
      updateUserData({ avatar: dataUrl, profile_picture: compressed });
    } catch {
      toast.error("Cette image n'a pas pu être traitée. Essayez-en une autre.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    const nextErrors: Record<string, string> = {};
    REQUIRED_FIELDS.forEach((field) => {
      const error = validateFieldValue(field, String(formData[field] ?? ""));
      if (error) nextErrors[field] = error;
    });
    if (!acceptTerms) {
      nextErrors.terms = "Acceptez les conditions d'utilisation pour continuer.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      // Move focus to the first problem rather than only announcing it.
      const firstField = REQUIRED_FIELDS.find((f) => nextErrors[f]);
      if (firstField) {
        document
          .querySelector<HTMLElement>(`[name="${firstField}"]`)
          ?.focus({ preventScroll: false });
      }
      return;
    }

    updateUserData({
      first_name: formData.first_name,
      last_name: formData.last_name,
      name: `${formData.first_name} ${formData.last_name}`.trim(),
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      city: formData.city,
      country: formData.country,
      code: countryCode,
      userRole:
        formData.user_type === "producer"
          ? ("producteur" as const)
          : ("client" as const),
      terms_accepted: acceptTerms,
      address: formData.user_type === "consumer" ? formData.city : "",
      profile_picture: formData.profile_picture,
    } as any);

    if (formData.user_type === "producer") setGoToIDVerification(true);
    else setGoToCategories(true);
  };

  if (showTermsPage) {
    return <TermsOfUsePage onBack={() => setShowTermsPage(false)} />;
  }

  if (goToIDVerification) {
    return (
      <IDVerificationPage
        onBack={() => setGoToIDVerification(false)}
        profileType="producer"
      />
    );
  }

  if (goToCategories) {
    return (
      <CategoriesPage
        onBack={() => setGoToCategories(false)}
        profileType="client"
      />
    );
  }

  const nextStepText =
    formData.user_type === "producer"
      ? "Vérification d'identité, catégories, puis création de votre page."
      : "Sélection de vos catégories préférées.";

  return (
    <div className="auth-screen fade-in-page">
      <NavBar title="Inscription" onBack={onBack} />

      <div className="auth-body">
        <div className="af-progress" style={{ marginBottom: "var(--space-9)" }}>
          <div className="af-progress__label">
            <span className="af-progress__step">Informations de base</span>
            <span className="af-progress__count">Étape 1 sur 3</span>
          </div>
          <div
            className="af-progress__track"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={completion}
            aria-label="Progression du formulaire"
          >
            <div
              className="af-progress__fill"
              style={
                { "--fill": Math.max(completion, 4) / 100 } as React.CSSProperties
              }
            />
          </div>
        </div>

        <div style={{ marginBottom: "var(--space-9)" }}>
          <label className="af-avatar-picker">
            <span className="af-avatar-picker__frame">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Votre photo de profil"
                  className="af-avatar-picker__photo"
                />
              ) : (
                <img
                  src={userIcon}
                  alt=""
                  aria-hidden="true"
                  className="af-avatar-picker__placeholder"
                />
              )}
            </span>
            <span className="af-avatar-picker__badge" aria-hidden="true">
              <img src={cameraIcon} alt="" />
            </span>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              aria-label="Choisir une photo de profil"
            />
          </label>
          <p className="af-avatar-picker__hint">
            Photo de profil — facultative
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <TextField
            name="first_name"
            label="Prénom"
            autoComplete="given-name"
            enterKeyHint="next"
            placeholder="Votre prénom"
            value={formData.first_name}
            error={errorFor("first_name")}
            onChange={(e) => handleChange("first_name", e.target.value)}
            onBlur={() => handleBlur("first_name")}
            iconStart={
              <img
                src={formData.first_name ? userOutlineBlue : userOutline}
                alt=""
              />
            }
          />

          <TextField
            name="last_name"
            label="Nom de famille"
            autoComplete="family-name"
            enterKeyHint="next"
            placeholder="Votre nom"
            value={formData.last_name}
            error={errorFor("last_name")}
            onChange={(e) => handleChange("last_name", e.target.value)}
            onBlur={() => handleBlur("last_name")}
            iconStart={
              <img
                src={formData.last_name ? userOutlineBlue : userOutline}
                alt=""
              />
            }
          />

          <TextField
            name="email"
            label="Email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect="off"
            enterKeyHint="next"
            placeholder="vous@exemple.com"
            value={formData.email}
            error={errorFor("email")}
            onChange={(e) => handleChange("email", e.target.value)}
            onBlur={() => handleBlur("email")}
            iconStart={
              <img src={formData.email ? emailIconBlue : emailIcon} alt="" />
            }
          />

          <div className="signup-phone">
            <UnifiedDropdown
              label="Indicatif"
              options={codeOptions}
              value={countryCode}
              onChange={setCountryCode}
              placeholder="+237"
            />
            <TextField
              name="phone"
              label="Téléphone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              enterKeyHint="next"
              placeholder="6 XX XX XX XX"
              value={formData.phone}
              error={errorFor("phone")}
              onChange={(e) => handleChange("phone", e.target.value)}
              onBlur={() => handleBlur("phone")}
            />
          </div>

          <TextField
            name="city"
            label="Ville ou quartier"
            autoComplete="address-level2"
            enterKeyHint="next"
            placeholder="Douala, Akwa…"
            value={formData.city}
            error={errorFor("city")}
            onChange={(e) => handleChange("city", e.target.value)}
            onBlur={() => handleBlur("city")}
            iconStart={
              <img src={formData.city ? userOutlineBlue : userOutline} alt="" />
            }
          />

          <UnifiedDropdown
            label="Pays"
            required
            options={countryOptions}
            value={formData.country}
            onChange={(value) => {
              handleChange("country", value);
              setTouched((prev) => ({ ...prev, country: true }));
            }}
            placeholder="Sélectionnez votre pays"
            error={errorFor("country")}
          />

          <PasswordField
            name="password"
            label="Mot de passe"
            autoComplete="new-password"
            enterKeyHint="next"
            placeholder="Au moins 8 caractères"
            value={formData.password}
            error={errorFor("password")}
            hint="Au moins 8 caractères, avec des lettres et des chiffres."
            onChange={(e) => handleChange("password", e.target.value)}
            onBlur={() => handleBlur("password")}
            iconStart={
              <img
                src={formData.password ? passwordIconBlue : passwordIcon}
                alt=""
              />
            }
          />

          <PasswordField
            name="password2"
            label="Confirmez le mot de passe"
            autoComplete="new-password"
            enterKeyHint="done"
            placeholder="Retapez le mot de passe"
            value={formData.password2}
            error={errorFor("password2")}
            valid={
              formData.password2.length > 0 &&
              formData.password === formData.password2
            }
            onChange={(e) => handleChange("password2", e.target.value)}
            onBlur={() => handleBlur("password2")}
            iconStart={
              <img
                src={formData.password2 ? passwordIconBlue : passwordIcon}
                alt=""
              />
            }
          />

          <fieldset className="signup-type">
            <legend className="af-field__label">Type de compte</legend>
            <div className="af-segmented">
              <button
                type="button"
                className="af-segmented__option"
                aria-pressed={formData.user_type === "consumer"}
                onClick={() =>
                  setFormData((prev) => ({ ...prev, user_type: "consumer" }))
                }
              >
                Client
              </button>
              <button
                type="button"
                className="af-segmented__option"
                aria-pressed={formData.user_type === "producer"}
                onClick={() =>
                  setFormData((prev) => ({ ...prev, user_type: "producer" }))
                }
              >
                Producteur
              </button>
            </div>
            <p className="signup-type__hint">
              {formData.user_type === "producer"
                ? "Vous vendez du poisson et publiez vos produits."
                : "Vous achetez du poisson auprès des producteurs."}
            </p>
          </fieldset>

          <label className="af-check signup-terms">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => {
                setAcceptTerms(e.target.checked);
                if (e.target.checked) {
                  setErrors(({ terms: _t, ...rest }) => rest);
                }
              }}
            />
            <span className="af-check__box" aria-hidden="true" />
            <span className="af-check__label">
              J&apos;accepte les{" "}
              <button
                type="button"
                className="af-link"
                onClick={(e) => {
                  e.preventDefault();
                  setShowTermsPage(true);
                }}
              >
                conditions d&apos;utilisation
              </button>{" "}
              et la politique de confidentialité d&apos;AutoFish Store.
            </span>
          </label>

          {submitted && errors.terms && (
            <p className="af-field__note af-field__note--error" role="alert">
              {errors.terms}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            block
            className="auth-form__submit"
          >
            Créer mon compte
          </Button>

          <div className="af-divider af-divider--labelled">ou</div>

          <Button
            variant="outline"
            size="lg"
            block
            iconStart={<img src={googleIcon} alt="" />}
          >
            Continuer avec Google
          </Button>
        </form>

        <Banner tone="info" style={{ marginTop: "var(--space-9)" }}>
          <span className="af-banner__title">Et ensuite ?</span>
          {nextStepText}
        </Banner>

        <p className="auth-footer auth-footer__spacer">
          Vous avez déjà un compte ?{" "}
          <button type="button" className="af-link" onClick={onBack}>
            Se connecter
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
