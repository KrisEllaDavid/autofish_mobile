import React, { useState, useEffect } from "react";
import TopNavBar from "../../components/TopNavBar";
import { PostCardSkeleton } from "../../components/ui";
import PostCard from "../../components/PostCard";
import { useApiWithLoading } from "../../services/apiWithLoading";
import { Publication } from "../../services/api";
import { toast } from "react-toastify";
import { useData } from "../../context/DataContext";
import { appEvents, APP_EVENTS } from "../../utils/eventEmitter";
import "./FavoritePostsPage.css";


interface FavoritePostsPageProps {
  onNotificationClick?: () => void;
  onMyPageClick?: () => void;
  activeTab?: string;
  userAvatar?: string;
  userName?: string;
  userEmail?: string;
  userRole?: string;
  onPostClick?: (postId: number) => void;
}

const FavoritePostsPage: React.FC<FavoritePostsPageProps> = ({
  onNotificationClick,
  onMyPageClick,
  activeTab = "favorites",
  userAvatar,
  userName,
  userEmail,
  userRole,
  onPostClick,
}) => {
  const api = useApiWithLoading();
  const { favoritePublications, loadFavorites, isLoadingFavorites } = useData();
  const [likedPublications, setLikedPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);

  // Load favorites from DataContext on mount
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  // Sync local state with DataContext
  useEffect(() => {
    setLikedPublications(favoritePublications);
    setLoading(isLoadingFavorites);
  }, [favoritePublications, isLoadingFavorites]);

  // Listen for like/unlike events from other components
  useEffect(() => {
    const handlePublicationUnliked = ({ publicationId }: { publicationId: number }) => {
      // Remove from local list when unliked
      setLikedPublications(prev => prev.filter(pub => pub.id !== publicationId));
    };

    const handleFavoritesRefresh = () => {
      loadFavorites();
    };

    // Subscribe to events
    const unsubUnliked = appEvents.on(APP_EVENTS.PUBLICATION_UNLIKED, handlePublicationUnliked);
    const unsubRefresh = appEvents.on(APP_EVENTS.FAVORITES_REFRESH, handleFavoritesRefresh);

    // Cleanup
    return () => {
      unsubUnliked();
      unsubRefresh();
    };
  }, [loadFavorites]);

  const handleLike = async (publicationId: number) => {
    // Optimistic update
    setLikedPublications(prev => prev.filter(pub => pub.id !== publicationId));

    try {
      await api.likePublication(publicationId);

      // Emit event to notify other components
      appEvents.emit(APP_EVENTS.PUBLICATION_UNLIKED, { publicationId, isLiked: false });

      toast.success("Retiré des favoris");
    } catch (error) {
      console.error("Error unliking publication:", error);
      toast.error("Erreur lors de la mise à jour");
      // Revert optimistic update on error
      loadFavorites();
    }
  };

  return (
    <div className="favorite-posts-page">
      <TopNavBar
        title="Posts favoris"
        userAvatar={userAvatar}
        userName={userName}
        userEmail={userEmail}
        onNotificationClick={onNotificationClick}
        userRole={userRole}
        onMyPageClick={onMyPageClick}
        activeTab={activeTab}
      />

      <div className="favorite-posts-content">
        {loading ? (
          <div className="favorite-posts-list" aria-busy="true">
            <PostCardSkeleton />
            <PostCardSkeleton />
          </div>
        ) : likedPublications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <img src="/icons/dark_heart_outline_like.svg" alt="favorites" />
            </div>
            <h2>Aucune publication favorite</h2>
            <p>Vos publications favorites apparaîtront ici une fois que vous commencerez à aimer des posts.</p>
          </div>
        ) : (
          <>
            <p className="favorite-posts-count">
              {likedPublications.length} publication
              {likedPublications.length > 1 ? "s" : ""} favorite
              {likedPublications.length > 1 ? "s" : ""}
            </p>
            <div className="favorite-posts-list">
              {likedPublications.map((pub) => (
                <div
                  key={pub.id}
                  onClick={() => onPostClick?.(pub.id)}
                >
                  <PostCard
                    id={pub.id.toString()}
                    producerName={pub.page_name || "Producteur"}
                    producerAvatar={pub.producer_picture || "/icons/autofish_blue_logo 1.png"}
                    postImage={pub.picture_url || pub.picture || ""}
                    description={pub.description}
                    date={pub.date_posted}
                    likes={pub.likes_count || pub.likes || 0}
                    comments={pub.comments_count || 0}
                    category={pub.category_name || ""}
                    location={pub.location}
                    price={pub.price}
                    isLiked={true}
                    producerPhone={pub.producer_phone}
                    postTitle={pub.title}
                    onLike={(e) => {
                      if (typeof e !== 'string' && e) {
                        e.stopPropagation();
                      }
                      handleLike(pub.id);
                    }}
                    onComment={() => {}}
                    onProducerClick={() => {}}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FavoritePostsPage;

