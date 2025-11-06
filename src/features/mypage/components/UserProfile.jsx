import { useState, useEffect } from 'react';

// material-ui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';

// project imports
import Avatar from 'ui-component/extended/Avatar';
import { gridSpacing } from 'store/constant';
import useAuth from 'hooks/useAuth';
import AnimateButton from '../../../ui-component/extended/AnimateButton';

// assets
import ErrorTwoToneIcon from '@mui/icons-material/ErrorTwoTone';

// 아이콘 imports
import AccountCircleTwoToneIcon from '@mui/icons-material/AccountCircleTwoTone';
import MailTwoToneIcon from '@mui/icons-material/MailTwoTone';
import CalendarTodayTwoToneIcon from '@mui/icons-material/CalendarTodayTwoTone';
import BusinessTwoToneIcon from '@mui/icons-material/BusinessTwoTone';
import BadgeTwoToneIcon from '@mui/icons-material/BadgeTwoTone';
import PhonelinkRingTwoToneIcon from '@mui/icons-material/PhonelinkRingTwoTone';

export default function UserProfile() {
  const { user, updateProfile } = useAuth();

  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (user?.phoneNumber) {
      setPhoneNumber(user.phoneNumber);
    }
  }, [user]);

  const handlePhoneNumberChange = (event) => {
    setPhoneNumber(event.target.value);
  };

  const handleSave = async () => {
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      await updateProfile({ phoneNumber: phoneNumber, username: user.username });
      setSuccessMessage('연락처가 성공적으로 변경되었습니다.');
    } catch (error) {
      console.error('Failed to update phone number:', error);
      setErrorMessage('연락처 변경에 실패했습니다.');
    }
  };

  return (
    <Grid container spacing={gridSpacing}>
      {errorMessage && (
        <Grid size={12}>
          <Alert severity="error" sx={{ width: '100%' }}>
            {errorMessage}
          </Alert>
        </Grid>
      )}
      {successMessage && (
        <Grid size={12}>
          <Alert severity="success" sx={{ width: '100%' }}>
            {successMessage}
          </Alert>
        </Grid>
      )}

      <Grid size={4}>
        <Grid container direction="column" sx={{ alignItems: 'center', gap: 2 }}>
          <Grid>
            <Avatar alt="User" src={user?.profileImg} sx={{ height: 150, width: 150 }} />
          </Grid>
          <Grid size={{ sm: 'grow' }}>
            <Grid container spacing={1}>
              <Grid size={12}>
                <Stack direction="row" sx={{ alignItems: 'center' }}>
                  <input accept="image/*" style={{ display: 'none' }} id="contained-button-file" multiple type="file" />
                </Stack>
              </Grid>
              <Grid size={12}>
                <Typography variant="caption">
                  <ErrorTwoToneIcon sx={{ height: 16, width: 16, mr: 1, verticalAlign: 'text-bottom' }} />
                  이부분에 이미지 수정 컴포넌트
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Grid size={8}>
        <List component="nav" aria-label="user details" sx={{ width: '100%' }}>
          <ListItemButton>
            <ListItemIcon>
              <AccountCircleTwoToneIcon sx={{ fontSize: '1.3rem' }} />
            </ListItemIcon>
            <ListItemText primary={<Typography sx={{ fontSize: 16 }}>이름</Typography>} />
            <Typography sx={{ fontSize: 16 }} align="right">
              {user?.name}
            </Typography>
          </ListItemButton>
          <Divider />
          <ListItemButton>
            <ListItemIcon>
              <MailTwoToneIcon sx={{ fontSize: '1.3rem' }} />
            </ListItemIcon>
            <ListItemText primary={<Typography sx={{ fontSize: 16 }}>이메일 주소</Typography>} />
            <Typography sx={{ fontSize: 16 }} align="right">
              {user?.email}
            </Typography>
          </ListItemButton>
          <Divider />
          <ListItemButton>
            <ListItemIcon>
              <CalendarTodayTwoToneIcon sx={{ fontSize: '1.3rem' }} />
            </ListItemIcon>
            <ListItemText primary={<Typography sx={{ fontSize: 16 }}>입사일</Typography>} />
            <Typography sx={{ fontSize: 16 }} align="right">
              {user?.hireDate}
            </Typography>
          </ListItemButton>
          <Divider />
          <ListItemButton>
            <ListItemIcon>
              <BusinessTwoToneIcon sx={{ fontSize: '1.3rem' }} />
            </ListItemIcon>
            <ListItemText primary={<Typography sx={{ fontSize: 16 }}>부서</Typography>} />
            <Typography sx={{ fontSize: 16 }} align="right">
              {user?.department}
            </Typography>
          </ListItemButton>
          <Divider />
          <ListItemButton>
            <ListItemIcon>
              <BadgeTwoToneIcon sx={{ fontSize: '1.3rem' }} />
            </ListItemIcon>
            <ListItemText primary={<Typography sx={{ fontSize: 16 }}>직급</Typography>} />
            <Typography sx={{ fontSize: 16 }} align="right">
              {user?.position}
            </Typography>
          </ListItemButton>
          <Divider />
          <ListItem sx={{ py: 1.5 }}>
            <ListItemIcon>
              <PhonelinkRingTwoToneIcon sx={{ fontSize: '1.3rem' }} />
            </ListItemIcon>
            <ListItemText primary={<Typography sx={{ fontSize: 16 }}>연락처</Typography>} />
            <TextField
              variant="standard"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              sx={{
                marginLeft: 'auto',
                '& .MuiInputBase-input': {
                  textAlign: 'right',
                  fontSize: 16
                }
              }}
            />
          </ListItem>
        </List>
      </Grid>

      <Grid size={12}>
        <Stack direction="row" justifyContent="flex-end">
          <AnimateButton>
            <Button variant="outlined" size="large" onClick={handleSave}>
              저장
            </Button>
          </AnimateButton>
        </Stack>
      </Grid>
    </Grid>
  );
}