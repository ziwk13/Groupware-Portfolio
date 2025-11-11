import { useEffect, useState, useTransition } from 'react';

// material-ui
import Box from '@mui/material/Box';
import { styled, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

// third party 추후 인스톨 후 구현 예정
// import EmojiPicker, { SkinTones } from 'emoji-picker-react';

// project imports
import { useChat } from 'contexts/ChatContext';
import Loader from 'ui-component/Loader';
import ChatDrawer from '../components/ChatDrawer';
import CreateChatRoomModal from '../components/CreateChatRoomModal';

import useAuth from 'hooks/useAuth';
import { appDrawerWidth as drawerWidth } from 'store/constant';

// assets

// drawer content element
const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(({ theme, open }) => ({
  flexGrow: 1,
  paddingLeft: open ? theme.spacing(3) : 0,
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.shorter
  }),
  marginLeft: `-${drawerWidth}px`,
  [theme.breakpoints.down('lg')]: {
    paddingLeft: 0,
    marginLeft: 0
  },
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.shorter
    }),
    marginLeft: 0
  })
}));

// ==============================|| APPLICATION CHAT ||============================== //

export default function ChatMainPage() {
  const chatCtx = useChat(); // 훅 1
  const [data, setData] = useState([]); // 훅 2
  const [isChatLoading, startTransition] = useTransition(); // 훅 3
  
  
  const { user: authUser } = useAuth(); // 훅 4
  const theme = useTheme(); // 훅 5
  const [emailDetails, setEmailDetails] = useState(false); // 훅 7
  const [openChatDrawer, setOpenChatDrawer] = useState(true); // 훅 8
  const [openCreateModal, setOpenCreateModal] = useState(false); // 훅 9
  
  const user = chatCtx?.selectedUser;
  const goBackToUserList = chatCtx?.goBackToUserList;
  
  // set chat details page open when user is selected from sidebar
  const handleUserChange = (event) => {
    setEmailDetails((prev) => !prev);
  };

  // toggle sidebar
  const handleDrawerOpen = () => {
    setOpenChatDrawer((prevState) => !prevState);
  };


  // 플러스 버튼 클릭 시 실행될 핸들러
  const handleStartNewChat = () => {
    setOpenCreateModal(true);
  };

  // 모달 닫기 핸들러
  const handleCloseCreateModal = () => {
    setOpenCreateModal(false);
  };

  useEffect(() => {
    if (user) {
      setData([]);
      startTransition(async () => {
        await new Promise((resolve) => setTimeout(resolve, 500)).then(() => {
        });
      });
    }
  }, [user]);

  const handleOnSend = (messageText) => {
    const d = new Date();
    const newMessage = {
      from: authUser.name,
      to: user.name,
      text: messageText,
      time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setData((prevState) => [...prevState, newMessage]);
  };

  // // handle emoji
  // const onEmojiClick = (emojiObject, event) => {
  //   setMessage(message + emojiObject.emoji);
  // };

  // const [anchorElEmoji, setAnchorElEmoji] = React.useState(); /** No single type can cater for all elements */
  // const handleOnEmojiButtonClick = (event) => {
  //   setAnchorElEmoji(anchorElEmoji ? null : event?.currentTarget);
  // };

  // const emojiOpen = Boolean(anchorElEmoji);
  // const emojiId = emojiOpen ? 'simple-popper' : undefined;
  // const handleCloseEmoji = () => {
  //   setAnchorElEmoji(null);
  // };

  return (
    <>
      <ChatDrawer
        openChatDrawer={openChatDrawer}
        handleDrawerOpen={handleDrawerOpen} // (Drawer를 닫는 기능이 없다면 이 prop들은 불필요)
        onStartNewChat={handleStartNewChat}

        selectedUser={user}
        isHistoryLoading={isChatLoading}
        chatHistoryData={data}
        onSendMessage={handleOnSend}
        onCloseChat={goBackToUserList} // '뒤로가기' 용도
      />
      <CreateChatRoomModal
        open={openCreateModal}
        onClose={handleCloseCreateModal}
      />
    </>
  );
}