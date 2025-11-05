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
const whatsappIcon = "/icons/whatsapp.svg";
const commentIcon = "/icons/messages-bottom-nav.svg";

interface PublicationPreviewPageProps {
  publicationId: number;
  onBack: () => void;
  onNotificationClick?: () => void;
  onMyPageClick?: () => void;
  onTabChange: (tab: "home" | "messages" | "producers" | "profile" | "favorites") => void;
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

    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
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
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8, color: "#222" }}>
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
                src={normalizeImageUrl(publication.picture_url || publication.picture || "")}
                alt={publication.title}
                style={{
                  width: "100%",
                  height: "100%",
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
                <div style={{ fontSize: 12, color: "#999", marginBottom: 4 }}>Prix</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: MAIN_BLUE }}>
                  {publication.price.toLocaleString()} FCFA
                </div>
              </div>

              {/* Location */}
              <div>
                <div style={{ fontSize: 12, color: "#999", marginBottom: 4 }}>Localisation</div>
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
                <div style={{ fontSize: 12, color: "#999", marginBottom: 4 }}>J'aime</div>
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
                  padding: "14px 20px",
                  backgroundColor: publication.is_liked ? "#FFE5E5" : "white",
                  color: publication.is_liked ? "#FF4B4B" : "#666",
                  border: `2px solid ${publication.is_liked ? "#FF4B4B" : "#e0e0e0"}`,
                  borderRadius: "12px",
                  fontSize: "16px",
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
                    transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
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
                  padding: "14px 20px",
                  backgroundColor: "white",
                  color: "#666",
                  border: "2px solid #e0e0e0",
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
                  <img
                    src={whatsappIcon}
                    alt="whatsapp"
                    style={{ width: 20, height: 20, filter: "brightness(0) invert(1)" }}
                  />
                  Contacter
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <BottomNavBar activeTab={activeTab || "home"} onTabChange={onTabChange} />

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
