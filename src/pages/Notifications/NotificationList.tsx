import React from "react";
import { Notification } from "./notificationsMock";
import NotificationCard from "./NotificationCard";
import "./Notifications.css";

interface NotificationListProps {
  notifications: Notification[];
  onNotificationClick?: (notification: Notification) => void;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onNotificationClick,
}) => (
  <div className="notif-list">
    {notifications.map((notif, idx) => (
      <NotificationCard
        key={notif.id}
        notification={notif}
        /* Capped so a long list does not stagger for seconds. */
        style={{ animationDelay: `${Math.min(idx, 7) * 40}ms` }}
        onNotificationClick={onNotificationClick}
      />
    ))}
  </div>
);

export default NotificationList;
