import React from "react";
import { Notification } from "./notificationsMock";
import { Avatar } from "../../components/ui";
import "./Notifications.css";

interface NotificationCardProps {
  notification: Notification;
  style?: React.CSSProperties;
  onNotificationClick?: (notification: Notification) => void;
}

const ChevronIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M9 18l6-6-6-6" />
  </svg>
);

/**
 * One notification.
 *
 * The whole row is the control — a separate "voir" button next to a row
 * that was already clickable gave the same action two targets and made the
 * list noisier than the content it carried.
 */
const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  style,
  onNotificationClick,
}) => (
  <button
    type="button"
    className={`notif-card${notification.seen ? "" : " notif-card--unread"}`}
    style={style}
    onClick={() => onNotificationClick?.(notification)}
  >
    <Avatar
      src={notification.user.avatar}
      name={notification.user.name}
      alt=""
    />

    <span className="notif-card__body">
      <span className="notif-card__text">
        <strong>{notification.user.name}</strong> {notification.message}
      </span>

      <span className="notif-card__foot">
        <span className="notif-card__date">{notification.date}</span>
        {!notification.seen && (
          <span className="notif-card__badge">Nouveau</span>
        )}
      </span>
    </span>

    <span className="notif-card__chevron">
      <ChevronIcon />
    </span>
  </button>
);

export default NotificationCard;
