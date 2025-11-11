import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

let stompClient = null;
let subscriptions = new Map();

/**
 * STOMP 클라이언트 연결
 * @param {Function} onConnectedCallback - 연결 성공 시 실행할 콜백
 */
const connect = (onConnectedCallback) => {

  // 이미 연결되어 있다면 콜백만 실행
  if (stompClient && stompClient.active) {
    console.log('STOMP: 이미 연결되어 있습니다.');
    if (onConnectedCallback) onConnectedCallback();
    return;
  }

  // 새 클라이언트 생성
  stompClient = new Client({
    webSocketFactory: () => new SockJS('http://localhost:8080/ws'), // 백엔드 엔드포인트
    reconnectDelay: 5000, // 5초마다 재연결 시도
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
  });

  // 연결 성공 시
  stompClient.onConnect = (frame) => {
    console.log('STOMP: 연결 성공', frame);
    // 연결 성공 시 전달받은 콜백 함수 실행
    if (onConnectedCallback) {
      onConnectedCallback();
    }
  };

  // 연결 오류 시
  stompClient.onStompError = (frame) => {
    console.error('STOMP: 브로커 오류', frame.headers['message'], frame.body);
  };

  // 활성화 (연결 시작)
  stompClient.activate();
};

/**
 * STOMP 클라이언트 연결 해제
 */
const disconnect = () => {
  // 모든 구독 해제
  subscriptions.forEach((subscription, destination) => {
    subscription.unsubscribe();
    console.log(`STOPM: [${destination}] 구독 해제`);
  });
  subscriptions.clear();

  // 연결 해제
  if (stompClient && stompClient.active) {
    stompClient.deactivate();
    console.log('STOMP: 연결 해제');
  }
  stompClient = null;
};

/**
 * 구독 함수
 * @param {string} destination - 구독할 경로
 * @param {Function} callback - 메시지 수신 시 실행할 콜백
 */
const subscribe = (destination, callback) => {
  if(!stompClient || !stompClient.active) {
    console.warn('STOMP: 연결되지 않은 상태에서 구독 시도');
    return;
  }
  if(subscriptions.has(destination)) {
    console.warn(`STOMP: [${destination}] 이미 구독 중 입니다.`);
    return;
  }
  const subscription = stompClient.subscribe(destination, (message) => {
    try {
      const payload = JSON.parse(message.body);
      callback(payload);  // 컴포넌트의 state 변경 함수 호출
    } catch (error) {
      console.error('STOMP: 메시지 파싱 실패', error);
    }
  });

  // 구독 정보 저장
  subscriptions.set(destination, subscription);
}

/**
 * 특정 구독 해제 함수
 * @param {string} destination - 구독 해제할 경로
 */
const unsubscribe = (destination) => {
  if(subscriptions.has(destination)) {
    const subscription = subscriptions.get(destination);
    subscription.unsubscribe();
    subscriptions.delete(destination);
    console.log(`STOMP: [${destination}] 구독 해제`);
  }
};

/**
 * 발행 함수
 * @param {string} destination - 발행할 경로
 * @param {object} body - 전송할 메시지 객체
 */
const publish = (destination, body) => {
  if(!stompClient || !stompClient.active) {
    console.warn('STOMP: 연결되지 않은 상태에서 발행 시도.');
    return;
  }

  stompClient.publish({
    destination: destination,
    body: JSON.stringify(body),
  });
};

/**
 * 알림 개수 구독
 * @param {Function} callback - 메시지 수신 시 실행할 콜백 (payload를 인자로 받음)
 */
const subscribeToNotifications = (callback) => {
  if (!stompClient || !stompClient.active) {
    console.warn('STOMP: 연결되지 않은 상태에서 구독 시도.');
    return;
  }

  if (notificationSubscription) {
    console.warn('STOMP: 이미 알림을 구독 중입니다.');
    return;
  }

  // /user/queue/notifications 구독
  subscribe('/user/queue/notifications', (message) => {
    if (message.body) {
      try {
        const payload = JSON.parse(message.body); // { unreadCount, totalCount }
        callback(payload); // 컴포넌트의 state 변경 함수 호출
      } catch (e) {
        console.error('STOMP: 메시지 파싱 실패', e);
      }
    }
  });
  console.log('STOMP: 알림 구독 시작');
};

// 서비스 객체로 내보내기
export const stompService = {
  connect,
  disconnect,
  subscribe,
  unsubscribe,
  publish,
  subscribeToNotifications,
};