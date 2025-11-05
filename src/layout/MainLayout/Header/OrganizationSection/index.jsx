import { useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';

// project imports
import OrganizationModal from 'features/organization/components/OrganizationModal'; // 새로 추가할 조직도 모달 컴포넌트
// assets
import { IconSitemap } from '@tabler/icons-react';

// ==============================|| HEADER - ORGANIZATION CHART ||============================== //

export default function OrganizationSection() {
  const theme = useTheme();
  const [open, setOpen] = useState(false); // 모달 상태 관리를 위한 state

  // 모달을 여는 핸들러
  const handleOpen = () => {
    setOpen(true);
  };

  // 모달을 닫는 핸들러
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Box sx={{ ml: 2 }}>
        {/* 기존 아이콘 아바타. 클릭 시 handleOpen 호출 */}
        <Avatar
          variant="rounded"
          sx={{
            ...theme.typography.commonAvatar,
            ...theme.typography.mediumAvatar,
            transition: 'all .2s ease-in-out',
            // ✅ 기본 아이콘 색상 (어두운 파란색)
    color: theme.vars.palette.primary.dark, 
    // ✅ 기본 배경 색상 (밝은 파란색)
    background: theme.vars.palette.primary.light, 
    
    // ✅ 호버(hover) 시 색상
    '&:hover, &[aria-controls="menu-list-grow"]': {
      color: theme.vars.palette.primary.light,
      background: theme.vars.palette.primary.main
    },

    // ✅ 다크 모드일 때 색상
    ...theme.applyStyles('dark', {
      color: theme.vars.palette.primary.dark,
      background: theme.vars.palette.dark.main,
      '&:hover, &[aria-controls="menu-list-grow"]': {
        color: theme.vars.palette.primary.light,
        background: theme.vars.palette.primary.main
      }
    }),
            cursor: 'pointer' // 클릭 가능한 아이콘임을 표시
          }}
          aria-haspopup="true"
          onClick={handleOpen} // 클릭 시 모달 열기
        >
          <IconSitemap stroke={1.5} size="20px" />
        </Avatar>
      </Box>

      {/* 조직도 모달 컴포넌트 렌더링 */}
      {/* <OrganizationModal open={open} onClose={handleClose}/> */}
      <OrganizationModal open={open} onClose={handleClose} />

    </>
  );
}