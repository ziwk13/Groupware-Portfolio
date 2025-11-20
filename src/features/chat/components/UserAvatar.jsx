import PropTypes from 'prop-types';

// material-ui
import Avatar from '@mui/material/Avatar';
import GroupIcon from '@mui/icons-material/Group';

// project imports
import { getImageUrl, ImagePath } from 'api/getImageUrl';

export default function UserAvatar({ user }) {
  
  // user 데이터가 없을 경우 방어 코드
  if (!user) {
    return <Avatar />;
  }

  // 팀 채팅방(그룹)인 경우: GroupIcon 표시
  if (user.isTeam) {
    return (
      <Avatar alt={user.name}>
        <GroupIcon />
      </Avatar>
    );
  }

  // 개인 사용자: 프로필 이미지가 있으면 이미지 표시, 없으면 기본 Avatar(이름 이니셜 등) 표시
  return (
    <Avatar 
      alt={user.name} 
      src={user.avatar ? getImageUrl(user.avatar, ImagePath.USERS) : undefined} 
    />
  );
}

UserAvatar.propTypes = { 
  user: PropTypes.shape({
    name: PropTypes.string,
    avatar: PropTypes.string,
    isTeam: PropTypes.bool
  })
};