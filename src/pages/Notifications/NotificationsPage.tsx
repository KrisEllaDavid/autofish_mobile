import React, { useState, useEffect } from "react";
import TopNavBar from "../../components/TopNavBar";
import BottomNavBar from "../../components/BottomNavBar";
import { useApiWithLoading } from "../../services/apiWithLoading";
import { Notification as ApiNotification } from "../../services/api";
import { Notification as UINotification } from "./notificationsMock";
import "../HomePage.css";
import NotificationList from "./NotificationList";
import { Button, EmptyState, ListRowSkeleton } from "../../components/ui";

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
  onNavigateToPost?: (postId: string) => void;
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
  onNavigateToPost,
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

  const handleNotificationClick = (notification: UINotification) => {
    // Navigate to the related post if it exists
    if (notification.postId && onNavigateToPost) {
      onNavigateToPost(notification.postId);
    }
  };

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
      <div className="home-scroll">
        {loading && initialLoad ? (
          <div className="notif-list" aria-busy="true">
            <ListRowSkeleton />
            <ListRowSkeleton />
            <ListRowSkeleton />
          </div>
        ) : error ? (
          <div className="feed-error">
            <h2 className="feed-error__title">
              Les notifications n&apos;ont pas pu se charger
            </h2>
            <p className="feed-error__text">{error}</p>
            <Button variant="secondary" onClick={fetchNotifications}>
              Réessayer
            </Button>
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={<img src="/icons/Notification.svg" alt="" />}
            title="Aucune notification"
            description="Les likes, commentaires et nouveaux arrivages apparaîtront ici."
          />
        ) : (
          <NotificationList
            notifications={notifications}
            onNotificationClick={handleNotificationClick}
          />
        )}
      </div>
      {/* Bottom Navigation */}
      <BottomNavBar activeTab="home" onTabChange={onTabChange} />
    </div>
  );
};

export default NotificationsPage;
