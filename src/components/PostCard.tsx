import React, { useState } from "react";
import { normalizeImageUrl } from "../utils/imageUtils";
import CommentsBottomSheet from "./CommentsBottomSheet";

interface PostCardProps {
  id: string;
  producerName: string;
  producerAvatar: string;
  postImage: string;
  description: string;
  date: string;
  likes: number;
  comments: number;
  category: string;
  location: string;
  price: number;
  isLiked?: boolean;
  producerPhone?: string; // WhatsApp contact
  postTitle?: string; // For WhatsApp message
  onLike?: (postIdOrEvent?: string | React.MouseEvent) => void;
  onComment?: (postIdOrEvent?: string | React.MouseEvent) => void;
  onProducerClick?: (producerIdOrEvent?: string | React.MouseEvent) => void;
  hideContactButton?: boolean;
  onCommentsCountUpdate?: (newCount: number) => void;
  onMessageClick?: (publicationId: number) => void; // Chat handler
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) {
    return `Il y a ${diffMins} minute${diffMins > 1 ? "s" : ""}`;
  } else if (diffHours < 24) {
    return `Il y a ${diffHours} heure${diffHours > 1 ? "s" : ""}`;
  } else if (diffDays < 7) {
    return `Il y a ${diffDays} jour${diffDays > 1 ? "s" : ""}`;
  } else {
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    });
  }
};

const PostCard: React.FC<PostCardProps> = React.memo(
  ({
    id,
    producerName,
    producerAvatar,
    postImage,
    description,
    date,
    likes,
    comments,
    category,
    location,
    price,
    isLiked = false,
    producerPhone,
    postTitle,
    onLike,
    onComment,
    onProducerClick,
    hideContactButton = false,
    onCommentsCountUpdate,
    onMessageClick,
  }) => {
    const [isCommentsOpen, setIsCommentsOpen] = useState(false);
    const [localCommentsCount, setLocalCommentsCount] = useState(comments);
    const [localIsLiked, setLocalIsLiked] = useState(isLiked);
    const [localLikesCount, setLocalLikesCount] = useState(likes);
    const [isAnimating, setIsAnimating] = useState(false);

    const locationIcon = "/icons/Location.svg";
    const favouriteIcon = localIsLiked
      ? "/icons/red_heart_like.svg"
      : "/icons/dark_heart_outline_like.svg";
    const commentIcon = "/icons/messages-bottom-nav.svg";

    // Like handler with optimistic updates
    const handleLikeClick = async (e: React.MouseEvent) => {
      e.stopPropagation();

      // Optimistic update
      const wasLiked = localIsLiked;
      const previousCount = localLikesCount;

      setLocalIsLiked(!wasLiked);
      setLocalLikesCount(wasLiked ? previousCount - 1 : previousCount + 1);
      setIsAnimating(true);

      // Call the parent onLike handler
      try {
        await onLike?.(e);
      } catch (error) {
        // Revert on error
        setLocalIsLiked(wasLiked);
        setLocalLikesCount(previousCount);
      }

      // Remove animation class after animation completes
      setTimeout(() => setIsAnimating(false), 300);
    };

    // Comments handler
    const handleCommentClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsCommentsOpen(true);
      onComment?.(e);
    };

    const handleCommentsClose = () => {
      setIsCommentsOpen(false);
    };

    // Update comments count when new comments are added
    const handleCommentsUpdate = (newCount: number) => {
      setLocalCommentsCount(newCount);
      onCommentsCountUpdate?.(newCount);
    };

    // WhatsApp contact handler
    const handleWhatsAppContact = () => {
      if (!producerPhone) {
        console.warn("No producer phone number available");
        return;
      }

      // Clean phone number (remove spaces, dashes, etc.)
      const cleanPhone = producerPhone.replace(/[\s-()]/g, "");

      // Create WhatsApp message
      const message = postTitle
        ? `Bonjour, je suis intéressé par "${postTitle}" sur AutoFish`
        : `Bonjour, je suis intéressé par votre publication sur AutoFish`;

      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
        message
      )}`;

      // Open WhatsApp in new window/tab
      window.open(whatsappUrl, "_blank");
    };

    return (
      <div
        style={{
          width: "100%",
          background: "#fff",
          borderRadius: 16,
          overflow: "hidden",
          marginBottom: 16,
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.05)",
        }}
      >
        {/* Producer header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "30px 16px 0 16px",
            background: "#fff",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              overflow: "hidden",
              marginRight: 12,
              cursor: "pointer",
            }}
            onClick={(e) => {
              e.stopPropagation();
              onProducerClick?.(e);
            }}
            role="button"
            tabIndex={0}
            aria-label={`Voir le profil de ${producerName}`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onProducerClick?.(id);
              }
            }}
          >
            <img
              src={normalizeImageUrl(producerAvatar)}
              alt={`Photo de profil de ${producerName}`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <h3
                style={{
                  margin: 0,
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#222",
                  cursor: "pointer",
                }}
                onClick={(e) => {
              e.stopPropagation();
              onProducerClick?.(e);
            }}
              >
                {producerName}
              </h3>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: 13,
                color: "#888",
                marginTop: 2,
              }}
            >
              <span>{formatDate(date)}</span>
              <span style={{ margin: "0 6px" }}>•</span>
              <div style={{ display: "flex", alignItems: "center" }}>
                <img
                  src={locationIcon}
                  alt="location"
                  style={{
                    width: 14,
                    height: 14,
                    marginRight: 4,
                    opacity: 0.7,
                  }}
                />
                <span>{location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Post content */}
        <div style={{ padding: "12px 16px 0 16px" }}>
          <p
            style={{
              margin: 0,
              fontSize: 15,
              lineHeight: 1.5,
              color: "#222",
            }}
          >
            {description}
          </p>
        </div>

        {/* Post image with category pill overlay */}
        <div style={{ width: "100%", position: "relative", marginTop: 12 }}>
          <img
            src={normalizeImageUrl(postImage)}
            alt="Post"
            style={{
              width: "100%",
              maxHeight: 350,
              objectFit: "cover",
              borderRadius: 0,
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 12,
              right: 12,
              background: "#F3FAFF",
              color: "#00B2D6",
              fontWeight: 500,
              fontSize: 14,
              borderRadius: 16,
              padding: "4px 16px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}
          >
            {category}
          </div>
          {/* Price overlay */}
          <div
            style={{
              position: "absolute",
              bottom: 12,
              left: 12,
              background: "rgba(0, 0, 0, 0.8)",
              color: "white",
              fontWeight: 600,
              fontSize: 16,
              borderRadius: 8,
              padding: "6px 12px",
            }}
          >
            {price.toLocaleString()} FCFA
          </div>
        </div>

        {/* Like count row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 40px",
          }}
        >
          <button
            onClick={handleLikeClick}
            style={{
              display: "flex",
              alignItems: "center",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              color: localIsLiked ? "#FF4B4B" : "#666",
              fontSize: 14,
              transition: "color 0.2s ease",
            }}
          >
            <img
              src={favouriteIcon}
              alt="like"
              style={{
                width: 20,
                height: 20,
                marginRight: 6,
                transform: isAnimating ? "scale(1.3)" : "scale(1)",
                transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            />
            <span>{localLikesCount}</span>
          </button>

          <button
            onClick={handleCommentClick}
            style={{
              display: "flex",
              alignItems: "center",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              color: "#666",
              fontSize: 14,
            }}
          >
            <img
              src={commentIcon}
              alt="comment"
              style={{
                width: 20,
                height: 20,
                marginRight: 6,
                opacity: 0.7,
              }}
            />
            <span>{localCommentsCount}</span>
          </button>
        </div>

        {/* Contact buttons */}
        {!hideContactButton && (
          <div
            style={{
              padding: "12px 16px 16px 16px",
              display: "flex",
              gap: "8px",
            }}
          >
            {/* Message Button */}
            <button
              onClick={() => onMessageClick?.(parseInt(id))}
              style={{
                flex: 1,
                background: "#00B2D6", // Main blue
                color: "white",
                border: "none",
                borderRadius: 8,
                padding: "12px",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                transition: "background-color 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#0095B8";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#00B2D6";
              }}
            >
              <img
                src={commentIcon}
                alt="message"
                style={{
                  width: 18,
                  height: 18,
                  filter: "brightness(0) invert(1)",
                }}
              />
              Message
            </button>

            {/* WhatsApp Button */}
            {producerPhone && (
              <button
                onClick={handleWhatsAppContact}
                style={{
                  flex: 1,
                  background: "#25D366", // WhatsApp green
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  padding: "12px",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#20BA5A";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#25D366";
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="white"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                WhatsApp
              </button>
            )}
          </div>
        )}

        {/* Comments Bottom Sheet */}
        <CommentsBottomSheet
          isOpen={isCommentsOpen}
          onClose={handleCommentsClose}
          publicationId={parseInt(id)}
          publicationTitle={postTitle || description.substring(0, 50) + "..."}
        />
      </div>
    );
  }
);

PostCard.displayName = "PostCard";

export default PostCard;
