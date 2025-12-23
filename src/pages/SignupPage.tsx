import React, { useState } from "react";
import { toast } from "react-toastify";
import NavBar from "../components/NavBar";
import UnifiedDropdown from "../components/UnifiedDropdown";
import "./CategoriesPage/CategoriesPage.css";
// Modal removed from this page to simplify flow
// ContactInfoPage removed from flow; collect all required client fields here
import IDVerificationPage from "./IDVerificationPage";
import CategoriesPage from "./CategoriesPage/CategoriesPage";
import TermsOfUsePage from "./TermsOfUsePage";
import { useAuth } from "../context/AuthContext";
import { compressImage, validateImage } from "../utils/imageCompression";
const userIcon = "/icons/account.svg";
const cameraIcon = "/icons/camera_icon.svg";
const emailIcon = "/icons/Email.svg";
const passwordIcon = "/icons/Password.svg";
const eyeIcon = "/icons/Eye Slash.svg";
const eyeOpenIcon = "/icons/Eye Open.svg";
const googleIcon = "/icons/Google_icon.svg";
const userUserOutlineBlue = "/icons/User-Outline_blue.svg";
const userUserOutline = "/icons/User-Outline.svg";
const emailIconBlue = "/icons/Email_blue.svg";
const passwordIconBlue = "/icons/Password_blue.svg";
const checkIcon = "/icons/Check.svg";
const checkboxIcon = "/icons/Checkbox.svg";
// const bravoCheckIcon = "/icons/Check.svg";
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
interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password2: string;
  phone: string;
  city: string;
  user_type: 'producer' | 'consumer';
  terms_accepted: boolean;
  // Country is required for both users
  country: string;
  // Address only needed for producers (will be collected later)
  // description removed from initial form - will be collected later in workflow
  // categories, recto_id, verso_id, profile_picture handled in later steps
  profile_picture: File | null;
}
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
    user_type: 'consumer',
    terms_accepted: false,
    // Required for both user types
    country: "",
    profile_picture: null,
  });
  // Country dialing code (only Cameroun and Congo per requirements)
  const [countryCode, setCountryCode] = useState<string>("+237");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  // const [showModal, setShowModal] = useState(false);
  // Removed contact info page navigation
  const [goToIDVerification, setGoToIDVerification] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [goToCategories, setGoToCategories] = useState(false);
  const [showTermsPage, setShowTermsPage] = useState(false);

  // Country and code options
  const countryOptions = [
    { value: 'Cameroun', label: 'Cameroun' },
    { value: 'République du Congo', label: 'République du Congo' }
  ];

  const codeOptions = [
    { value: '+237', label: '+237' },
    { value: '+242', label: '+242' }
  ];
  
  // Validation functions
  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'first_name':
        return value.trim() ? '' : 'Le prénom est requis';
      case 'last_name':
        return value.trim() ? '' : 'Le nom de famille est requis';
      case 'email': {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return value.trim() ? (emailRegex.test(value) ? '' : 'Format d\'email invalide') : 'L\'email est requis';
      }
      case 'phone':
        return value.trim() ? '' : 'Le numéro de téléphone est requis';
      case 'city':
        return value.trim() ? '' : 'La ville est requise';
      case 'password':
        if (!value.trim()) return 'Le mot de passe est requis';
        if (value.length < 8) return 'Le mot de passe doit contenir au moins 8 caractères';
        if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(value)) return 'Le mot de passe doit contenir des lettres et des chiffres';
        return '';
      case 'password2':
        return value === formData.password ? '' : 'Les mots de passe ne correspondent pas';
      default:
        return '';
    }
  };

  // Form validation for this step only (backend-specific fields collected later)
  const isFormValid = (() => {
    const basicFieldsValid = formData.first_name &&
      formData.last_name &&
      formData.email &&
      formData.password &&
      formData.password2 &&
      formData.phone &&
      formData.city &&
      formData.country &&
      acceptTerms;

    const passwordsMatch = formData.password === formData.password2;

    return !!(basicFieldsValid && passwordsMatch);
  })();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields and collect errors
    const errors: Record<string, string> = {};
    const fieldsToValidate = ['first_name', 'last_name', 'email', 'phone', 'city', 'password', 'password2'];
    
    fieldsToValidate.forEach(field => {
      const error = validateField(field, formData[field as keyof FormData] as string);
      if (error) errors[field] = error;
    });
    
    // Check terms acceptance
    if (!acceptTerms) {
      errors.terms = 'Vous devez accepter les conditions d\'utilisation';
    }
    
    // Check user type selection
    if (!formData.user_type) {
      errors.user_type = 'Veuillez sélectionner un type de compte';
    }
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setShowValidationErrors(true);
      return;
    }
    
    // Clear validation errors if form is valid
    setValidationErrors({});
    setShowValidationErrors(false);
    
    if (isFormValid) {
      const signupData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        // Also store combined name for downstream utils compatibility
        name: `${formData.first_name} ${formData.last_name}`.trim(),
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        city: formData.city,
        country: formData.country,
        code: countryCode,
        userRole: formData.user_type === 'producer' ? 'producteur' as const : 'client' as const,
        terms_accepted: acceptTerms,
        // For producers, address will be collected later; for consumers, use city as address
        address: formData.user_type === 'consumer' ? formData.city : '',
        profile_picture: formData.profile_picture,
      } as any;
      updateUserData(signupData);

      // Navigate according to selected role
      if (formData.user_type === 'producer') {
        setGoToIDVerification(true);
      } else {
        // Consumers go to categories, then directly register (no need for ContactInfoPage)
        setGoToCategories(true);
      }
    }
  };
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image")) {
      try {
        // Validate the image first
        validateImage(file);
        // Compress the image
        const compressedFile = await compressImage(file, {
          maxWidth: 800,
          maxHeight: 800,
          quality: 0.8,
        });
        // Store compressed file for preview and later upload
        setFormData((prev) => ({
          ...prev,
          profile_picture: compressedFile,
        }));
        
        // Log file information for debugging
        console.log('Profile picture processed:', {
          name: compressedFile.name,
          size: compressedFile.size,
          type: compressedFile.type
        });
        
        // Also mirror to AuthContext for registration utils
        updateUserData({ avatar: await (async () => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(compressedFile);
          });
        })(), profile_picture: compressedFile });
      } catch {
        toast.error("Erreur lors du traitement de l'image");
      }
    }
  };
  // Show Terms of Use page
  if (showTermsPage) {
    return (
      <TermsOfUsePage
        onBack={() => setShowTermsPage(false)}
      />
    );
  }

  // Contact info page removed
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
          paddingBottom: 40
        }}
      >
        <NavBar title="Inscription" onBack={onBack} />
        <div style={{ height: 16 }} />
        
        {/* Signup Progress Indicator */}
        <div
          style={{
            width: "90vw",
            maxWidth: 340,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              fontSize: 14,
              color: "#666",
              marginBottom: 8,
              textAlign: "center",
            }}
          >
            Création du compte - Informations de base
          </div>
          <div
            style={{
              width: "100%",
              height: 4,
              background: "#e0e0e0",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: "16.67%",
                height: "100%",
                background: "#00A6C0",
                borderRadius: 2,
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>
        
        {/* Avatar upload */}
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              position: "relative",
              width: 120,
              height: 120,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
            onClick={handleAvatarClick}
          >
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                border: "2px solid #00A6C0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#fff",
                overflow: "hidden",
              }}
            >
              {formData.profile_picture ? (
                <img
                  src={URL.createObjectURL(formData.profile_picture)}
                  alt="avatar"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "50%",
                  }}
                />
              ) : (
                <img
                  src={userIcon}
                  alt="avatar"
                  style={{
                    width: 60,
                    height: 60,
                    opacity: 0.7,
                    display: "block",
                    margin: "0 auto",
                  }}
                />
              )}
            </div>
            <div
              style={{
                position: "absolute",
                right: 0,
                bottom: 12,
                background: "#fff",
                borderRadius: "50%",
                border: "2px solid #00A6C0",
                width: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={cameraIcon}
                alt="upload"
                style={{ width: 22, height: 22 }}
              />
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleAvatarChange}
            />
          </div>
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
          {/* First Name Field */}
          <div style={inputContainerStyle}>
            <span style={iconStyle}>
              <img
                src={formData.first_name ? userUserOutlineBlue : userUserOutline}
                alt="user"
                style={{
                  width: 22,
                  height: 22,
                  opacity: formData.first_name ? 1 : 0.6,
                }}
              />
            </span>
            <input
              type="text"
              placeholder="Entrez votre prénom *"
              style={getInputStyle(!!formData.first_name)}
              value={formData.first_name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, first_name: e.target.value }))
              }
            />
          </div>

          {/* Last Name Field */}
          <div style={inputContainerStyle}>
            <span style={iconStyle}>
              <img
                src={formData.last_name ? userUserOutlineBlue : userUserOutline}
                alt="user"
                style={{
                  width: 22,
                  height: 22,
                  opacity: formData.last_name ? 1 : 0.6,
                }}
              />
            </span>
            <input
              type="text"
              placeholder="Entrez votre nom de famille *"
              style={getInputStyle(!!formData.last_name)}
              value={formData.last_name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, last_name: e.target.value }))
              }
            />
          </div>
          {/* Email Field */}
          <div style={inputContainerStyle}>
            <span style={iconStyle}>
              <img
                src={formData.email ? emailIconBlue : emailIcon}
                alt="email"
                style={{
                  width: 22,
                  height: 22,
                  opacity: formData.email ? 1 : 0.6,
                }}
              />
            </span>
            <input
              type="email"
              placeholder="Entrez votre email *"
              style={getInputStyle(!!formData.email)}
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              autoComplete="email"
            />
          </div>

          {/* Phone Field with Country Code Dropdown */}
          <div style={{ display: 'flex', gap: 8, width: '100%', marginBottom: 12 }}>
            <div style={{ width: '35%' }}>
              <UnifiedDropdown
                options={codeOptions}
                value={countryCode}
                onChange={setCountryCode}
                placeholder="+237"
                style={{ marginBottom: 0}}
              />
            </div>
            <div style={{ width: '62%' }}>
              <div style={{ ...inputContainerStyle, marginBottom: 0 }}>
                <span style={iconStyle}>
                  <img
                    src={formData.phone ? userUserOutlineBlue : userUserOutline}
                    alt="phone"
                    style={{ width: 22, height: 22, opacity: formData.phone ? 1 : 0.6 }}
                  />
                </span>
                <input
                  type="tel"
                  placeholder="Votre numéro *"
                  style={getInputStyle(!!formData.phone)}
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  autoComplete="tel"
                />
              </div>
            </div>
          </div>

            {/* Town/City Field */}
          <div style={inputContainerStyle}>
            <span style={iconStyle}>
              <img
                src={formData.city ? userUserOutlineBlue : userUserOutline}
                  alt="town"
                style={{
                  width: 22,
                  height: 22,
                  opacity: formData.city ? 1 : 0.6,
                }}
              />
            </span>
            <input
              type="text"
                placeholder="Entrez votre ville/quartier *"
              style={getInputStyle(!!formData.city)}
              value={formData.city}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, city: e.target.value }))
              }
              autoComplete="address-level2"
            />
          </div>

          {/* Country Field Dropdown */}
          <UnifiedDropdown
            options={countryOptions}
            value={formData.country}
            onChange={(value) => setFormData(prev => ({ ...prev, country: value }))}
            placeholder="Sélectionnez votre pays"
            required={true}
            style={{ marginBottom: 25}}
          />
          {/* Password Field */}
          <div style={inputContainerStyle}>
            <span style={iconStyle}>
              <img
                src={formData.password ? passwordIconBlue : passwordIcon}
                alt="password"
                style={{
                  width: 22,
                  height: 22,
                  opacity: formData.password ? 1 : 0.6,
                }}
              />
            </span>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Entrez votre mot de passe *"
              style={getInputStyle(!!formData.password)}
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  password: e.target.value,
                }))
              }
              autoComplete="new-password"
            />
            <span
              style={eyeIconStyle}
              onClick={() => setShowPassword((s) => !s)}
            >
              <img
                src={showPassword ? eyeOpenIcon : eyeIcon}
                alt="toggle password visibility"
                style={{ width: 22, height: 22, opacity: 1 }}
              />
            </span>
          </div>
          
          {/* Password Requirements Help */}
          <div
            style={{
              width: "100%",
              fontSize: 12,
              color: "#666",
              marginBottom: 12,
              paddingLeft: 8,
            }}
          >
            Le mot de passe doit contenir au moins 8 caractères avec des lettres et des chiffres
          </div>

          {/* Password Confirmation Field */}
          <div style={inputContainerStyle}>
            <span style={iconStyle}>
              <img
                src={formData.password2 ? passwordIconBlue : passwordIcon}
                alt="password confirmation"
                style={{
                  width: 22,
                  height: 22,
                  opacity: formData.password2 ? 1 : 0.6,
                }}
              />
            </span>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirmez votre mot de passe *"
              style={getInputStyle(!!formData.password2)}
              value={formData.password2}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  password2: e.target.value,
                }))
              }
              autoComplete="new-password"
            />
          </div>
          {/* User Type Selection */}
          <div
            style={{
              width: "100%",
              marginBottom: 18,
            }}
          >
            <div
              style={{
                fontSize: 14,
                color: "#222",
                marginBottom: 8,
                fontWeight: 500,
              }}
            >
              Type de compte *
            </div>
            <div
              style={{
                display: "flex",
                gap: 12,
                width: "100%",
              }}
            >
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, user_type: 'consumer' }))}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  borderRadius: 12,
                  border: formData.user_type === 'consumer' ? "2px solid #00A6C0" : "1px solid #e0e0e0",
                  background: formData.user_type === 'consumer' ? "#f0f9ff" : "#fff",
                  color: formData.user_type === 'consumer' ? "#00A6C0" : "#666",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                Client
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, user_type: 'producer' }))}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  borderRadius: 12,
                  border: formData.user_type === 'producer' ? "2px solid #00A6C0" : "1px solid #e0e0e0",
                  background: formData.user_type === 'producer' ? "#f0f9ff" : "#fff",
                  color: formData.user_type === 'producer' ? "#00A6C0" : "#666",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                Producteur
              </button>
            </div>
          </div>

          {/* Terms Acceptance */}
          <div
            style={{
              width: "100%",
              display: "flex",
              alignItems: "flex-start",
              marginBottom: 18,
            }}
          >
            <span
              onClick={() => setAcceptTerms((v) => !v)}
              style={{
                marginRight: 8,
                width: 18,
                height: 18,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              <img
                src={acceptTerms ? checkIcon : checkboxIcon}
                alt={acceptTerms ? "checked" : "unchecked"}
                style={{ width: 18, height: 18 }}
              />
            </span>
            <span style={{ fontSize: 13, color: "#222", lineHeight: 1.4 }}>
              J'accepte les{" "}
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTermsPage(true);
                }}
                style={{
                  color: "#009CB7",
                  fontWeight: 600,
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
              >
                conditions d'utilisation
              </span>{" "}
              et la politique de confidentialité de AutoFish-store
            </span>
          </div>
          <div
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              margin: "18px 0 18px 0",
            }}
          >
            <div style={{ flex: 1, height: 1, background: "#e0e0e0" }} />
            <span
              style={{ margin: "0 12px", color: "#b0b0b0", fontWeight: 500 }}
            >
              OU
            </span>
            <div style={{ flex: 1, height: 1, background: "#e0e0e0" }} />
          </div>
          <button
            type="button"
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
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
            }}
          >
            <img
              src={googleIcon}
              alt="Google"
              style={{ width: 24, height: 24 }}
            />
            Continuer avec Google
          </button>
          {/* Validation Errors Display */}
          {showValidationErrors && Object.keys(validationErrors).length > 0 && (
            <div
              style={{
                width: "100%",
                background: "#fff3f3",
                border: "1px solid #ffcdd2",
                borderRadius: 12,
                padding: "16px",
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#d32f2f",
                  marginBottom: 8,
                }}
              >
                Veuillez corriger les erreurs suivantes :
              </div>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: 20,
                  fontSize: 13,
                  color: "#d32f2f",
                  lineHeight: 1.4,
                }}
              >
                {Object.entries(validationErrors).map(([field, error]) => (
                  <li key={field}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <button
            type="submit"
            style={{
              width: "100%",
              background: "#009CB7",
              color: "#fff",
              fontWeight: 700,
              fontSize: 18,
              borderRadius: 15,
              border: "none",
              padding: "16px 0",
              marginBottom: 18,
              cursor: "pointer",
              transition: "background 0.2s, opacity 0.2s",
            }}
          >
            S'Inscrire
          </button>
        </form>
        {/* Signup Process Information */}
        <div
          style={{
            width: "90vw",
            maxWidth: 340,
            marginTop: 16,
            padding: "16px",
            background: "#f8f9fa",
            borderRadius: 12,
            border: "1px solid #e9ecef",
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#495057",
              marginBottom: 8,
            }}
          >
            📋 Processus d'inscription
          </div>
          <div
            style={{
              fontSize: 12,
              color: "#6c757d",
              lineHeight: 1.4,
            }}
          >
            Étapes suivantes :
            <br />• {formData.user_type === 'producer' ? 'Vérification d\'identité (recto/verso), sélection de catégories et création de votre page' : 'Fournir vos informations de contact'}
          </div>
        </div>

        <div style={{ marginTop: 16, fontSize: 15, color: "#b0b0b0" }}>
          Vous avez un compte ?{" "}
          <span
            onClick={onBack}
            style={{
              color: "#009CB7",
              fontWeight: 600,
              textDecoration: "none",
              cursor: "pointer",
            }}
          >
            Connexion
          </span>
        </div>
        {/* No modal; we navigate directly to next step based on role */}
      </div>
    </>
  );
};
export default SignupPage;
