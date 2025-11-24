import React, { createContext, useContext, useEffect, useState } from 'react';
import { useStomp } from './StompProvider';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [selectedUrl, setSelectedUrl] = useState(0);

  const { client, isConnected } = useStomp();

  useEffect(() => {
    if(client && isConnected) {
      const unreadQueue = '/user/queue/unread-count';

      const subscription = client.subscribe(unreadQueue, (message) => {
        try {
          const payload = JSON.parse(message.body);

          if(payload.totalUnreadCount !== undefined) {
            setTotalUnreadCount(payload.totalUnreadCount);
          }
        } catch (error) {
          console.error('STOMP: 안 읽은 개수 메시지 파싱 실패', error);
        }
      });
      return () => {
        if(subscription) {
          subscription.unsubscribe();
        }
      };
    }
  }, [client, isConnected]);

  const toggleChat = () => setIsChatOpen((prev) => !prev);
  
  const openChatWithUser = (user) => {
    setSelectedUser(user);
    setSelectedUrl(null);
    setIsChatOpen(true);
  };

  // URL로 채팅 여는 함수
  const openChatWithUrl = (url) => {
    setSelectedUrl(url);
    setSelectedUser(null);
    setIsChatOpen(true);
  }

  const closeChat = () => {
    setIsChatOpen(false);
    setSelectedUser(null); // 닫을 때 유저 선택도 초기화
    setSelectedUrl(null);
  };

  // "뒤로 가기" (사용자 목록으로) 전용 함수를 새로 만듭니다.
  const goBackToUserList = () => {
    setSelectedUser(null);
    setSelectedUrl(null);
  };

  const providerValue = {
    isChatOpen,
    selectedUser,
    totalUnreadCount,
    selectedUrl,
    openChatWithUrl,
    toggleChat,
    openChatWithUser,
    closeChat,
    goBackToUserList
  };

  return (
    // 새로 만든 함수를 context value에 추가합니다.
    <ChatContext.Provider value={providerValue}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};