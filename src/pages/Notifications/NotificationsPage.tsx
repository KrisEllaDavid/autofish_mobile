import React, { useState, useEffect } from "react";
import TopNavBar from "../../components/TopNavBar";
import BottomNavBar from "../../components/BottomNavBar";
import PullToRefreshIndicator from "../../components/PullToRefresh";
import { usePullToRefresh } from "../../hooks/usePullToRefresh";
import { useApiWithLoading } from "../../services/apiWithLoading";
import { Notification as ApiNotification } from "../../services/api";
import { Notification as UINotification } from "./notificationsMock";
import "../HomePage.css";
import NotificationList from "./NotificationList";

// Utility function to map API notifications to UI notifications
const mapApiNotificationToUI = (apiNotif: ApiNotification): UINotification => {
  // Format the date
  const date = new Date(apiNotif.created_at).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });

  return {
    id: apiNotif.id.toString(),
    type: apiNotif.notification_type === 'order' ? 'new_post' : 'like',
    user: {
      name: 'Système', // API notifications don't have user info, using system
      avatar: null,
    },
    message: apiNotif.message,
    date: date,
    seen: apiNotif.is_read,
    postId: apiNotif.related_object_id?.toString() || '0',
  };
};

interface NotificationsPageProps {
  onBackToHome: () => void;
  onNotificationClick: () => void;
  onMyPageClick: () => void;
  onTabChange: (tab: "home" | "messages" | "producers" | "profile" | "favorites") => void;
  activeTab: string;
  userAvatar?: string;
  userName?: string;
  userEmail?: string;
  userRole?: string;
}

const NotificationsPage: React.FC<NotificationsPageProps> = ({
  onBackToHome: _onBackToHome,
  onNotificationClick,
  onMyPageClick,
  onTabChange,
  activeTab,
  userAvatar,
  userName,
  userEmail,
  userRole,
}) => {
  const api = useApiWithLoading();
  const [notifications, setNotifications] = useState<UINotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      if (initialLoad) {
        setLoading(true);
      }
      setError(null);

      // Check if user is authenticated
      if (!api.isAuthenticated()) {
        setError('Vous devez être connecté pour voir les notifications');
        setNotifications([]);
        if (initialLoad) {
          setLoading(false);
        }
        return;
      }

      const apiNotifications = await api.getNotifications();
      const uiNotifications = apiNotifications.map(mapApiNotificationToUI);
      setNotifications(uiNotifications);

      if (import.meta.env.DEV) {
        console.log('✅ Loaded notifications:', uiNotifications.length);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load notifications';
      setError(errorMessage);
      console.error('❌ Failed to load notifications:', err);
      setNotifications([]);
    } finally {
      if (initialLoad) {
        setLoading(false);
        setInitialLoad(false);
      }
    }
  };

  // Pull to refresh hook
  const pullToRefresh = usePullToRefresh({
    onRefresh: fetchNotifications,
    threshold: 80,
  });

  useEffect(() => {
    fetchNotifications();
  }, []);
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
      <div 
        className="posts-feed" 
        style={{ marginTop: "90px", position: 'relative' }}
        ref={pullToRefresh.containerRef}
      >
        <PullToRefreshIndicator
          show={pullToRefresh.showIndicator}
          text={pullToRefresh.indicatorText}
          opacity={pullToRefresh.indicatorOpacity}
          isRefreshing={pullToRefresh.isRefreshing}
        />
        
        {/* Hidden Loading State - only show on initial load */}
        {loading && initialLoad && (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid #f3f3f3',
              borderTop: '3px solid #00B2D6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '20px auto'
            }} />
            <p>Chargement des notifications...</p>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div style={{ textAlign: "center", padding: "40px", color: "red" }}>
            <p>Erreur: {error}</p>
            <button 
              onClick={fetchNotifications}
              style={{
                padding: "8px 16px",
                backgroundColor: "#00B2D6",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                marginTop: "10px"
              }}
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Content */}
        {(!loading || !initialLoad) && !error && (
          <>
            {notifications.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <img src="/icons/Notification.svg" alt="notifications" />
                </div>
                <h2>Aucune notification</h2>
                <p>Vous n'avez pas encore de notifications. Elles apparaîtront ici lorsque vous en recevrez.</p>
              </div>
            ) : (
              <NotificationList notifications={notifications} />
            )}
          </>
        )}
        
        {/* Add extra space at the bottom to ensure content doesn't hide behind bottom nav */}
        <div style={{ height: "70px" }}></div>
      </div>
      {/* Bottom Navigation */}
      <BottomNavBar
        activeTab="home"
        onTabChange={onTabChange}
      />
    </div>
  );
};

export default NotificationsPage;
