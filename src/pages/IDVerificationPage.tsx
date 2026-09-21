import React, { useState, useRef } from "react";
import Webcam from "react-webcam";
import NavBar from "../components/NavBar";
import CategoriesPage from "./CategoriesPage/CategoriesPage";
import { useAuth } from "../context/AuthContext";
import CameraPermissionRequest from "../components/CameraPermissionRequest";
import { checkCameraSupport, getAvailableCameras } from "../utils/cameraUtils";
import { Banner, Button } from "../components/ui";
import "./Flow.css";
import "./IDVerificationPage.css";

const cameraIcon = "/icons/camera_icon.svg";

interface IDVerificationPageProps {
  onBack: () => void;
  profileType: "client" | "producer";
}

type Side = "recto" | "verso";

const RetakeIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M20.5 12a8.5 8.5 0 1 1-2.6-6.1" />
    <path d="M20.5 4v5h-5" />
  </svg>
);

const DoneIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 12.5l5 5L20 6.5" />
  </svg>
);

const IDVerificationPage: React.FC<IDVerificationPageProps> = ({
  onBack,
  profileType,
}) => {
  const { updateUserData } = useAuth();
  const [isCameraOpen, setIsCameraOpen] = useState<false | Side>(false);
  const [rectoImage, setRectoImage] = useState<string | null>(null);
  const [versoImage, setVersoImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [goToCategories, setGoToCategories] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [showPermissionRequest, setShowPermissionRequest] = useState(false);
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  const handleOpenCamera = async (side: Side) => {
    const support = checkCameraSupport();
    if (!support.getUserMedia) {
      setCameraError("Votre navigateur ne gère pas l'accès à la caméra.");
      return;
    }

    const cameras = await getAvailableCameras();
    if (cameras.length === 0) {
      setCameraError("Aucune caméra détectée sur cet appareil.");
      return;
    }

    setCameraError(null);
    setIsCameraOpen(side);
    if (!cameraPermissionGranted) setShowPermissionRequest(true);
  };

  const handleCapture = () => {
    if (!webcamRef.current || !isCameraOpen) return;

    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 120);

    const imageSrc = webcamRef.current.getScreenshot();
    if (isCameraOpen === "recto") {
      setRectoImage(imageSrc);
      updateUserData({ idRecto: imageSrc });
    } else {
      setVersoImage(imageSrc);
      updateUserData({ idVerso: imageSrc });
    }
    setIsCameraOpen(false);
  };

  const handleRetake = (side: Side) => {
    setIsCameraOpen(side);
    setCameraError(null);
  };

  const handleCameraError = (error: string | DOMException) => {
    let message =
      "La caméra n'a pas pu démarrer. Autorisez l'accès dans les réglages de votre navigateur.";

    if (error instanceof DOMException) {
      if (error.name === "NotAllowedError") {
        message =
          "Accès refusé. Autorisez la caméra dans les réglages de votre navigateur.";
      } else if (error.name === "NotFoundError") {
        message = "Aucune caméra détectée sur cet appareil.";
      } else if (error.name === "NotSupportedError") {
        message = "Votre navigateur ne gère pas l'accès à la caméra.";
      } else if (error.name === "OverconstrainedError") {
        // The component retries with looser constraints on its own.
        return;
      }
    }

    setCameraError(message);
  };

  const handlePermissionGranted = () => {
    setShowPermissionRequest(false);
    setCameraPermissionGranted(true);
  };

  const handlePermissionDenied = () => {
    setShowPermissionRequest(false);
    setIsCameraOpen(false);
    setCameraError("Accès à la caméra refusé.");
  };

  if (goToCategories) {
    return (
      <CategoriesPage
        profileType={profileType}
        onBack={() => setGoToCategories(false)}
      />
    );
  }

  const renderSlot = (
    side: Side,
    label: string,
    image: string | null
  ) => (
    <div>
      <span className="idv-card__label">{label}</span>

      <button
        type="button"
        className={`idv-slot${image ? "" : " idv-slot--empty"}`}
        onClick={() => (image ? handleRetake(side) : handleOpenCamera(side))}
        aria-label={
          image ? `Reprendre la photo du ${side}` : `Photographier le ${side}`
        }
      >
        {image ? (
          <>
            <img src={image} alt="" className="idv-slot__photo" />
            <span className="idv-slot__done">
              <DoneIcon />
              Enregistré
            </span>
            <span
              className="idv-slot__retake"
              role="presentation"
              aria-hidden="true"
            >
              <RetakeIcon />
            </span>
          </>
        ) : (
          <span className="idv-slot__prompt">
            <img src={cameraIcon} alt="" aria-hidden="true" />
            Appuyez pour photographier
          </span>
        )}
      </button>
    </div>
  );

  const complete = Boolean(rectoImage && versoImage);

  return (
    <div className="flow-screen fade-in-page">
      <NavBar title="Pièce d'identité" onBack={onBack} />

      <div className="flow-body">
        <div className="flow-intro">
          <h1 className="flow-intro__title">Vérifions votre identité</h1>
          <p className="flow-intro__text">
            Photographiez les deux faces de votre pièce d&apos;identité. Cadrez
            le document entièrement et évitez les reflets.
          </p>
        </div>

        {cameraError && !isCameraOpen && (
          <Banner tone="warning" style={{ marginBottom: "var(--space-7)" }}>
            {cameraError}
          </Banner>
        )}

        <div className="idv-cards">
          {renderSlot("recto", "Recto de la pièce", rectoImage)}
          {renderSlot("verso", "Verso de la pièce", versoImage)}
        </div>

        <div className="flow-actions">
          <Button
            size="lg"
            block
            disabled={!complete}
            onClick={() => setGoToCategories(true)}
          >
            Poursuivre
          </Button>
        </div>
      </div>

      {isCameraOpen && (
        <>
          {showFlash && <div className="flash-overlay" />}

          <div className="idv-camera" role="dialog" aria-modal="true">
            <div className="idv-camera__bar">
              <button
                type="button"
                className="idv-camera__cancel"
                onClick={() => {
                  setIsCameraOpen(false);
                  setCameraError(null);
                }}
              >
                Annuler
              </button>
              <span className="idv-camera__title">
                {isCameraOpen === "recto" ? "Recto" : "Verso"}
              </span>
              <span className="idv-camera__spacer" />
            </div>

            <div className="idv-camera__stage">
              {cameraError ? (
                <p className="idv-camera__error">{cameraError}</p>
              ) : (
                <>
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{
                      facingMode: "environment",
                      width: { ideal: 1920, min: 1280 },
                      height: { ideal: 1080, min: 720 },
                      aspectRatio: { ideal: 16 / 9 },
                    }}
                    className="idv-camera__video"
                    onUserMediaError={handleCameraError}
                    mirrored={false}
                  />

                  <div className="id-frame" aria-hidden="true" />

                  <p className="idv-camera__hint">
                    Alignez la pièce dans le cadre
                  </p>

                  <button
                    type="button"
                    className="idv-camera__shutter"
                    onClick={handleCapture}
                    aria-label="Prendre la photo"
                  />
                </>
              )}
            </div>
          </div>
        </>
      )}

      {showPermissionRequest && (
        <CameraPermissionRequest
          onPermissionGranted={handlePermissionGranted}
          onPermissionDenied={handlePermissionDenied}
        />
      )}
    </div>
  );
};

export default IDVerificationPage;
