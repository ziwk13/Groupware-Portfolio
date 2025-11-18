import { useEffect, useState } from 'react';

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
import { gridSpacing } from 'store/constant';
import useAuth from 'hooks/useAuth';
import AnimateButton from 'ui-component/extended/AnimateButton';
import AttachmentProfile from 'features/attachment/components/AttachmentProfile';

// 아이콘
import AccountCircleTwoToneIcon from '@mui/icons-material/AccountCircleTwoTone';
import MailTwoToneIcon from '@mui/icons-material/MailTwoTone';
import CalendarTodayTwoToneIcon from '@mui/icons-material/CalendarTodayTwoTone';
import BusinessTwoToneIcon from '@mui/icons-material/BusinessTwoTone';
import BadgeTwoToneIcon from '@mui/icons-material/BadgeTwoTone';
import PhonelinkRingTwoToneIcon from '@mui/icons-material/PhonelinkRingTwoTone';

export default function UserProfile() {
  const { user, updateProfile } = useAuth();
  const [file, setFile] = useState(null);

  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (user?.phoneNumber) {
      // 컴포넌트 마운트 시 또는 user 정보 변경 시 기존 번호 포맷팅.
      const cleaned = (user.phoneNumber || '').replace(/[^\d]/g, '').slice(0, 11);
      const length = cleaned.length;
      let formattedValue = cleaned;
      if (length > 3 && length <= 7) {
        formattedValue = `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
      } else if (length > 7) {
        formattedValue = `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
      }
      setPhoneNumber(formattedValue);
    }
  }, [user]);

  /**
   * 전화번호 입력 시 자동으로 하이픈(-)을 추가하는 핸들러 (010-0000-0000 형식)
   */
  const handlePhoneNumberChange = (event) => {
    const rawValue = event.target.value;
    // 숫자만 추출하고 최대 11자리로 제한
    const cleaned = rawValue.replace(/[^\d]/g, '').slice(0, 11);
    const length = cleaned.length;

    let formattedValue = cleaned;
    if (length > 3 && length <= 7) {
      formattedValue = `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    } else if (length > 7) {
      formattedValue = `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
    }

    setPhoneNumber(formattedValue);
  };

  const handleSave = async () => {
    setSuccessMessage(null);
    setErrorMessage(null);

    const formData = new FormData();

    // 참고: 현재는 하이픈이 포함된 값(예: '010-1234-5678')이 전송됩니다.
    // 만약 서버에서 숫자만(예: '01012345678') 받기를 원한다면,
    // phoneNumber.replace(/[^\d]/g, '') 값을 append 해야 합니다.
    formData.append('phoneNumber', phoneNumber);

    if (file) {
      formData.append('multipartFile', file);
    }

    try {
      await updateProfile(formData);
      setSuccessMessage('내 정보가 성공적으로 변경되었습니다.');
      setFile(null);
    } catch (error) {
      console.error('Failed to update profile:', error);
      setErrorMessage('내 정보 변경에 실패했습니다.');
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
        <AttachmentProfile file={file} setFile={setFile} />
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
              placeholder="010-0000-0000"
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