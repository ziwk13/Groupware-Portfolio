import PropTypes from 'prop-types';
import React, { useState } from 'react'; // React import 추가

// material-ui
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import { getImageUrl, ImagePath } from 'api/getImageUrl';

// assets
import MoreHorizTwoToneIcon from '@mui/icons-material/MoreHorizTwoTone';
import { IconArrowLeft } from '@tabler/icons-react';

// ==============================|| CHAT - HEADER ||============================== //

export default function ChatHeader({
  user,
  onClose,
  isUserDetailsOpen,
  onLeaveRoom,
  onInviteClick
}) {
  const theme = useTheme();

  // 1. ChatPage에 있던 메뉴 관련 state와 핸들러를 이곳으로 가져옵니다.
  const [anchorEl, setAnchorEl] = useState(null);
  const handleClickSort = (event) => {
    setAnchorEl(event?.currentTarget);
  };

  // 메뉴 닫기
  const handleCloseSort = () => {
    setAnchorEl(null);
  };

  // 초대하기 메뉴 클릭 핸들러
  const handleInviteMenuClick = () => {
    handleCloseSort();
    onInviteClick();
  }

  // 채팅방 나가기 클릭 핸들러
  const handleLeaveRoomClick = () => {
    onLeaveRoom();
  };

  return (
    <Grid size={12}>
      <Grid container spacing={0.1} sx={{ alignItems: 'center', flexWrap: 'nowrap' }}>
        <Grid sx={{flexShrink:0}}>
          <IconButton onClick={onClose} size="small" aria-label="chat menu collapse">
            <IconArrowLeft />
          </IconButton>
        </Grid>
        <Grid sx={{flex:1}}>
          <Grid container spacing={1} sx={{ alignItems: 'center', flexWrap: 'nowrap' }}>
            <Grid>
              <Avatar alt={user.name} src={user.avatar && getImageUrl(`${user.avatar}`, ImagePath.USERS)} />
            </Grid>
            <Grid size={{ sm: 'grow' }} sx={{ minWidth: 0 }}>
              <Grid container spacing={0} sx={{ alignItems: 'center' }}>
                <Grid size={12}>
                  <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="h4"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >{user.name}
                    </Typography>
                    {user.memberCount && (
                      <Typography variant="h5" color="textSecondary" sx={{ ml: 0.5 }}>
                        {user.memberCount}
                      </Typography>
                    )}
                  </Stack>
                </Grid>
                <Grid size={12}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {user.isTeam ? '팀 채팅방' : user.position}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {!isUserDetailsOpen && (
          <Grid sx={{flexShrink:0}}>
            <IconButton onClick={handleClickSort} size="large" aria-label="chat user details change">
              <MoreHorizTwoToneIcon />
            </IconButton>
            <Menu
              id="simple-menu"
              anchorEl={anchorEl} // 내부 state 사용
              keepMounted
              open={Boolean(anchorEl)} // 내부 state 사용
              onClose={handleCloseSort} // 내부 핸들러 사용
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right'
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right'
              }}
            >
              <MenuItem onClick={handleInviteMenuClick}>초대하기</MenuItem>
              <MenuItem onClick={handleLeaveRoomClick}>채팅방 나가기</MenuItem>
            </Menu>
          </Grid>
        )}
      </Grid>
      <Divider sx={{ mt: 2 }} />
    </Grid>
  );
}

ChatHeader.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    avatar: PropTypes.string,
    online_status: PropTypes.string,
    position: PropTypes.string,
    isTeam: PropTypes.bool.isRequired, // isTeam을 필수로 받도록 설정
    memberCount: PropTypes.number
  }),
  onClose: PropTypes.func,
  onLeaveRoom: PropTypes.func,
  onInviteClick: PropTypes.func,
  isUserDetailsOpen: PropTypes.bool,
};