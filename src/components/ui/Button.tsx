import React from "react";

type Variant =
  | "primary"
  | "dark"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "danger-quiet"
  | "whatsapp";

type Size = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Fills the width of its container — the default for form submits. */
  block?: boolean;
  /** Swaps the label for a spinner and blocks input, without resizing. */
  loading?: boolean;
  /** Shown in place of children while `loading`; falls back to the label. */
  loadingLabel?: string;
  iconStart?: React.ReactNode;
  iconEnd?: React.ReactNode;
}

/**
 * The single button in the app. Press feedback lands on contact via :active
 * in components.css; hover is gated behind a pointer:fine query there so a
 * tap never leaves a stuck hover state.
 */
const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  block = false,
  loading = false,
  loadingLabel,
  iconStart,
  iconEnd,
  disabled,
  className = "",
  children,
  type = "button",
  ...rest
}) => {
  const classes = [
    "af-btn",
    `af-btn--${variant}`,
    size !== "md" ? `af-btn--${size}` : "",
    block ? "af-btn--block" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const onBrandSpinner =
    variant === "primary" ||
    variant === "dark" ||
    variant === "danger" ||
    variant === "whatsapp";

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? (
        <>
          <span
            className={`af-spinner${onBrandSpinner ? " af-spinner--on-brand" : ""}`}
            aria-hidden="true"
          />
          {loadingLabel ?? children}
        </>
      ) : (
        <>
          {iconStart}
          {children}
          {iconEnd}
        </>
      )}
    </button>
  );
};

export default Button;
