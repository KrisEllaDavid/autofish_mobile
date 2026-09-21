import React, { useCallback, useRef, useState } from "react";

interface SwipeableContainerProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  /** Horizontal distance, in px, that commits the swipe. */
  threshold?: number;
  className?: string;
}

/**
 * Horizontal swipe surface for the onboarding steps.
 *
 * Refs rather than state for the in-flight touch: a state write per
 * touchmove re-renders the whole page 60 times a second for a value nothing
 * renders. The gesture is also axis-locked — a mostly-vertical drag is left
 * to the browser, so a swipe down never skips a step.
 */
const SwipeableContainer: React.FC<SwipeableContainerProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  threshold = 56,
  className = "",
}) => {
  const start = useRef<{ x: number; y: number } | null>(null);
  const current = useRef<{ x: number; y: number } | null>(null);
  const [offset, setOffset] = useState(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    start.current = { x: t.clientX, y: t.clientY };
    current.current = start.current;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!start.current) return;
    const t = e.touches[0];
    current.current = { x: t.clientX, y: t.clientY };

    const dx = t.clientX - start.current.x;
    const dy = t.clientY - start.current.y;

    // Vertical intent — hand the gesture back to the browser.
    if (Math.abs(dy) > Math.abs(dx)) {
      setOffset(0);
      return;
    }

    // Rubber-band the drag so the page acknowledges the finger without
    // travelling the full distance.
    setOffset(Math.sign(dx) * Math.min(Math.abs(dx) * 0.35, 28));
  }, []);

  const handleTouchEnd = useCallback(() => {
    const from = start.current;
    const to = current.current;
    setOffset(0);
    start.current = null;
    current.current = null;

    if (!from || !to) return;

    const dx = from.x - to.x;
    const dy = Math.abs(from.y - to.y);
    if (Math.abs(dx) < threshold || dy > Math.abs(dx)) return;

    if (dx > 0) onSwipeLeft?.();
    else onSwipeRight?.();
  }, [threshold, onSwipeLeft, onSwipeRight]);

  return (
    <div
      className={`ob-screen ${className}`.trim()}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      style={{
        // The container owns horizontal; the browser keeps vertical panning.
        touchAction: "pan-y",
        transform: offset ? `translate3d(${offset}px, 0, 0)` : undefined,
        transition: offset
          ? "none"
          : "transform var(--dur-base) var(--ease-out)",
      }}
    >
      {children}
    </div>
  );
};

export default SwipeableContainer;
