import PropTypes from 'prop-types';

// material-ui
import { useTheme } from '@mui/material/styles';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';

// project imports
import UserAvatar from './UserAvatar';

// assets
import CloseIcon from '@mui/icons-material/Close';

export default function UserList({ users, setUser, onLeave }) {
  const theme = useTheme();

  // 나가기 버튼 클릭 핸들러 (바로 onLeave 호출)
  const handleCloseClick = (event, roomId) => {
    event.stopPropagation(); // 리스트 클릭 방지
    if (onLeave) {
      onLeave(roomId); // ChatDrawer로 ID 전달
    }
  };

  return (
    <>
      <List component="nav">
        {users.map((user) => (
          <ListItem
            key={user.id}
            disablePadding
            divider
            secondaryAction={
              <Stack direction="row" alignItems="center" spacing={1}>
                {user.unReadChatCount !== 0 && (
                  <Chip
                    label={user.unReadChatCount}
                    color="secondary"
                    size="small"
                    sx={{
                      height: 20,
                      minWidth: 20,
                      '& .MuiChip-label': { px: 0.5 }
                    }}
                  />
                )}
                <IconButton
                  edge="end"
                  aria-label="leave-room"
                  onClick={(e) => handleCloseClick(e, user.id)}
                  sx={{ color: theme.palette.text.secondary }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Stack>
            }
          >
            <ListItemButton
              onClick={() => setUser(user)}
              sx={{ pr: user.unReadChatCount > 0 ? 16 : 9 }}
            >
              <ListItemAvatar>
                <UserAvatar user={user} />
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Grid container spacing={1} component="span" sx={{ alignItems: 'center' }}>
                    <Grid component="span" size="grow">
                      <Stack direction="row" alignItems="center" spacing={0.5} component="span">
                        <Typography
                          variant="h5"
                          component="span"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            display: 'block',
                            color: 'inherit',
                            minWidth: 0
                          }}
                        >
                          {user.name}
                        </Typography>
                        {/* 인원수 표시 */}
                        {user.memberCount > 0 && (
                          <Typography
                            variant="body2"
                            component="span"
                            color="textSecondary"
                            sx={{ whiteSpace: 'nowrap' }}
                          >
                            {user.memberCount}
                          </Typography>
                        )}
                      </Stack>
                    </Grid>
                  </Grid>
                }
                secondary={
                  <Grid container spacing={1} component="span" sx={{ alignItems: 'center' }}>
                    <Grid component="span" size="grow" sx={{ minWidth: 0 }}>
                      <Typography
                        variant="caption"
                        component="span"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          display: 'block'
                        }}
                      >
                        {user.lastMessage || '대화 내용 없음'}
                      </Typography>
                    </Grid>
                  </Grid>
                }
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </>
  );
}

UserList.propTypes = {
  users: PropTypes.array,
  setUser: PropTypes.func,
  onLeave: PropTypes.func
};