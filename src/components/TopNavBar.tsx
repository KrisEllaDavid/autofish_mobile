import React from "react";

interface TopNavBarProps {
  title: string;
  userAvatar?: string;
  onNotificationClick?: () => void;
  onMenuClick?: () => void;
  userRole?: string;
  onMyPageClick?: () => void;
}

const defaultAvatar = "/icons/account.svg";
const notificationIcon = "/icons/Notification.svg";
const menuIcon = "/icons/3-dots-home-menu.svg";
const myPageIcon = "/icons/mypage-icon.svg";

const TopNavBar: React.FC<TopNavBarProps> = ({
  title,
  userAvatar,
  onNotificationClick,
  onMenuClick,
  userRole,
  onMyPageClick,
}) => {
  console.log("TopNavBar userRole:", userRole);
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
              background: "none",
              border: "none",
              padding: 8,
              marginRight: 0,
              cursor: "pointer",
            }}
            onClick={onMyPageClick}
          >
            <img
              src={myPageIcon}
              alt="Ma page"
              style={{ width: 24, height: 24 }}
            />
          </button>
        )}
        <button
          className="nav-button"
          style={{
            background: "none",
            border: "none",
            padding: 8,
            marginRight: 0,
            cursor: "pointer",
          }}
          onClick={onNotificationClick}
        >
          <img
            src={notificationIcon}
            alt="Notifications"
            style={{ width: 24, height: 24 }}
          />
        </button>
        <button
          className="nav-button"
          style={{
            background: "none",
            border: "none",
            padding: 8,
            cursor: "pointer",
          }}
          onClick={onMenuClick}
        >
          <img src={menuIcon} alt="Menu" style={{ width: 24, height: 24 }} />
        </button>
      </div>
    </div>
  );
};

export default TopNavBar;
