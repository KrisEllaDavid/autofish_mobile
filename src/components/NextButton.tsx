import React from "react";
import Button from "./ui/Button";

interface NextButtonProps {
  onClick: () => void;
  isLastStep?: boolean;
}

const ArrowIcon: React.FC = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M5 12h13M12.5 5.5L19 12l-6.5 6.5" />
  </svg>
);

/** Advances the onboarding. The last step names its destination instead of
 *  showing another arrow, so the final tap is not a guess. */
const NextButton: React.FC<NextButtonProps> = ({
  onClick,
  isLastStep = false,
}) =>
  isLastStep ? (
    <Button variant="dark" size="lg" onClick={onClick}>
      Poursuivre
    </Button>
  ) : (
    <button
      type="button"
      className="af-fab"
      onClick={onClick}
      aria-label="Étape suivante"
    >
      <ArrowIcon />
    </button>
  );

export default NextButton;
