import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';

// material-ui
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import AttachmentTwoToneIcon from '@mui/icons-material/AttachmentTwoTone';
import SendTwoToneIcon from '@mui/icons-material/SendTwoTone';
import { Box } from '@mui/material';

// import project
import AttachmentDropzone from 'features/attachment/components/AttachmentDropzone';
import FileUploadModal from './FileUploadModal';

// ==============================|| CHAT - MESSAGE INPUT ||============================== //

export default function MessageInput({ onSend, disabled, multiple= true }) {
  const [message, setMessage] = useState('');
  // 파일 첨부 상태 관리
  const [attachments, setAttachments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileDialogOpenRef = useRef();

  // 파일이 선택되면 자동으로 모달 열기
  useEffect(() => {
    if (attachments.length > 0) {
      setIsModalOpen(true);
    }
  }, [attachments]);

  // 텍스트 전송 핸들러
  const handleTextMessageSend = () => {
    if (disabled || !message.trim()) return;

    onSend({ text: message, files: [] });
    setMessage('');
  };

  // 파일 전송 핸들러
  const handleFileMessageSend = (caption) => {
    if (disabled) return;

    onSend({
      text: caption,
      files: attachments
    });
    setIsModalOpen(false);
    setAttachments([]);
  };

  // 모달 닫기/취소 핸들러
  const handleModalClose = () => {
    setIsModalOpen(false);
    setAttachments([]);
  }

  // Enter키 핸들러
  const handleEnterKey = (event) => {
    if (event.nativeEvent.isComposing) return;

    if (event?.key === 'Enter') {
      event.preventDefault();
      handleTextMessageSend();
    }
  };

  // 파일 삭제 핸들러
  const handleRemoveFile = (file) => {
    const newAttachments = attachments.filter(f => f !== file);
    setAttachments(newAttachments);

    if (newAttachments.length === 0) {
      setIsModalOpen(false);
    }
  };

  return (
    <Box sx={{ p: 1, borderTop: '1px solid', borderColor: 'divider' }}>
      <FileUploadModal
        open={isModalOpen}
        onClose={handleModalClose}
        onSend={handleFileMessageSend}
        files={attachments}
        onRemove={handleRemoveFile}
        loading={disabled}
      />
      <Grid container spacing={1} sx={{ alignItems: 'center' }}>
        <Grid>
          <IconButton 
          size="large" 
          aria-label="attachment file" 
          onClick={() => fileDialogOpenRef.current?.()}
          disabled={disabled}
          >
            <AttachmentTwoToneIcon/>
          </IconButton>
          <Box sx={{ display: 'none' }}>
              <AttachmentDropzone
              attachments={attachments} 
              setAttachments={setAttachments} 
              multiple={multiple}
              maxSize={10 * 1024 * 1024}
              onOpenFileDialog={(openFn) => {fileDialogOpenRef.current = openFn}}/>
            </Box>
        </Grid>
        <Grid size={{ xs: 12, sm: 'grow' }}>
          <OutlinedInput
            id="message-send"
            fullWidth
            value={message} // 내부 state 사용
            onChange={(e) => setMessage(e.target.value)} // 내부 state 변경
            onKeyDown={handleEnterKey} // 내부 핸들러 사용
            placeholder={disabled ? "파일 전송 중..." : "메시지를 입력 하세요"}
            endAdornment={
              <InputAdornment position="end">
                <IconButton 
                disableRipple color="primary" 
                onClick={handleTextMessageSend} 
                aria-label="send message"
                disabled={disabled}
                >
                  <SendTwoToneIcon />
                </IconButton>
              </InputAdornment>
            }
            aria-describedby="search-helper-text"
            slotProps={{ input: { 'aria-label': 'weight' } }}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

MessageInput.propTypes = {
  onSend: PropTypes.func,
  disabled: PropTypes.bool
};