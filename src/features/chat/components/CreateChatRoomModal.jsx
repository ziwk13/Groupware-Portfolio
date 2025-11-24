import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// material-ui
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import { IconPlus } from '@tabler/icons-react';

// project imports
import { useChat } from 'contexts/ChatContext';
import { createRoom } from '../api/Chat';

const mapOrgUserToChatUser = (orgUser) => {
  // TODO: 'empId', 'empName' 등 실제 키 값으로 변경 필요
  return {
    id: orgUser.employeeId,
    name: orgUser.name,
    avatar: orgUser.profileImg || null, // 아바타 키가 없다면
    position: orgUser.position
  };
};
export default function CreateChatRoomModal({ open, onClose, onSuccess, preSelectedUsers = [], onAddUsersClick }) {
  // 모달 내부 상태
  const [roomName, setRoomName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [roomNameError, setRoomNameError] = useState('');
  const [orgList, setOrgList] = useState([
    { name: '초대자', empList: [] } // 채팅 모달은 '초대자' 목록 하나만 필요
  ]);
  const { openChatWithUser } = useChat();

  useEffect(() => {
    if (open) {
      if (preSelectedUsers && preSelectedUsers.length > 0) {
        // preSelectedUsers(조직도 데이터)를 orgList 및 selectedUsers(채팅 모달 상태)로 변환
        const newOrgList = [
          { name: '초대자', empList: preSelectedUsers }
        ];
        setOrgList(newOrgList);
      } else {
        setRoomName('');
        setSelectedUsers([]);
        setRoomNameError('');
        setOrgList([{ name: '초대자', empList: [] }]);
      }
    }
  }, [open, preSelectedUsers]);

  useEffect(() => {
    const inviteeCategory = orgList.find((item) => item.name === '초대자');
    if (inviteeCategory) {
      const newSelectedUsers = inviteeCategory.empList.map(mapOrgUserToChatUser);
      setSelectedUsers(newSelectedUsers);
    }
  }, [orgList]);

  const handleRoomNameChange = (event) => {
    setRoomName(event.target.value);
    // --- 사용자가 입력 시작 시 에러 메시지 초기화 ---
    if (roomNameError) {
      setRoomNameError('');
    }
  };

  const handleUserDeselect = (userId) => {
    // selectedUsers 대신 orgList(원본 데이터)를 수정합니다.
    setOrgList((prevList) => {
      const newList = [...prevList];
      const inviteeCategoryIndex = newList.findIndex((item) => item.name === '초대자');

      if (inviteeCategoryIndex !== -1) {
        const oldEmpList = newList[inviteeCategoryIndex].empList;
        const newEmpList = oldEmpList.filter((user) => user.employeeId !== userId);

        newList[inviteeCategoryIndex] = {
          ...newList[inviteeCategoryIndex],
          empList: newEmpList
        };
      }
      return newList;
    });
  };

  const handleClose = () => {
    onClose();
    //  모달 닫을 때 모든 상태 초기화 ---
    setRoomName('');
    setSelectedUsers([]);
    setRoomNameError('');
    setOrgList([{ name: '초대자', empList: [] }]);
  };
  
  const handleCreate = async () => {
    const userIds = selectedUsers.map((user) => user.id);

    if (userIds.length === 0) {
      return;
    }

    let finalRoomName = roomName.trim();

    if (userIds.length > 1 && finalRoomName === '') {
      setRoomNameError('그룹 채팅방 이름을 입력해주세요.');
      return;
    }

    if(userIds.length === 1) {
      const otherUser = selectedUsers[0];
      finalRoomName = `${otherUser.name} ${otherUser.position}`;
    }

    try {
      const roomData = {
        displayName: userIds.length > 1 ? finalRoomName : null,
        inviteeEmployeeIds: userIds
      };

      const newRoom = await createRoom(roomData);

      let avatar = null;
      let position = null;
      const isTeam = selectedUsers.length > 1;

      if(!isTeam) {
        const otherUser = selectedUsers[0];
        avatar = otherUser.avatar || null;
        position = otherUser.position || null;
      }

      const mappedNewRoom = {
        id: newRoom.chatRoomId,
        name: finalRoomName,
        avatar: avatar,
        position: position,
        isTeam: isTeam,
        lastMessage: '',
        unReadChatCount: 0,
      };

      // 생성된 채팅방으로 바로 이동
      openChatWithUser(mappedNewRoom);

      if (onSuccess) {
        onSuccess();
      }
      handleClose(); // 모달 닫기
    } catch (error) {
      console.error('채팅방 생성 실패:', error);
    }
  };

  // 렌더링
  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>새 채팅방 생성</DialogTitle>

        <DialogContent dividers>
          {/* ---  채팅방 이름 입력 필드 (그룹 채팅 시에만) --- */}
          {selectedUsers.length > 1 && (
            <TextField
              fullWidth
              variant="outlined"
              label="채팅방 이름"
              value={roomName}
              onChange={handleRoomNameChange}
              sx={{ mb: 2 }}
              autoFocus // 그룹일 땐 이름에 자동 포커스
              error={!!roomNameError}
              helperText={roomNameError}
            />
          )}
          <Button
            variant="outlined"
            fullWidth
            startIcon={<IconPlus />}
            sx={{ mb: 2 }}
            onClick={onAddUsersClick}
          >
            초대 사원 선택
          </Button>

          {/* 선택된 사용자 칩 표시 */}
          {selectedUsers.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1, p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              {selectedUsers.map((user) => (
                <Chip
                  key={user.id}
                  label={user.name + ' ' + user.position}
                  onDelete={() => handleUserDeselect(user.id)}
                  size="small"
                />
              ))}
            </Box>
          )}
          {selectedUsers.length === 0 && (!preSelectedUsers || preSelectedUsers.length === 0) && (
            <Typography variant="body2" color="textSecondary" align="center">
              '초대 사원 선택' 버튼을 눌러
              <br />
              채팅방에 참여할 사원을 추가하세요.
            </Typography>
          )}

        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            취소
          </Button>
          <Button onClick={handleCreate} variant="contained" color="primary" disabled={selectedUsers.length === 0}>
            생성
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

CreateChatRoomModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
  preSelectedUsers: PropTypes.array,
  onAddUsersClick: PropTypes.func
};