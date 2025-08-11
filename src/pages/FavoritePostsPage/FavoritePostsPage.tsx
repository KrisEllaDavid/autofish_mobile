import React from "react";
import TopNavBar from "../../components/TopNavBar";
import "./FavoritePostsPage.css";

interface FavoritePostsPageProps {
  onNotificationClick?: () => void;
  onMyPageClick?: () => void;
  activeTab?: string;
  userAvatar?: string;
  userName?: string;
  userEmail?: string;
  userRole?: string;
}

const FavoritePostsPage: React.FC<FavoritePostsPageProps> = ({
  onNotificationClick,
  onMyPageClick,
  activeTab = "favorites",
  userAvatar,
  userName,
  userEmail,
  userRole,
}) => {
  return (
    <div className="favorite-posts-page">
      <TopNavBar
        title="Publications favorites"
        userAvatar={userAvatar}
        userName={userName}
        userEmail={userEmail}
        onNotificationClick={onNotificationClick}
        userRole={userRole}
        onMyPageClick={onMyPageClick}
        activeTab={activeTab}
      />

      <div className="favorite-posts-content">
        <div className="empty-state">
          <div className="empty-state-icon">
            <img src="/icons/dark_heart_outline_like.svg" alt="favorites" />
          </div>
          <h2>Aucune publication favorite</h2>
          <p>Vos publications favorites apparaîtront ici une fois que vous commencerez à aimer des posts.</p>
        </div>
      </div>
    </div>
  );
};

export default FavoritePostsPage;
