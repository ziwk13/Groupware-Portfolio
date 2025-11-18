import PropTypes from 'prop-types';
import { useState } from 'react';

// project imports
import FilesPreview from 'features/attachment/components/FilePreview';

// material-ui
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

export default function FileUploadModal({ open, onClose, onSend, files, onRemove, loading }) {
  const [caption, setCaption] = useState('');

  const handleSend = () => {
    onSend(caption);
    setCaption('');
  };

  const handleClose = () => {
    setCaption('');
    onClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="div">파일 전송</Typography>
        <Typography variant="caption">{files.length}개의 파일 선택됨</Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <FilesPreview files={files} onRemove={onRemove} />
          
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2}}>
        <Button onClick={handleClose} color='error' disabled={loading}>
          취소
        </Button>
        <Button onClick={handleSend} variant="contained" disabled={loading}>
          {loading ? '전송 중...' : '전송'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

FileUploadModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSend: PropTypes.func.isRequired,
  files: PropTypes.array.isRequired,
  onRemove: PropTypes.func.isRequired,
  loading: PropTypes.bool
};
