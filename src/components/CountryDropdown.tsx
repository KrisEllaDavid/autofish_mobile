import React from "react";
import UnifiedDropdown from "./UnifiedDropdown";

interface Country {
  name: string;
  code: string;
}

interface CountryDropdownProps {
  countries: Country[];
  selectedCountry: string;
  selectedCode: string;
  onCountryChange: (country: string, code: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  error?: string;
  style?: React.CSSProperties;
}

/** Country picker, backed by the shared select so it inherits its keyboard
 *  handling, focus ring and field shell. */
const CountryDropdown: React.FC<CountryDropdownProps> = ({
  countries,
  selectedCountry,
  selectedCode: _selectedCode,
  onCountryChange,
  placeholder = "Sélectionnez votre pays",
  label,
  required,
  error,
  style,
}) => (
  <UnifiedDropdown
    label={label}
    required={required}
    error={error}
    style={style}
    placeholder={placeholder}
    value={selectedCountry}
    options={countries.map((c) => ({ value: c.name, label: c.name }))}
    onChange={(value) => {
      const match = countries.find((c) => c.name === value);
      onCountryChange(value, match?.code ?? "");
    }}
  />
);

export default CountryDropdown;
