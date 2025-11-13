// material-ui
import List from '@mui/material/List';
import { Box, Typography } from '@mui/material';


// assets
import { useEffect, useState, forwardRef, useImperativeHandle, useCallback } from 'react';
import PropTypes from 'prop-types';
import NotificationItem from './NotificationItem';
import ListItemWrapper from './ListItemWrapper';
import { getNotifications } from '../api/notification';
import EmptyNotificationIcon from 'assets/icons/EmptyNotificationIcon';


// ==============================|| NOTIFICATION LIST ITEM ||============================== //

const NotificationList = forwardRef(({ refreshKey, onCountChange, onTotalCountChange, onClose }, ref) => {
  const NOTIFICATION_PAGE_SIZE = 10;
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(0); // 현재 페이지 번호
  const [hasNextPage, setHasNextPage] = useState(true);  // 다음 페이지가 있는지 여부
  const [isLoading, setIsLoading] = useState(false);  // 로딩 중복 방지

  // 초기 로딩
  useEffect(() => {
    if (isLoading) return;
    setIsLoading(true);

    getNotifications(0, NOTIFICATION_PAGE_SIZE)
      .then(response => {  // API 함수가 response.data를 반환
        const { content, last } = response;
        setNotifications(content || []);
        setHasNextPage(!last);
        setPage(0);  // 로드 성공 후 페이지 0 으로 확정
      })
      .catch(error => {
        console.error('알림 로딩 실패: ', error);
      })
      .finally(() => {
        setIsLoading(false);  // 로딩 완료
      });
  }, [refreshKey]);

  // 데이터 로딩 useEffect: page가 바뀔 때 작동
  useEffect(() => {
    if (page === 0 || isLoading || !hasNextPage) return;

    setIsLoading(true);
    getNotifications(page, NOTIFICATION_PAGE_SIZE)
      .then(response => {  // API 함수가 reponse.data를 반환
        const { content, last } = response;
        if (content) {
          setNotifications(prev => [...prev, ...content]);
        }
        setHasNextPage(!last);
      })
      .catch(error => {
        console.error("알림 더 불러오기 실패: ", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
    }, [page]);

    const loadMoreItems = useCallback(() => {
      if(!isLoading && hasNextPage) {
        setPage(prevPage => prevPage + 1);
      }
    }, [isLoading, hasNextPage]);

    useImperativeHandle(ref, () => ({
      loadMore: () => {
        loadMoreItems();
      },
      markAllAsRead: () => {
        // 현재 로컬 state의 모든 알림을 읽음 으로 즉시 변경
        const updateNotifications = notifications.map(item => ({
          ...item,
          readAt: true
        }));
        setNotifications(updateNotifications);
      }
    }), [loadMoreItems, notifications]);

    // 알림 읽음 처리 함수
    const handleItemRead = (readItemId) => {
      let wasUnread = false;
      const updateNotifications = notifications.map((item) => {
        if(item.notificationId === readItemId) {
          if(!item.readAt) wasUnread = true;
          return { ... item, readAt: true }; // 읽음 상태로 변경
        }
        return item;
      });

      setNotifications(updateNotifications);
      if(wasUnread && onCountChange) {
        onCountChange(prevCount => Math.max(0, prevCount - 1));
      };
    }

    // 개별 알림 삭제 함수
    const handleItemDelete = (deletedItemId) => {
      let wasUnread = false;
      const itemToDelete = notifications.find(item => item.notificationId === deletedItemId);
      if(itemToDelete && !itemToDelete.readAt) {
        wasUnread = true;
      }
      const updateNotifications = notifications.filter(
        (item) => item.notificationId !== deletedItemId
      );
      setNotifications(updateNotifications);

      if(wasUnread && onCountChange) {
        onCountChange(prevCount => Math.max(0, prevCount - 1));
      }
      if(onTotalCountChange) {
        onTotalCountChange(prevCount => Math.max(0, prevCount - 1));
      }
      if(hasNextPage) {
        loadMoreItems();
      }
    };

    return (
      <List sx={{ width: '100%', py: 0 }}>
        {/* 초기 로딩 중이면서, 알림이 0개일 때는 아무것도 표시하지 않음
            알림이 1개 이상일 때는 목록을 map으로 랜더링
            로딩 중이 아니면서 알림이 0개일 때 알림 없음 SVG 표시
         */}
         {isLoading && notifications.length === 0 ? (
          <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
          </Box>
         ) : notifications.length > 0 ? (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.notificationId}
              notification={notification}
              onItemRead={handleItemRead}
              onItemDelete={handleItemDelete}
              onClose={onClose}
              />
          ))
         ) : (
          <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: 4,
            px: 2,
            textAlign: 'center'
          }}
        >
          <EmptyNotificationIcon style={{ width: '150px', height: 'auto', opacity: 0.7 }} />
          <Typography variant="subtitle1" sx={{ mt: 2, color: 'text.secondary' }}>
            알림이 없습니다.
          </Typography>
        </Box>
         )}
      </List>
    );
  });

  NotificationList.displayName = 'NotificationList';

  ListItemWrapper.propTypes = {
    children: PropTypes.node
  };

  NotificationList.propTypes = {
    refreshKey: PropTypes.number,
    onCountChange: PropTypes.func,
    onTotalCountChange: PropTypes.func,
    onClose: PropTypes.func,
  };

  export default NotificationList;
