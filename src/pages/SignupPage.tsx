import React, { useState } from "react";
import { toast } from "react-toastify";
import NavBar from "../components/NavBar";
import ProfileChoicePage from "./ProfileChoicePage";
import Modal from "../components/Modal";
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
const bravoCheckIcon = "/icons/Check.svg";
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
  name: string;
  email: string;
  password: string;
  avatar: string;
}
const SignupPage: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { updateUserData } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    avatar: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [goToProfileChoice, setGoToProfileChoice] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const isFormValid =
    formData.name && formData.email && formData.password && acceptTerms;
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      const signupData = {
        name: formData.name,
        email: formData.email,
        avatar: formData.avatar,
        password: formData.password, // Store password for API registration
      };
      
      
      
      updateUserData(signupData);
      setShowModal(true);
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
        const reader = new FileReader();
        reader.onload = (ev) => {
          setFormData((prev) => ({
            ...prev,
            avatar: ev.target?.result as string,
          }));
        };
        reader.readAsDataURL(compressedFile);
      } catch {
        // Error processing image - show user-friendly message
        toast.error("Erreur lors du traitement de l'image");
      }
    }
  };
  if (goToProfileChoice) {
    return <ProfileChoicePage onBack={() => setGoToProfileChoice(false)} />;
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
        <NavBar title="Inscription" onBack={onBack} />
        <div style={{ height: 16 }} />
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
              {formData.avatar ? (
                <img
                  src={formData.avatar}
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
          <div style={inputContainerStyle}>
            <span style={iconStyle}>
              <img
                src={formData.name ? userUserOutlineBlue : userUserOutline}
                alt="user"
                style={{
                  width: 22,
                  height: 22,
                  opacity: formData.name ? 1 : 0.6,
                }}
              />
            </span>
            <input
              type="text"
              placeholder="Entrez votre nom"
              style={getInputStyle(!!formData.name)}
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>
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
              placeholder="Entrez votre email"
              style={getInputStyle(!!formData.email)}
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              autoComplete="email"
            />
          </div>
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
              placeholder="Entrez votre mot de passe"
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
              J'accepte les conditions d'utilisation et la politique de
              confidentialité de AutoFish-store
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
          <button
            type="submit"
            disabled={!isFormValid}
            style={{
              width: "100%",
              background: isFormValid ? "#009CB7" : "#b0b0b0",
              color: "#fff",
              fontWeight: 700,
              fontSize: 18,
              borderRadius: 15,
              border: "none",
              padding: "16px 0",
              marginBottom: 18,
              cursor: isFormValid ? "pointer" : "not-allowed",
              opacity: isFormValid ? 1 : 0.7,
              transition: "background 0.2s, opacity 0.2s",
            }}
          >
            S'Inscrire
          </button>
        </form>
        <div style={{ marginTop: 8, fontSize: 15, color: "#b0b0b0" }}>
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
        {showModal && (
          <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
            <div
              style={{
                background: "#fff",
                borderRadius: 32,
                boxShadow: "0 4px 32px rgba(0,0,0,0.10)",
                padding: "40px 24px 32px 24px",
                minWidth: 300,
                maxWidth: 340,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: "50%",
                  background: "rgba(0,166,192,0.07)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 24,
                }}
              >
                <img
                  src={bravoCheckIcon}
                  alt="check"
                  style={{ width: 54, height: 54, color: "#009CB7" }}
                />
              </div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 22,
                  color: "#222",
                  marginBottom: 8,
                  textAlign: "center",
                }}
              >
                Bravo !
              </div>
              <div
                style={{
                  fontSize: 16,
                  color: "#b0b0b0",
                  marginBottom: 28,
                  textAlign: "center",
                }}
              >
                Votre compte a bien été enregistré
              </div>
              <button
                style={{
                  width: "100%",
                  background: "#009CB7",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 17,
                  borderRadius: 15,
                  border: "none",
                  padding: "14px 0",
                  marginBottom: 0,
                  cursor: "pointer",
                }}
                onClick={() => {
                  setShowModal(false);
                  setGoToProfileChoice(true);
                }}
              >
                Vers choix du profil
              </button>
            </div>
          </Modal>
        )}
      </div>
    </>
  );
};
export default SignupPage;
