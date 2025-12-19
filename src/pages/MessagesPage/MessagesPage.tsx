import React, { useState, useEffect } from "react";
import ConversationsListPage from "../ConversationsListPage/ConversationsListPage";
import ChatConversationPage from "../ChatConversationPage/ChatConversationPage";

interface MessagesPageProps {
  onNotificationClick?: () => void;
  onMyPageClick?: () => void;
  activeTab?: string;
  userAvatar?: string;
  userName?: string;
  userEmail?: string;
  userRole?: string;
  onChatStateChange?: (inChat: boolean) => void;
}

const MessagesPage: React.FC<MessagesPageProps> = ({
  onNotificationClick,
  onMyPageClick,
  activeTab = "messages",
  userAvatar,
  userName,
  userEmail,
  userRole,
  onChatStateChange,
}) => {
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);

  // Auto-select chat if coming from a publication or product page
  useEffect(() => {
    const storedChatId = sessionStorage.getItem("selectedChatId");
    if (storedChatId) {
      setSelectedChatId(parseInt(storedChatId));
      sessionStorage.removeItem("selectedChatId");
    }
  }, []);

  // Notify parent when chat state changes
  useEffect(() => {
    onChatStateChange?.(selectedChatId !== null);
  }, [selectedChatId, onChatStateChange]);

  const handleChatSelect = (chatId: number) => {
    setSelectedChatId(chatId);
  };

  const handleBackToList = () => {
    setSelectedChatId(null);
  };

  if (selectedChatId !== null) {
    return (
      <ChatConversationPage
        chatId={selectedChatId}
        onBack={handleBackToList}
        userEmail={userEmail}
      />
    );
  }

  return (
    <ConversationsListPage
      onNotificationClick={onNotificationClick}
      onMyPageClick={onMyPageClick}
      onChatSelect={handleChatSelect}
      activeTab={activeTab}
      userAvatar={userAvatar}
      userName={userName}
      userEmail={userEmail}
      userRole={userRole}
    />
  );
};

export default MessagesPage;
