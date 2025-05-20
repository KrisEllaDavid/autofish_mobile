import React from "react";
import TopNavBar from "../../components/TopNavBar";
import BottomNavBar from "../../components/BottomNavBar";
import "../HomePage.css";
import NotificationList from "./NotificationList";
import { notifications } from "./notificationsMock";
import { useAuth } from "../../context/AuthContext";

const NotificationsPage: React.FC<{ onBackToHome: () => void }> = ({
  onBackToHome,
}) => {
  const { userData } = useAuth();
  return (
    <div className="home-container">
      {/* Top Navigation with notifications icon highlighted */}
      <TopNavBar
        title="Notifs"
        userAvatar={userData?.avatar}
        userRole={userData?.userRole}
        userName={userData?.name}
        userEmail={userData?.email}
        activeTab="notifications"
        onNotificationClick={() => {}}
        onMyPageClick={() => {}}
      />
      {/* Notifications Feed */}
      <div className="posts-feed">
        <NotificationList notifications={notifications} />
        {/* Add extra space at the bottom to ensure content doesn't hide behind bottom nav */}
        <div style={{ height: "70px" }}></div>
      </div>
      {/* Bottom Navigation */}
      <BottomNavBar
        activeTab="home"
        onTabChange={(tab: "home" | "messages" | "connections" | "profile") => {
          if (tab === "home") onBackToHome();
        }}
      />
    </div>
  );
};

export default NotificationsPage;
