import React from "react";
import { commonStyles } from "./styles";

interface ProgressDotsProps {
  activeIndex: number;
  totalSteps: number;
}

const ProgressDots: React.FC<ProgressDotsProps> = ({
  activeIndex,
  totalSteps,
}) => {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <span
          key={index}
          style={{
            ...(index === activeIndex
              ? commonStyles.progressBar
              : commonStyles.progressDot),
            background: index === activeIndex ? "#17b5c5" : "#e0e0e0",
          }}
        />
      ))}
    </div>
  );
};

export default ProgressDots;
