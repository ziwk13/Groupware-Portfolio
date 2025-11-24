
// --- 채팅방 목록 ---

import axiosServices from "api/axios";

/**
 * (UserList.jsx 용)
 * 현재 로그인한 사용자가 속한 모든 채팅방 목록을 조회합니다.
 * (ChatRoomApiController.java에 추가된 /api/chat/rooms GET 엔드포인트를 호출합니다.)
 */
export const getRooms = async () => {
  try {
    const response = await axiosServices.get('/api/chat/rooms');
    return response.data; // List<ChatRoomResponseDTO>
  } catch (error) {
    console.error('채팅방 목록 조회에 실패 하였습니다. : ', error);
    throw error;
  }
};

// --- 채팅방 관리 ---

/**
 * (N/A - 새 채팅 모달용)
 * 새로운 채팅방을 생성합니다.
 */
export const createRoom = async ({displayName, inviteeEmployeeIds}) => {
  try {
    const response = await axiosServices.post('/api/chat/rooms', {
      displayName,
      inviteeEmployeeIds
    });
    return response.data; // ChatRoomResponseDTO
  } catch (error) {
    throw error;
  }
};

/**
 * (N/A - 초대 모달용)
 * 특정 채팅방에 사용자를 초대합니다.
 */
export const inviteToRoom = async (roomId, inviteeEmployeeIds) => {
  try {
    const response = await axiosServices.post(`/api/chat/rooms/${roomId}/invite`, {
      inviteeEmployeeIds
    });
    return response.data;
  } catch (error) {
    console.error('채팅방 초대에 실패 하였습니다. : ', error);
    throw error;
  }
};

/**
 * (N/A - 채팅방 설정용)
 * 특정 채팅방을 나갑니다.
 */
export const leaveRoom = async (roomId) => {
  try {
    const response = await axiosServices.post(`/api/chat/rooms/${roomId}/leave`);
    return response.data;
  } catch (error) {
    console.error('채팅방 나가기에 실패 하였습니다. : ', error);
    throw error;
  }
};


// --- 메시지 ---

/**
 * (ChatPage.jsx 용)
 * 특정 채팅방의 메시지 목록을 페이지네이션으로 조회합니다.
 */
export const getMessages = async (roomId, page, size) => {
  try {
    const response = await axiosServices.get(`/api/chat/rooms/${roomId}/messages`, {
      params: { page, size }
    });
    return response.data; // Page<ChatMessageResponseDTO>
  } catch (error) {
    console.error('채팅 메시지 조회에 실패 하였습니다. : ', error);
    throw error;
  }
};

/**
 * (ChatPage.jsx - 입력창 포커스 시)
 * 특정 채팅방의 마지막 읽은 메시지 ID를 갱신합니다.
 */
export const updateLastRead = async (roomId, lastMessageId) => {
  try {
    const response = await axiosServices.patch(`/api/chat/rooms/${roomId}/read`, null, {
      params: { lastMessageId }
    });
    return response.data;
  } catch (error) {
    console.error('마지막 읽은 메시지 갱신에 실패 하였습니다. : ', error);
    throw error;
  }
};

/**
 * ID로 특정 채팅방 정보를 가져옵니다.
 */
export const getRoomById = async (roomId) => {
  try {
    const response = await axiosServices.get(`/api/chat/rooms/${roomId}`);
    return response.data;
  } catch (error) {
    console.error("API: 채팅방 정보(ID) 가져오기 실패", error);
    throw error;
  }
};

/**
 * (ChatDrawer.jsx - 채팅방 입장 시)
 * 특정 채팅방의 모든 안 읽은 메시지를 읽음 처리합니다. (카운트를 0으로)
 * /api/chat/rooms/{roomId}/read (PATCH) 엔드포인트를 파라미터 없이 호출합니다.
 */
export const markRoomAsRead = async (roomId) => {
  try {
    const response = await axiosServices.patch(`/api/chat/rooms/${roomId}/read`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * HTTP API를 통해 파일이 첨부된 메시지를 전송 한다.
 */
export const sendMessageWithFiles = async (roomId, formData) => {
  try {
    const response = await axiosServices.post(`/api/chat/rooms/${roomId}/send-with-files`, formData, {
      headers: { 'Content-Type': 'multipart/form-data'}
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};