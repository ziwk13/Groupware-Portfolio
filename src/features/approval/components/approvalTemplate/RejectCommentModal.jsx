import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import React from 'react';

export default function RejectCommentModal({ open, onClose, onSubmit }) {
  const [comment, setComment] = React.useState('');

  const handleSubmit = () => {
    onSubmit(comment);
    setComment('');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>반려 사유 입력</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          multiline
          minRows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="반려 사유를 입력하세요."
        />
      </DialogContent>

      <DialogActions>
        <Button color="error" variant="outlined" onClick={handleSubmit}>
          반려 처리
        </Button>
        <Button onClick={onClose} color="primary" variant="outlined">
          취소
        </Button>
      </DialogActions>
    </Dialog>
  );
}
