import React, { useState, useEffect, useRef } from "react";
import { useApiWithLoading } from "../../services/apiWithLoading";
import { Chat, ChatMessage, apiClient } from "../../services/api";
import { toast } from "react-toastify";
import { normalizeImageUrl } from "../../utils/imageUtils";
import "./ChatConversationPage.css";

interface ChatConversationPageProps {
  chatId: number;
  onBack: () => void;
  userEmail?: string;
}

const ChatConversationPage: React.FC<ChatConversationPageProps> = ({
  chatId,
  onBack,
  userEmail,
}) => {
  const api = useApiWithLoading(); // For initial load and user actions
  const directApi = apiClient; // For silent background polling
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previousMessageCountRef = useRef(0);

  useEffect(() => {
    fetchChatData(true);

    // Poll for new messages every 6 seconds
    const pollInterval = setInterval(() => {
      fetchChatData(false);
    }, 6000);

    return () => clearInterval(pollInterval);
  }, [chatId]);

  useEffect(() => {
    // Only scroll if new messages were added
    if (messages.length > previousMessageCountRef.current) {
      scrollToBottom();
    }
    previousMessageCountRef.current = messages.length;
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchChatData = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    try {
      // Use direct API for background polls (no loading screen)
      // Use api hook for initial load (shows loading screen)
      const apiToUse = showLoading ? api : directApi;

      const [chatData, messageList] = await Promise.all([
        apiToUse.getChatById(chatId),
        apiToUse.getChatMessages(chatId),
      ]);

      if (showLoading) {
        console.log('📥 Received chat data:', chatData);
        console.log('  Producer details:', chatData.producer_details);
        console.log('  Consumer details:', chatData.consumer_details);
      }

      setChat(chatData);
      setMessages(messageList);
    } catch (error) {
      // Silent failure on background polls - only show error on initial load
      if (showLoading) {
        console.error("Error fetching chat data:", error);
        toast.error("Erreur lors du chargement de la conversation");
      }
      // Background polls fail silently to avoid crashes
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || sending) return;

    setSending(true);
    try {
      const newMessage = await api.sendMessage(chatId, messageText.trim());
      setMessages([...messages, newMessage]);
      setMessageText("");

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Erreur lors de l'envoi du message");
    } finally {
      setSending(false);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageText(e.target.value);

    // Auto-resize textarea
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPartner = () => {
    if (!chat) return null;

    console.log('🔍 ChatConversationPage - Getting partner');
    console.log('  Chat ID:', chat.id);
    console.log('  Producer:', chat.producer_details);
    console.log('  Consumer:', chat.consumer_details);
    console.log('  Current user email:', userEmail);

    // Edge case: If consumer is null and current user is producer,
    // this is invalid data (user trying to message themselves)
    // Return a placeholder that shows "Conversation invalide"
    if (!chat.consumer_details && chat.producer_details?.email === userEmail) {
      console.log('  ⚠️ Invalid chat: User is producer with no consumer');
      return {
        id: 0,
        email: '',
        first_name: 'Conversation',
        last_name: 'invalide',
        profile_picture_url: '',
      } as any;
    }

    // Show the OTHER person in the conversation
    // If current user is the producer, show the consumer
    // If current user is the consumer, show the producer
    if (chat.producer_details?.email === userEmail) {
      // Current user is the producer, show the consumer
      console.log('  ✅ Current user is producer, showing consumer:', chat.consumer_details);
      return chat.consumer_details || null;
    }
    // Current user is the consumer, show the producer
    console.log('  ✅ Current user is consumer, showing producer:', chat.producer_details);
    return chat.producer_details;
  };

  if (loading) {
    return (
      <div className="chat-conversation-page">
        <div className="chat-loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  const partner = getPartner();

  return (
    <div className="chat-conversation-page">
      {/* Header */}
      <div className="chat-header">
        <button className="back-button" onClick={onBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18l-6-6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className="chat-partner-info">
          <div className="partner-avatar-small">
            {partner?.profile_picture_url || partner?.profile_picture ? (
              <img
                src={normalizeImageUrl(partner.profile_picture_url || partner.profile_picture || '')}
                alt={`${partner.first_name || ''} ${partner.last_name || ''}`.trim()}
              />
            ) : (
              <div className="avatar-initials-small">
                {((partner?.first_name || "U").charAt(0) + (partner?.last_name || "").charAt(0)).toUpperCase()}
              </div>
            )}
          </div>
          <div className="partner-details">
            <h2 className="partner-name">
              {`${partner?.first_name || ''} ${partner?.last_name || ''}`.trim() || partner?.email || "Utilisateur"}
            </h2>
            {chat?.item_title && (
              <p className="chat-subject">{chat.item_title}</p>
            )}
          </div>
        </div>

        <button className="more-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="5" r="1.5" fill="currentColor" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
            <circle cx="12" cy="19" r="1.5" fill="currentColor" />
          </svg>
        </button>
      </div>

      {/* Messages Area */}
      <div className="messages-area">
        {messages.length === 0 ? (
          <div className="no-messages-yet">
            <p>Aucun message pour l'instant</p>
            <p className="no-messages-hint">Commencez la conversation !</p>
          </div>
        ) : (
          <>
            {messages.map((message) => {
              const isMyMessage = chat
                ? (chat.producer_details.email === userEmail &&
                    message.sender.id === chat.producer_details.id) ||
                  (chat.consumer_details && chat.consumer_details.email === userEmail &&
                    message.sender.id === chat.consumer_details.id)
                : false;

              return (
                <div
                  key={message.id}
                  className={`message-wrapper ${
                    isMyMessage ? "my-message" : "their-message"
                  }`}
                >
                  <div className="message-content">
                    <p className="message-text">{message.content}</p>
                    <span className="message-timestamp">
                      {formatMessageTime(message.created_at)}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="message-input-area">
        <textarea
          ref={textareaRef}
          value={messageText}
          onChange={handleTextareaChange}
          onKeyPress={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="Tapez un message..."
          className="message-textarea"
          rows={1}
        />
        <button
          onClick={handleSendMessage}
          disabled={!messageText.trim() || sending}
          className="send-button"
          style={{
            backgroundColor: messageText.trim() ? "#00b2d6" : "#d0d0d0",
          }}
        >
          {sending ? (
            <div className="sending-spinner"></div>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default ChatConversationPage;
