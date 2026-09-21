import React, { useEffect, useRef, useState } from "react";
import AccountMenu from "./AccountMenu";
import { Avatar, IconButton } from "./ui";

interface TopNavBarProps {
  title: string;
  userAvatar?: string;
  userEmail?: string;
  userRole?: string;
  onNotificationClick?: () => void;
  onMyPageClick?: () => void;
  onChangePassword?: () => void;
  onAvatarClick?: () => void;
  activeTab?: string;
  userName?: string;
  /** Shows the unread dot on the notifications button. */
  hasNewPublications?: boolean;
}

const notificationIcon = "/icons/Notification.svg";
const notificationIconWhite = "/icons/Notification_white.svg";
const menuIcon = "/icons/3-dots-home-menu.svg";
const myPageIcon = "/icons/mypage-icon.svg";
const myPageIconWhite = "/icons/mypage-icon-white.svg";

/**
 * The app header.
 *
 * Fixed, inset from the top safe area, and raised with a hairline plus a
 * soft shadow only once content has scrolled beneath it — so a screen at
 * rest reads as one continuous surface.
 */
const TopNavBar: React.FC<TopNavBarProps> = ({
  title,
  userAvatar,
  userName,
  userEmail: _userEmail,
  userRole,
  onNotificationClick,
  onMyPageClick,
  onChangePassword,
  onAvatarClick,
  activeTab,
  hasNewPublications = false,
}) => {
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [raised, setRaised] = useState(false);

  // The header lifts off the page as soon as content scrolls under it.
  // Every screen owns its own scroll container, so rather than naming one,
  // listen in the capture phase and read whichever element actually scrolled.
  useEffect(() => {
    let frame = 0;
    let pending = 0;

    const commit = () => {
      frame = 0;
      setRaised(pending > 4);
    };

    const handle = (event: Event) => {
      const target = event.target;
      pending =
        target instanceof HTMLElement ? target.scrollTop : window.scrollY;
      if (!frame) frame = requestAnimationFrame(commit);
    };

    document.addEventListener("scroll", handle, {
      passive: true,
      capture: true,
    });

    return () => {
      document.removeEventListener("scroll", handle, { capture: true });
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const isProducer = userRole?.toLowerCase() === "producteur";
  const myPageActive = activeTab === "myPage";
  const notificationsActive = activeTab === "notifications";

  return (
    <header className={`af-header${raised ? " af-header--raised" : ""}`}>
      <div className="af-header__inner">
        <div className="af-header__side">
          <Avatar
            src={userAvatar}
            name={userName}
            size="sm"
            onClick={onAvatarClick}
            alt={onAvatarClick ? "Ouvrir mon profil" : undefined}
            style={{ boxShadow: "inset 0 0 0 1px var(--border-default)" }}
          />
        </div>

        <h1 className="af-header__title">{title}</h1>

        <div className="af-header__side af-header__side--end">
          {isProducer && (
            <IconButton
              label="Ma page"
              active={myPageActive}
              onClick={onMyPageClick}
            >
              <img
                src={myPageActive ? myPageIconWhite : myPageIcon}
                alt=""
                aria-hidden="true"
              />
            </IconButton>
          )}

          <IconButton
            label="Notifications"
            active={notificationsActive}
            dot={hasNewPublications}
            onClick={onNotificationClick}
          >
            <img
              src={notificationsActive ? notificationIconWhite : notificationIcon}
              alt=""
              aria-hidden="true"
            />
          </IconButton>

          <IconButton
            label="Menu"
            ref={menuButtonRef as React.Ref<HTMLButtonElement>}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <img src={menuIcon} alt="" aria-hidden="true" />
          </IconButton>

          <AccountMenu
            open={menuOpen}
            anchorRef={menuButtonRef as React.RefObject<HTMLButtonElement>}
            onClose={() => setMenuOpen(false)}
            onChangePassword={onChangePassword}
          />
        </div>
      </div>
    </header>
  );
};

export default TopNavBar;
