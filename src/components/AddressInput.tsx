import React from "react";
import { TextField } from "./ui";

interface AddressInputProps {
  address: string;
  onAddressChange: (address: string) => void;
  placeholder?: string;
  label?: string;
  hint?: string;
  error?: string;
  style?: React.CSSProperties;
}

const AddressInput: React.FC<AddressInputProps> = ({
  address,
  onAddressChange,
  placeholder = "Ville, quartier, repère…",
  label,
  hint,
  error,
  style,
}) => (
  <div style={style}>
    <TextField
      label={label}
      value={address}
      onChange={(e) => onAddressChange(e.target.value)}
      placeholder={placeholder}
      autoComplete="street-address"
      enterKeyHint="next"
      hint={hint}
      error={error}
    />
  </div>
);

export default AddressInput;
