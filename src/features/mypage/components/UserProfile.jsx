import { useState, useEffect } from 'react';
import axiosServices from '../../../utils/axios';

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
import AttachmentProfile from '../../../ui-component/extended/AttachmentProfile';

export default function UserProfile() {
  const { user, updateProfile } = useAuth();

  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [file, setFile] = useState(null);   // 프로필

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

      {/* 기존 프로필 이미지 영역 */}
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
        
        {/* 프로필 이미지 부분 */}
        <AttachmentProfile file={file} setFile={setFile}/>
         <Stack sx={{ mt: 2, alignItems: 'center' }}>
    <Button
      variant="contained"
      color="primary"
      onClick={async () => {
        if (!file) {
          alert('파일을 먼저 선택하세요.');
          return;
        }

        const formData = new FormData();
        formData.append('files', file); // 서비스가 List<MultipartFile>이면 그대로 유지

        try {
          const res = await axiosServices.post('/api/attachmentFiles/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          console.log('✅ 업로드 성공:', res.data);
          alert('업로드 성공!');
        } catch (err) {
          console.error('❌ 업로드 실패:', err);
          alert('업로드 실패');
        }
      }}
    >
      프로필 업로드 테스트
    </Button>
  </Stack>
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