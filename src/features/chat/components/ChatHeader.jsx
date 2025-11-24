import PropTypes from 'prop-types';
import React, { useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import UserAvatar from './UserAvatar';
import { getImageUrl } from 'api/getImageUrl';
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

  const [anchorEl, setAnchorEl] = useState(null);
  const handleClickSort = (event) => {
    setAnchorEl(event?.currentTarget);
  };

  const handleCloseSort = () => {
    setAnchorEl(null);
  };

  const handleInviteMenuClick = () => {
    handleCloseSort();
    onInviteClick();
  }

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
              <UserAvatar 
                user={{
                  ...user,
                  avatar: user.avatar,
                  isTeam: user.isTeam
                }} 
              />
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
                    >{user.displayName || user.name}
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
                    {user.isTeam ? '팀 채팅방' : user.positionName}
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
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleCloseSort}
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
    displayName: PropTypes.string,
    avatar: PropTypes.string,
    online_status: PropTypes.string,
    positionName: PropTypes.string,
    isTeam: PropTypes.bool,
    memberCount: PropTypes.number
  }),
  onClose: PropTypes.func,
  onLeaveRoom: PropTypes.func,
  onInviteClick: PropTypes.func,
  isUserDetailsOpen: PropTypes.bool,
};