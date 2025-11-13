import PropTypes from 'prop-types';
import { useState } from 'react';

// material-ui
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';

// assets
import AttachmentTwoToneIcon from '@mui/icons-material/AttachmentTwoTone';
import MoodTwoToneIcon from '@mui/icons-material/MoodTwoTone';
import SendTwoToneIcon from '@mui/icons-material/SendTwoTone';

// ==============================|| CHAT - MESSAGE INPUT ||============================== //

export default function MessageInput({ onSend }) {
  // 1. ChatPage에 있던 message state를 이곳으로 가져옵니다.
  const [message, setMessage] = useState('');

  // 2. ChatPage의 handleOnSend 로직을 내부화합니다.
  const handleOnSendClick = () => {
    // 메시지가 비어있지 않으면 부모(ChatPage)로 전송 이벤트를 알립니다.
    if (message.trim()) {
      onSend(message);
      setMessage(''); // 입력창을 스스로 비웁니다.
    }
  };

  // 3. ChatPage의 handleEnter 로직을 내부화합니다.
  const handleEnterKey = (event) => {
    if (event?.key === 'Enter') {
      handleOnSendClick();
    }
  };

  return (
    <Grid container spacing={1} sx={{ alignItems: 'center' }}>
      <Grid>
        <IconButton size="large" aria-label="attachment file">
          <AttachmentTwoToneIcon />
        </IconButton>
      </Grid>
      <Grid size={{ xs: 12, sm: 'grow' }}>
        <OutlinedInput
          id="message-send"
          fullWidth
          value={message} // 내부 state 사용
          onChange={(e) => setMessage(e.target.value)} // 내부 state 변경
          onKeyDown={handleEnterKey} // 내부 핸들러 사용
          placeholder="Type a Message"
          endAdornment={
            <InputAdornment position="end">
              <IconButton disableRipple color="primary" onClick={handleOnSendClick} aria-label="send message">
                <SendTwoToneIcon />
              </IconButton>
            </InputAdornment>
          }
          aria-describedby="search-helper-text"
          slotProps={{ input: { 'aria-label': 'weight' } }}
        />
      </Grid>
    </Grid>
  );
}

MessageInput.propTypes = {
  onSend: PropTypes.func
};