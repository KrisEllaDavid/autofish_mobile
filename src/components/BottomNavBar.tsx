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
  producers: "/icons/profile-2user-bottom-nav.svg",
  producersActive: "/icons/profile-2user.svg",
  favorites: "/icons/dark_heart_outline_like.svg",
  favoritesActive: "/icons/favourite_blue.svg",
  home: "/icons/home-2-bottom-nav.svg",
  messages: "/icons/messages-bottom-nav.svg",
  messagesActive: "/icons/messages-bottom-nav-blue.svg",
  profile: "/icons/profile-bottom-nav.svg",
  profileActive: "/icons/profile-2user-bottom-nav-blue.svg",
} as const;

type TabSpec = {
  id: Exclude<NavTab, "home">;
  label: string;
  icon: string;
  iconActive: string;
};

const startTabs: TabSpec[] = [
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
];

const endTabs: TabSpec[] = [
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
 * Five destinations: four flanking tabs plus the home button raised into a
 * notch in the bar. The notch is a CSS mask (see BottomNavBar.css) so the
 * silhouette holds its shape from a 320px phone to a tablet column, and the
 * whole bar sits above the home indicator via env(safe-area-inset-bottom).
 */
const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onTabChange,
  messageCount = 0,
}) => {
  const renderTab = (tab: TabSpec) => {
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
          unread
            ? `${tab.label}, ${messageCount} non lus`
            : tab.label
        }
      >
        <span className="af-tab__icon">
          <img src={active ? tab.iconActive : tab.icon} alt="" aria-hidden="true" />
          {unread && (
            <span className="af-badge af-tab__badge" aria-hidden="true">
              {messageCount > 99 ? "99+" : messageCount}
            </span>
          )}
        </span>
        <span className="af-tab__label">{tab.label}</span>
      </button>
    );
  };

  const homeActive = activeTab === "home";

  return (
    <nav className="af-tabbar" aria-label="Navigation principale">
      <div className="af-tabbar__inner">
        <div className="af-tabbar__veil" aria-hidden="true" />
        <div className="af-tabbar__surface" aria-hidden="true" />

        <div className="af-tabbar__group af-tabbar__group--start">
          {startTabs.map(renderTab)}
        </div>

        <div className="af-tabbar__group af-tabbar__group--end">
          {endTabs.map(renderTab)}
        </div>

        <button
          type="button"
          className={`af-tabbar__home${homeActive ? " af-tabbar__home--active" : ""}`}
          onClick={() => onTabChange("home")}
          aria-label="Accueil"
          aria-current={homeActive ? "page" : undefined}
        >
          <img src={icons.home} alt="" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
};

export default BottomNavBar;
