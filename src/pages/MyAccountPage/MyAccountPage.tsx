import React from "react";
import TopNavBar from "../../components/TopNavBar";
import "./MyAccountPage.css";

interface MyAccountPageProps {
  onNotificationClick?: () => void;
  onMyPageClick?: () => void;
  activeTab?: string;
  userAvatar?: string;
  userName?: string;
  userEmail?: string;
  userRole?: string;
}

const MyAccountPage: React.FC<MyAccountPageProps> = ({
  onNotificationClick,
  onMyPageClick,
  activeTab = "profile",
  userAvatar,
  userName,
  userEmail,
  userRole,
}) => {
  return (
    <div className="my-account-page">
      <TopNavBar
        title="Mon compte"
        userAvatar={userAvatar}
        userName={userName}
        userEmail={userEmail}
        onNotificationClick={onNotificationClick}
        userRole={userRole}
        onMyPageClick={onMyPageClick}
        activeTab={activeTab}
      />

      <div className="my-account-content">
        <div className="empty-state">
          <div className="empty-state-icon">
            <img src="/icons/profile-bottom-nav.svg" alt="account" />
          </div>
          <h2>Mon compte</h2>
          <p>Gérez vos paramètres de compte, votre profil et vos préférences ici.</p>
        </div>
      </div>
    </div>
  );
};

export default MyAccountPage;
