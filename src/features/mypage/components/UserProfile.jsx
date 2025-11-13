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

// assets

// 아이콘 imports
import AccountCircleTwoToneIcon from '@mui/icons-material/AccountCircleTwoTone';
import MailTwoToneIcon from '@mui/icons-material/MailTwoTone';
import CalendarTodayTwoToneIcon from '@mui/icons-material/CalendarTodayTwoTone';
import BusinessTwoToneIcon from '@mui/icons-material/BusinessTwoTone';
import BadgeTwoToneIcon from '@mui/icons-material/BadgeTwoTone';
import PhonelinkRingTwoToneIcon from '@mui/icons-material/PhonelinkRingTwoTone';
import AttachmentProfile from 'features/attachment/components/AttachmentProfile';

export default function UserProfile() {
  const { user, updateProfile } = useAuth();
  const [file, setFile] = useState(null);

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

    // FormData 객체 생성
    const formData = new FormData();

    formData.append('phoneNumber', phoneNumber);

    // 파일이 있을 경우, DTO의 필드명('multipartFile')에 맞게 파일 추가
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

      {/* 기존 프로필 이미지 영역 */}
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
