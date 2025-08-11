import React from "react";
import TopNavBar from "../../components/TopNavBar";
import "./MessagesPage.css";

interface MessagesPageProps {
  onNotificationClick?: () => void;
  onMyPageClick?: () => void;
  activeTab?: string;
  userAvatar?: string;
  userName?: string;
  userEmail?: string;
  userRole?: string;
}

const MessagesPage: React.FC<MessagesPageProps> = ({
  onNotificationClick,
  onMyPageClick,
  activeTab = "messages",
  userAvatar,
  userName,
  userEmail,
  userRole,
}) => {
  return (
    <div className="messages-page">
      <TopNavBar
        title="Messages"
        userAvatar={userAvatar}
        userName={userName}
        userEmail={userEmail}
        onNotificationClick={onNotificationClick}
        userRole={userRole}
        onMyPageClick={onMyPageClick}
        activeTab={activeTab}
      />

      <div className="messages-content">
        <div className="empty-state">
          <div className="empty-state-icon">
            <img src="/icons/messages-bottom-nav.svg" alt="messages" />
          </div>
          <h2>Aucun message</h2>
          <p>Vos conversations apparaîtront ici. Commencez à échanger avec d'autres utilisateurs.</p>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
