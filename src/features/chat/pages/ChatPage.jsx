import React, { useEffect, useState, useTransition } from 'react';

// material-ui
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import Dialog from '@mui/material/Dialog';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { styled, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

// third party 추후 인스톨 후 구현 예정
// import EmojiPicker, { SkinTones } from 'emoji-picker-react';

// project imports
import ChartHistory from '../components/ChartHistory';
import ChatDrawer from '../components/ChatDrawer';
import UserDetails from '../components/UserDetails';

import Loader from 'ui-component/Loader';
import MainCard from 'ui-component/cards/MainCard';
import SimpleBar from 'ui-component/third-party/SimpleBar';

import { appDrawerWidth as drawerWidth, gridSpacing } from 'store/constant';

import useAuth from 'hooks/useAuth';

// assets
import HighlightOffTwoToneIcon from '@mui/icons-material/HighlightOffTwoTone';
import ChatHeader from '../components/ChatHeader';
import MessageInput from '../components/MessageInput';

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
  const theme = useTheme();
  const downLG = useMediaQuery(theme.breakpoints.down('lg'));
  const downMD = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const { user: authUser } = useAuth();

  const [loading, setLoading] = useState(false);

  // set chat details page open when user is selected from sidebar
  const [emailDetails, setEmailDetails] = React.useState(false);
  const handleUserChange = (event) => {
    setEmailDetails((prev) => !prev);
  };

  // toggle sidebar
  const [openChatDrawer, setOpenChatDrawer] = React.useState(true);
  const handleDrawerOpen = () => {
    setOpenChatDrawer((prevState) => !prevState);
  };

  // close sidebar when widow size below 'md' breakpoint
  useEffect(() => {
    setOpenChatDrawer(!downLG);
  }, [downLG]);

  const [user, setUser] = useState({});
  const [isChatLoading, startTransition] = useTransition();
  const [data, setData] = React.useState([]);

  const handleUserSelect = (user) => {
    setData([]);

    startTransition(async () => {
      await new Promise((resolve) => setTimeout(resolve, 500)).then(() => {
        setUser(user);
      });
    });
  };

  // handle new message form
  const [message, setMessage] = useState('');
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

  if (loading) return <Loader />;

  return (
    <Box sx={{ display: 'flex', overflow: 'hidden' }}>
      <ChatDrawer openChatDrawer={openChatDrawer} handleDrawerOpen={handleDrawerOpen} setUser={handleUserSelect} />
      <Main open={openChatDrawer} sx={{ minWidth: 0 }}>
        <Grid container spacing={gridSpacing} sx={{ height: 1 }}>
          <Grid
            size={{ xs: 12, md: emailDetails ? 8 : 12, xl: emailDetails ? 9 : 12 }}
            sx={(theme) => ({
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.shorter + 200
              })
            })}
          >
            <MainCard
              sx={{
                height: 1,
                bgcolor: 'grey.50',
                ...theme.applyStyles('dark', { bgcolor: 'dark.main' }),
                transition: theme.transitions.create('width', {
                  easing: theme.transitions.easing.easeOut,
                  duration: theme.transitions.duration.shorter + 200
                })
              }}
            >
              <Grid container spacing={gridSpacing} sx={{ height: 1 }}>
                {/* ChatHeader*/}
                <ChatHeader
                  user={user}
                  onDrawerOpen={handleDrawerOpen}
                  onUserDetailsToggle={handleUserChange}
                  isUserDetailsOpen={emailDetails}
                />
                {/* ChatHistory */}
                <SimpleBar
                  sx={{ overflowX: 'hidden', height: 'calc(100vh - 431px)', minHeight: 420, '& .simplebar-content': { height: 1 } }}
                >
                  <Box sx={{ height: 1 }}>
                    {isChatLoading ? (
                      <Stack sx={{ height: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <CircularProgress color="secondary" />
                      </Stack>
                    ) : (
                      <ChartHistory theme={theme} user={user} data={data} />
                    )}
                  </Box>
                </SimpleBar>
              </Grid>

              {/* MessageInput */}
              <MessageInput onSend={handleOnSend} />
              {/*  <Popper
                id={emojiId}
                open={emojiOpen}
                anchorEl={anchorElEmoji}
                disablePortal
                sx={{ zIndex: 1200 }}
                modifiers={[
                  {
                    name: 'offset',
                    options: {
                      offset: [-20, 20]
                    }
                  }
                ]}
              >
                <ClickAwayListener onClickAway={handleCloseEmoji}>
                  <MainCard
                    elevation={8}
                    content={false}
                    sx={{
                      '& .EmojiPickerReact': {
                        backgroundColor: 'background.default',
                        ...theme.applyStyles('dark', {
                          borderColor: withAlpha(theme.vars.palette.grey[500], 0.2),
                          'div:last-child': {
                            borderColor: withAlpha(theme.vars.palette.grey[500], 0.2)
                          }
                        })
                      },
                      '& .EmojiPickerReact .epr-emoji-category-label': {
                        backgroundColor: 'background.paper'
                      },
                      '& .epr-search-container input': {
                        backgroundColor: 'grey.50',
                        ...theme.applyStyles('dark', {
                          backgroundColor: 'background.paper',
                          borderColor: withAlpha(theme.vars.palette.grey[500], 0.2)
                        }),
                        '&:focus': {
                          borderColor: 'primary.main',
                          ...theme.applyStyles('dark', { borderColor: 'common.white' })
                        }
                      }
                    }}
                  >
                    <EmojiPicker onEmojiClick={onEmojiClick} defaultSkinTone={SkinTones.DARK} lazyLoadEmojis={true} />
                  </MainCard>
                </ClickAwayListener>
              </Popper> */}
            </MainCard>
          </Grid>

          {/* UserDeatils 패널 (우측 상세정보) */}
          <Grid sx={{ overflow: 'hidden', display: emailDetails ? 'flex' : 'none' }} size={{ xs: 12, md: 4, xl: 3 }}>
            <Collapse orientation="horizontal" in={emailDetails && !downMD}>
              <Box sx={{ display: { xs: 'block', sm: 'none', textAlign: 'right' } }}>
                <IconButton onClick={handleUserChange} sx={{ mb: -5 }} size="large">
                  <HighlightOffTwoToneIcon />
                </IconButton>
              </Box>
              {isChatLoading ? (
                <Stack sx={{ height: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <CircularProgress color="secondary" />
                </Stack>
              ) : (
                <UserDetails user={user} />
              )}
            </Collapse>
          </Grid>
          {/* 패널 */}
          <Dialog onClose={handleUserChange} open={downMD && emailDetails} scroll="body" slotProps={{ paper: { sx: { p: 2 } } }}>
            {isChatLoading ? (
              <Stack sx={{ height: 1, justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress color="secondary" />
              </Stack>
            ) : (
              <UserDetails user={user} />
            )}
          </Dialog>
        </Grid>
      </Main>
    </Box>
  );
}
