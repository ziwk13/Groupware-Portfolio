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
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import MoreHorizTwoToneIcon from '@mui/icons-material/MoreHorizTwoTone';
import ErrorTwoToneIcon from '@mui/icons-material/ErrorTwoTone';

// ==============================|| CHAT - HEADER ||============================== //

export default function ChatHeader({ user, onDrawerOpen, onUserDetailsToggle, isUserDetailsOpen }) {
  const theme = useTheme();

  // 1. ChatPage에 있던 메뉴 관련 state와 핸들러를 이곳으로 가져옵니다.
  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleClickSort = (event) => {
    setAnchorEl(event?.currentTarget);
  };

  const handleCloseSort = () => {
    setAnchorEl(null);
  };

  return (
    <Grid size={12}>
      <Grid container spacing={0.5} sx={{ alignItems: 'center' }}>
        <Grid>
          <IconButton onClick={onDrawerOpen} size="large" aria-label="chat menu collapse">
            <MenuRoundedIcon />
          </IconButton>
        </Grid>
        <Grid>
          <Grid container spacing={2} sx={{ alignItems: 'center', flexWrap: 'nowrap' }}>
            <Grid>
              <Avatar alt={user.name} src={user.avatar && getImageUrl(`${user.avatar}`, ImagePath.USERS)} />
            </Grid>
            <Grid size={{ sm: 'grow' }}>
              <Grid container spacing={0} sx={{ alignItems: 'center' }}>
                <Grid size={12}>
                  <Stack direction="row" sx={{ alignItems: 'center', gap: 0.25 }}>
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
        <Grid>
          <IconButton
            onClick={onUserDetailsToggle}
            size="large"
            aria-label="chat user information"
            {...(isUserDetailsOpen && { color: 'error' })}
          >
            <ErrorTwoToneIcon />
          </IconButton>
        </Grid>
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
              <MenuItem onClick={handleCloseSort}>Name</MenuItem>
              <MenuItem onClick={handleCloseSort}>Date</MenuItem>
              <MenuItem onClick={handleCloseSort}>Ratting</MenuItem>
              <MenuItem onClick={handleCloseSort}>Unread</MenuItem>
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