import React, { useEffect, useState } from "react";
import { normalizeImageUrl } from "../utils/imageUtils";
import CommentsBottomSheet from "./CommentsBottomSheet";
import { appEvents, APP_EVENTS } from "../utils/eventEmitter";
import { Avatar, Button, Chip } from "./ui";
import "./PostCard.css";

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
  producerPhone?: string;
  postTitle?: string;
  onLike?: (postIdOrEvent?: string | React.MouseEvent) => void;
  onComment?: (postIdOrEvent?: string | React.MouseEvent) => void;
  onProducerClick?: (producerIdOrEvent?: string | React.MouseEvent) => void;
  hideContactButton?: boolean;
  onCommentsCountUpdate?: (newCount: number) => void;
  onMessageClick?: (publicationId: number) => void;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours} h`;
  if (diffDays < 7) return `Il y a ${diffDays} j`;

  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
};

const MessageIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9.4 9.4 0 0 1-2.8-.4L4 21l1.4-3.9A8.2 8.2 0 0 1 3.6 11.5 8.4 8.4 0 0 1 12 3.1a8.4 8.4 0 0 1 9 8.4z" />
  </svg>
);

const WhatsAppIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

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
    const [isPulsing, setIsPulsing] = useState(false);

    // The feed re-fetches after a like or a refresh; without this the card
    // kept showing its own stale optimistic value.
    useEffect(() => setLocalIsLiked(isLiked), [isLiked]);
    useEffect(() => setLocalLikesCount(likes), [likes]);
    useEffect(() => setLocalCommentsCount(comments), [comments]);

    useEffect(() => {
      const handleCommentEvent = ({
        publicationId,
      }: {
        publicationId: number;
      }) => {
        if (publicationId === parseInt(id)) {
          setLocalCommentsCount((prev) => {
            const next = prev + 1;
            onCommentsCountUpdate?.(next);
            return next;
          });
        }
      };

      return appEvents.on(APP_EVENTS.PUBLICATION_COMMENTED, handleCommentEvent);
    }, [id, onCommentsCountUpdate]);

    const locationIcon = "/icons/Location.svg";
    const favouriteIcon = localIsLiked
      ? "/icons/red_heart_like.svg"
      : "/icons/dark_heart_outline_like.svg";
    const commentIcon = "/icons/messages-bottom-nav.svg";

    const handleLikeClick = async (e: React.MouseEvent) => {
      e.stopPropagation();

      const wasLiked = localIsLiked;
      const previousCount = localLikesCount;

      setLocalIsLiked(!wasLiked);
      setLocalLikesCount(wasLiked ? previousCount - 1 : previousCount + 1);

      // The heart overshoots on the tap that sets it, not on the one that
      // clears it — a celebration, not a twitch.
      if (!wasLiked) {
        setIsPulsing(true);
        setTimeout(() => setIsPulsing(false), 300);
      }

      try {
        await onLike?.(e);
      } catch {
        setLocalIsLiked(wasLiked);
        setLocalLikesCount(previousCount);
      }
    };

    const handleCommentClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsCommentsOpen(true);
      onComment?.(e);
    };

    const handleWhatsAppContact = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!producerPhone) return;

      const cleanPhone = producerPhone.replace(/[\s-()]/g, "");
      const message = postTitle
        ? `Bonjour, je suis intéressé par "${postTitle}" sur AutoFish`
        : "Bonjour, je suis intéressé par votre publication sur AutoFish";

      window.open(
        `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`,
        "_blank"
      );
    };

    const handleProducer = (e: React.MouseEvent) => {
      e.stopPropagation();
      onProducerClick?.(e);
    };

    const likeLabel = `${localIsLiked ? "Retirer le like" : "Aimer"}, ${localLikesCount} like${localLikesCount > 1 ? "s" : ""}`;

    return (
      <article className="post-card">
        <header className="post-card__header">
          <Avatar
            src={producerAvatar}
            name={producerName}
            onClick={handleProducer}
            alt={`Voir le profil de ${producerName}`}
          />

          <div className="post-card__identity">
            <button
              type="button"
              className="post-card__name"
              onClick={handleProducer}
            >
              {producerName}
            </button>

            <div className="post-card__meta">
              <time dateTime={date}>{formatDate(date)}</time>
              <span className="post-card__meta-sep" aria-hidden="true" />
              <span className="post-card__location">
                <img src={locationIcon} alt="" aria-hidden="true" />
                <span>{location}</span>
              </span>
            </div>
          </div>
        </header>

        <p className="post-card__text">{description}</p>

        <div className="post-card__media">
          <img
            src={normalizeImageUrl(postImage)}
            alt={postTitle || description.slice(0, 80)}
            className="post-card__image"
            loading="lazy"
            decoding="async"
          />

          <Chip as="span" tone="onimage" className="post-card__category">
            {category}
          </Chip>

          <p className="post-card__price">
            {price.toLocaleString("fr-FR")}
            <small>FCFA</small>
          </p>
        </div>

        <div className="post-card__actions">
          <button
            type="button"
            onClick={handleLikeClick}
            data-pulse={isPulsing}
            aria-pressed={localIsLiked}
            aria-label={likeLabel}
            className={`post-card__action${
              localIsLiked ? " post-card__action--liked" : ""
            }`}
          >
            <img src={favouriteIcon} alt="" aria-hidden="true" />
            <span>{localLikesCount}</span>
          </button>

          <button
            type="button"
            onClick={handleCommentClick}
            className="post-card__action"
            aria-label={`Commentaires, ${localCommentsCount}`}
          >
            <img src={commentIcon} alt="" aria-hidden="true" />
            <span>{localCommentsCount}</span>
          </button>
        </div>

        {!hideContactButton && (
          <div className="post-card__contact">
            <Button
              variant="primary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onMessageClick?.(parseInt(id));
              }}
              iconStart={<MessageIcon />}
            >
              Message
            </Button>

            {producerPhone && (
              <Button
                variant="whatsapp"
                size="sm"
                onClick={handleWhatsAppContact}
                iconStart={<WhatsAppIcon />}
              >
                WhatsApp
              </Button>
            )}
          </div>
        )}

        <CommentsBottomSheet
          isOpen={isCommentsOpen}
          onClose={() => setIsCommentsOpen(false)}
          publicationId={parseInt(id)}
          publicationTitle={postTitle || `${description.slice(0, 50)}…`}
        />
      </article>
    );
  }
);

PostCard.displayName = "PostCard";

export default PostCard;
