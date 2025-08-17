import React from "react";

interface PhoneInputProps {
  countryCode: string;
  phoneNumber: string;
  onPhoneChange: (phone: string) => void;
  onCountryCodeClick: () => void;
  placeholder?: string;
  label?: string;
  style?: React.CSSProperties;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  countryCode,
  phoneNumber,
  onPhoneChange,
  onCountryCodeClick,
  placeholder = "Entrez votre numéro de téléphone",
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
      <div
        style={{ 
          display: "flex", 
          alignItems: "center", 
          marginBottom: 32,
          ...style
        }}
      >
        <div
          style={{
            minWidth: 64,
            fontSize: 16,
            color: "#222",
            padding: "18px 10px 18px 18px",
            marginRight: 8,
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            userSelect: "none",
            position: "relative",
          }}
          onClick={onCountryCodeClick}
        >
          {countryCode}{" "}
          <span style={{ fontSize: 16, color: "#b0b0b0" }}></span>
        </div>
        <input
          className="input-box"
          style={{ marginBottom: 0 }}
          placeholder={placeholder}
          value={phoneNumber}
          onChange={(e) => onPhoneChange(e.target.value)}
          type="tel"
        />
      </div>
    </>
  );
};

export default PhoneInput;

