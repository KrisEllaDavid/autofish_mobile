import React, { useState, useRef, useEffect } from 'react';

interface DropdownOption {
  value: string;
  label: string;
}

interface UnifiedDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon?: string;
  activeIcon?: string;
  disabled?: boolean;
  required?: boolean;
  style?: React.CSSProperties;
}

const UnifiedDropdown: React.FC<UnifiedDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder,
  icon,
  activeIcon,
  disabled = false,
  required = false,
  style = {}
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const selectedOption = options.find(option => option.value === value);
  const hasContent = !!value;

  const inputContainerStyle: React.CSSProperties = {
    position: "relative",
    width: "100%",
    marginBottom: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    ...style
  };

  const getInputStyle = (hasContent: boolean): React.CSSProperties => ({
    width: "100%",
    padding: "16px 48px 16px 16px",
    borderRadius: 15,
    border: hasContent ? "1.2px solid #222" : "1.2px solid #e0e0e0",
    background: disabled ? "#f5f5f5" : "#fafbfc",
    fontSize: 16,
    color: hasContent ? "#222" : "#b0b0b0",
    marginBottom: 0,
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
    fontWeight: 500,
    cursor: disabled ? "not-allowed" : "pointer",
    userSelect: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  });

  const iconStyle: React.CSSProperties = {
    position: "absolute",
    left: 18,
    top: "50%",
    transform: "translateY(-50%)",
    width: 22,
    height: 22,
    opacity: hasContent ? 1 : 0.6,
    zIndex: 2
  };

  const arrowStyle: React.CSSProperties = {
    position: "absolute",
    right: 18,
    top: "50%",
    transform: `translateY(-50%) ${isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}`,
    width: 20,
    height: 20,
    opacity: 0.6,
    transition: "transform 0.3s ease",
    zIndex: 2
  };

  const dropdownListStyle: React.CSSProperties = {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    background: "#fff",
    border: "1.2px solid #e0e0e0",
    borderRadius: 15,
    marginTop: 4,
    maxHeight: 200,
    overflowY: "auto",
    zIndex: 1000,
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)"
  };

  const dropdownItemStyle: React.CSSProperties = {
    padding: "12px 16px",
    fontSize: 16,
    color: "#222",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
    borderBottom: "1px solid #f0f0f0"
  };

  // Hover style would be used with CSS-in-JS hover pseudo-selectors if needed
  // const dropdownItemHoverStyle: React.CSSProperties = {
  //   ...dropdownItemStyle,
  //   backgroundColor: "#f8f9fa"
  // };

  return (
    <>
      <style>{`
        .unified-dropdown-item:hover {
          background-color: #f8f9fa !important;
        }
        .unified-dropdown-item:last-child {
          border-bottom: none;
        }
      `}</style>
      <div style={inputContainerStyle} ref={dropdownRef}>
        {icon && (
          <span style={iconStyle}>
            <img
              src={hasContent && activeIcon ? activeIcon : icon}
              alt="dropdown icon"
              style={{
                width: 22,
                height: 22,
                opacity: hasContent ? 1 : 0.6,
              }}
            />
          </span>
        )}
        
        <div
          style={getInputStyle(hasContent)}
          onClick={toggleDropdown}
        >
          <span style={{ flex: 1, textAlign: "left" }}>
            {selectedOption ? selectedOption.label : placeholder}
            {required && !hasContent && <span style={{ color: "#ff6b6b" }}> *</span>}
          </span>
        </div>

        <span style={arrowStyle}>
          <img
            src="/icons/chevron.svg"
            alt="dropdown arrow"
            style={{ width: 20, height: 20 }}
          />
        </span>

        {isOpen && (
          <div style={dropdownListStyle}>
            {options.map((option) => (
              <div
                key={option.value}
                className="unified-dropdown-item"
                style={dropdownItemStyle}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default UnifiedDropdown;
