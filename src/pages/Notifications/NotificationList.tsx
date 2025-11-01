import React from "react";
import { Notification } from "./notificationsMock";
import NotificationCard from "./NotificationCard";

interface NotificationListProps {
  notifications: Notification[];
  onNotificationClick?: (notification: Notification) => void;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onNotificationClick,
}) => (
  <>
    {notifications.map((notif, idx) => (
      <NotificationCard
        key={notif.id}
        notification={notif}
        style={{ animationDelay: `${0.05 + idx * 0.05}s` }}
        onNotificationClick={onNotificationClick}
      />
    ))}
  </>
);

export default NotificationList;
