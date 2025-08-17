import React from "react";

interface AddressInputProps {
  address: string;
  onAddressChange: (address: string) => void;
  placeholder?: string;
  label?: string;
  style?: React.CSSProperties;
}

const AddressInput: React.FC<AddressInputProps> = ({
  address,
  onAddressChange,
  placeholder = "Entrez votre adresse",
  label,
  style = {}
}) => {
  return (
    <>
      {label && (
        <div style={{ fontSize: 15, color: "#222", marginBottom: 10 }}>
          {label}
        </div>
      )}
      <input
        className="input-box"
        placeholder={placeholder}
        value={address}
        onChange={(e) => onAddressChange(e.target.value)}
        style={style}
      />
    </>
  );
};

export default AddressInput;

