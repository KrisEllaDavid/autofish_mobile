import React from "react";
import { Notification } from "./notificationsMock";
import NotificationCard from "./NotificationCard";

interface NotificationListProps {
  notifications: Notification[];
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
}) => (
  <>
    {notifications.map((notif, idx) => (
      <NotificationCard
        key={notif.id}
        notification={notif}
        style={{ animationDelay: `${0.05 + idx * 0.05}s` }}
      />
    ))}
  </>
);

export default NotificationList;
