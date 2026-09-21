import React from "react";
import "./Onboarding.css";

/** First frame of the app: the wordmark over the brand wash, and three dots
 *  that say work is happening without pretending to measure it. */
const SplashScreen: React.FC = () => (
  <div className="splash">
    <img
      src="/images/splash_image.svg"
      alt=""
      aria-hidden="true"
      className="splash__bg"
    />
    <div className="splash__wash" aria-hidden="true" />

    <div className="splash__content">
      <img
        src="/icons/autofish_white_logo.svg"
        alt="Autofish Store"
        className="splash__logo"
      />

      <p className="splash__wordmark">
        <strong>Autofish</strong>
        <span>Store</span>
      </p>

      <div className="splash__dots" role="status" aria-label="Chargement">
        <span className="splash__dot" />
        <span className="splash__dot" />
        <span className="splash__dot" />
      </div>
    </div>
  </div>
);

export default SplashScreen;
