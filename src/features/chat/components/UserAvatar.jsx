import PropTypes from 'prop-types';
// material-ui
import Avatar from '@mui/material/Avatar';

// project imports
import { getImageUrl, ImagePath } from 'api/getImageUrl';

export default function UserAvatar({ user }) {
  return (
      <Avatar alt={user.name} src={user.avatar && getImageUrl(`${user.avatar}`, ImagePath.USERS)} />
  );
}

UserAvatar.propTypes = { user: PropTypes.any };
