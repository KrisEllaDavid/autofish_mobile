import React from "react";
import { normalizeImageUrl } from "../../utils/imageUtils";

/* ── Avatar ──────────────────────────────────────────────────────────────
   Falls back to initials rather than a broken-image glyph, which is the
   most common way an avatar row goes ugly in production.
   ───────────────────────────────────────────────────────────────────────── */

export interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  ring?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
  alt?: string;
}

const initialsOf = (name?: string) =>
  (name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "?";

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = "md",
  ring = false,
  className = "",
  style,
  onClick,
  alt,
}) => {
  const [failed, setFailed] = React.useState(false);
  const resolved = src ? normalizeImageUrl(src) : "";
  const showImage = Boolean(resolved) && !failed;

  const classes = [
    "af-avatar",
    size !== "md" ? `af-avatar--${size}` : "",
    ring ? "af-avatar--ring" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const interactive = Boolean(onClick);

  return (
    <span
      className={classes}
      style={{ cursor: interactive ? "pointer" : undefined, ...style }}
      onClick={onClick}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={interactive ? alt || `Profil de ${name ?? ""}`.trim() : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.(e as unknown as React.MouseEvent);
              }
            }
          : undefined
      }
    >
      {showImage ? (
        <img
          src={resolved}
          alt={alt ?? (name ? `Photo de ${name}` : "")}
          onError={() => setFailed(true)}
          loading="lazy"
        />
      ) : (
        initialsOf(name)
      )}
    </span>
  );
};

/* ── Card ────────────────────────────────────────────────────────────── */

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "flat" | "raised";
  pad?: boolean;
  tappable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  variant = "default",
  pad = false,
  tappable = false,
  className = "",
  children,
  ...rest
}) => (
  <div
    className={[
      "af-card",
      variant !== "default" ? `af-card--${variant}` : "",
      pad ? "af-card--pad" : "",
      tappable ? "af-card--tappable" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ")}
    {...rest}
  >
    {children}
  </div>
);

/* ── Chip ────────────────────────────────────────────────────────────── */

export interface ChipProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  tone?: "neutral" | "brand" | "onimage";
  as?: "button" | "span";
}

export const Chip: React.FC<ChipProps> = ({
  selected = false,
  tone = "neutral",
  as = "button",
  className = "",
  children,
  ...rest
}) => {
  const classes = [
    "af-chip",
    selected ? "af-chip--selected" : "",
    !selected && tone !== "neutral" ? `af-chip--${tone}` : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (as === "span") {
    return (
      <span className={classes} {...(rest as React.HTMLAttributes<HTMLSpanElement>)}>
        {children}
      </span>
    );
  }

  return (
    <button type="button" className={classes} aria-pressed={selected} {...rest}>
      {children}
    </button>
  );
};

/* ── Icon button ─────────────────────────────────────────────────────── */

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Required: an icon-only control needs an accessible name. */
  label: string;
  active?: boolean;
  size?: "sm" | "md";
  /** Shows the unread dot in the corner. */
  dot?: boolean;
}

export const IconButton = React.forwardRef<
  HTMLButtonElement,
  IconButtonProps
>(({ label, active = false, size = "md", dot = false, className = "", children, ...rest }, ref) => (
  <button
    ref={ref}
    type="button"
    aria-label={label}
    title={label}
    className={[
      "af-icon-btn",
      size === "sm" ? "af-icon-btn--sm" : "",
      active ? "af-icon-btn--active" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ")}
    {...rest}
  >
    {children}
    {dot && <span className="af-icon-btn__dot" aria-hidden="true" />}
  </button>
));

IconButton.displayName = "IconButton";

/* ── List row ────────────────────────────────────────────────────────── */

export interface ListRowProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "title"> {
  lead?: React.ReactNode;
  title: React.ReactNode;
  meta?: React.ReactNode;
  trail?: React.ReactNode;
  /** Draws the trailing chevron. Off when `trail` supplies its own. */
  chevron?: boolean;
}

const Chevron: React.FC = () => (
  <svg
    className="af-listrow__chevron"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M9 18l6-6-6-6" />
  </svg>
);

export const ListRow: React.FC<ListRowProps> = ({
  lead,
  title,
  meta,
  trail,
  chevron = false,
  className = "",
  ...rest
}) => (
  <button type="button" className={`af-listrow ${className}`.trim()} {...rest}>
    {lead}
    <span className="af-listrow__body">
      <span className="af-listrow__title">{title}</span>
      {meta && <span className="af-listrow__meta">{meta}</span>}
    </span>
    {trail}
    {chevron && !trail && <Chevron />}
  </button>
);
