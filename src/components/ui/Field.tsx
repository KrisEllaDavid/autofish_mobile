import React, { useId, useState } from "react";

const eyeClosedIcon = "/icons/Eye Slash.svg";
const eyeOpenIcon = "/icons/Eye Open.svg";

type BaseProps = {
  label?: string;
  /** Sits under the field. Shares its slot with `error` so height is stable. */
  hint?: string;
  /** Names the problem; replaces `hint` and turns the shell red. */
  error?: string;
  /** Confirms a valid value without shouting. */
  valid?: boolean;
  iconStart?: React.ReactNode;
  iconEnd?: React.ReactNode;
  /** Renders a live `n / max` counter against `maxLength`. */
  showCount?: boolean;
  containerClassName?: string;
};

export interface TextFieldProps
  extends BaseProps,
    Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {}

export interface TextAreaProps
  extends BaseProps,
    React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

function shellClass(opts: {
  filled: boolean;
  error?: string;
  valid?: boolean;
  disabled?: boolean;
}) {
  return [
    "af-field__shell",
    opts.disabled ? "af-field__shell--disabled" : "",
    opts.error ? "af-field__shell--error" : "",
    !opts.error && opts.valid ? "af-field__shell--success" : "",
    !opts.error && !opts.valid && opts.filled ? "af-field__shell--filled" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function Note({
  id,
  error,
  hint,
  count,
}: {
  id: string;
  error?: string;
  hint?: string;
  count?: string;
}) {
  if (!error && !hint && !count) return null;
  return (
    <div
      id={id}
      className={`af-field__note${error ? " af-field__note--error" : ""}`}
      role={error ? "alert" : undefined}
    >
      <span>{error || hint}</span>
      {count && <span className="af-field__count">{count}</span>}
    </div>
  );
}

/** Single-line text input with label, icons, validation and count. */
export const TextField: React.FC<TextFieldProps> = ({
  label,
  hint,
  error,
  valid,
  iconStart,
  iconEnd,
  showCount,
  containerClassName = "",
  className = "",
  id,
  value,
  maxLength,
  disabled,
  ...rest
}) => {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const noteId = `${fieldId}-note`;
  const filled = String(value ?? "").length > 0;
  const count =
    showCount && maxLength
      ? `${String(value ?? "").length} / ${maxLength}`
      : undefined;

  return (
    <div className={`af-field ${containerClassName}`.trim()}>
      {label && (
        <label className="af-field__label" htmlFor={fieldId}>
          {label}
        </label>
      )}
      <div className={shellClass({ filled, error, valid, disabled })}>
        {iconStart && <span className="af-field__lead">{iconStart}</span>}
        <input
          id={fieldId}
          className={`af-field__input ${className}`.trim()}
          value={value}
          maxLength={maxLength}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint || count ? noteId : undefined}
          {...rest}
        />
        {iconEnd && <span className="af-field__trail">{iconEnd}</span>}
      </div>
      <Note id={noteId} error={error} hint={hint} count={count} />
    </div>
  );
};

/** Text input with a show/hide toggle that keeps its own 44px hit target. */
export const PasswordField: React.FC<Omit<TextFieldProps, "type">> = ({
  iconEnd: _iconEnd,
  ...props
}) => {
  const [visible, setVisible] = useState(false);
  return (
    <TextField
      {...props}
      type={visible ? "text" : "password"}
      iconEnd={
        <button
          type="button"
          className="af-field__toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={
            visible ? "Masquer le mot de passe" : "Afficher le mot de passe"
          }
          aria-pressed={visible}
          tabIndex={-1}
        >
          <img src={visible ? eyeOpenIcon : eyeClosedIcon} alt="" />
        </button>
      }
    />
  );
};

/** Multi-line input. Same shell, same states, same note slot. */
export const TextArea: React.FC<TextAreaProps> = ({
  label,
  hint,
  error,
  valid,
  showCount,
  containerClassName = "",
  className = "",
  id,
  value,
  maxLength,
  disabled,
  rows = 5,
  ...rest
}) => {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const noteId = `${fieldId}-note`;
  const filled = String(value ?? "").length > 0;
  const count =
    showCount && maxLength
      ? `${String(value ?? "").length} / ${maxLength}`
      : undefined;

  return (
    <div className={`af-field ${containerClassName}`.trim()}>
      {label && (
        <label className="af-field__label" htmlFor={fieldId}>
          {label}
        </label>
      )}
      <div className={shellClass({ filled, error, valid, disabled })}>
        <textarea
          id={fieldId}
          rows={rows}
          className={`af-field__input ${className}`.trim()}
          value={value}
          maxLength={maxLength}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint || count ? noteId : undefined}
          {...rest}
        />
      </div>
      <Note id={noteId} error={error} hint={hint} count={count} />
    </div>
  );
};

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: React.ReactNode;
}

/** Checkbox drawn from tokens — the native control is never styleable enough. */
export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  id,
  className = "",
  ...rest
}) => {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <label className={`af-check ${className}`.trim()} htmlFor={fieldId}>
      <input id={fieldId} type="checkbox" {...rest} />
      <span className="af-check__box" aria-hidden="true" />
      <span className="af-check__label">{label}</span>
    </label>
  );
};

export default TextField;
