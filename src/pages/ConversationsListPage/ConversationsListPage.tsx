import React, { useState, useEffect } from "react";
import TopNavBar from "../../components/TopNavBar";
import { useApiWithLoading } from "../../services/apiWithLoading";
import { Chat, apiClient } from "../../services/api";
import { toast } from "react-toastify";
import { normalizeImageUrl } from "../../utils/imageUtils";
import "./ConversationsListPage.css";

interface ConversationsListPageProps {
  onNotificationClick?: () => void;
  onMyPageClick?: () => void;
  onChatSelect: (chatId: number) => void;
  activeTab?: string;
  userAvatar?: string;
  userName?: string;
  userEmail?: string;
  userRole?: string;
}

const ConversationsListPage: React.FC<ConversationsListPageProps> = ({
  onNotificationClick,
  onMyPageClick,
  onChatSelect,
  activeTab = "messages",
  userAvatar,
  userName,
  userEmail,
  userRole,
}) => {
  const api = useApiWithLoading(); // For initial load and user actions
  const directApi = apiClient; // For silent background polling
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingChatId, setDeletingChatId] = useState<number | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    fetchChats(true);

    // Poll for new messages every 6 seconds
    const pollInterval = setInterval(() => {
      fetchChats(false);
    }, 6000);

    return () => clearInterval(pollInterval);
  }, []);

  const fetchChats = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    try {
      // Use direct API for background polls (no loading screen)
      // Use api hook for initial load (shows loading screen)
      const apiToUse = showLoading ? api : directApi;

      const chatList = await apiToUse.getChats();
      setChats(chatList);
      if (initialLoad) {
        setInitialLoad(false);
      }
    } catch (error) {
      // Silent failure on background polls - only show error on initial load
      if (showLoading) {
        console.error("Error fetching chats:", error);
        toast.error("Erreur lors du chargement des conversations");
      }
      // Background polls fail silently to avoid crashes
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const handleDeleteChat = async (chatId: number, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent opening the chat

    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette conversation ?")) {
      return;
    }

    setDeletingChatId(chatId);
    try {
      await api.deleteChat(chatId);
      setChats(chats.filter((chat) => chat.id !== chatId));
      toast.success("Conversation supprimée");
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast.error("Erreur lors de la suppression de la conversation");
    } finally {
      setDeletingChatId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isYesterday = new Date(now.getTime() - 86400000).toDateString() === date.toDateString();

    if (isToday) {
      return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    }
    if (isYesterday) return "Hier";

    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  const getPartner = (chat: Chat) => {
    // Show the OTHER person in the conversation
    // If current user is the producer, show the consumer
    // If current user is the consumer, show the producer
    if (chat.producer_details.email === userEmail) {
      // Current user is the producer, show the consumer
      return chat.consumer_details || null;
    }
    // Current user is the consumer, show the producer
    return chat.producer_details;
  };

  const filteredChats = chats.filter((chat) => {
    const partner = getPartner(chat);
    const searchLower = searchQuery.toLowerCase();

    // If no partner (e.g., null consumer), still show the chat if searching by item title or message
    if (!partner) {
      return (
        chat.item_title?.toLowerCase().includes(searchLower) ||
        chat.last_message?.content?.toLowerCase().includes(searchLower)
      );
    }

    const partnerName = `${partner.first_name || ''} ${partner.last_name || ''}`.trim() || partner.email;
    return (
      partnerName?.toLowerCase().includes(searchLower) ||
      chat.item_title?.toLowerCase().includes(searchLower) ||
      chat.last_message?.content?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="conversations-list-page">
        <TopNavBar
          title="Messages"
          userAvatar={userAvatar}
          userName={userName}
          userEmail={userEmail}
          onNotificationClick={onNotificationClick}
          userRole={userRole}
          onMyPageClick={onMyPageClick}
          activeTab={activeTab}
        />
        <div className="conversations-loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="conversations-list-page">
      <TopNavBar
        title="Messages"
        userAvatar={userAvatar}
        userName={userName}
        userEmail={userEmail}
        onNotificationClick={onNotificationClick}
        userRole={userRole}
        onMyPageClick={onMyPageClick}
        activeTab={activeTab}
      />

      <div className="conversations-content">
        {/* Search Bar */}
        <div className="search-container">
          <div className="search-input-wrapper">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <input
              type="text"
              placeholder="Rechercher un message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Conversations List */}
        {filteredChats.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <img src="/icons/messages-bottom-nav.svg" alt="messages" />
            </div>
            <h2>Aucune conversation</h2>
            <p>Vos messages apparaîtront ici</p>
          </div>
        ) : (
          <div className="conversations-list">
            {filteredChats.map((chat) => {
              const partner = getPartner(chat);

              // For chats without a partner (null consumer), show placeholder info
              const partnerName = partner
                ? (`${partner.first_name || ''} ${partner.last_name || ''}`.trim() || partner.email || "Utilisateur")
                : "Nouveau contact";

              const partnerAvatar = partner?.profile_picture_url || partner?.profile_picture;
              const partnerInitials = partner
                ? ((partner.first_name || "U").charAt(0) + (partner.last_name || "").charAt(0)).toUpperCase()
                : "?";

              return (
                <div
                  key={chat.id}
                  className="conversation-item"
                  onClick={() => onChatSelect(chat.id)}
                >
                  <div className="conversation-avatar">
                    {partnerAvatar ? (
                      <img
                        src={normalizeImageUrl(partnerAvatar)}
                        alt={partnerName}
                      />
                    ) : (
                      <div className="avatar-initials">
                        {partnerInitials}
                      </div>
                    )}
                  </div>

                  <div className="conversation-details">
                    <div className="conversation-header">
                      <h3 className="conversation-name">
                        {partnerName}
                      </h3>
                      {chat.last_message && (
                        <span className="conversation-time">
                          {formatDate(chat.last_message.created_at)}
                        </span>
                      )}
                    </div>

                    <div className="conversation-preview">
                      <p className="conversation-message">
                        {chat.last_message?.content || "Nouvelle conversation"}
                      </p>
                      {chat.unread_count > 0 && (
                        <div className="unread-count">{chat.unread_count}</div>
                      )}
                    </div>
                  </div>

                  <button
                    className="delete-conversation-button"
                    onClick={(e) => handleDeleteChat(chat.id, e)}
                    disabled={deletingChatId === chat.id}
                    title="Supprimer la conversation"
                  >
                    {deletingChatId === chat.id ? (
                      <div className="delete-spinner" />
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationsListPage;
