import PropTypes from 'prop-types';
import { useState, useEffect, useRef, useCallback } from 'react';

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
import { leaveRoom, getRooms, inviteToRoom, getRoomById, markRoomAsRead } from '../api/Chat';
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
  lastMessageTimestamp: room.lastMessageCreatedAt
});

// 채팅방 목록을 최신 메시지 시간순으로 정렬하는 헬퍼 함수
const sortRoomsByTimestamp = (rooms) => {
  return [...rooms].sort((a, b) => {
    // lastMessageTimestamp가 없는 방은 맨 뒤로 보내짐
    const timeA = a.lastMessageTimestamp ? new Date(a.lastMessageTimestamp).getTime() : 0;
    const timeB = b.lastMessageTimestamp ? new Date(b.lastMessageTimestamp).getTime() : 0;

    // 내림차순
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


  // 상태 추가(알림 클릭 대응)
  const [currentRoom, setCurrentRoom] = useState(selectedUser);
  // 채팅방 정보를 fetch 중인지 여부
  const [isLoadingRoom, setIsLoadingRoom] = useState(false);

  // 채팅방 나가기 모달 상태
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);

  // 초대하기 모달 상태
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  // 초대 모달에 전달할 초기 목록
  const initialInviteList = [{ name: '초대 대상자', empList: [] }];
  const [inviteList, setInviteList] = useState(initialInviteList);

  // 에러 메시지 출력 모달
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const effectiveRoomId = currentRoom ? currentRoom.id : null;

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
    if (!effectiveRoomId) return;

    try {
      await leaveRoom(effectiveRoomId);
      handleLeaveModalClose();
      onCloseChat();
    } catch (error) {
      console.error('채팅방 나가기 실패: ', error);
      setErrorMessage("채팅방을 나가는 중 오류가 발생했습니다");
      setIsErrorModalOpen(true);
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
    if (!effectiveRoomId) return;

    // OrganizationModal에서 '초대 대상자' 박스의 empList를 찾음
    const inviteeBox = appliedList.find(item => item.name === '초대 대상자');
    if (!inviteeBox || inviteeBox.empList.length === 0) {
      handleInviteModalClose(); // 모달 닫기
      return;
    }

    // API가 요구하는 형식 [1, 2, 3] 으로 변환
    const inviteeEmployeeIds = inviteeBox.empList.map(emp => emp.employeeId);

    try {
      // 백엔드 API 호출 (API 파일에 inviteToRoom이 정의되어 있어야 함)
      // API는 (roomId, body) 형태를 받는다고 가정
      await inviteToRoom(effectiveRoomId, inviteeEmployeeIds);

      handleInviteModalClose(); // 성공 시 모달 닫기
    } catch (error) {
      setErrorMessage("초대에 실패 했습니다. 다시 시도해주세요.");
      setIsErrorModalOpen(true);
      handleInviteModalClose(); // 실패 시에도 모달 닫기
    }
  };

  const [chatRooms, setChatRooms] = useState([]);
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

  // 알림 클릭 시 방 정보 로드
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
    // 목록에서 클릭
    if (selectedUser) {
      const roomFromList = chatRooms.find(room => room.id === selectedUser.id);
      if (roomFromList) {
        // 목록에 이미 있는 방
        setCurrentRoom(roomFromList);
        setIsLoadingRoom(false);
        markRoomAsReadInState(selectedUser.id);
        if(roomFromList.unReadChatCount > 0) {
          markRoomAsRead(selectedUser.id);
        }
      } else {
        // 목록에 없는 방(새로 생성된 채팅ㅂ아)
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
            onCloseChat();  // 실패 시 목록으로 복귀
          })
          .finally(() => {
            setIsLoadingRoom(false);
          })
      }

    }
    // 알림 클릭 흐름
    else if (roomId) {
      setIsLoadingRoom(true);
      markRoomAsReadInState(roomId);
      markRoomAsRead(roomId);

      getRoomById(roomId) // 백엔드 API 호출
        .then(roomDto => {
          const mappedRoom = mapDtoToUser(roomDto);
          setCurrentRoom(mappedRoom);
        })
        .catch(err => {
          console.error("Failed to fetch room details by ID", err);
          onCloseChat(); // 실패 시 목록으로 복귀
        })
        .finally(() => {
          setIsLoadingRoom(false);
        });
    }
    // 둘 다 null (채팅방 닫힘)
    else {
      setCurrentRoom(null);
      setIsLoadingRoom(false);
    }
  }, [selectedUser, roomId, onCloseChat, chatRooms]);

  // 채팅방 목록 로드
  useEffect(() => {
    if (!selectedUser) {
      fetchChatRooms();
    }
  }, [selectedUser, fetchChatRooms]);

  useEffect(() => {
    if (client && isConnected) {
      const listUpdateQueue = '/user/queue/chat-list-update';

      const subscription = client.subscribe(listUpdateQueue, (message) => {
        fetchChatRooms();
      });
      return () => {
        if (subscription) {
          subscription.unsubscribe();
        }
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
            {isLoadingRoom ? (
              <Typography>채팅방 정보 로딩 중...</Typography>
            ) : (
              <ChatHeader
                user={currentRoom}
                onClose={onCloseChat}
                onLeaveRoom={handleLeaveClick}
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
              />
            )}
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
        </>
      )}
    </Box>
  );
}

ChatDrawer.propTypes = {
  onStartNewChat: PropTypes.func,
  selectedUser: PropTypes.object,
  onCloseChat: PropTypes.func,
  roomId: PropTypes.string
};