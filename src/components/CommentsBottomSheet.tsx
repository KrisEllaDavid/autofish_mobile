import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { useApiWithLoading } from "../services/apiWithLoading";
import { Comment } from "../services/api";
import { toast } from "react-toastify";
import { appEvents, APP_EVENTS } from "../utils/eventEmitter";
import {
  Avatar,
  Button,
  EmptyState,
  IconButton,
  ListRowSkeleton,
  Spinner,
} from "./ui";
import "./CommentsBottomSheet.css";

const CloseIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

const SendIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4.3 11.7 20 4l-7.7 15.7-1.9-6.1z" />
    <path d="m10.4 13.6 9.6-9.6" />
  </svg>
);

const HeartIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
  <svg
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 20s-7.2-4.5-7.2-9.4A4.1 4.1 0 0 1 12 8.2a4.1 4.1 0 0 1 7.2 2.4C19.2 15.5 12 20 12 20z" />
  </svg>
);

const CommentIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="var(--brand-700)"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9.4 9.4 0 0 1-2.8-.4L4 21l1.4-3.9A8.2 8.2 0 0 1 3.6 11.5 8.4 8.4 0 0 1 12 3.1a8.4 8.4 0 0 1 9 8.4z" />
  </svg>
);

interface CommentsBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  publicationId: number;
  publicationTitle: string;
}

const CommentsBottomSheet: React.FC<CommentsBottomSheetProps> = ({
  isOpen,
  onClose,
  publicationId,
  publicationTitle,
}) => {
  const api = useApiWithLoading();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchComments(1);
      // Focus lands after the sheet has finished rising, so the keyboard
      // does not fight the entrance animation.
      const timer = setTimeout(() => inputRef.current?.focus(), 360);
      return () => clearTimeout(timer);
    }

    setComments([]);
    setPage(1);
    setHasMore(true);
    setCommentText("");
  }, [isOpen, publicationId]);

  // Escape closes the sheet, and the page behind it stops scrolling while
  // it is open.
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  const fetchComments = async (pageNum: number) => {
    if (loading) return;

    setLoading(true);
    try {
      const response = await api.getPublicationComments(
        publicationId,
        pageNum,
        20
      );
      const results = response.results || [];

      setComments((prev) => (pageNum === 1 ? results : [...prev, ...results]));
      setHasMore(response.has_more || false);
      setPage(pageNum);
    } catch (error: any) {
      setComments([]);
      setHasMore(false);

      // A 404 just means the publication has no comment thread yet.
      if (error?.status !== 404) {
        toast.error("Les commentaires n'ont pas pu être chargés.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendComment = async () => {
    if (!commentText.trim() || sending) return;

    if (!api.isAuthenticated()) {
      toast.info("Connectez-vous pour commenter.");
      return;
    }

    setSending(true);
    try {
      const newComment = await api.createComment(
        publicationId,
        commentText.trim()
      );

      setComments((prev) => [newComment, ...prev]);
      setCommentText("");
      if (inputRef.current) inputRef.current.style.height = "auto";

      appEvents.emit(APP_EVENTS.PUBLICATION_COMMENTED, {
        publicationId,
        comment: newComment,
      });

      commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch {
      toast.error("Votre commentaire n'a pas pu être envoyé.");
    } finally {
      setSending(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await api.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));

      appEvents.emit(APP_EVENTS.PUBLICATION_COMMENTED, {
        publicationId,
        commentDeleted: true,
      });
    } catch {
      toast.error("Le commentaire n'a pas pu être supprimé.");
    }
  };

  const handleLikeComment = async (commentId: number) => {
    if (!api.isAuthenticated()) {
      toast.info("Connectez-vous pour aimer un commentaire.");
      return;
    }

    const toggle = (list: Comment[]) =>
      list.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              is_liked: !comment.is_liked,
              likes_count: comment.is_liked
                ? comment.likes_count - 1
                : comment.likes_count + 1,
            }
          : comment
      );

    setComments(toggle);

    try {
      await api.toggleLikeComment(commentId);
    } catch {
      setComments(toggle);
      toast.error("Le like n'a pas pu être enregistré.");
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) fetchComments(page + 1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const diffMins = Math.floor((Date.now() - date.getTime()) / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    if (diffDays < 7) return `Il y a ${diffDays} j`;

    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <>
      <div
        className="af-scrim"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-hidden="true"
      />

      <section
        className="af-sheet comments-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Commentaires"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="af-sheet__grip"
          aria-label="Fermer les commentaires"
          onClick={onClose}
        />

        <header className="af-sheet__header">
          <div className="comments-sheet__title-block">
            <h2 className="af-sheet__title">Commentaires</h2>
            <p className="comments-sheet__subtitle">{publicationTitle}</p>
          </div>
          <IconButton label="Fermer" size="sm" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </header>

        <div className="af-sheet__body comments-sheet__list">
          {loading && comments.length === 0 ? (
            <>
              <ListRowSkeleton />
              <ListRowSkeleton />
              <ListRowSkeleton />
            </>
          ) : comments.length === 0 ? (
            <EmptyState
              icon={<CommentIcon />}
              title="Aucun commentaire"
              description="Soyez le premier à réagir à cette publication."
            />
          ) : (
            <>
              {comments.map((comment) => (
                <article key={comment.id} className="comment">
                  <Avatar
                    size="sm"
                    src={
                      comment.author_avatar?.startsWith("http")
                        ? comment.author_avatar
                        : undefined
                    }
                    name={comment.author_name || "Utilisateur"}
                  />

                  <div className="comment__body">
                    <div className="comment__head">
                      <span className="comment__author">
                        {comment.author_name || "Utilisateur"}
                      </span>
                      <time
                        className="comment__time"
                        dateTime={comment.created_at}
                      >
                        {formatDate(comment.created_at)}
                        {comment.is_edited && " · modifié"}
                      </time>

                      {comment.can_delete && (
                        <button
                          type="button"
                          className="comment__delete"
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          Supprimer
                        </button>
                      )}
                    </div>

                    <p className="comment__text" data-selectable="true">
                      {comment.content}
                    </p>

                    <div className="comment__footer">
                      <button
                        type="button"
                        className="comment__like"
                        aria-pressed={Boolean(comment.is_liked)}
                        aria-label={`${
                          comment.is_liked ? "Retirer le like" : "Aimer"
                        }, ${comment.likes_count || 0}`}
                        onClick={() => handleLikeComment(comment.id)}
                      >
                        <HeartIcon filled={Boolean(comment.is_liked)} />
                        <span>{comment.likes_count || 0}</span>
                      </button>

                      {comment.reply_count > 0 && (
                        <span className="comment__replies">
                          {comment.reply_count}{" "}
                          {comment.reply_count === 1 ? "réponse" : "réponses"}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              ))}

              {hasMore && (
                <Button
                  variant="ghost"
                  block
                  loading={loading}
                  loadingLabel="Chargement…"
                  onClick={loadMore}
                  style={{ marginTop: "var(--space-5)" }}
                >
                  Voir plus de commentaires
                </Button>
              )}
            </>
          )}
          <div ref={commentsEndRef} />
        </div>

        <div className="comments-composer">
          <textarea
            ref={inputRef}
            className="comments-composer__input"
            value={commentText}
            rows={1}
            placeholder="Ajouter un commentaire…"
            enterKeyHint="send"
            onChange={(e) => {
              setCommentText(e.target.value);
              // Grow with the content, up to the CSS max-height.
              e.target.style.height = "auto";
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendComment();
              }
            }}
          />

          <button
            type="button"
            className="comments-composer__send"
            onClick={handleSendComment}
            disabled={!commentText.trim() || sending}
            aria-label="Envoyer le commentaire"
          >
            {sending ? <Spinner onBrand /> : <SendIcon />}
          </button>
        </div>
      </section>
    </>,
    document.body
  );
};

export default CommentsBottomSheet;
