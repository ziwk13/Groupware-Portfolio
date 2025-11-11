import PropTypes from 'prop-types';
import React from 'react'; // React import 추가

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
import AvatarStatus from './AvatarStatus';
import { getImageUrl, ImagePath } from 'utils/getImageUrl';

// assets
import MoreHorizTwoToneIcon from '@mui/icons-material/MoreHorizTwoTone';
import ErrorTwoToneIcon from '@mui/icons-material/ErrorTwoTone';
import { IconArrowLeft } from '@tabler/icons-react';

// ==============================|| CHAT - HEADER ||============================== //

export default function ChatHeader({ 
  user, 
  onClose, 
  onUserDetailsToggle, 
  isUserDetailsOpen,
  onLeaveRoom
}) {
  const theme = useTheme();

  // 1. ChatPage에 있던 메뉴 관련 state와 핸들러를 이곳으로 가져옵니다.
  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleClickSort = (event) => {
    setAnchorEl(event?.currentTarget);
  };

  const handleCloseSort = () => {
    setAnchorEl(null);
  };

  // 채팅방 나가기 클릭 핸들러
  const handleLeaveRoomClick = () => {
    onLeaveRoom();
  };
  
  return (
    <Grid size={12}>
      <Grid container spacing={0.1} sx={{ alignItems: 'center' }}>
        <Grid>
          <IconButton onClick={onClose} size="small" aria-label="chat menu collapse">
            <IconArrowLeft />
          </IconButton>
        </Grid>
        <Grid>
          <Grid container spacing={1} sx={{ alignItems: 'center', flexWrap: 'nowrap' }}>
            <Grid>
              <Avatar alt={user.name} src={user.avatar && getImageUrl(`${user.avatar}`, ImagePath.USERS)} />
            </Grid>
            <Grid size={{ sm: 'grow' }}>
              <Grid container spacing={0} sx={{ alignItems: 'center' }}>
                <Grid size={12}>
                  <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="h4">{user.name}</Typography>
                    {user.online_status && <AvatarStatus status={user.online_status} />}
                  </Stack>
                </Grid>
                <Grid size={12}>
                  <Typography variant="subtitle2">{user.name}</Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid size={{ sm: 'grow' }} />
       
        {!isUserDetailsOpen && (
          <Grid>
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
              <MenuItem onClick={handleLeaveRoomClick}>채팅방 나가기</MenuItem>
              <MenuItem onClick={handleCloseSort}>초대하기</MenuItem>
            </Menu>
          </Grid>
        )}
      </Grid>
      <Divider sx={{ mt: 2 }} />
    </Grid>
  );
}

ChatHeader.propTypes = {
  user: PropTypes.object,
  onDrawerOpen: PropTypes.func,
  onUserDetailsToggle: PropTypes.func,
  isUserDetailsOpen: PropTypes.bool
};