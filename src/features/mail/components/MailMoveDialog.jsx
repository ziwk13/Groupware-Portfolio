import React, {useState, useEffect} from 'react'
import {Dialog, DialogTitle, DialogContent, DialogActions, Button, RadioGroup, Radio, FormControlLabel, Box, useColorScheme} from '@mui/material';

function MailMoveDialog({open, onClose, onConfirm, mailboxType}) {
	const [value, setValue] = useState('');

	const boxStyle = (theme) => ({
    backgroundColor: theme.vars
      ? theme.vars.palette.background.paper
      : theme.palette.background.paper,
    border: `1px solid ${
      theme.vars ? theme.vars.palette.divider : theme.palette.divider
    }`,
    color: theme.vars
      ? theme.vars.palette.text.primary
      : theme.palette.text.primary,
    borderRadius: '12px',
    padding: '14px 5px 14px 14px',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
		height: '60px'
  });

	useEffect(() => {
		if(!open) {
			setValue('');
		}
	}, [open]);
	
	
	return (
		<Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
			<DialogTitle>메일함 이동</DialogTitle>
			<DialogContent>
				<RadioGroup value={value} onChange={(e) => setValue(e.target.value)}>
					<Box sx={boxStyle}>
          	<FormControlLabel value="MYBOX" control={<Radio />} label="개인보관함" labelPlacement="start" disabled={mailboxType === 'MYBOX'} sx={{justifyContent:'space-between', width:"100%", margin:0}}/>
					</Box>
					<Box sx={(theme) => ({ ...boxStyle(theme), marginTop: '8px' })}>
          	<FormControlLabel value="TRASH" control={<Radio />} label="휴지통" labelPlacement="start" disabled={mailboxType === 'TRASH'} sx={{justifyContent:'space-between', width:"100%", margin:0}}/>
					</Box>
        </RadioGroup>
			</DialogContent>

			<DialogActions>
        <Button variant="contained" onClick={() => onConfirm(value)}>이동</Button>
        <Button onClick={onClose}>취소</Button>
      </DialogActions>
		</Dialog>	
	)
}

export default MailMoveDialog