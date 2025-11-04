import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

// material-ui
import CloseIcon from '@mui/icons-material/Close';
import { Avatar, Chip, IconButton, ListItem, ListItemAvatar, ListItemText, Stack, Typography } from '@mui/material';

import { IconBadge, IconBug, IconFileCheck, IconMail } from '@tabler/icons-react';
import EmployeeIcon from 'assets/icons/EmployeeIcon';

// date-fns 라이브러리
import { deleteNotification, markAsRead } from 'api/notification';
import ChatIcon from 'assets/icons/ChatIcon';
import { formatRelativeTime } from 'utils/formatDate';
import ListItemWrapper from './ListItemWrapper';

const NotificationItem = ({ notification, onItemRead, onItemDelete, onClose }) => {
  const { notificationId: id, title, content, createdAt, readAt, ownerType, url } = notification;
  const navigate = useNavigate();
  const containerSX = { gap: 2, pl: 7 };

  // 새 알림 Chip을 표시할 시간
  const NEW_THRESHOLD_MINUTES = 5;
  const NEW_NOTIFICATION_THRESHOLD_MS = NEW_THRESHOLD_MINUTES * 60 * 1000;

  // 현재 시간과 알림 생성 시간의 차이 계산
  const now = new Date();
  const notificationTime = new Date(createdAt);
  const timeDifference = now.getTime() - notificationTime.getTime();

  // 설정한 시간 이내에 생성된 알림인지 확인
  const isRecent = timeDifference < NEW_NOTIFICATION_THRESHOLD_MS;

  // date-fns 라이브러리 세팅
  const displayTime = formatRelativeTime(createdAt);

  const isRead = readAt === true;

  // 알림 종류에 따른 아이콘 불러오기
  const renderIcon = () => {
    switch (ownerType) {
      case 'MAIL':
        return <IconMail />;
      case 'EMPLOYEE':
        return <EmployeeIcon />;
      case 'TEAMCHATNOTI':
        return <ChatIcon />;
      case 'CATEGORI':
        return <IconBug />;
      case 'APPROVAL':
        return <IconFileCheck />;
      case 'WORKLOG':
        return <IconBadge />;
      default:
        return null;
    }
  };

  // 알림 읽기 클릭 이벤트 핸들러
  const handleReadClick = (event) => {
    if (!isRead) {
      markAsRead(id)
        .then(() => {
          if (onItemRead) {
            onItemRead(id);
          }
        })
        .catch(error => {
          // API 파일에서 콘솔 에러 출력
        });
    }
    if (url) {
      navigate(url);
    }
    if (onClose) {
      onClose(event);
    }
  };

  // 알림 삭제 이벤트 핸들러 (소프트 삭제)
  const handleDeleteClick = (event) => {
    event.stopPropagation();
    deleteNotification(id)
      .then(() => {
        if (onItemDelete) {
          onItemDelete(id);
        }
      })
      .catch(error => {
        // API 파일에서 콘솔 에러 출력
      });
  };
  return (
    <ListItemWrapper onClick={handleReadClick}>
      <IconButton
        onClick={handleDeleteClick}
        size="small"
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 1,
        }}
      >
        <CloseIcon fontSize="inherit" />
      </IconButton>
      <ListItem
        alignItems="center"
        disablePadding
        secondaryAction={
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'flex-end' }}>
            <Typography variant="caption">{displayTime}</Typography>
          </Stack>
        }
      >
        <ListItemAvatar>
          {/* 알림 종류에 따른 아이콘 불러오기 */}
          <Avatar>{renderIcon()}</Avatar>
        </ListItemAvatar>
        <ListItemText primary={title} />
      </ListItem>
      <Stack sx={containerSX}>
        <Typography
          variant="subtitle2"
          noWrap
          sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          {content}
        </Typography>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }} >
          {!isRead && (
            <>
              <Chip label="안읽음" color="error" size="small" sx={{ width: 'min-content' }} />
              {isRecent && (
                <Chip label="새 알림" color="warning" size="small" sx={{ width: 'min-content' }} />
              )}
            </>
          )}
        </Stack>
      </Stack>
    </ListItemWrapper>
  );
};

NotificationItem.propTypes = {
  notification: PropTypes.shape({
    notificationId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string,
    content: PropTypes.string,
    createdAt: PropTypes.string,
    readAt: PropTypes.bool,
    ownerType: PropTypes.string,
    url: PropTypes.string
  }).isRequired,
  onItemRead: PropTypes.func,
  onItemDelete: PropTypes.func,
  onClose: PropTypes.func,
};

ListItemWrapper.propTypes = {
  children: PropTypes.node,
  onClick: PropTypes.func
};

export default NotificationItem;