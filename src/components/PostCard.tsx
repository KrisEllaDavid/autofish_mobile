import React from "react";
import { normalizeImageUrl } from "../utils/imageUtils";

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
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onProducerClick?: (producerId: string) => void;
  hideContactButton?: boolean;
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
    onLike,
    onComment,
    onProducerClick,
    hideContactButton = false,
  }) => {
    const locationIcon = "/icons/Location.svg";
    const favouriteIcon = isLiked
      ? "/icons/red_heart_like.svg"
      : "/icons/dark_heart_outline_like.svg";
    const commentIcon = "/icons/messages-bottom-nav.svg";

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
            padding: "16px 16px 0 16px",
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
            onClick={() => onProducerClick?.(id)}
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
                onClick={() => onProducerClick?.(id)}
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
            padding: "12px 16px 0 16px",
          }}
        >
          <button
            onClick={() => onLike?.(id)}
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
              src={favouriteIcon}
              alt="like"
              style={{
                width: 20,
                height: 20,
                marginRight: 6,
              }}
            />
            <span>{likes}</span>
          </button>

          <button
            onClick={() => onComment?.(id)}
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
            <span>{comments}</span>
          </button>
        </div>

        {/* Contact button */}
        {!hideContactButton && (
          <div style={{ padding: "12px 16px 16px 16px" }}>
            <button
              style={{
                width: "100%",
                background: "#00B2D6",
                color: "white",
                border: "none",
                borderRadius: 8,
                padding: "12px",
                fontSize: 16,
                fontWeight: 600,
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#0099B8";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#00B2D6";
              }}
            >
              Contacter le producteur
            </button>
          </div>
        )}
      </div>
    );
  }
);

PostCard.displayName = "PostCard";

export default PostCard;
