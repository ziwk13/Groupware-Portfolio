import { Dialog, DialogTitle, DialogContent, DialogActions, Button, List, ListItemButton, ListItemText } from '@mui/material';

export default function ApprovalFormModal({ open, onClose, templates, onSelect }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>결재 양식 선택</DialogTitle>
      <DialogContent>
        <List>
          {templates.map((form) => (
            <ListItemButton key={form.code} onClick={() => onSelect(form)}>
              <ListItemText primary={form.value1} />
            </ListItemButton>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>닫기</Button>
      </DialogActions>
    </Dialog>
  );
}
