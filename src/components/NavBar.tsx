import React from "react";

interface NavBarProps {
  title: string;
  onBack?: () => void;
  /** Optional control rendered at the trailing edge (Skip, Save…). */
  action?: React.ReactNode;
  /** Lets the screen beneath show through — for photo and preview headers. */
  transparent?: boolean;
}

const BackIcon: React.FC = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M15 19l-7-7 7-7" />
  </svg>
);

/**
 * The header for the linear flows — auth, onboarding, page creation.
 *
 * Fixed rather than sticky so it survives the iOS keyboard, inset from the
 * top safe area, with matched side slots so the title stays optically centred
 * whether or not a back button or action is present.
 */
const NavBar: React.FC<NavBarProps> = ({
  title,
  onBack,
  action,
  transparent = false,
}) => (
  <header
    className={`af-header${transparent ? " af-header--transparent" : ""}`}
  >
    <div className="af-header__inner">
      <div className="af-header__side">
        {onBack && (
          <button
            type="button"
            className="af-icon-btn"
            onClick={onBack}
            aria-label="Retour"
          >
            <BackIcon />
          </button>
        )}
      </div>

      <h1 className="af-header__title">{title}</h1>

      <div className="af-header__side af-header__side--end">{action}</div>
    </div>
  </header>
);

export default NavBar;
