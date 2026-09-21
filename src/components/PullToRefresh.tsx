import React from "react";
import "./PullToRefresh.css";

interface PullToRefreshIndicatorProps {
  show: boolean;
  text: string;
  /** 0–1, how far the gesture has travelled toward the release threshold. */
  opacity: number;
  isRefreshing: boolean;
}

/**
 * Pull-to-refresh affordance.
 *
 * The ring fills as the finger travels, so the user can see the threshold
 * approaching rather than guessing when to let go.
 */
const PullToRefreshIndicator: React.FC<PullToRefreshIndicatorProps> = ({
  show,
  text,
  opacity,
  isRefreshing,
}) => {
  if (!show) return null;

  return (
    <div
      className="ptr"
      role="status"
      aria-live="polite"
      style={{ opacity }}
    >
      {isRefreshing ? (
        <span className="af-spinner ptr__spinner" aria-hidden="true" />
      ) : (
        <span
          className="ptr__progress"
          aria-hidden="true"
          style={
            {
              "--ptr-angle": `${Math.min(opacity, 1) * 360}deg`,
            } as React.CSSProperties
          }
        />
      )}
      <span>{text}</span>
    </div>
  );
};

export default PullToRefreshIndicator;
