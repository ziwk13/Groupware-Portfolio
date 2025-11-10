import React from 'react';
import { Avatar, Box, Button, Divider, Grid, List, ListItem, ListItemIcon, ListItemText, Stack, Typography } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';

// 아이콘 임포트
import AccountCircleTwoToneIcon from '@mui/icons-material/AccountCircleTwoTone';
import BusinessTwoToneIcon from '@mui/icons-material/BusinessTwoTone';
import BadgeTwoToneIcon from '@mui/icons-material/BadgeTwoTone';
import PhonelinkRingTwoToneIcon from '@mui/icons-material/PhonelinkRingTwoTone';
import MailTwoToneIcon from '@mui/icons-material/MailTwoTone';
import EventTwoToneIcon from '@mui/icons-material/EventTwoTone';
import PersonPinTwoToneIcon from '@mui/icons-material/PersonPinTwoTone';
import SecurityTwoToneIcon from '@mui/icons-material/SecurityTwoTone';
import FingerprintTwoToneIcon from '@mui/icons-material/FingerprintTwoTone';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import {getImageUrl} from 'utils/getImageUrl';
import DefaultAvatar from 'assets/images/profile/default_profile.png';


function EmployeeForm({ formData, setFormData, commonCodes, selectedDeptInfo, resetPasswordHandler }) {
  // 1. 폼 데이터가 없을 때 (초기 상태)
  if (!formData) {
    return (
      <MainCard
        title="인사 정보"
        content={false}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid',
          '& .MuiCardHeader-root': {
            padding: 1.5
          }
        }}
      >
        <Box
          sx={{
            p: 3,
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'text.secondary'
          }}
        >
          직원을 선택하거나 '신규' 버튼을 클릭하세요.
        </Box>
      </MainCard>
    );
  }

  // 2. 폼 이벤트 핸들러
  // (1) 일반 TextField 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // (2) Autocomplete 변경 핸들러
  const handleAutocompleteChange = (name, newValue) => {
    console.log('Autocomplete change:', name, newValue);
    setFormData((prev) => ({
      ...prev,
      [name]: newValue ? newValue.commonCodeId : null // ID 값만 저장
    }));
  };

  // (3) Autocomplete 렌더링을 위한 값 찾기
  const findValue = (list, id) => {
    return list.find((item) => item.commonCodeId === id) || null;
  };

  const isNew = !formData.employeeId;

  // 3. 렌더링
  return (
    <MainCard
      title="인사 정보"
      content={false}
      secondary={
        !isNew && (
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Button variant="contained" color="primary" onClick={resetPasswordHandler} size="small">
              비밀번호 초기화
            </Button>
          </Stack>
        )
      }
      sx={{
        height: '100%',
        border: '1px solid',
        '& .MuiCardHeader-root': {
          padding: 1.5
        },
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden' // 자식 요소가 스크롤을 제어하도록 함
      }}
    >
      <Box sx={{ p: 3, flex: 1, overflowY: 'auto' }}>
        <Grid container spacing={3}>
          {/* 프로필 이미지 */}
          {!isNew && (
            <>
              <Grid size={12}>
                <Grid container direction="column" sx={{ alignItems: 'center' }}>
                  <Grid>
                    <Avatar alt={formData.name}
                            src={formData.profileImg ? getImageUrl(formData.profileImg) : DefaultAvatar}
                            sx={{ height: 70, width: 70 }} />
                  </Grid>
                </Grid>
              </Grid>
            </>
          )}

          {/* 폼 필드 */}
          <Grid size={12}>
            <List component="nav" aria-label="user details" sx={{ width: '100%' }}>
              {/* 아이디 */}
              <ListItem sx={{ px: 0 }}>
                {' '}
                <ListItemIcon>
                  <FingerprintTwoToneIcon sx={{ fontSize: '1.3rem' }} />
                </ListItemIcon>
                <ListItemText primary={<Typography sx={{ fontSize: 14 }}>아이디</Typography>} />
                <TextField
                  variant="standard"
                  name="username"
                  value={formData.username || ''}
                  onChange={handleChange}
                  disabled={!isNew}
                  placeholder={isNew ? '로그인 아이디' : '(수정불가)'}
                  sx={{ marginLeft: 'auto' }}
                  inputProps={{ style: { textAlign: 'right' } }}
                />
              </ListItem>
              <Divider />

              {/* 이름 */}
              <ListItem sx={{ px: 0 }}>
                {' '}
                <ListItemIcon>
                  <AccountCircleTwoToneIcon sx={{ fontSize: '1.3rem' }} />
                </ListItemIcon>
                <ListItemText primary={<Typography sx={{ fontSize: 14 }}>이름</Typography>} />
                <TextField
                  variant="standard"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  sx={{ marginLeft: 'auto' }}
                  inputProps={{ style: { textAlign: 'right' } }}
                />
              </ListItem>
              <Divider />

              {/* 부서 (트리에서 선택, 수정 불가) */}
              <ListItem sx={{ px: 0 }}>
                {' '}
                <ListItemIcon>
                  <BusinessTwoToneIcon sx={{ fontSize: '1.3rem' }} />
                </ListItemIcon>
                <ListItemText primary={<Typography sx={{ fontSize: 14 }}>부서</Typography>} />
                <Typography sx={{ fontSize: 14 }} align="right">
                  {selectedDeptInfo?.value1}
                </Typography>
              </ListItem>
              <Divider />

              {/* 직급 (Autocomplete) */}
              <ListItem sx={{ px: 0 }}>
                {' '}
                <ListItemIcon>
                  <BadgeTwoToneIcon sx={{ fontSize: '1.3rem' }} />
                </ListItemIcon>
                <ListItemText primary={<Typography sx={{ fontSize: 14 }}>직급</Typography>} />
                <Autocomplete
                  disableClearable={true}
                  options={commonCodes.positions}
                  getOptionLabel={(option) => option.value1 || ''}
                  value={findValue(commonCodes.positions, formData.position)}
                  onChange={(e, newValue) => handleAutocompleteChange('position', newValue)}
                  isOptionEqualToValue={(option, value) => option.commonCodeId === value.commonCodeId}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="standard"
                      sx={{ minWidth: 120 }}
                      inputProps={{
                        ...params.inputProps,
                        style: { textAlign: 'right' }
                      }}
                    />
                  )}
                  sx={{ marginLeft: 'auto' }}
                  size="small"
                />
              </ListItem>
              <Divider />

              {/* 연락처 */}
              <ListItem sx={{ px: 0 }}>
                {' '}
                <ListItemIcon>
                  <PhonelinkRingTwoToneIcon sx={{ fontSize: '1.3rem' }} />
                </ListItemIcon>
                <ListItemText primary={<Typography sx={{ fontSize: 14 }}>연락처</Typography>} />
                <TextField
                  variant="standard"
                  name="phoneNumber"
                  value={formData.phoneNumber || ''}
                  onChange={handleChange}
                  sx={{ marginLeft: 'auto' }}
                  inputProps={{ style: { textAlign: 'right' } }}
                />
              </ListItem>
              <Divider />

              {/* 이메일 */}
              {!isNew && (
                <>
                  <ListItem sx={{ px: 0 }}>
                    {' '}
                    <ListItemIcon>
                      <MailTwoToneIcon sx={{ fontSize: '1.3rem' }} />
                    </ListItemIcon>
                    <ListItemText primary={<Typography sx={{ fontSize: 14 }}>이메일</Typography>} />
                    <TextField
                      variant="standard"
                      name="email"
                      disabled
                      value={formData.email || ''}
                      onChange={handleChange}
                      sx={{ marginLeft: 'auto', minWidth: 200 }}
                      inputProps={{ style: { textAlign: 'right' } }}
                    />
                  </ListItem>
                  <Divider />
                </>
              )}

              {/* 입사일 */}
              <ListItem sx={{ px: 0 }}>
                {' '}
                <ListItemIcon>
                  <EventTwoToneIcon sx={{ fontSize: '1.3rem' }} />
                </ListItemIcon>
                <ListItemText primary={<Typography sx={{ fontSize: 14 }}>입사일</Typography>} />
                <TextField
                  variant="standard"
                  type="date"
                  name="hireDate"
                  value={formData.hireDate || ''}
                  onChange={handleChange}
                  sx={{ marginLeft: 'auto' }}
                  inputProps={{ style: { textAlign: 'right' } }}
                />
              </ListItem>
              <Divider />

              {/* 재직 상태 (Autocomplete) */}
              <ListItem sx={{ px: 0 }}>
                {' '}
                <ListItemIcon>
                  <PersonPinTwoToneIcon sx={{ fontSize: '1.3rem' }} />
                </ListItemIcon>
                <ListItemText primary={<Typography sx={{ fontSize: 14 }}>재직 상태</Typography>} />
                <Autocomplete
                  disableClearable={true}
                  options={commonCodes.status}
                  getOptionLabel={(option) => option.value2 || ''}
                  value={findValue(commonCodes.status, formData.status)}
                  onChange={(e, newValue) => handleAutocompleteChange('status', newValue)}
                  isOptionEqualToValue={(option, value) => option.commonCodeId === value.commonCodeId}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="standard"
                      sx={{ minWidth: 120 }}
                      inputProps={{
                        ...params.inputProps,
                        style: { textAlign: 'right' }
                      }}
                    />
                  )}
                  sx={{ marginLeft: 'auto' }}
                  size="small"
                />
              </ListItem>
              <Divider />

              {/* 권한 (Autocomplete) */}
              <ListItem sx={{ px: 0 }}>
                {' '}
                <ListItemIcon>
                  <SecurityTwoToneIcon sx={{ fontSize: '1.3rem' }} />
                </ListItemIcon>
                <ListItemText primary={<Typography sx={{ fontSize: 14 }}>권한</Typography>} />
                <Autocomplete
                  disableClearable={true}
                  options={commonCodes.roles}
                  getOptionLabel={(option) => option.value2 || ''}
                  value={findValue(commonCodes.roles, formData.role)}
                  onChange={(e, newValue) => handleAutocompleteChange('role', newValue)}
                  isOptionEqualToValue={(option, value) => option.commonCodeId === value.commonCodeId}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="standard"
                      sx={{ minWidth: 120 }}
                      inputProps={{
                        ...params.inputProps,
                        style: { textAlign: 'right' }
                      }}
                    />
                  )}
                  sx={{ marginLeft: 'auto' }}
                  size="small"
                />
              </ListItem>
            </List>
          </Grid>
        </Grid>
      </Box>
    </MainCard>
  );
}

export default EmployeeForm;
