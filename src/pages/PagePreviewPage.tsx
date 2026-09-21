import React, { useRef } from "react";
import NavBar from "../components/NavBar";
import { compressImage, validateImage } from "../utils/imageCompression";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { Avatar } from "../components/ui";
import "./PagePreviewPage.css";

const cameraIcon = "/icons/camera_icon_white.svg";
const locationIcon = "/icons/Location.svg";

const PlusIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const ClockIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="var(--brand-700)"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5V12l3 1.8" />
  </svg>
);

const PagePreviewPage: React.FC<{
  onBack: () => void;
  onBannerChange?: (banner: string) => void;
}> = ({ onBack, onBannerChange }) => {
  const { userData, updateUserData } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const banner = userData?.page?.banner || "";

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file?.type.startsWith("image")) return;

    try {
      validateImage(file);
      const compressedFile = await compressImage(file, {
        maxWidth: 1200,
        maxHeight: 600,
        quality: 0.8,
      });

      const reader = new FileReader();
      reader.onload = (ev) => {
        const newBanner = ev.target?.result as string;
        updateUserData({ page: { ...userData?.page, banner: newBanner } });
        onBannerChange?.(newBanner);
      };
      reader.readAsDataURL(compressedFile);
    } catch {
      toast.error("Cette image n'a pas pu être traitée. Essayez-en une autre.");
    }
  };

  return (
    <div className="pp-screen fade-in-page">
      <NavBar title="Aperçu de la page" onBack={onBack} />

      <div className="pp-scroll">
        <header className="pp-banner">
          {banner && (
            <img src={banner} alt="" aria-hidden="true" className="pp-banner__image" />
          )}
          <div className="pp-banner__scrim" aria-hidden="true" />

          <div className="pp-banner__content">
            <div className="pp-banner__identity">
              <Avatar
                src={userData?.avatar}
                name={userData?.name}
                size="lg"
                alt=""
                style={{ boxShadow: "0 0 0 3px rgba(255,255,255,0.9)" }}
              />
              <div className="pp-banner__meta">
                <p className="pp-banner__name">{userData?.name}</p>
                <p className="pp-banner__role">{userData?.userRole}</p>
              </div>
            </div>

            <h1 className="pp-banner__title">{userData?.page?.pageName}</h1>

            <div className="pp-banner__footer">
              <p className="pp-banner__address">
                <img src={locationIcon} alt="" aria-hidden="true" />
                <span>{userData?.page?.address}</span>
              </p>

              <label
                className="pp-banner__upload"
                title="Changer la photo de couverture"
              >
                <img src={cameraIcon} alt="" aria-hidden="true" />
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleBannerChange}
                  aria-label="Changer la photo de couverture"
                />
              </label>
            </div>
          </div>
        </header>

        <section className="pp-section">
          <div className="pp-section__head">
            <h2 className="pp-section__title">Publications</h2>
            <button
              type="button"
              className="pp-add"
              disabled
              aria-label="Publier — disponible après validation"
              title="Disponible après validation de votre compte"
            >
              <PlusIcon />
            </button>
          </div>

          <div className="pp-empty">
            <span className="pp-empty__icon">
              <ClockIcon />
            </span>
            <p className="pp-empty__title">Aucune publication</p>
            <p className="pp-empty__text">
              Votre compte producteur est en cours de validation. Vous pourrez
              publier vos produits dès qu&apos;il sera approuvé.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PagePreviewPage;
