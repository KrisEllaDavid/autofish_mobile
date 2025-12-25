import React, { useState, useEffect, useRef } from "react";
import { useApiWithLoading } from "../../services/apiWithLoading";
import { Chat, ChatMessage, apiClient } from "../../services/api";
import { toast } from "react-toastify";
import { normalizeImageUrl } from "../../utils/imageUtils";
import { appEvents, APP_EVENTS } from "../../utils/eventEmitter";
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
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previousMessageCountRef = useRef(0);
  const [failedMessageIds, setFailedMessageIds] = useState<Set<number | string>>(new Set());

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

    const messageContent = messageText.trim();
    const tempId = `temp-${Date.now()}`;

    // Set sending state to prevent double-sends
    setSending(true);

    // Create optimistic message immediately
    if (!chat) return;

    const optimisticMessage: ChatMessage = {
      id: tempId as any,
      chat: chatId,
      sender: {
        id: chat.producer_details?.email === userEmail ? chat.producer_details.id : chat.consumer_details?.id || 0,
        full_name: '',
      },
      content: messageContent,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    // Add message to UI immediately (optimistic update)
    setMessages([...messages, optimisticMessage]);
    setMessageText("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    // Send in background using directApi (no loading screen)
    try {
      const sentMessage = await directApi.sendMessage(chatId, messageContent);

      // Replace optimistic message with real message
      setMessages(prev =>
        prev.map(msg => String(msg.id) === tempId ? sentMessage : msg)
      );

      // Remove from failed list if it was there
      setFailedMessageIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(tempId);
        return newSet;
      });

      // Emit event to notify other components (e.g., chat list)
      appEvents.emit(APP_EVENTS.CHAT_NEW_MESSAGE, { chatId, message: sentMessage });
    } catch (error) {
      console.error("Error sending message:", error);

      // Mark message as failed
      setFailedMessageIds(prev => new Set(prev).add(tempId));

      // Don't show toast - user will see error icon on message
    } finally {
      // Reset sending state
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
            {messages.map((message, index) => {
              const isMyMessage = chat
                ? (chat.producer_details.email === userEmail &&
                    message.sender.id === chat.producer_details.id) ||
                  (chat.consumer_details && chat.consumer_details.email === userEmail &&
                    message.sender.id === chat.consumer_details.id)
                : false;

              const isFailed = failedMessageIds.has(message.id);

              // Show publication context at the start of conversation
              // OR when this is the most recent message and chat was just updated with new publication
              const isFirstMessage = index === 0;
              const isLatestMessage = index === messages.length - 1;

              // Show context for first message, or for latest message if it's recent (within 10 seconds)
              // This catches cases where user just clicked to message about a new publication
              const messageAge = new Date().getTime() - new Date(message.created_at).getTime();
              const isRecentMessage = messageAge < 10000; // 10 seconds

              const shouldShowContext = chat?.publication_details && (
                isFirstMessage || (isLatestMessage && isRecentMessage && messages.length > 1)
              );

              return (
                <div key={message.id}>
                  {/* Show publication context card */}
                  {shouldShowContext && (
                    <div className="message-context-card">
                      <div className="context-header">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M8 1v14M1 8h14" stroke="#666" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        <span>Conversation à propos de:</span>
                      </div>
                      <div className="context-content">
                        {chat.publication_details?.picture_url && (
                          <img
                            src={normalizeImageUrl(chat.publication_details.picture_url)}
                            alt={chat.publication_details.title || 'Publication'}
                            className="context-image"
                          />
                        )}
                        <div className="context-details">
                          <h4 className="context-title">
                            {chat.publication_details?.title || chat.publication_details?.description?.substring(0, 50) + '...'}
                          </h4>
                          <p className="context-price">
                            {chat.publication_details?.price?.toLocaleString('fr-FR')} FCFA
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Regular message */}
                  <div
                    className={`message-wrapper ${
                      isMyMessage ? "my-message" : "their-message"
                    }`}
                  >
                    <div className="message-content">
                      <p className="message-text">{message.content}</p>
                      <div className="message-footer">
                        <span className="message-timestamp">
                          {formatMessageTime(message.created_at)}
                        </span>
                        {isFailed && isMyMessage && (
                          <svg
                            className="message-error-icon"
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <circle cx="8" cy="8" r="7" fill="#ff4444" />
                            <path
                              d="M8 4v5M8 11h.01"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
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
          disabled={!messageText.trim()}
          className="send-button"
          style={{
            backgroundColor: messageText.trim() ? "#00b2d6" : "#d0d0d0",
          }}
        >
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
        </button>
      </div>
    </div>
  );
};

export default ChatConversationPage;
