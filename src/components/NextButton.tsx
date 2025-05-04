import React from "react";
import { commonStyles } from "./styles";

interface NextButtonProps {
  onClick: () => void;
  isLastStep?: boolean;
}

const NextButton: React.FC<NextButtonProps> = ({
  onClick,
  isLastStep = false,
}) => {
  return (
    <button
      style={isLastStep ? commonStyles.continueButton : commonStyles.nextButton}
      onClick={onClick}
      aria-label={isLastStep ? "Poursuivre" : "Next"}
    >
      {isLastStep ? (
        "Poursuivre"
      ) : (
        <svg
          width="28"
          height="28"
          fill="none"
          stroke="#fff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      )}
    </button>
  );
};

export default NextButton;
