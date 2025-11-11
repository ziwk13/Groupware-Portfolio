import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import { useColorScheme, useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';

// project imports
import { ThemeMode } from 'config';
import { useChat } from 'contexts/ChatContext';
import useAuth from 'hooks/useAuth';
import { appDrawerWidth as drawerWidth, gridSpacing } from 'store/constant';
import SimpleBar from 'ui-component/third-party/SimpleBar';
import ChatHeader from './ChatHeader';
import ChatRoom from './ChatRoom';
import UserAvatar from './UserAvatar';
import UserList from './UserList';
import { leaveRoom, getRooms } from '../api/Chat';
import { useStomp } from 'contexts/StompProvider';


// assets
import SearchTwoToneIcon from '@mui/icons-material/SearchTwoTone';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Stack } from '@mui/material';
import { IconPlus } from '@tabler/icons-react';
import useConfig from 'hooks/useConfig';

const mapDtoToUser = (room) => ({
  id: room.chatRoomId,
  name: room.name,
  avatar: room.profile,
  lastMessage: room.lastMessage,
  unReadChatCount: room.unreadCount,
  online_status: 'available'
});

export default function ChatDrawer({
  handleDrawerOpen,
  openChatDrawer,
  onStartNewChat,
  selectedUser,
  onCloseChat
}) {
  const theme = useTheme();
  const { colorScheme } = useColorScheme();

  const { user } = useAuth();
  const {
    state: { borderRadius }
  } = useConfig();
  const downLG = useMediaQuery(theme.breakpoints.down('lg'));

  const { openChatWithUser } = useChat();

  // show menu to set current user status
  const [anchorEl, setAnchorEl] = useState();
  const handleClickRightMenu = (event) => {
    setAnchorEl(event?.currentTarget);
  };

  const handleCloseRightMenu = () => {
    setAnchorEl(null);
  };

  // set user status on status menu click
  const [status, setStatus] = useState('available');
  const handleRightMenuItemClick = (userStatus) => () => {
    setStatus(userStatus);
    handleCloseRightMenu();
  };

  // 채팅방 나가기 모달 상태
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);

  // 채팅방 나가기 메뉴 클릭
  const handleLeaveClick = () => {
    setLeaveModalOpen(true);
  };

  // 모달 닫기
  const handleLeaveModalClose = () => {
    setLeaveModalOpen(false);
  };

  // 모달 나가기
  const handleConfirmLeave = async () => {
    if (!selectedUser || !selectedUser.id) return;

    try {
      await leaveRoom(selectedUser.id);
      handleLeaveModalClose();
      onCloseChat();
    } catch (error) {
      console.error('채팅방 나가기 실패: ', error);
      handleLeaveModalClose();
    }
  };

  const [chatRooms, setChatRooms] = useState([]);
  const { client, isConnected } = useStomp();

  useEffect(() => {
    if(!selectedUser) {
      const fetchChatRooms = async () => {
        try {
          const roomsDto = await getRooms();
          const mappedData = roomsDto.map(mapDtoToUser);
          setChatRooms(mappedData);
        } catch (error) {
          console.error("채팅방 목록 초기 로드 실패", error);
        }
      };
      fetchChatRooms();
    }
  }, [selectedUser]);

  useEffect(() => {
    if(client && isConnected) {
      const listUpdateQueue = '/user/queue/chat-list-update';

      const subscription = client.subscribe(listUpdateQueue, (message) => {
        try {
          const updatedRoomDto = JSON.parse(message.body);
          const mappedRoom = mapDtoToUser(updatedRoomDto);

          setChatRooms(currentRooms => {
            const otherRooms = currentRooms.filter(room => room.id !== mappedRoom.id);
            return [mappedRoom, ...otherRooms];
          });
        } catch (error) {
          console.error('채팅방 목록 업데이트 파싱 실패', error);
        }
      });
      return () => {
        if(subscription) {
          subscription.unsubscribe();
        }
      };
    }
  }, [client, isConnected]);

  return (
    <Drawer
      slotProps={{
        paper: {
          sx: {
            height: { xs: '100%', lg: '100%' },
            width: drawerWidth,
            boxSizing: 'border-box',
            position: 'relative',
            border: 'none',
            borderRadius: { sx: 'none', lg: `${borderRadius}px` },
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }
        }
      }}
      sx={{ 
        width: drawerWidth, 
        flexShrink: 0, 
        zIndex: { xs: 1100, lg: 0 }, 
        height: '100%' 
      }}
      variant={downLG ? 'temporary' : 'persistent'}
      anchor="right"
      open={openChatDrawer}
      ModalProps={{ keepMounted: true }}
      onClose={handleDrawerOpen}
    >
      {openChatDrawer && (
        <Box
          sx={{
            height: 1,
            minHeight: 0,
            bgcolor: { xs: 'transparent', lg: 'grey.50' },
            borderRadius: { xs: 0, lg: `${borderRadius}px` },
            ...theme.applyStyles('dark', { bgcolor: { lg: 'dark.main' } }),
            display: 'flex',
            flexDirection: 'column',
            border: colorScheme === ThemeMode.LIGHT ? '1px solid' : 'none',
            borderColor: theme.palette.divider,
            boxSizing: 'border-box'
          }}
        >
          {!selectedUser ? (
            <>
              <Box sx={{ p: 3, pb: 2 }}>
                <Grid container spacing={gridSpacing}>
                  <Grid size={12}>
                    <Grid container spacing={2} sx={{ alignItems: 'center', flexWrap: 'nowrap' }}>
                      <Grid>
                        <UserAvatar user={{
                          online_status: status,
                          avatar: user?.avatar || 'avatar-5.png',
                          name: user?.name || 'User'
                        }} />
                      </Grid>
                      <Grid size="grow">
                        <Typography variant="h4">{user?.name} {user?.position}님</Typography>
                      </Grid>
                      <Grid>
                        <IconButton onClick={onStartNewChat} size="large" aria-label="start new chat">
                          <IconPlus />
                        </IconButton>
                      </Grid>

                    </Grid>
                  </Grid>
                  <Grid size={12}>
                    <OutlinedInput
                      fullWidth
                      id="input-search-header"
                      placeholder="채팅방 검색"
                      startAdornment={
                        <InputAdornment position="start">
                          <SearchTwoToneIcon fontSize="small" />
                        </InputAdornment>
                      }
                    />
                  </Grid>
                </Grid>
              </Box>
              <SimpleBar
                sx={{
                  overflowX: 'hidden',
                  flex: 1,
                }}
              >
                <Box sx={{ p: 3, pt: 0 }}>
                  <UserList 
                  users={chatRooms}
                  setUser={openChatWithUser}
                  />
                </Box>
              </SimpleBar>
            </>
          ) : (
            <>
              <Box sx={{ p: 3, pb: 2 }}>
                <ChatHeader
                  user={selectedUser}
                  onClose={onCloseChat}
                  onLeaveRoom={handleLeaveClick}
                />
              </Box>
              <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
                <ChatRoom
                roomId={selectedUser.id}
                user={user}
                theme={theme}
                />
              </Box>

              <Dialog
                open={leaveModalOpen}
                onClose={handleLeaveModalClose}
                aria-labelledby="leave-chat-dialog-title"
                aria-describedby="leave-chat-dialog-description"
              >
                <DialogTitle id="leave-chat-dialog-title">
                  {"채팅방 나가기"}
                </DialogTitle>
                <DialogContent>
                  <DialogContentText id="leave-chat-dialog-description">
                    채팅방을 나가시겠습니까?
                    <br />
                    채팅방을 나가면 대화 내역이 삭제되어 복구할 수 없습니다.
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleConfirmLeave} color="error">
                    나가기
                  </Button>
                  <Button onClick={handleLeaveModalClose} autoFocus>
                    취소
                  </Button>
                  </DialogActions>
              </Dialog>
            </>
          )}
        </Box>
      )}
    </Drawer>
  );
}

ChatDrawer.propTypes = {
handleDrawerOpen: PropTypes.func,
  openChatDrawer: PropTypes.oneOfType([PropTypes.bool, PropTypes.any]),
  onStartNewChat: PropTypes.func,
  selectedUser: PropTypes.object,
  onCloseChat: PropTypes.func
};
