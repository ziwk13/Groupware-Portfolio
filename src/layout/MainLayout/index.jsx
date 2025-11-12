import { useEffect, useMemo } from 'react';
import { Outlet } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import AppBar from '@mui/material/AppBar';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import Drawer from '@mui/material/Drawer';

// project imports
import Footer from './Footer';
import Header from './Header';
import Sidebar from './Sidebar';
import HorizontalBar from './HorizontalBar';
import MainContentStyled from './MainContentStyled';
import Loader from 'ui-component/Loader';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';

import { MenuOrientation } from 'config';
import useConfig from 'hooks/useConfig';
import { handlerDrawerOpen, useGetMenuMaster } from 'api/menu';
import { useChat } from 'contexts/ChatContext';
import ChatPage from '../../features/chat/pages/ChatPage';

import { appDrawerWidth as drawerWidth } from 'store/constant'; 
import { Badge } from '@mui/material';

// ==============================|| MAIN LAYOUT ||============================== //

export default function MainLayout() {
  const theme = useTheme();
  const downMD = useMediaQuery(theme.breakpoints.down('md'));

  const {
    state: { borderRadius, container, miniDrawer, menuOrientation }
  } = useConfig();
  const { menuMaster, menuMasterLoading } = useGetMenuMaster();
  const drawerOpen = menuMaster?.isDashboardDrawerOpened;

  const { isChatOpen, closeChat, toggleChat, selectedUser, totalUnreadCount } = useChat();

  useEffect(() => {
    handlerDrawerOpen(!miniDrawer);
  }, [miniDrawer]);

  useEffect(() => {
    downMD && handlerDrawerOpen(false);
  }, [downMD]);

  const isHorizontal = menuOrientation === MenuOrientation.HORIZONTAL && !downMD;

  // horizontal menu-list bar : drawer
  const menu = useMemo(() => (isHorizontal ? <HorizontalBar /> : <Sidebar />), [isHorizontal]);

  if (menuMasterLoading) return <Loader />;

  return (
    <Box sx={{ display: 'flex' }}>
      {/* header */}
      <AppBar enableColorOnDark position="fixed" color="inherit" elevation={0} sx={{ bgcolor: 'background.default' }}>
        <Toolbar sx={{ p: isHorizontal ? 1.25 : 2 }}>
          
          <Header />
        </Toolbar>
      </AppBar>

      {/* menu / drawer */}
      {menu}

      {/* main content */}
      <MainContentStyled {...{ borderRadius, menuOrientation, open: drawerOpen }}>
        <Container
          maxWidth={container ? 'lg' : false}
          sx={{ ...(!container && { px: { xs: 0 } }), minHeight: 'calc(100vh - 128px)', display: 'flex', flexDirection: 'column' }}
        >
          {/* breadcrumb */}
          <Breadcrumbs />
          <Outlet />
          <Footer />
        </Container>
      </MainContentStyled>
      <Badge
        badgeContent={totalUnreadCount}
        color="error"
        max={99} // 99개 초과 시 '99+'로 표시
        sx={{
          position: 'fixed', // 화면에 고정
          bottom: theme.spacing(4), // 하단에서 32px (4 * 8px)
          right: theme.spacing(4), // 우측에서 32px (4 * 8px)
          zIndex: theme.zIndex.speedDial // 다른 요소들 위에 보이도록 z-index 설정
        }}
        >
      <Fab
        color="primary" // 색상 (primary, secondary 등)
        aria-label="open chat"
        onClick={toggleChat} // 클릭 시 채팅 토글
      >
        <ChatBubbleOutlineIcon />
      </Fab>
      </Badge>
      <Drawer
        anchor="right"
        open={isChatOpen}
        onClose={closeChat}
        ModalProps={{
          disableEnforceFocus: true, // Drawer가 포커스를 강제로 잡는 것을 막아, 뒷 페이지 클릭을 허용합니다.
          sx: {
            // 2. Backdrop을 투명하게 만들어 시각적으로 숨김
            '& .MuiBackdrop-root': {
              backgroundColor: 'transparent'
            }
          }
        }}
        
        sx={{
          '& .MuiDrawer-paper': {
            width: '100%',
            maxWidth: selectedUser ? 900 : drawerWidth, 
            height: '100vh',
            overflow: 'hidden', 
            border: 'none',
            // 너비 변경 시 애니메이션 추가 ---
            transition: theme.transitions.create('max-width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.shorter
            }),
            boxShadow: theme.customShadows.z1
          }
        }}
      >
        {/* Drawer가 열릴 때만 ChatPage 컴포넌트의 내용을 렌더링하도록 합니다.
          (성능 최적화 및 useChat의 selectedUser가 있을 때만 렌더링)
        */}
        {isChatOpen && <ChatPage />}
        </Drawer>
    </Box>
  );
}