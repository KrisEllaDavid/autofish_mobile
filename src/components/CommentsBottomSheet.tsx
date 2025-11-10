import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { useApiWithLoading } from "../services/apiWithLoading";
import { Comment } from "../services/api";
import { toast } from "react-toastify";
import { normalizeImageUrl } from "../utils/imageUtils";

const MAIN_BLUE = "#00B2D6";

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
      // Focus input after a short delay to allow animation
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    } else {
      // Reset state when closing
      setComments([]);
      setPage(1);
      setHasMore(true);
      setCommentText("");
    }
  }, [isOpen, publicationId]);

  const fetchComments = async (pageNum: number) => {
    if (loading) return;

    setLoading(true);
    try {
      const response = await api.getPublicationComments(
        publicationId,
        pageNum,
        20
      );

      if (pageNum === 1) {
        setComments(response.results);
      } else {
        setComments((prev) => [...prev, ...response.results]);
      }

      setHasMore(response.has_more);
      setPage(pageNum);
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast.error("Erreur lors du chargement des commentaires");
    } finally {
      setLoading(false);
    }
  };

  const handleSendComment = async () => {
    if (!commentText.trim() || sending) return;

    if (!api.isAuthenticated()) {
      toast.info("Veuillez vous connecter pour commenter");
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
      toast.success("Commentaire ajouté !");
    } catch (error) {
      console.error("Error creating comment:", error);
      toast.error("Erreur lors de l'envoi du commentaire");
    } finally {
      setSending(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await api.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      toast.success("Commentaire supprimé");
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchComments(page + 1);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins}min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;

    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    });
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 9998,
          animation: "fadeIn 0.2s ease-out",
        }}
      />

      {/* Bottom Sheet */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          maxHeight: "80vh",
          backgroundColor: "white",
          borderRadius: "24px 24px 0 0",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          animation: "slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: "0 -4px 24px rgba(0,0,0,0.15)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px 16px 24px",
            borderBottom: "1px solid #e0e0e0",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: "40px",
              height: "4px",
              backgroundColor: "#ddd",
              borderRadius: "2px",
              margin: "0 auto 16px auto",
              cursor: "pointer",
            }}
            onClick={onClose}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#222",
                margin: 0,
              }}
            >
              Commentaires
            </h2>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                fontSize: 24,
                color: "#666",
                cursor: "pointer",
                padding: "4px 8px",
              }}
            >
              ×
            </button>
          </div>
          <p
            style={{
              fontSize: 13,
              color: "#666",
              margin: "4px 0 0 0",
            }}
          >
            {publicationTitle}
          </p>
        </div>

        {/* Comments List */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px 24px",
          }}
        >
          {comments.length === 0 && !loading ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 20px",
                color: "#999",
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
              <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
                Aucun commentaire
              </p>
              <p style={{ fontSize: 14 }}>
                Soyez le premier à commenter cette publication
              </p>
            </div>
          ) : (
            <>
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  style={{
                    marginBottom: 20,
                    paddingBottom: 16,
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  <div style={{ display: "flex", gap: "12px" }}>
                    {/* Avatar */}
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        backgroundColor: "#f0f0f0",
                        flexShrink: 0,
                        overflow: "hidden",
                      }}
                    >
                      {comment.user_avatar ? (
                        <img
                          src={normalizeImageUrl(comment.user_avatar)}
                          alt={comment.user_name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: `${MAIN_BLUE}20`,
                            color: MAIN_BLUE,
                            fontWeight: 700,
                            fontSize: 16,
                          }}
                        >
                          {comment.user_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Comment Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: 6,
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontWeight: 600,
                              fontSize: 15,
                              color: "#222",
                              marginBottom: 2,
                            }}
                          >
                            {comment.user_name}
                          </div>
                          <div style={{ fontSize: 12, color: "#999" }}>
                            {formatDate(comment.created_at)}
                          </div>
                        </div>

                        {/* Delete Button for Owner */}
                        {comment.is_owner && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#ff4444",
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: "pointer",
                              padding: "4px 8px",
                            }}
                          >
                            Supprimer
                          </button>
                        )}
                      </div>

                      <p
                        style={{
                          margin: 0,
                          fontSize: 15,
                          lineHeight: 1.5,
                          color: "#444",
                          wordBreak: "break-word",
                        }}
                      >
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Load More Button */}
              {hasMore && (
                <button
                  onClick={loadMore}
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "12px",
                    backgroundColor: "white",
                    border: `2px solid ${MAIN_BLUE}`,
                    borderRadius: "8px",
                    color: MAIN_BLUE,
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.6 : 1,
                    marginTop: 8,
                  }}
                >
                  {loading ? "Chargement..." : "Voir plus de commentaires"}
                </button>
              )}
            </>
          )}
          <div ref={commentsEndRef} />
        </div>

        {/* Comment Input */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid #e0e0e0",
            backgroundColor: "white",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
            <textarea
              ref={inputRef}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendComment();
                }
              }}
              placeholder="Ajouter un commentaire..."
              rows={1}
              style={{
                flex: 1,
                padding: "12px 16px",
                border: "1px solid #e0e0e0",
                borderRadius: "24px",
                fontSize: 15,
                color: "#000",
                outline: "none",
                resize: "none",
                fontFamily: "inherit",
                maxHeight: "100px",
                backgroundColor: "white",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = MAIN_BLUE;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e0e0e0";
              }}
            />
            <button
              onClick={handleSendComment}
              disabled={!commentText.trim() || sending}
              style={{
                padding: "12px 20px",
                backgroundColor: commentText.trim() ? MAIN_BLUE : "#ddd",
                color: "white",
                border: "none",
                borderRadius: "24px",
                fontSize: 15,
                fontWeight: 600,
                cursor:
                  commentText.trim() && !sending ? "pointer" : "not-allowed",
                transition: "background-color 0.2s",
                height: "48.1px",
              }}
            >
              {sending ? "..." : "Envoyer"}
            </button>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </>,
    document.body
  );
};

export default CommentsBottomSheet;
