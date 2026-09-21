import React, { useEffect, useId, useRef, useState } from "react";

interface DropdownOption {
  value: string;
  label: string;
}

interface UnifiedDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label?: string;
  icon?: string;
  activeIcon?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  style?: React.CSSProperties;
}

const ChevronIcon: React.FC<{ open: boolean }> = ({ open }) => (
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
    style={{
      transform: open ? "rotate(180deg)" : "rotate(0deg)",
      transition: "transform var(--dur-fast) var(--ease-out)",
    }}
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const CheckIcon: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 12.5l5 5L20 6.5" />
  </svg>
);

/**
 * Select control shared by the signup, page-creation and filter flows.
 *
 * Built on the same field shell as TextField so a form reads as one set of
 * controls, and wired as a real listbox: arrow keys, Home/End, Escape, type-
 * to-jump, and a focus return to the trigger on close.
 */
const UnifiedDropdown: React.FC<UnifiedDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder,
  label,
  icon,
  activeIcon,
  disabled = false,
  required = false,
  error,
  hint,
  className = "",
  style,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();
  const noteId = `${listId}-note`;

  const selectedIndex = options.findIndex((option) => option.value === value);
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : undefined;
  const hasContent = Boolean(value);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown, {
      passive: true,
    });
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [isOpen]);

  // Open on the current selection so the list starts where the user left off.
  const open = () => {
    if (disabled) return;
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setIsOpen(true);
  };

  const close = (refocus = true) => {
    setIsOpen(false);
    if (refocus) triggerRef.current?.focus();
  };

  const commit = (index: number) => {
    const option = options[index];
    if (!option) return;
    onChange(option.value);
    close();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        open();
      }
      return;
    }

    switch (event.key) {
      case "Escape":
        event.preventDefault();
        close();
        break;
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((i) => (i + 1) % options.length);
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((i) => (i - 1 + options.length) % options.length);
        break;
      case "Home":
        event.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        event.preventDefault();
        setActiveIndex(options.length - 1);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        commit(activeIndex);
        break;
      case "Tab":
        close(false);
        break;
      default:
        if (event.key.length === 1) {
          const target = event.key.toLowerCase();
          const next = options.findIndex((o) =>
            o.label.toLowerCase().startsWith(target)
          );
          if (next >= 0) setActiveIndex(next);
        }
    }
  };

  const shellClasses = [
    "af-field__shell",
    "af-select",
    disabled ? "af-field__shell--disabled" : "",
    error ? "af-field__shell--error" : "",
    !error && hasContent ? "af-field__shell--filled" : "",
    isOpen ? "af-select--open" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={`af-field af-select-root ${className}`.trim()}
      ref={rootRef}
      style={style}
    >
      {label && (
        <span className="af-field__label">
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </span>
      )}

      <div className={shellClasses}>
        {icon && (
          <span className="af-field__lead">
            <img
              src={hasContent && activeIcon ? activeIcon : icon}
              alt=""
              aria-hidden="true"
            />
          </span>
        )}

        <button
          ref={triggerRef}
          type="button"
          className="af-select__trigger"
          onClick={() => (isOpen ? close(false) : open())}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={isOpen ? listId : undefined}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? noteId : undefined}
        >
          <span
            className={`af-select__value${
              hasContent ? "" : " af-select__value--placeholder"
            }`}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronIcon open={isOpen} />
        </button>

        {isOpen && (
          <ul
            id={listId}
            ref={listRef}
            className="af-select__list"
            role="listbox"
            aria-label={label || placeholder}
            tabIndex={-1}
          >
            {options.map((option, index) => {
              const isSelected = option.value === value;
              return (
                <li key={option.value} role="none">
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={`af-select__option${
                      index === activeIndex ? " af-select__option--active" : ""
                    }`}
                    onClick={() => commit(index)}
                    onMouseEnter={() => setActiveIndex(index)}
                  >
                    <span>{option.label}</span>
                    {isSelected && <CheckIcon />}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {(error || hint) && (
        <div
          id={noteId}
          className={`af-field__note${error ? " af-field__note--error" : ""}`}
          role={error ? "alert" : undefined}
        >
          {error || hint}
        </div>
      )}
    </div>
  );
};

export default UnifiedDropdown;
