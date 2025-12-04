import React, { useState, useEffect, useRef } from "react";
import TopNavBar from "../../components/TopNavBar";
import { useApiWithLoading } from "../../services/apiWithLoading";
import { Chat, ChatMessage } from "../../services/api";
import { toast } from "react-toastify";
import { normalizeImageUrl } from "../../utils/imageUtils";
import "./MessagesPage.css";

const MAIN_BLUE = "#00B2D6";

interface MessagesPageProps {
  onNotificationClick?: () => void;
  onMyPageClick?: () => void;
  activeTab?: string;
  userAvatar?: string;
  userName?: string;
  userEmail?: string;
  userRole?: string;
}

const MessagesPage: React.FC<MessagesPageProps> = ({
  onNotificationClick,
  onMyPageClick,
  activeTab = "messages",
  userAvatar,
  userName,
  userEmail,
  userRole,
}) => {
  const api = useApiWithLoading();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchChats();
  }, []);

  // Auto-select chat if coming from a publication or product page
  useEffect(() => {
    const selectedChatId = sessionStorage.getItem("selectedChatId");
    if (selectedChatId && chats.length > 0) {
      const chatToSelect = chats.find((c) => c.id === parseInt(selectedChatId));
      if (chatToSelect) {
        setSelectedChat(chatToSelect);
        sessionStorage.removeItem("selectedChatId"); // Clear after using
      }
    }
  }, [chats]);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.id);
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchChats = async () => {
    setLoading(true);
    try {
      const chatList = await api.getChats();
      setChats(chatList);
    } catch (error) {
      console.error("Error fetching chats:", error);
      toast.error("Erreur lors du chargement des conversations");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId: number) => {
    try {
      const messageList = await api.getChatMessages(chatId);
      setMessages(messageList);

      // Messages are automatically marked as read by the backend
      // Update the chat's unread count in the list
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === chatId ? { ...chat, unread_count: 0 } : chat
        )
      );
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Erreur lors du chargement des messages");
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedChat || sending) return;

    setSending(true);
    try {
      const newMessage = await api.sendMessage(
        selectedChat.id,
        messageText.trim()
      );
      setMessages([...messages, newMessage]);
      setMessageText("");

      // Update chat list to reflect new message
      await fetchChats();
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Erreur lors de l'envoi du message");
    } finally {
      setSending(false);
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
    if (diffMins < 60) return `${diffMins}min`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}j`;

    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    });
  };

  const getPartner = (chat: Chat) => {
    // Determine who is the chat partner based on current user email
    if (chat.producer.email === userEmail) {
      return chat.consumer;
    }
    return chat.producer;
  };

  if (loading) {
    return (
      <div className="messages-page">
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
        <div className="messages-content">
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="messages-page">
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

      <div className="messages-content">
        {chats.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <img src="/icons/messages-bottom-nav.svg" alt="messages" />
            </div>
            <h2>Aucun message</h2>
            <p>
              Vos conversations apparaîtront ici. Commencez à échanger avec
              d'autres utilisateurs.
            </p>
          </div>
        ) : (
          <div className="messages-layout">
            {/* Chat List */}
            <div className="chat-list">
              {chats.map((chat) => {
                const partner = getPartner(chat);
                return (
                  <div
                    key={chat.id}
                    className={`chat-item ${selectedChat?.id === chat.id ? "active" : ""}`}
                    onClick={() => setSelectedChat(chat)}
                  >
                    <div className="chat-avatar">
                      {partner.profile_picture ? (
                        <img
                          src={normalizeImageUrl(partner.profile_picture)}
                          alt={partner.full_name}
                        />
                      ) : (
                        <div className="avatar-placeholder">
                          {(partner.full_name || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="chat-info">
                      <div className="chat-header">
                        <h3>{partner.full_name || 'Utilisateur'}</h3>
                        {chat.last_message && (
                          <span className="chat-time">
                            {formatDate(chat.last_message.timestamp)}
                          </span>
                        )}
                      </div>
                      <div className="chat-preview">
                        <p className="product-name">
                          {chat.item_title}
                        </p>
                        {chat.last_message && (
                          <p className="last-message">
                            {chat.last_message.content}
                          </p>
                        )}
                      </div>
                    </div>
                    {chat.unread_count > 0 && (
                      <div className="unread-badge">{chat.unread_count}</div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Conversation View */}
            {selectedChat ? (
              <div className="conversation-view">
                {/* Conversation Header */}
                <div className="conversation-header">
                  <div className="conversation-partner">
                    <div className="partner-avatar">
                      {getPartner(selectedChat).profile_picture ? (
                        <img
                          src={normalizeImageUrl(
                            getPartner(selectedChat).profile_picture!
                          )}
                          alt={getPartner(selectedChat).full_name}
                        />
                      ) : (
                        <div className="avatar-placeholder">
                          {(getPartner(selectedChat).full_name || 'U')
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3>
                        {getPartner(selectedChat).full_name || 'Utilisateur'}
                      </h3>
                      <p className="product-tag">
                        {selectedChat.item_title}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages List */}
                <div className="messages-list">
                  {messages.length === 0 ? (
                    <div className="no-messages">
                      <p>Aucun message. Commencez la conversation !</p>
                    </div>
                  ) : (
                    <>
                      {messages.map((message) => {
                        // Check if sender is me by comparing with chat participants
                        const isMyMessage = selectedChat
                          ? (selectedChat.producer.email === userEmail && message.sender.id === selectedChat.producer.id) ||
                            (selectedChat.consumer.email === userEmail && message.sender.id === selectedChat.consumer.id)
                          : false;
                        return (
                          <div
                            key={message.id}
                            className={`message ${isMyMessage ? "my-message" : "their-message"}`}
                          >
                            <div className="message-bubble">
                              <p>{message.content}</p>
                              <span className="message-time">
                                {formatDate(message.timestamp)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Message Input */}
                <div className="message-input-container">
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Écrivez votre message..."
                    rows={1}
                    style={{
                      backgroundColor: "white",
                      color: "#000",
                    }}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim() || sending}
                    style={{
                      backgroundColor: messageText.trim()
                        ? MAIN_BLUE
                        : "#ddd",
                    }}
                  >
                    {sending ? "..." : "Envoyer"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="no-chat-selected">
                <div className="empty-state-icon">
                  <img src="/icons/messages-bottom-nav.svg" alt="messages" />
                </div>
                <p>Sélectionnez une conversation pour commencer</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
