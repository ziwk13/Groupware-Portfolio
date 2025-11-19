import { Box, Paper } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import ChatHistory from './ChatHistory';
import { getMessages, markRoomAsRead, sendMessageWithFiles } from '../api/Chat';
import MessageInput from './MessageInput';
import { useStomp } from 'contexts/StompProvider';

export default function ChatRoom({ roomId, user, theme }) {
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const scrollContainerRef = useRef(null);

  // useStomp 훅으로 client 객체와 연결 상태(isConnected)를 가져옴
  const { client, isConnected } = useStomp();

  // 채팅방 구독 경로
  const chatRoomTopic = `/topic/chat/rooms/${roomId}`;
  // 안읽음 카운트 업데이트 구독 경로
  const unreadUpdateTopic = `/topic/chat/rooms/${roomId}/unread-updates`;

  // 이전 대화 내역을 불러오는 useEffect
  useEffect(() => {
    const fetchHistory = async () => {
      if (!roomId) return;
      try {
        setError(null);
        const response = await getMessages(roomId, 0, 50);
        const formattedHistory = response.content
          .map((msg) => ({
            chatMessageId: msg.chatMessageId,
            employeeId: msg.employeeId,
            senderName: msg.senderName,
            content: msg.content,
            createdAt: msg.createdAt,
            unreadCount: msg.unreadCount,
            attachments: msg.attachments
          }))
          .reverse();
        setMessages(formattedHistory);
      } catch (error) {
        console.error('이전 메시지 불러오기 실패', error);
        setError(error);
      }
    };
    fetchHistory();
  }, [roomId]);

  // 연결, 구독, 구독 해제 관리 useEffect 수정
  useEffect(() => {
    // client가 존재하고, 연결(isConnected)이 true일 때만 구독 로직 실행
    if (!client || !isConnected || !roomId) {
      return;
    }

    // 메시지 수신 시 처리할 콜백
    const onMessageReceived = (payload) => {
      const formattedMessage = {
        chatMessageId: payload.chatMessageId,
        employeeId: payload.employeeId,
        senderName: payload.senderName,
        content: payload.content,
        createdAt: payload.createdAt,
        unreadCount: payload.unreadCount,
        attachments: payload.attachments
      };
      setMessages((prevMessages) => [...prevMessages, formattedMessage]);

      if (payload.employeeId && String(payload.employeeId) !== String(user.id)) {
        markRoomAsRead(roomId);
      }
    };

    const onUnreadUpdate = (payload) => {
      const updates = payload.unreadUpdates;
      if (!updates || updates.length === 0) return;

      const updateMap = new Map(
        updates.map((upd) => [upd.chatMessageId, upd.newUnreadCount])
      );

      setMessages((prevMessages) =>
        prevMessages.map((msg) => {
          if (updateMap.has(msg.chatMessageId)) {
            return {
              ...msg,
              unreadCount: updateMap.get(msg.chatMessageId)
            };
          }
          return msg;
        })
      );
    };
    // 새 메시지 구독
    const messageSubscription = client.subscribe(chatRoomTopic, (message) => {
      try {
        const payload = JSON.parse(message.body);
        onMessageReceived(payload);
      } catch (error) {
        console.error('STOMP: 메시지 파싱 실패', error);
      }
    });

    const unreadSubscription = client.subscribe(
      unreadUpdateTopic,
      (message) => {
        try {
          const payload = JSON.parse(message.body);
          onUnreadUpdate(payload);
        } catch (error) {
          console.error('STOMP: 안 읽음 갱신 파싱 실패', error);
        }
      }
    );

    // useEffect의 cleanup 함수 (구독 해제)
    return () => {
      messageSubscription.unsubscribe();
      unreadSubscription.unsubscribe();
    };

  }, [roomId, client, isConnected, chatRoomTopic, unreadUpdateTopic]);

  // 메시지 목록이 변경될 때마다 스크롤을 맨 아래로 이동
  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  // 메시지 전송 핸들러
  const handleSendMessage = async (data) => {

    const { text, files } = data;  // files는 MessageInput의 attachments state

    // 보낼 내용이 없으면 return
    if (!text.trim() && (!files || files.length === 0)) {
      return;
    }

    // 파일이 없고 텍스트만 있는 경우 STOMP로 즉시 전송
    if (!files || files.length === 0) {
      if (text.trim() && client && isConnected) {
        const destination = `/app/chat/rooms/${roomId}/send`;
        const payload = {
          content: text.trim(),
          attachments: null
        };
        client.publish({
          destination: destination,
          body: JSON.stringify(payload)
        });
      } else if (!client || !isConnected) {
        setError('연결이 끊어졌습니다. 메시지를 보낼 수 없습니다');
      }
      return;
    }

    // 파일이 있는 경우: HTTP API로 전송
    setLoading(true);
    setError(null);

    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    formData.append('content', text.trim());

    try {
      await sendMessageWithFiles(roomId, formData);
    } catch (error) {
      setError(error.response?.data?.message || '파일 업로드에 실패 했습니다');
    } finally {
      setLoading(false);
    }
  };
    return (
      <Paper sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {error && (
          <Box sx={{ p: 2, m: 'auto', color: 'red' }}>
            {error}
          </Box>
        )}
        {!error && (
          <>
            {/* 채팅 내역 */}
            <Box
              ref={scrollContainerRef}
              sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
              <ChatHistory data={messages} theme={theme} user={user} />
            </Box>

            <Box sx={{ p: 2, pt: 0, borderTop: '1px solid #eee' }}>
              <MessageInput onSend={handleSendMessage} disabled={loading} />
            </Box>
          </>
        )}
      </Paper>
    );
  }