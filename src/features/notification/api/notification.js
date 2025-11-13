import axiosServices from "api/axios";


// 읽지 않은 알림 개수 조회 (index.jsx)
export const getUnreadCount = async () => {
  try {
    const response = await axiosServices.get(`/api/notifications/unread-count`);
    return response.data;
  } catch (error) {
    console.error('읽지 않은 알림 개수 조회에 실패 하였습니다. : ', error);
    throw error;
  }
};

// 모든 알림 읽음 처리 (index.jsx)
export const markAllAsRead = async () => {
  try {
    const response = await axiosServices.patch('/api/notifications/read-all');
    return response.data;
  } catch (error) {
    console.error('모든 알림 읽음 처리에 실패 하였습니다. :', error);
    throw error;
  }
};

// 모든 알림 삭제 (index.jsx) 
export const deleteAllNotifications = async () => {
  try {
    const response = await axiosServices.patch('/api/notifications/delete-all');
    return response.data;
  } catch (error) {
    console.error('모든 알림 삭제에 실패 하였습니다. :', error);
    throw error;
  }
};

// 알림 목록 조회 (페이지네이션) (NotificationList.jsx) 
export const getNotifications = async (page, size) => {
  try {
    const response = await axiosServices.get('/api/notifications', {
      params: { page, size }
    });
    return response.data; // { content: [...], last: false }
  } catch (error) {
    console.error('알림 목록 조회에 실패 하였습니다. :', error);
    throw error;
  }
};

// 개별 알림 읽음 처리 (NotificationItem.jsx) 
export const markAsRead = async (id) => {
  try {
    const response = await axiosServices.patch(`/api/notifications/${id}/read`);
    return response.data;
  } catch (error) {
    console.error('알림 읽음 처리에 실패 하였습니다. :', error);
    throw error;
  }
};

// 개별 알림 삭제 (NotificationItem.jsx)
export const deleteNotification = async (id) => {
  try {
    const response = await axiosServices.patch(`/api/notifications/${id}/delete`);
    return response.data;
  } catch (error) {
    console.error('알림 삭제 처리에 실패 하였습니다. :', error);
    throw error;
  }
};