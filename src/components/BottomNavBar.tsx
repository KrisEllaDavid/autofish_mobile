import React from "react";
import "./BottomNavBar.css";

export type NavTab =
  | "home"
  | "messages"
  | "producers"
  | "profile"
  | "favorites";

interface BottomNavBarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  /** Unread conversation count shown on the messages tab. */
  messageCount?: number;
}

const icons = {
  home: "/icons/home-2-bottom-nav-inactive.svg",
  homeActive: "/icons/home-2-bottom-nav-blue.svg",
  producers: "/icons/profile-2user-bottom-nav.svg",
  producersActive: "/icons/profile-2user.svg",
  favorites: "/icons/dark_heart_outline_like.svg",
  favoritesActive: "/icons/favourite_blue.svg",
  messages: "/icons/messages-bottom-nav.svg",
  messagesActive: "/icons/messages-bottom-nav-blue.svg",
  profile: "/icons/profile-bottom-nav.svg",
  profileActive: "/icons/profile-2user-bottom-nav-blue.svg",
} as const;

type TabSpec = {
  id: NavTab;
  label: string;
  icon: string;
  iconActive: string;
};

// Home first, in reading order — the flat bar this became is read left to
// right, so the primary destination leads it instead of sitting apart.
const tabs: TabSpec[] = [
  {
    id: "home",
    label: "Accueil",
    icon: icons.home,
    iconActive: icons.homeActive,
  },
  {
    id: "producers",
    label: "Producteurs",
    icon: icons.producers,
    iconActive: icons.producersActive,
  },
  {
    id: "favorites",
    label: "Favoris",
    icon: icons.favorites,
    iconActive: icons.favoritesActive,
  },
  {
    id: "messages",
    label: "Messages",
    icon: icons.messages,
    iconActive: icons.messagesActive,
  },
  {
    id: "profile",
    label: "Profil",
    icon: icons.profile,
    iconActive: icons.profileActive,
  },
];

/**
 * The app's primary navigation.
 *
 * A flat, equal-weight five-tab bar — the pattern every mainstream feed app
 * (LinkedIn included) actually ships, not a floating notch-and-badge affair.
 * One accent colour marks the active tab; nothing else competes with it.
 */
const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onTabChange,
  messageCount = 0,
}) => (
  <nav className="af-tabbar" aria-label="Navigation principale">
    {tabs.map((tab) => {
      const active = activeTab === tab.id;
      const unread = tab.id === "messages" && messageCount > 0;

      return (
        <button
          key={tab.id}
          type="button"
          className={`af-tab${active ? " af-tab--active" : ""}`}
          onClick={() => onTabChange(tab.id)}
          aria-current={active ? "page" : undefined}
          aria-label={
            unread ? `${tab.label}, ${messageCount} non lus` : tab.label
          }
        >
          <span className="af-tab__icon">
            <img
              src={active ? tab.iconActive : tab.icon}
              alt=""
              aria-hidden="true"
            />
            {unread && (
              <span className="af-badge af-tab__badge" aria-hidden="true">
                {messageCount > 99 ? "99+" : messageCount}
              </span>
            )}
          </span>
          <span className="af-tab__label">{tab.label}</span>
        </button>
      );
    })}
  </nav>
);

export default BottomNavBar;
