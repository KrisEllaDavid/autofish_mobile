import React, { useState, useRef } from "react";
import Webcam from "react-webcam";
import NavBar from "../components/NavBar";
import CategoriesPage from "./CategoriesPage/CategoriesPage";
import { useAuth } from "../context/AuthContext";

const cameraIcon = "/icons/camera_icon.svg";

interface IDVerificationPageProps {
  onBack: () => void;
  profileType: "client" | "producer";
}

type Side = "recto" | "verso";

const IDVerificationPage: React.FC<IDVerificationPageProps> = ({
  onBack,
  profileType,
}) => {
  const { userData, updateUserData } = useAuth();
  const [isCameraOpen, setIsCameraOpen] = useState<false | Side>(false);
  const [rectoImage, setRectoImage] = useState<string | null>(null);
  const [versoImage, setVersoImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [goToCategories, setGoToCategories] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  const handleOpenCamera = (side: Side) => {
    setIsCameraOpen(side);
    setCameraError(null);
  };

  const handleCapture = () => {
    if (webcamRef.current && isCameraOpen) {
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 120);
      const imageSrc = webcamRef.current.getScreenshot();
      if (isCameraOpen === "recto") {
        setRectoImage(imageSrc);
        updateUserData({ idRecto: imageSrc });
      }
      if (isCameraOpen === "verso") {
        setVersoImage(imageSrc);
        updateUserData({ idVerso: imageSrc });
      }
      setIsCameraOpen(false);
    }
  };

  const handleRetake = (side: Side) => {
    setIsCameraOpen(side);
    setCameraError(null);
  };

  const handleCameraError = () => {
    setCameraError(
      "Impossible d'accéder à la caméra. Veuillez autoriser l'accès à la caméra dans votre navigateur."
    );
  };

  if (goToCategories) {
    return (
      <CategoriesPage
        profileType={profileType}
        onBack={() => setGoToCategories(false)}
      />
    );
  }

  const uploadBox = (
    side: Side,
    label: string,
    image: string | null,
    onRetake: () => void,
    onOpen: () => void
  ) => (
    <div style={{ marginBottom: 32, width: "100%" }}>
      <div style={{ fontSize: 15, color: "#222", marginBottom: 10 }}>
        {label}
      </div>
      <div
        style={{
          width: "100%",
          height: 160,
          background: "#fafbfc",
          borderRadius: 24,
          border: "1.2px solid #e0e0e0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          position: "relative",
        }}
        onClick={onOpen}
      >
        {image ? (
          <>
            <img
              src={image}
              alt={side}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: 24,
              }}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRetake();
              }}
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                background: "rgba(0,0,0,0.5)",
                border: "none",
                borderRadius: "50%",
                width: 32,
                height: 32,
                color: "#fff",
                fontSize: 18,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              aria-label="Reprendre"
            >
              ↻
            </button>
          </>
        ) : (
          <img
            src={cameraIcon}
            alt="camera"
            style={{ width: 40, height: 40, opacity: 0.8 }}
          />
        )}
      </div>
    </div>
  );

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
        .id-frame {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 320px;
          height: 200px;
          transform: translate(-50%, -50%);
          border: 3px dashed #00A6C0;
          border-radius: 16px;
          pointer-events: none;
          z-index: 10;
        }
        @media (max-width: 400px) {
          .id-frame {
            width: 90vw;
            height: 56vw;
          }
        }
        .flash-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: #fff;
          opacity: 0.85;
          z-index: 1001;
          pointer-events: none;
          animation: flashAnim 0.18s linear;
        }
        @keyframes flashAnim {
          from { opacity: 0.85; }
          to { opacity: 0; }
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
          paddingTop: 32,
        }}
      >
        <NavBar title="Document d'identification" onBack={onBack} />
        <div
          style={{
            width: "100%",
            maxWidth: 370,
            margin: "0 auto",
            padding: "0 16px",
            boxSizing: "border-box",
            marginTop: 60,
          }}
        >
          {uploadBox(
            "recto",
            "Chargez le recto votre pièce d'identité",
            rectoImage,
            () => handleRetake("recto"),
            () => handleOpenCamera("recto")
          )}
          {uploadBox(
            "verso",
            "Chargez le verso votre pièce d'identité",
            versoImage,
            () => handleRetake("verso"),
            () => handleOpenCamera("verso")
          )}
          <button
            style={{
              width: "100%",
              background: rectoImage && versoImage ? "#009cb7" : "#b0b0b0",
              color: "#fff",
              fontWeight: 700,
              fontSize: 18,
              borderRadius: 18,
              border: "none",
              padding: "18px 0",
              marginTop: 18,
              cursor: rectoImage && versoImage ? "pointer" : "not-allowed",
              transition: "background 0.2s",
              boxShadow: "0 2px 12px rgba(0, 156, 183, 0.08)",
            }}
            disabled={!(rectoImage && versoImage)}
            onClick={() => setGoToCategories(true)}
          >
            Poursuivre
          </button>
        </div>
        {isCameraOpen && (
          <>
            {showFlash && <div className="flash-overlay" />}
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "#000",
                zIndex: 1000,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  padding: 16,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <button
                  onClick={() => {
                    setIsCameraOpen(false);
                    setCameraError(null);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#fff",
                    fontSize: 16,
                    cursor: "pointer",
                  }}
                >
                  Annuler
                </button>
                <div style={{ color: "#fff", fontSize: 16 }}>
                  {isCameraOpen === "recto"
                    ? "Photo du recto"
                    : "Photo du verso"}
                </div>
                <div style={{ width: 60 }} />
              </div>
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  flexDirection: "column",
                }}
              >
                {cameraError ? (
                  <div
                    style={{ color: "#fff", textAlign: "center", padding: 24 }}
                  >
                    {cameraError}
                  </div>
                ) : (
                  <>
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      videoConstraints={{ facingMode: "environment" }}
                      style={{ width: "100%", maxWidth: 400, borderRadius: 16 }}
                      onUserMediaError={handleCameraError}
                    />
                    <div className="id-frame" />
                  </>
                )}
              </div>
              <div
                style={{
                  padding: 24,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <button
                  onClick={handleCapture}
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    background: "#fff",
                    border: "4px solid #009cb7",
                    cursor: cameraError ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                    fontWeight: 700,
                    color: "#009cb7",
                  }}
                  disabled={!!cameraError}
                >
                  ��
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default IDVerificationPage;
