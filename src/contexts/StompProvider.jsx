import React, { createContext, useContext, useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import PropTypes from 'prop-types';
// Context 생성
const StompContext = createContext({
  client: null,
  isConnected: false
});

// Provider 컴포넌트 생성

export function StompProvider({ children }){
  const [client, setClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // STOMP 클라이언트 인스턴스 생성
    const stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    // 연결 성공 시
    stompClient.onConnect = (frame) => {
      console.log('STOMP 연결 성공', frame);
      setIsConnected(true);
    };

    // 연결 오류 시
    stompClient.onStompError = (frame) => {
      console.error('STOMP (Context): 브로커 오류', frame.headers['message'], frame.body);
      setIsConnected(false);
    };

    // 연결 해제 시
    stompClient.onDisconnect = () => {
      console.log('STOMP (Context): 연결 해제');
      setIsConnected(false);
    };

    // 클라이언트 활성화
    stompClient.activate();
    setClient(stompClient);

    // 앱 종료 또는 컴포넌트 언마운트 시 연결 해재
    return () => {
      if(stompClient.active) {
        stompClient.deactivate();
      }
    };
  }, []);

  const value = { client, isConnected };

  return <StompContext.Provider value={value}>{children}</StompContext.Provider>
}

StompProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export const useStomp = () => {
  const context = useContext(StompContext);
  if(!context) {
    throw new Error('useStomp는 StompProvider 내부에서 사용해야 합니다.');
  }
  return context;
}
