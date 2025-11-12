import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import { useColorScheme, useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

// project imports
import { ThemeMode } from 'config';
import { useChat } from 'contexts/ChatContext';
import useAuth from 'hooks/useAuth';
import { gridSpacing } from 'store/constant';
import SimpleBar from 'ui-component/third-party/SimpleBar';
import ChatHeader from './ChatHeader';
import ChatRoom from './ChatRoom';
import UserAvatar from './UserAvatar';
import UserList from './UserList';
import { leaveRoom, getRooms, inviteToRoom } from '../api/Chat';
import { useStomp } from 'contexts/StompProvider';
import OrganizationModal from '../../organization/components/OrganizationModal';


// assets
import SearchTwoToneIcon from '@mui/icons-material/SearchTwoTone';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
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

  // 초대하기 모달 상태
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  // 초대 모달에 전달할 초기 목록
  const initialInviteList = [{ name: '초대 대상자', empList: [] }];
  const [inviteList, setInviteList] = useState(initialInviteList);


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

  // 초대하기 메뉴 클릭 핸들러 (ChatHeader에서 호출)
  const handleInviteClick = () => {
    setInviteList(initialInviteList); // 모달을 열 때마다 선택 목록 초기화
    setInviteModalOpen(true);
  };

  // 초대 모달 닫기 핸들러
  const handleInviteModalClose = () => {
    setInviteModalOpen(false);
  };

  // 초대 모달 '적용' 버튼 클릭 핸들러 (API 호출)
  const handleInviteApply = async (appliedList) => {
    // 현재 채팅방 ID (selectedUser.id)가 있는지 확인
    if (!selectedUser || !selectedUser.id) return;

    // OrganizationModal에서 '초대 대상자' 박스의 empList를 찾음
    const inviteeBox = appliedList.find(item => item.name === '초대 대상자');
    if (!inviteeBox || inviteeBox.empList.length === 0) {
      console.log("선택된 직원이 없습니다.");
      handleInviteModalClose(); // 모달 닫기
      return;
    }

    // API가 요구하는 형식 [1, 2, 3] 으로 변환
    const inviteeEmployeeIds = inviteeBox.empList.map(emp => emp.employeeId);
    const roomId = selectedUser.id; // 현재 채팅방 ID

    try {
      // 백엔드 API 호출 (API 파일에 inviteToRoom이 정의되어 있어야 함)
      // API는 (roomId, body) 형태를 받는다고 가정
      await inviteToRoom(roomId, inviteeEmployeeIds);
      
      console.log('초대 성공!');
      handleInviteModalClose(); // 성공 시 모달 닫기
    } catch (error) {
      console.error('초대 실패:', error);
      handleInviteModalClose(); // 실패 시에도 모달 닫기
    }
  };


  const [chatRooms, setChatRooms] = useState([]);
  const { client, isConnected } = useStomp();

  useEffect(() => {
    if (!selectedUser) {
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
    if (client && isConnected) {
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
        if (subscription) {
          subscription.unsubscribe();
        }
      };
    }
  }, [client, isConnected]);

  return (
    <Box
      sx={{
        height: '100%',
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
              onInviteClick={handleInviteClick}
            />
          </Box>
          <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
            <ChatRoom
              roomId={selectedUser.id}
              user={{id: user.employeeId, name: user.name }}
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

          <OrganizationModal
            open={inviteModalOpen}
            onClose={handleInviteModalClose}
            list={inviteList}
            setList={handleInviteApply} // '적용' 버튼 클릭 시 API 호출 함수(handleInviteApply) 실행
          />
        </>
      )}
    </Box>
  );
}

ChatDrawer.propTypes = {
  handleDrawerOpen: PropTypes.func,
  openChatDrawer: PropTypes.oneOfType([PropTypes.bool, PropTypes.any]),
  onStartNewChat: PropTypes.func,
  selectedUser: PropTypes.object,
  onCloseChat: PropTypes.func
};