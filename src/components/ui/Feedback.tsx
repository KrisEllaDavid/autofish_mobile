import React from "react";
import Button from "./Button";

/* ── Empty state ─────────────────────────────────────────────────────────
   Three parts, always: what is missing, why that is fine, and the way out.
   ───────────────────────────────────────────────────────────────────────── */

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}) => (
  <div className={`af-empty af-anim-rise ${className}`.trim()}>
    {icon && <div className="af-empty__icon">{icon}</div>}
    <h2 className="af-empty__title">{title}</h2>
    {description && <p className="af-empty__text">{description}</p>}
    {actionLabel && onAction && (
      <div className="af-empty__action">
        <Button variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      </div>
    )}
  </div>
);

/* ── Skeleton ────────────────────────────────────────────────────────────
   Shaped like the content it stands in for, so the layout does not jump
   when the real thing lands.
   ───────────────────────────────────────────────────────────────────────── */

export interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  radius?: string;
  circle?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = "100%",
  height = 12,
  radius,
  circle = false,
  className = "",
  style,
}) => (
  <span
    className={`af-skeleton${circle ? " af-skeleton--circle" : ""} ${className}`.trim()}
    aria-hidden="true"
    style={{
      display: "block",
      width,
      height,
      borderRadius: circle ? "50%" : radius,
      ...style,
    }}
  />
);

/** Placeholder matching the shape of one feed PostCard. */
export const PostCardSkeleton: React.FC = () => (
  <div
    className="af-card"
    style={{ marginBottom: "var(--space-6)", padding: "var(--space-6)" }}
    aria-hidden="true"
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-5)",
        marginBottom: "var(--space-6)",
      }}
    >
      <Skeleton circle width={44} height={44} />
      <div style={{ flex: 1, display: "grid", gap: "var(--space-3)" }}>
        <Skeleton width="45%" height={13} />
        <Skeleton width="30%" height={11} />
      </div>
    </div>
    <div style={{ display: "grid", gap: "var(--space-3)" }}>
      <Skeleton width="100%" height={12} />
      <Skeleton width="80%" height={12} />
    </div>
    <Skeleton
      height={200}
      radius="var(--radius-md)"
      style={{ marginTop: "var(--space-6)" }}
    />
  </div>
);

/** Placeholder matching one list row (conversations, producers, settings). */
export const ListRowSkeleton: React.FC = () => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "var(--space-5)",
      padding: "var(--space-5) var(--space-6)",
    }}
    aria-hidden="true"
  >
    <Skeleton circle width={44} height={44} />
    <div style={{ flex: 1, display: "grid", gap: "var(--space-3)" }}>
      <Skeleton width="40%" height={13} />
      <Skeleton width="65%" height={11} />
    </div>
  </div>
);

/* ── Banner ──────────────────────────────────────────────────────────────
   Inline status the user should read in place, not a toast that vanishes.
   ───────────────────────────────────────────────────────────────────────── */

export interface BannerProps {
  tone?: "info" | "success" | "warning" | "danger";
  icon?: React.ReactNode;
  title?: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Banner: React.FC<BannerProps> = ({
  tone = "info",
  icon,
  title,
  children,
  action,
  className = "",
  style,
}) => (
  <div
    className={`af-banner${tone !== "info" ? ` af-banner--${tone}` : ""} ${className}`.trim()}
    role={tone === "danger" ? "alert" : "status"}
    style={style}
  >
    {icon && <span className="af-banner__icon">{icon}</span>}
    <div className="af-banner__body">
      {title && <div className="af-banner__title">{title}</div>}
      {children}
      {action && <div style={{ marginTop: "var(--space-5)" }}>{action}</div>}
    </div>
  </div>
);

/* ── Spinner ─────────────────────────────────────────────────────────── */

export const Spinner: React.FC<{
  size?: "md" | "lg";
  onBrand?: boolean;
  label?: string;
}> = ({ size = "md", onBrand = false, label = "Chargement" }) => (
  <span
    className={`af-spinner${size === "lg" ? " af-spinner--lg" : ""}${
      onBrand ? " af-spinner--on-brand" : ""
    }`}
    role="status"
    aria-label={label}
  />
);
