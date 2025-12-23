import React from "react";
import { Notification } from "./notificationsMock";
import { normalizeImageUrl } from "../../utils/imageUtils";

const mainBlue = "#00B2D6";

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

interface NotificationCardProps {
  notification: Notification;
  style?: React.CSSProperties;
  onNotificationClick?: (notification: Notification) => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  style,
  onNotificationClick,
}) => (
  <div className="post-animation" style={style}>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        background: notification.seen ? "#fff" : "#f7fafd",
        borderRadius: 12,
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        padding: 12,
        marginBottom: 12,
        border: "1px solid #e6e6e6",
        cursor: onNotificationClick ? "pointer" : "default",
      }}
      onClick={() => onNotificationClick && onNotificationClick(notification)}
    >
      {/* Avatar or initials */}
      {notification.user.avatar ? (
        <img
          src={normalizeImageUrl(notification.user.avatar)}
          alt={notification.user.name}
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            objectFit: "cover",
            marginRight: 12,
          }}
        />
      ) : (
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: mainBlue + "22",
            color: mainBlue,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 20,
            marginRight: 12,
          }}
        >
          {getInitials(notification.user.name)}
        </div>
      )}
      {/* Notification content */}
      <div style={{ flex: 1 }}>
        <span style={{ fontWeight: 700, color: "#222" }}>
          {notification.user.name}
        </span>{" "}
        <span style={{ color: "#222" }}>{notification.message}</span>
        <div style={{ display: "flex", alignItems: "center", marginTop: 6 }}>
          <span style={{ color: "#888", fontSize: 13 }}>
            {notification.date}
          </span>
        </div>
      </div>
      {/* Voir button */}
      <button
        style={{
          display: "flex",
          alignItems: "center",
          background: "#f3faff",
          border: "none",
          borderRadius: 20,
          padding: "6px 16px",
          color: "#333",
          fontWeight: 500,
          fontSize: 15,
          marginLeft: 12,
          cursor: "pointer",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        }}
      >
        <img
          src="/icons/Eye Open.svg"
          alt="voir"
          style={{ width: 20, height: 20, marginRight: 6, opacity: 0.8 }}
        />
        voir
      </button>
    </div>
  </div>
);

export default NotificationCard;
