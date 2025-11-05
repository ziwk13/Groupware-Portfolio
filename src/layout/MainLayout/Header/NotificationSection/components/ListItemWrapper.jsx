import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/material';
import { withAlpha } from 'utils/colorUtils';

function ListItemWrapper({ children, onClick }) {
  const theme = useTheme();
  return (
    <Box
      onClick={onClick}
      sx={{
        p: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
        cursor: 'pointer',
        '&:hover': {
          bgcolor: withAlpha(theme.palette.grey[200], 0.3)
        },
        position: 'relative'  // 삭제 버튼을 위한 relative 
      }}
    >
      {children}
    </Box>
  )
}

ListItemWrapper.PropTypes = {
  children: PropTypes.node,
  onClick: PropTypes.func
};

export default ListItemWrapper;