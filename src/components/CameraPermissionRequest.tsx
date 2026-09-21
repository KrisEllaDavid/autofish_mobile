import React from "react";
import { useCameraPermission } from "../hooks/useCameraPermission";
import { Button } from "./ui";
import "./CameraPermissionRequest.css";

interface CameraPermissionRequestProps {
  onPermissionGranted: () => void;
  onPermissionDenied: () => void;
}

const CameraIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="var(--brand-700)"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 8.5h3l1.6-2.4h6.8L17 8.5h3a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1z" />
    <circle cx="12" cy="13.2" r="3.4" />
  </svg>
);

const AlertIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="var(--danger-600)"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 3.8 21 19.2H3z" />
    <path d="M12 10v4M12 16.8v.2" />
  </svg>
);

/**
 * Camera permission prompt.
 *
 * Shown before the browser's own dialog so the user knows what is about to
 * be asked and why — a request that arrives unexplained gets denied, and a
 * denial is far harder to reverse than it is to avoid.
 */
const CameraPermissionRequest: React.FC<CameraPermissionRequestProps> = ({
  onPermissionGranted,
  onPermissionDenied,
}) => {
  const { hasPermission, isRequesting, error, requestPermission } =
    useCameraPermission();

  React.useEffect(() => {
    if (hasPermission) onPermissionGranted();
  }, [hasPermission, onPermissionGranted]);

  const isError = Boolean(error);

  return (
    <div className="cam-perm" role="dialog" aria-modal="true">
      <div className="cam-perm__panel">
        <div className={`cam-perm__icon${isError ? " cam-perm__icon--error" : ""}`}>
          {isError ? <AlertIcon /> : <CameraIcon />}
        </div>

        <h2 className="cam-perm__title">
          {isError ? "Caméra inaccessible" : "Accès à la caméra"}
        </h2>

        <p className="cam-perm__text">
          {error ||
            "AutoFish a besoin de votre caméra pour photographier votre pièce d'identité. Les images ne servent qu'à la vérification de votre compte."}
        </p>

        {isError && (
          <ul className="cam-perm__tips">
            <li>Vérifiez que votre appareil dispose d&apos;une caméra.</li>
            <li>
              Autorisez la caméra dans les réglages de votre navigateur.
            </li>
            <li>Rechargez la page, puis réessayez.</li>
          </ul>
        )}

        <div className="cam-perm__actions">
          <Button
            size="lg"
            block
            loading={isRequesting}
            loadingLabel="Demande en cours…"
            onClick={requestPermission}
          >
            {isError ? "Réessayer" : "Autoriser la caméra"}
          </Button>

          <Button variant="ghost" size="lg" block onClick={onPermissionDenied}>
            Plus tard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CameraPermissionRequest;
