import React, { useState, useEffect } from "react";
import TopNavBar from "../components/TopNavBar";
import BottomNavBar from "../components/BottomNavBar";
import CommentsBottomSheet from "../components/CommentsBottomSheet";
import { useAuth } from "../context/AuthContext";
import { useApiWithLoading } from "../services/apiWithLoading";
import { Publication } from "../services/api";
import { normalizeImageUrl } from "../utils/imageUtils";
import { toast } from "react-toastify";

const MAIN_BLUE = "#00B2D6";
const locationIcon = "/icons/Location.svg";
const heartIcon = "/icons/dark_heart_outline_like.svg";
const heartFilledIcon = "/icons/red_heart_like.svg";
const commentIcon = "/icons/messages-bottom-nav.svg";

interface PublicationPreviewPageProps {
  publicationId: number;
  onBack: () => void;
  onNotificationClick?: () => void;
  onMyPageClick?: () => void;
  onTabChange: (
    tab: "home" | "messages" | "producers" | "profile" | "favorites"
  ) => void;
  activeTab?: string;
  userAvatar?: string;
  userName?: string;
  userEmail?: string;
  userRole?: string;
}

const PublicationPreviewPage: React.FC<PublicationPreviewPageProps> = ({
  publicationId,
  onBack,
  onNotificationClick,
  onMyPageClick,
  onTabChange,
  activeTab,
  userAvatar,
  userName,
  userEmail,
  userRole,
}) => {
  const { userData } = useAuth();
  const api = useApiWithLoading();
  const [publication, setPublication] = useState<Publication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

  useEffect(() => {
    fetchPublication();
  }, [publicationId]);

  const fetchPublication = async () => {
    setIsLoading(true);
    try {
      // Fetch the specific publication
      const pub = await api.getPublicationById(publicationId);
      setPublication(pub);
    } catch (error) {
      console.error("Error fetching publication:", error);
      toast.error("Erreur lors du chargement de la publication");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async () => {
    if (!api.isAuthenticated()) {
      toast.info("Veuillez vous connecter pour aimer une publication");
      return;
    }

    if (!publication) return;

    // Optimistic update
    const wasLiked = publication.is_liked;
    const previousCount = publication.likes_count || 0;

    setPublication({
      ...publication,
      is_liked: !wasLiked,
      likes_count: wasLiked ? previousCount - 1 : previousCount + 1,
    });

    try {
      await api.likePublication(publication.id);
    } catch (error) {
      // Revert on error
      console.error("Error liking publication:", error);
      toast.error("Erreur lors de l'ajout aux favoris");
      setPublication({
        ...publication,
        is_liked: wasLiked,
        likes_count: previousCount,
      });
    }
  };

  const handleWhatsAppContact = () => {
    if (!publication?.producer_phone) {
      toast.error("Numéro de téléphone non disponible");
      return;
    }

    const cleanPhone = publication.producer_phone.replace(/[\s-()]/g, "");
    const message = publication.title
      ? `Bonjour, je suis intéressé par "${publication.title}" sur AutoFish`
      : `Bonjour, je suis intéressé par votre publication sur AutoFish`;

    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#f8f9fa",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <TopNavBar
          title="Publication"
          userAvatar={userAvatar || userData?.avatar}
          userName={userName || userData?.name}
          userEmail={userEmail || userData?.email}
          userRole={userRole || userData?.userRole}
          onNotificationClick={onNotificationClick}
          onMyPageClick={onMyPageClick}
          activeTab={activeTab}
        />
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "100px 20px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              border: `4px solid ${MAIN_BLUE}40`,
              borderTop: `4px solid ${MAIN_BLUE}`,
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!publication) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#f8f9fa",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <TopNavBar
          title="Publication"
          userAvatar={userAvatar || userData?.avatar}
          userName={userName || userData?.name}
          userEmail={userEmail || userData?.email}
          userRole={userRole || userData?.userRole}
          onNotificationClick={onNotificationClick}
          onMyPageClick={onMyPageClick}
          activeTab={activeTab}
        />
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "100px 20px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>😕</div>
          <h2
            style={{
              fontSize: 20,
              fontWeight: 600,
              marginBottom: 8,
              color: "#222",
            }}
          >
            Publication introuvable
          </h2>
          <p style={{ fontSize: 14, color: "#666", marginBottom: 24 }}>
            Cette publication n'existe pas ou a été supprimée
          </p>
          <button
            onClick={onBack}
            style={{
              padding: "12px 24px",
              backgroundColor: MAIN_BLUE,
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8f9fa",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <TopNavBar
        title="Publication"
        userAvatar={userAvatar || userData?.avatar}
        userName={userName || userData?.name}
        userEmail={userEmail || userData?.email}
        userRole={userRole || userData?.userRole}
        onNotificationClick={onNotificationClick}
        onMyPageClick={onMyPageClick}
        activeTab={activeTab}
      />

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "96px 0 100px 0",
        }}
      >
        <div
          style={{
            maxWidth: "800px",
            margin: "0 auto",
            backgroundColor: "white",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          {/* Back Button */}
          <div style={{ padding: "16px" }}>
            <button
              onClick={onBack}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "none",
                border: "none",
                color: MAIN_BLUE,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                padding: 0,
              }}
            >
              <span style={{ fontSize: 18 }}>←</span>
              <span>Retour</span>
            </button>
          </div>

          {/* Publication Image */}
          {(publication.picture_url || publication.picture) && (
            <div
              style={{
                width: "100%",
                maxHeight: "400px",
                overflow: "hidden",
                backgroundColor: "#f0f0f0",
              }}
            >
              <img
                src={normalizeImageUrl(
                  publication.picture_url || publication.picture || ""
                )}
                alt={publication.title}
                style={{
                  width: "100%",
                  height: "400px",
                  objectFit: "cover",
                }}
              />
            </div>
          )}

          {/* Content */}
          <div style={{ padding: "24px" }}>
            {/* Category Badge */}
            {publication.category_name && (
              <div
                style={{
                  display: "inline-block",
                  backgroundColor: `${MAIN_BLUE}15`,
                  color: MAIN_BLUE,
                  padding: "6px 12px",
                  borderRadius: "20px",
                  fontSize: 12,
                  fontWeight: 600,
                  marginBottom: 16,
                }}
              >
                {publication.category_name}
              </div>
            )}

            {/* Title */}
            <h1
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "#222",
                marginBottom: 16,
                lineHeight: 1.3,
              }}
            >
              {publication.title}
            </h1>

            {/* Producer Info */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                paddingBottom: 16,
                marginBottom: 16,
                borderBottom: "1px solid #e0e0e0",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  backgroundColor: "#f0f0f0",
                  overflow: "hidden",
                }}
              >
                <img
                  src={userAvatar || "/icons/autofish_blue_logo 1.png"}
                  alt="producer"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 16, color: "#222" }}>
                  {publication.page_name || "Producteur"}
                </div>
                <div style={{ fontSize: 12, color: "#999" }}>
                  {formatDate(publication.date_posted)}
                </div>
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: 24 }}>
              <h2
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#222",
                  marginBottom: 8,
                }}
              >
                Description
              </h2>
              <p
                style={{
                  fontSize: 15,
                  lineHeight: 1.6,
                  color: "#444",
                  whiteSpace: "pre-wrap",
                }}
              >
                {publication.description}
              </p>
            </div>

            {/* Details Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "16px",
                marginBottom: 24,
                padding: "20px",
                backgroundColor: "#f8f9fa",
                borderRadius: "12px",
              }}
            >
              {/* Price */}
              <div>
                <div style={{ fontSize: 12, color: "#999", marginBottom: 4 }}>
                  Prix
                </div>
                <div
                  style={{ fontSize: 24, fontWeight: 700, color: MAIN_BLUE }}
                >
                  {publication.price.toLocaleString()} FCFA
                </div>
              </div>

              {/* Location */}
              <div>
                <div style={{ fontSize: 12, color: "#999", marginBottom: 4 }}>
                  Localisation
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: 15,
                    fontWeight: 600,
                    color: "#222",
                  }}
                >
                  <img
                    src={locationIcon}
                    alt="location"
                    style={{ width: 16, height: 16, opacity: 0.6 }}
                  />
                  {publication.location}
                </div>
              </div>

              {/* Likes */}
              <div>
                <div style={{ fontSize: 12, color: "#999", marginBottom: 4 }}>
                  J'aime
                </div>
                <div style={{ fontSize: 18, fontWeight: 600, color: "#222" }}>
                  {publication.likes_count || publication.likes || 0}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              {/* Like Button */}
              <button
                onClick={handleLike}
                style={{
                  flex: 1,
                  minWidth: "140px",
                  padding: "14px 10px",
                  backgroundColor: publication.is_liked ? "#FFE5E5" : "white",
                  color: publication.is_liked ? "#FF4B4B" : "#666",
                  border: `2px solid ${
                    publication.is_liked ? "#FF4B4B" : "#e0e0e0"
                  }`,
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "all 0.3s ease",
                }}
              >
                <img
                  src={publication.is_liked ? heartFilledIcon : heartIcon}
                  alt="like"
                  style={{
                    width: 20,
                    height: 20,
                    transition:
                      "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  }}
                />
                {publication.is_liked ? "Aimé" : "J'aime"}
              </button>

              {/* Comments Button */}
              <button
                onClick={() => setIsCommentsOpen(true)}
                style={{
                  flex: 1,
                  minWidth: "140px",
                  padding: "14px 10px",
                  backgroundColor: "white",
                  color: "#666",
                  border: "2px solid #e0e0e0",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "all 0.2s",
                }}
              >
                <img
                  src={commentIcon}
                  alt="comments"
                  style={{ width: 20, height: 20, opacity: 0.7 }}
                />
                Commentaires ({publication.comments_count || 0})
              </button>

              {/* WhatsApp Contact Button */}
              {publication.producer_phone && (
                <button
                  onClick={handleWhatsAppContact}
                  style={{
                    flex: 1,
                    minWidth: "140px",
                    padding: "14px 20px",
                    backgroundColor: "#25D366",
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    fontSize: "16px",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#22C55E";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#25D366";
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="white"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"></path>
                  </svg>
                  Contacter
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <BottomNavBar
        activeTab={
          (activeTab as
            | "home"
            | "messages"
            | "producers"
            | "profile"
            | "favorites") || "home"
        }
        onTabChange={onTabChange}
      />

      {/* Comments Bottom Sheet */}
      {publication && (
        <CommentsBottomSheet
          isOpen={isCommentsOpen}
          onClose={() => setIsCommentsOpen(false)}
          publicationId={publication.id}
          publicationTitle={publication.title}
        />
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default PublicationPreviewPage;
