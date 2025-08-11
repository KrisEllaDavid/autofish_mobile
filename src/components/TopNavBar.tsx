import React, { useRef, useState } from "react";
import AccountMenu from "./AccountMenu";

interface TopNavBarProps {
  title: string;
  userAvatar?: string;
  userEmail?: string;
  userRole?: string;
  onNotificationClick?: () => void;
  onMyPageClick?: () => void;
  activeTab?: string;
  userName?: string;
}

const defaultAvatar = "/icons/autofish_blue_logo.svg";
const notificationIcon = "/icons/Notification.svg";
const notificationIconWhite = "/icons/Notification_white.svg";
const menuIcon = "/icons/3-dots-home-menu.svg";
const myPageIcon = "/icons/mypage-icon.svg";
const myPageIconWhite = "/icons/mypage-icon-white.svg";
const mainBlue = "#00B2D6";

const TopNavBar: React.FC<TopNavBarProps> = ({
  title,
  userAvatar,
  userName: _userName,
  userEmail: _userEmail,
  userRole,
  onNotificationClick,
  onMyPageClick,
  activeTab,
}) => {
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className="top-nav"
      style={{
        width: "100%",
        height: 80,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 16px",
        backgroundColor: "#ffffff",
        zIndex: 1000,
        position: "fixed",
      }}
    >
      <div
        style={{
          width: 90,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            overflow: "hidden",
            border: "1px solid rgba(0, 0, 0, 0.1)",
          }}
        >
          <img
            src={userAvatar || defaultAvatar}
            alt="User"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>
      </div>

      <h1
        style={{
          margin: 0,
          fontSize: 18,
          fontWeight: 700,
          color: "#333",
          flex: 1,
          textAlign: "center",
        }}
      >
        {title}
      </h1>

      <div
        style={{
          width: 90,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
        }}
      >
        {userRole?.toLowerCase() === "producteur" && (
          <button
            className="nav-button"
            style={{
              background: activeTab === "myPage" ? mainBlue : "none",
              border: "none",
              padding: 8,
              marginRight: 0,
              cursor: "pointer",
              borderRadius: activeTab === "myPage" ? "10px" : undefined,
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={onMyPageClick}
          >
            <img
              src={activeTab === "myPage" ? myPageIconWhite : myPageIcon}
              alt="Ma page"
              style={{ width: 24, height: 24 }}
            />
          </button>
        )}
        <button
          className="nav-button"
          style={{
            background: activeTab === "notifications" ? mainBlue : "none",
            border: "none",
            padding: 8,
            marginRight: 0,
            cursor: "pointer",
            borderRadius: activeTab === "notifications" ? "10px" : undefined,
            width: 40,
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={onNotificationClick}
        >
          <img
            src={
              activeTab === "notifications"
                ? notificationIconWhite
                : notificationIcon
            }
            alt="Notifications"
            style={{ width: 24, height: 24 }}
          />
        </button>
        <button
          className="nav-button"
          ref={menuButtonRef}
          style={{
            background: "none",
            border: "none",
            padding: 8,
            cursor: "pointer",
          }}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <img src={menuIcon} alt="Menu" style={{ width: 24, height: 24 }} />
        </button>
        <AccountMenu
          open={menuOpen}
          anchorRef={menuButtonRef as React.RefObject<HTMLButtonElement>}
          onClose={() => setMenuOpen(false)}
        />
      </div>
    </div>
  );
};

export default TopNavBar;
