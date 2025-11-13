import { useEffect, useRef, useState } from 'react';
import { useStomp } from 'contexts/StompProvider';

// material-ui
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Button } from '@mui/material';
import { IconBell } from '@tabler/icons-react';
import { IconBellCheck } from '@tabler/icons-react';

// project imports
import { deleteAllNotifications, getUnreadCount, markAllAsRead } from '../api/notification';
import NotificationList from '../components/NotificationList';

// assets
import MainCard from 'ui-component/cards/MainCard';
import Transitions from 'ui-component/extended/Transitions';
import IconBellRingingFilled from 'assets/icons/IconBellRingingFilled';
import TrashIcon from 'assets/icons/TrashIcon';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

// notification status options
const status = [
  {
    value: 'all',
    label: 'All Notification'
  },
  {
    value: 'new',
    label: 'New'
  },
  {
    value: 'unread',
    label: 'Unread'
  },
  {
    value: 'other',
    label: 'Other'
  }
];

// ==============================|| NOTIFICATION ||============================== //

export default function NotificationSection() {
  const theme = useTheme();
  const downMD = useMediaQuery(theme.breakpoints.down('md'));

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { client, isConnected } = useStomp();

  const anchorRef = useRef(null);
  const listRef = useRef(null);  // NotificationList의 loadMore 함수를 호출하기 위한 ref
  const scrollRef = useRef(null);  // 스크롤 이벤트를 감지할 Box의 ref

  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }
    prevOpen.current = open;
  }, [open]);

  // 최초 1회 읽지 않은(HTTP)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const unreadData = await getUnreadCount();
        if (typeof unreadData === 'number') {
          setUnreadCount(unreadData);
        }
      } catch (error) {
        console.error('초기 읽지 않은 개수 조회 실패: ', error);
      }
    };
    fetchInitialData();
  }, [refreshKey]);

  // 웹소켓 연결 및 구독
  useEffect(() => {
    // 서비스에 연결 요청
if (client && isConnected) {
      // 구독할 경로
      const notificationTopic = '/user/queue/notifications';

      // client.subscribe()를 직접 호출합니다.
      const subscription = client.subscribe(notificationTopic, (message) => {
        try {
          const payload = JSON.parse(message.body);
          console.log('STOMP (Context): 새 알림 개수 수신', payload);
          setUnreadCount(payload.unreadCount);
          setRefreshKey(prevKey => prevKey + 1);
        } catch (e) {
          console.error('STOMP (Context): 알림 메시지 파싱 실패', e);
        }
      });

      // (연결 해제(disconnect)는 StompProvider가 알아서 한다)
      return () => {
        if (subscription) {
          subscription.unsubscribe();
          console.log('STOMP (Context): 알림 구독 해제');
        }
      };
    }
    // client나 isConnected 상태가 변경될 때마다 이 효과를 재실행합니다.
  }, [client, isConnected]);

  // 전체 알림 읽기
  const handleClick = async () => {
    try {
      await markAllAsRead();
      setUnreadCount(0);
      if (listRef.current) {
        listRef.current.markAllAsRead();
      }
    } catch (error) {
      // API 파일에서 실패 처리 콘솔 생성
    }
  }

  // Dialog 열기 핸들러
  const handleDeleteAllClick = () => {
    setDialogOpen(true);
  };

  // Dialog 닫기 핸들러
  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  // 실제 Dialog의 삭제 로직을 처리할 핸들러
  const handleConfirmDelete = async () => {
    try {
      await deleteAllNotifications();
      setUnreadCount(0);  // 안읽은 개수
      setRefreshKey(prevKey => prevKey + 1);
    } catch (error) {
      // API 파일에서 실패 처리
    }
    // 처리가 끝나면 닫기
    setDialogOpen(false);
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const handleScroll = () => {
    const scrollBox = scrollRef.current;
    if (scrollBox) {
      // 스크롤이 (전체 높이 - 50px)지점, 즉 거의 맨 밑에 도달했는지 확인
      const isBottom = scrollBox.scrollHeight - scrollBox.scrollTop <= scrollBox.clientHeight + 50;
      if (isBottom && listRef.current) {
        listRef.current.loadMore();
      }
    }
  };

  return (
    <>
      <Box sx={{ ml: 2 }}>
        <Avatar
          variant="rounded"
          sx={{
            ...theme.typography.commonAvatar,
            ...theme.typography.mediumAvatar,
            transition: 'all .2s ease-in-out',
            color: theme.vars.palette.warning.dark,
            background: theme.vars.palette.warning.light,
            '&:hover, &[aria-controls="menu-list-grow"]': {
              color: theme.vars.palette.warning.light,
              background: theme.vars.palette.warning.dark
            },
            ...theme.applyStyles('dark', {
              color: theme.vars.palette.warning.dark,
              background: theme.vars.palette.dark.main,
              '&:hover, &[aria-controls="menu-list-grow"]': {
                color: theme.vars.palette.grey[800],
                background: theme.vars.palette.warning.dark
              }
            })
          }}
          ref={anchorRef}
          aria-controls={open ? 'menu-list-grow' : undefined}
          aria-haspopup="true"
          onClick={handleToggle}
        >
          {/* notificationCount 값에 따라 아이콘을 다르게 표시 */}
          {unreadCount > 0 ? (
            <IconBellRingingFilled storke={1.5} size="20px" />
          ) : (
            <IconBell stroke={1.5} size="20px" />
          )}
        </Avatar>
      </Box>
      <Popper
        placement={downMD ? 'bottom' : 'bottom-end'}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        modifiers={[{ name: 'offset', options: { offset: [downMD ? 5 : 0, 20] } }]}
      >
        {({ TransitionProps }) => (
          <ClickAwayListener onClickAway={handleClose}>
            <Transitions position={downMD ? 'top' : 'top-right'} in={open} {...TransitionProps}>
              <Paper>
                {open && (
                  <MainCard border={false} elevation={16} content={false} boxShadow shadow={theme.shadows[16]} sx={{ width: 330 }}>
                    <Stack sx={{ gap: 2 }}>
                      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', pt: 2, px: 2 }}>
                        <Stack direction="row" sx={{ gap: 2 }}>
                          <Typography variant="subtitle1">안읽은 알림</Typography>
                          <Chip size="small" label={unreadCount} variant="filled" sx={{ color: 'background.default', bgcolor: 'warning.dark' }} />
                        </Stack>
                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title="전체 알림 읽음">
                            <IconButton onClick={handleClick} color="primary" size="small">
                              <IconBellCheck />
                            </IconButton>
                          </Tooltip>
                          <Dialog
                            open={dialogOpen}
                            onClose={handleDialogClose}
                            aria-labelledby="alert-dialog-title"
                            aria-describedby="alert-dialog-description"
                          >
                            <DialogTitle id="alert-dialog-title" textAlign={'center'}>
                              {"알림 전체 삭제"}
                            </DialogTitle>
                            <DialogContent>
                              <DialogContentText id="alert-dialog-description">
                                모든 알림을 삭제 하시겠습니까?
                              </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                              <Button onClick={handleConfirmDelete} color="error" autoFocus>
                                삭제
                              </Button>
                              <Button onClick={handleDialogClose}>취소</Button>
                            </DialogActions>
                          </Dialog>
                          <Tooltip title="전체 알림 삭제">
                            <IconButton onClick={handleDeleteAllClick} color="error" size="small">
                              <TrashIcon />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Stack>
                      <Box
                        ref={scrollRef}
                        onScroll={handleScroll}
                        sx={{ height: 1, maxHeight: 'calc(100vh - 235px)', overflowX: 'hidden', '&::-webkit-scrollbar': { width: 5 } }}>
                        <NotificationList
                          ref={listRef}
                          refreshKey={refreshKey}
                          onCountChange={setUnreadCount}
                          onClose={handleClose}
                        />
                      </Box>
                    </Stack>
                  </MainCard>
                )}
              </Paper>
            </Transitions>
          </ClickAwayListener>
        )}
      </Popper>
    </>
  );
}
