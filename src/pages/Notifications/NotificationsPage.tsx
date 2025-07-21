import React from "react";
import TopNavBar from "../../components/TopNavBar";
import BottomNavBar from "../../components/BottomNavBar";
import "../HomePage.css";
import NotificationList from "./NotificationList";
import { notifications } from "./notificationsMock";

const NotificationsPage: React.FC<{
  onBackToHome: () => void;
  onNotificationClick: () => void;
  onMyPageClick: () => void;
  activeTab: string;
  userAvatar?: string;
  userName?: string;
  userEmail?: string;
  userRole?: string;
}> = ({
  onBackToHome,
  onNotificationClick,
  onMyPageClick,
  activeTab,
  userAvatar,
  userName,
  userEmail,
  userRole,
}) => {
  return (
    <div className="home-container">
      {/* Top Navigation with notifications icon highlighted */}
      <TopNavBar
        title="Notifs"
        userAvatar={userAvatar}
        userRole={userRole}
        userName={userName}
        userEmail={userEmail}
        activeTab={activeTab}
        onNotificationClick={onNotificationClick}
        onMyPageClick={onMyPageClick}
      />
      {/* Notifications Feed */}
      <div className="posts-feed" style={{ marginTop: "90px" }}>
        <NotificationList notifications={notifications} />
        {/* Add extra space at the bottom to ensure content doesn't hide behind bottom nav */}
        <div style={{ height: "70px" }}></div>
      </div>
      {/* Bottom Navigation */}
      <BottomNavBar
        activeTab="home"
        onTabChange={(tab: "home" | "messages" | "producers" | "profile") => {
          if (tab === "home") onBackToHome();
        }}
      />
    </div>
  );
};

export default NotificationsPage;
