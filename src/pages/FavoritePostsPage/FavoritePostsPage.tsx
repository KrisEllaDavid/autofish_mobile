import React, { useState, useEffect } from "react";
import TopNavBar from "../../components/TopNavBar";
import PostCard from "../../components/PostCard";
import { useApiWithLoading } from "../../services/apiWithLoading";
import { Publication } from "../../services/api";
import { toast } from "react-toastify";
import "./FavoritePostsPage.css";

const MAIN_BLUE = "#00B2D6";

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
  const [likedPublications, setLikedPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLikedPublications();
  }, []);

  const fetchLikedPublications = async () => {
    setLoading(true);
    try {
      // Fetch all publications and filter for liked ones
      const response = await api.getPublicFeed({ page: 1, limit: 100 });
      const liked = response.results.filter(pub => pub.is_liked === true);
      setLikedPublications(liked);
    } catch (error) {
      console.error("Error fetching liked publications:", error);
      toast.error("Erreur lors du chargement des favoris");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (publicationId: number) => {
    try {
      await api.likePublication(publicationId);
      // Remove from the list since it's been unliked
      setLikedPublications(prev => prev.filter(pub => pub.id !== publicationId));
      toast.success("Retiré des favoris");
    } catch (error) {
      console.error("Error unliking publication:", error);
      toast.error("Erreur lors de la mise à jour");
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

      <div className="favorite-posts-content" style={{
        padding: "96px 16px 100px 16px",
        minHeight: "100vh",
        backgroundColor: "#f8f9fa"
      }}>
        {loading ? (
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "50vh"
          }}>
            <div style={{
              width: "40px",
              height: "40px",
              border: `4px solid ${MAIN_BLUE}40`,
              borderTop: `4px solid ${MAIN_BLUE}`,
              borderRadius: "50%",
              animation: "spin 1s linear infinite"
            }} />
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
          <div style={{
            maxWidth: "800px",
            margin: "0 auto"
          }}>
            <h2 style={{
              fontSize: "18px",
              fontWeight: 600,
              color: "#222",
              marginBottom: "20px"
            }}>
              {likedPublications.length} publication{likedPublications.length > 1 ? "s" : ""} favorite{likedPublications.length > 1 ? "s" : ""}
            </h2>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "16px"
            }}>
              {likedPublications.map((pub) => (
                <div
                  key={pub.id}
                  onClick={() => onPostClick?.(pub.id)}
                  style={{ cursor: "pointer" }}
                >
                  <PostCard
                    id={pub.id.toString()}
                    producerName={pub.page_name || "Producteur"}
                    producerAvatar={userAvatar || "/icons/autofish_blue_logo 1.png"}
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
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default FavoritePostsPage;

