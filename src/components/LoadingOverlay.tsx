import React from "react";
import "./LoadingOverlay.css";

interface LoadingOverlayProps {
  isVisible: boolean;
  /** What is being waited on. Generic by default, specific where known. */
  label?: string;
}

/**
 * Full-screen wait state for operations that block the whole app.
 *
 * It is deliberately quiet: the logo breathes and three dots cycle, with no
 * spinner racing. Anything scoped to one view should use a local Spinner or
 * skeleton instead of covering the screen.
 */
const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  label = "Chargement…",
}) => {
  if (!isVisible) return null;

  return (
    <div className="loading-overlay" role="status" aria-live="polite">
      <div className="loading-overlay__content">
        <img
          src="/icons/autofish_white_logo.svg"
          alt=""
          aria-hidden="true"
          width={76}
          height={76}
          className="loading-overlay__logo"
        />

        <div className="loading-overlay__dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

        <p className="loading-overlay__label">{label}</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
