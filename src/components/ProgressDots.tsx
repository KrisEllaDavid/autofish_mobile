import React from "react";

interface ProgressDotsProps {
  activeIndex: number;
  totalSteps: number;
}

/** Step indicator. The active step widens into a bar rather than changing
 *  colour alone, so progress reads at a glance and without relying on hue. */
const ProgressDots: React.FC<ProgressDotsProps> = ({
  activeIndex,
  totalSteps,
}) => (
  <div
    className="ob-dots"
    role="progressbar"
    aria-valuemin={1}
    aria-valuemax={totalSteps}
    aria-valuenow={activeIndex + 1}
    aria-label={`Étape ${activeIndex + 1} sur ${totalSteps}`}
  >
    {Array.from({ length: totalSteps }).map((_, index) => (
      <span
        key={index}
        className={`ob-dot${index === activeIndex ? " ob-dot--active" : ""}`}
      />
    ))}
  </div>
);

export default ProgressDots;
