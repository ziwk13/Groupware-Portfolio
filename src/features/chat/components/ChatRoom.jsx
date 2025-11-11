import { Box, Paper } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import ChatHistory from './ChatHistory';
import { getMessages } from '../api/Chat';
import MessageInput from './MessageInput';
import { useStomp } from '../../../contexts/StompProvider';

export default function ChatRoom({ roomId, user, theme }) {
  const [messages, setMessages] = useState([]);

  const scrollContainerRef = useRef(null);
  
  // useStomp 훅으로 client 객체와 연결 상태(isConnected)를 가져옴
  const { client, isConnected } = useStomp();

  // 채팅방 구독 경로
  const chatRoomTopic = `/topic/chat/rooms/${roomId}`;

  // 이전 대화 내역을 불러오는 useEffect
  useEffect(() => {
    const fetchHistory = async () => {
      if (!roomId) return;
      try {
        const response = await getMessages(roomId, 0, 50);
        const formattedHistory = response.content
          .map((msg) => ({
            from: msg.senderName,
            text: msg.content,
            time: new Date(msg.createdAt).toLocaleTimeString()
          }))
          .reverse();
        setMessages(formattedHistory);
      } catch (error) {
        console.error('이전 메시지 불러오기 실패', error);
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

    // 메시지 수신 시 처리할 콜백 (기존과 동일)
    const onMessageReceived = (payload) => {
      const formattedMessage = {
        from: payload.senderName,
        text: payload.content,
        time: new Date().toLocaleTimeString()
      };
      setMessages((prevMessages) => [...prevMessages, formattedMessage]);
    };

    // client.subscribe()를 직접 사용
    const subscription = client.subscribe(chatRoomTopic, (message) => {
      try {
        const payload = JSON.parse(message.body);
        onMessageReceived(payload); // 콜백 호출
      } catch (error) {
        console.error('STOMP: 메시지 파싱 실패', error);
      }
    });
    console.log(`ChatRoom: [${chatRoomTopic}] 구독 시작`);

    // useEffect의 cleanup 함수 (구독 해제)
    return () => {
      subscription.unsubscribe();
      console.log(`ChatRoom: [${chatRoomTopic}] 구독 해제`);
    };

  // 의존성 배열에 client와 isConnected 추가
  }, [roomId, client, isConnected, chatRoomTopic]);

  // 메시지 목록이 변경될 때마다 스크롤을 맨 아래로 이동
  useEffect(() => {
    if(scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  // 메시지 전송 핸들러
  const handleSendMessage = (message) => {
    // 전송 시에도 isConnected와 client 체크
    if (message.trim() && client && isConnected) {
      const destination = `/app/chat/rooms/${roomId}/send`;
      const body = message.trim();
      // client.publish()를 직접 사용
      client.publish({
        destination: destination,
        body: body
      });
    } else if (!client || !isConnected) {
        console.warn('STOMP: 연결되지 않아 메시지를 보낼 수 없습니다.');
    }
  };

  return (
    <Paper sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 채팅 내역 */}
      <Box 
      ref={scrollContainerRef}
      sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        <ChatHistory data={messages} theme={theme} user={user} />
      </Box>

      <Box sx={{ p: 2, pt: 0, borderTop: '1px solid #eee' }}>
        <MessageInput onSend={handleSendMessage} />
      </Box>
    </Paper>
  );
}