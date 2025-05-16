import React from "react";
import { Post } from "../mock/posts";

interface PostCardProps {
  post: Post;
  isLiked?: boolean;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onProducerClick?: (producerId: string) => void;
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

const PostCard: React.FC<PostCardProps> = ({
  post,
  isLiked = false,
  onLike,
  onComment,
  onProducerClick,
}) => {
  const locationIcon = "/icons/Location.svg";
  const favouriteIcon = isLiked
    ? "/icons/red_heart_like.svg"
    : "/icons/dark_heart_outline_like.svg";
  const commentIcon = "/icons/messages-bottom-nav.svg";
  const contactIcon = "/icons/message.svg";

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
          onClick={() => onProducerClick?.(post.id)}
        >
          <img
            src={post.producerAvatar}
            alt={post.producerName}
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
              onClick={() => onProducerClick?.(post.id)}
            >
              {post.producerName}
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
            <span>{formatDate(post.date)}</span>
            <span style={{ margin: "0 6px" }}>•</span>
            <div style={{ display: "flex", alignItems: "center" }}>
              <img
                src={locationIcon}
                alt="location"
                style={{ width: 14, height: 14, marginRight: 4, opacity: 0.7 }}
              />
              <span>{post.location}</span>
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
          {post.description}
        </p>
      </div>

      {/* Post image with category pill overlay */}
      <div style={{ width: "100%", position: "relative", marginTop: 12 }}>
        <img
          src={post.postImage}
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
          {post.category}
        </div>
      </div>

      {/* Like count row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "12px 16px 0 16px",
        }}
      >
        <button
          onClick={() => onLike?.(post.id)}
          style={{
            display: "flex",
            alignItems: "center",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            marginRight: 8,
          }}
        >
          <img
            src={favouriteIcon}
            alt="like"
            style={{ width: 22, height: 22, marginRight: 4 }}
          />
          <span
            style={{
              color: isLiked ? "#F87171" : "#F87171",
              fontWeight: 600,
              fontSize: 16,
              marginRight: 4,
            }}
          >
            {post.likes}
          </span>
        </button>
      </div>

      {/* Bottom action bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid #F2F2F2",
          marginTop: 12,
          padding: "0 8px",
          height: 48,
          background: "#fff",
        }}
      >
        <button
          onClick={() => onLike?.(post.id)}
          style={{
            display: "flex",
            alignItems: "center",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: isLiked ? "#F87171" : "#222",
            fontWeight: 500,
            fontSize: 15,
          }}
        >
          <img
            src={favouriteIcon}
            alt="like"
            style={{ width: 22, height: 22, marginRight: 6 }}
          />
          J'aime
        </button>
        <button
          onClick={() => onComment?.(post.id)}
          style={{
            display: "flex",
            alignItems: "center",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#222",
            fontWeight: 500,
            fontSize: 15,
          }}
        >
          <img
            src={commentIcon}
            alt="comment"
            style={{ width: 22, height: 22, marginRight: 6 }}
          />
          Contacter
        </button>
      </div>
    </div>
  );
};

export default PostCard;
