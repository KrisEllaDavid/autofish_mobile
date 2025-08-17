import React, { useState } from "react";

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
  style?: React.CSSProperties;
}

const CountryDropdown: React.FC<CountryDropdownProps> = ({
  countries,
  selectedCountry,
  selectedCode,
  onCountryChange,
  placeholder = "Sélectionnez votre pays",
  label,
  style = {}
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <>
      {label && (
        <div style={{ fontSize: 15, color: "#222", marginBottom: 10 }}>
          {label}
        </div>
      )}
      <div
        className={`categories-dropdown${showDropdown ? " open" : ""}`}
        tabIndex={0}
        style={{ marginBottom: 22, ...style }}
        onClick={() => setShowDropdown((open) => !open)}
      >
        <div
          className="categories-dropdown-header"
          style={{ cursor: "pointer" }}
        >
          <span style={{ color: selectedCountry ? "#222" : "#b0b0b0" }}>
            {selectedCountry || placeholder}
          </span>
          <span className="categories-dropdown-arrow">
            <img
              src="/icons/chevron.svg"
              alt="chevron"
              style={{ width: 24, height: 24 }}
            />
          </span>
        </div>
        {showDropdown && (
          <div
            className="categories-dropdown-list"
            style={{ marginTop: 18, zIndex: 1000 }}
          >
            {countries.map((country) => (
              <div
                key={country.name}
                className="categories-dropdown-item"
                style={{
                  fontSize: 16,
                  color: "#222",
                  cursor: "pointer",
                  padding: "12px 24px",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onCountryChange(country.name, country.code);
                  setShowDropdown(false);
                }}
              >
                {country.name}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default CountryDropdown;

