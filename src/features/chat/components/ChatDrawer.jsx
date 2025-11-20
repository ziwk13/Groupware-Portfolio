import PropTypes from 'prop-types';
import { useState, useEffect, useCallback } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import { useColorScheme, useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

// icons
import { IconPlus } from '@tabler/icons-react';

// project imports
import { ThemeMode } from 'config';
import { useChat } from 'contexts/ChatContext';
import useAuth from 'hooks/useAuth';
import { gridSpacing } from 'store/constant';
import SimpleBar from 'ui-component/third-party/SimpleBar';
import ChatHeader from './ChatHeader';
import ChatRoom from './ChatRoom';
import { leaveRoom, getRooms, inviteToRoom, getRoomById, markRoomAsRead } from '../api/Chat';
import { useStomp } from 'contexts/StompProvider';
import OrganizationModal from '../../organization/components/OrganizationModal';
import UserAvatar from './UserAvatar';
import UserList from './UserList';
import useConfig from 'hooks/useConfig';


const mapDtoToUser = (room) => ({
  id: room.chatRoomId,
  name: room.name,
  avatar: room.profile,
  lastMessage: room.lastMessage,
  unReadChatCount: room.unreadCount,
  lastMessageTimestamp: room.lastMessageCreatedAt,
  memberCount: room.memberCount,
});

// 채팅방 목록을 최신 메시지 시간순으로 정렬하는 헬퍼 함수
const sortRoomsByTimestamp = (rooms) => {
  return [...rooms].sort((a, b) => {
    const timeA = a.lastMessageTimestamp ? new Date(a.lastMessageTimestamp).getTime() : 0;
    const timeB = b.lastMessageTimestamp ? new Date(b.lastMessageTimestamp).getTime() : 0;
    return timeB - timeA;
  });
};

export default function ChatDrawer({
  onStartNewChat,
  selectedUser,
  onCloseChat,
  roomId
}) {
  const theme = useTheme();
  const { colorScheme } = useColorScheme();

  const { user } = useAuth();
  const {
    state: { borderRadius }
  } = useConfig();

  const { openChatWithUser } = useChat();

  const [currentRoom, setCurrentRoom] = useState(selectedUser);
  const [isLoadingRoom, setIsLoadingRoom] = useState(false);
  const [chatRooms, setChatRooms] = useState([]);

  // ==============================|| 채팅방 나가기 로직 ||============================== //
  
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  // 실제로 나갈 채팅방 ID (헤더에서 클릭했거나, 목록에서 클릭한 방 ID)
  const [leaveTargetRoomId, setLeaveTargetRoomId] = useState(null);

  // 1. 헤더에서 '나가기' 클릭 (현재 보고 있는 방)
  const handleLeaveFromHeader = () => {
    if (currentRoom) {
      setLeaveTargetRoomId(currentRoom.id);
      setLeaveModalOpen(true);
    }
  };

  // 2. 목록에서 '나가기' 클릭 (특정 방)
  const handleLeaveFromList = (roomId) => {
    setLeaveTargetRoomId(roomId);
    setLeaveModalOpen(true);
  };

  // 모달 닫기
  const handleLeaveModalClose = () => {
    setLeaveModalOpen(false);
    setLeaveTargetRoomId(null); // 타겟 초기화
  };

  // 최종 나가기 확인 (API 호출)
  const handleConfirmLeave = async () => {
    if (!leaveTargetRoomId) return;

    try {
      await leaveRoom(leaveTargetRoomId);
      
      // 만약 현재 보고 있는 방을 나갔다면 채팅 화면 닫기
      if (currentRoom && String(currentRoom.id) === String(leaveTargetRoomId)) {
        onCloseChat();
      }
      
      // 목록 갱신
      fetchChatRooms(); 
      handleLeaveModalClose();

    } catch (error) {
      console.error('채팅방 나가기 실패: ', error);
      setErrorMessage("채팅방을 나가는 중 오류가 발생했습니다");
      setIsErrorModalOpen(true);
      handleLeaveModalClose();
    }
  };

  // ==============================|| 기타 모달 및 기능 ||============================== //

  // 초대하기 모달
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const initialInviteList = [{ name: '초대 대상자', empList: [] }];
  const [inviteList, setInviteList] = useState(initialInviteList);

  // 에러 모달
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const effectiveRoomId = currentRoom ? currentRoom.id : null;

  // 초대하기 메뉴 클릭 핸들러
  const handleInviteClick = () => {
    setInviteList(initialInviteList);
    setInviteModalOpen(true);
  };

  const handleInviteModalClose = () => {
    setInviteModalOpen(false);
  };

  // 초대하기 적용 핸들러 (본인 포함 체크 추가)
  const handleInviteApply = async (appliedList) => {
    if (!effectiveRoomId) return;

    const inviteeBox = appliedList.find(item => item.name === '초대 대상자');
    // 선택된 인원이 없는 경우
    if (!inviteeBox || inviteeBox.empList.length === 0) {
      setErrorMessage("초대할 대상을 선택해주세요.");
      setIsErrorModalOpen(true);
      handleInviteModalClose();
      return;
    }

    const selectedEmployees = inviteeBox.empList;

    // 1. 본인 포함 여부 검증
    // 현재 로그인한 사용자(user)가 선택된 목록에 있는지 확인
    const isSelfIncluded = selectedEmployees.some(
      (emp) => emp.employeeId === user.employeeId
    );

    if (isSelfIncluded) {
      setErrorMessage("사용자 본인은 초대할 수 없습니다.");
      setIsErrorModalOpen(true);
      handleInviteModalClose(); // 조직도 모달 닫기 (에러 모달만 남김)
      return; // API 호출 중단
    }

    // 2. 검증 통과 시 API 호출
    const inviteeEmployeeIds = selectedEmployees.map(emp => emp.employeeId);

    try {
      await inviteToRoom(effectiveRoomId, inviteeEmployeeIds);
      handleInviteModalClose();
    } catch (error) {
      setErrorMessage("초대에 실패 했습니다. 다시 시도해주세요.");
      setIsErrorModalOpen(true);
      handleInviteModalClose();
    }
  };

  // ==============================|| 데이터 로드 및 STOMP ||============================== //

  const { client, isConnected } = useStomp();

  const fetchChatRooms = useCallback(async () => {
    try {
      const roomsDto = await getRooms();
      const mappedData = roomsDto.map(mapDtoToUser);
      const sortedDate = sortRoomsByTimestamp(mappedData);
      setChatRooms(sortedDate);
    } catch (error) {
      console.error("채팅방 목록 초기 로드 실패", error);
    }
  }, []);

  // 알림/선택에 따른 방 정보 로드 로직
  useEffect(() => {
    const markRoomAsReadInState = (idToMark) => {
      if (!idToMark) return;
      const roomToUpdate = chatRooms.find(
        (room) => room.id === idToMark && room.unReadChatCount > 0
      );
      if (roomToUpdate) {
        setChatRooms((currentRooms) =>
          currentRooms.map((room) =>
            room.id === idToMark ? { ...room, unReadChatCount: 0 } : room
          )
        );
      }
    };

    if (selectedUser) {
      const roomFromList = chatRooms.find(room => room.id === selectedUser.id);
      if (roomFromList) {
        setCurrentRoom(roomFromList);
        setIsLoadingRoom(false);
        markRoomAsReadInState(selectedUser.id);
        if(roomFromList.unReadChatCount > 0) {
          markRoomAsRead(selectedUser.id);
        }
      } else {
        setIsLoadingRoom(true);
        markRoomAsReadInState(selectedUser.id);
        markRoomAsRead(selectedUser.id);
        getRoomById(selectedUser.id)
          .then(roomDto => {
            const mappedRoom = mapDtoToUser(roomDto);
            setCurrentRoom(mappedRoom);
          })
          .catch(error => {
            console.error("새 채팅방 정보 로드 실패", error);
            onCloseChat();
          })
          .finally(() => setIsLoadingRoom(false))
      }

    } else if (roomId) {
      setIsLoadingRoom(true);
      markRoomAsReadInState(roomId);
      markRoomAsRead(roomId);
      getRoomById(roomId)
        .then(roomDto => {
          const mappedRoom = mapDtoToUser(roomDto);
          setCurrentRoom(mappedRoom);
        })
        .catch(err => {
          console.error("Failed to fetch room details by ID", err);
          onCloseChat();
        })
        .finally(() => setIsLoadingRoom(false));
    } else {
      setCurrentRoom(null);
      setIsLoadingRoom(false);
    }
  }, [selectedUser, roomId, onCloseChat, chatRooms]);

  // 목록 초기 로드
  useEffect(() => {
    if (!selectedUser) {
      fetchChatRooms();
    }
  }, [selectedUser, fetchChatRooms]);

  // STOMP 리스트 업데이트 구독
  useEffect(() => {
    if (client && isConnected) {
      const listUpdateQueue = '/user/queue/chat-list-update';
      const subscription = client.subscribe(listUpdateQueue, () => {
        fetchChatRooms();
      });
      return () => {
        if (subscription) subscription.unsubscribe();
      };
    }
  }, [client, isConnected, fetchChatRooms]);

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
      {!(currentRoom || isLoadingRoom) ? (
        <>
          {/* 채팅방 목록 뷰 */}
          <Box sx={{ p: 3, pb: 2 }}>
            <Grid container spacing={gridSpacing}>
              <Grid size={12}>
                <Grid container spacing={2} sx={{ alignItems: 'center', flexWrap: 'nowrap' }}>
                  <Grid>
                    <UserAvatar user={{
                      avatar: user?.avatar || null,
                      name: user?.name || 'User',
                      position: user?.position
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
            </Grid>
          </Box>
          <SimpleBar sx={{ overflowX: 'hidden', flex: 1 }}>
            <Box sx={{ p: 3, pt: 0 }}>
              <UserList
                users={chatRooms}
                setUser={openChatWithUser}
                onLeave={handleLeaveFromList} // 목록에서 나가기 핸들러 전달
              />
            </Box>
          </SimpleBar>
        </>
      ) : (
        <>
          {/* 채팅방 내부 뷰 */}
          <Box sx={{ p: 3, pb: 2 }}>
            {isLoadingRoom ? (
              <Typography>채팅방 정보 로딩 중...</Typography>
            ) : (
              <ChatHeader
                user={currentRoom}
                onClose={onCloseChat}
                onLeaveRoom={handleLeaveFromHeader} // 헤더에서 나가기 핸들러 전달
                onInviteClick={handleInviteClick}
              />
            )}
          </Box>
          <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
            {!isLoadingRoom && (
              <ChatRoom
                roomId={effectiveRoomId}
                user={{ id: user.employeeId, name: user.name }}
                theme={theme}
                roomInfo={currentRoom} // 방 정보를 ChatRoom으로 전달
              />
            )}
          </Box>
        </>
      )}

      {/* 공통: 채팅방 나가기 확인 모달 */}
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

      {/* 공통: 초대 모달 */}
      <OrganizationModal
        open={inviteModalOpen}
        onClose={handleInviteModalClose}
        list={inviteList}
        setList={handleInviteApply}
      />

      {/* 공통: 에러 모달 */}
      <Dialog
        open={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        aria-labelledby="error-alert-dialog-title"
        aria-describedby="error-alert-dialog-description"
      >
        <DialogTitle id="error-alert-dialog-title">
          {"알림"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="error-alert-dialog-description">
            {errorMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsErrorModalOpen(false)} autoFocus>
            확인
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

ChatDrawer.propTypes = {
  onStartNewChat: PropTypes.func,
  selectedUser: PropTypes.object,
  onCloseChat: PropTypes.func,
  roomId: PropTypes.string
};