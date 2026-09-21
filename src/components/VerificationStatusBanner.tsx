import React from "react";
import { useAuth } from "../context/AuthContext";
import { Banner } from "./ui";

interface VerificationStatusBannerProps {
  className?: string;
}

const ClockIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5V12l3 1.8" />
  </svg>
);

const AlertIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 3.8 21 19.2H3z" />
    <path d="M12 10v4M12 16.8v.2" />
  </svg>
);

/**
 * Producer account status, shown inline above the feed.
 *
 * It used to be a solid orange or green bar with an emoji — loud enough to
 * compete with the content it sits above. It now uses the token banner:
 * amber for "you need to act", brand for "we are reviewing".
 */
const VerificationStatusBanner: React.FC<VerificationStatusBannerProps> = ({
  className = "",
}) => {
  const { userData } = useAuth();

  if (
    !userData ||
    userData.userRole !== "producteur" ||
    userData.access_level === "full"
  ) {
    return null;
  }

  const needsEmail = !userData.email_verified;

  const title = needsEmail
    ? "Vérifiez votre email"
    : "Vérification en cours";

  const message =
    userData.status_message ||
    (needsEmail
      ? "Confirmez votre adresse pour débloquer toutes les fonctionnalités."
      : "Votre compte producteur est en cours de validation. Certaines actions restent limitées en attendant.");

  return (
    <div
      className={className}
      style={{
        maxWidth: "var(--content-max)",
        margin: "0 auto",
        padding: "var(--space-2) var(--gutter) var(--space-5)",
      }}
    >
      <Banner
        tone={needsEmail ? "warning" : "info"}
        icon={needsEmail ? <AlertIcon /> : <ClockIcon />}
        title={title}
      >
        {message}
      </Banner>
    </div>
  );
};

export default VerificationStatusBanner;
