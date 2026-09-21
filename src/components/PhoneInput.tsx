import React from "react";
import { TextField } from "./ui";
import "../pages/Auth.css";

interface PhoneInputProps {
  countryCode: string;
  phoneNumber: string;
  onPhoneChange: (phone: string) => void;
  onCountryCodeClick: () => void;
  placeholder?: string;
  label?: string;
  hint?: string;
  error?: string;
  style?: React.CSSProperties;
}

/**
 * Dial code beside the number.
 *
 * The code is a button, not a decorated div: it opens the country list, so
 * it needs a real hit target, a focus ring and a keyboard path.
 */
const PhoneInput: React.FC<PhoneInputProps> = ({
  countryCode,
  phoneNumber,
  onPhoneChange,
  onCountryCodeClick,
  placeholder = "6 XX XX XX XX",
  label,
  hint,
  error,
  style,
}) => (
  <div className="signup-phone" style={style}>
    <div className="af-field">
      <span className="af-field__label">Indicatif</span>
      <div className="af-field__shell af-field__shell--filled">
        <button
          type="button"
          className="af-select__trigger"
          onClick={onCountryCodeClick}
          aria-label={`Indicatif ${countryCode}, changer de pays`}
        >
          <span className="af-select__value">{countryCode}</span>
          <svg
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
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </div>
    </div>

    <TextField
      label={label || "Téléphone"}
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      enterKeyHint="next"
      placeholder={placeholder}
      value={phoneNumber}
      onChange={(e) => onPhoneChange(e.target.value)}
      hint={hint}
      error={error}
    />
  </div>
);

export default PhoneInput;
