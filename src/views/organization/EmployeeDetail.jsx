// src/views/organization/EmployeeDetail.jsx
import React from 'react';

// material-ui
import {
  Avatar,
  Grid,
  Typography,
  Divider,
  Box,
  Stack,
  Paper
} from '@mui/material';

// ===========================|| 조직도 - 직원 상세 ||=========================== //

export default function EmployeeDetail({ selectedEmployee }) {
  if (!selectedEmployee)
    return (
      <Paper
        sx={{
          height: '100%',
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255,255,255,0.03)',
          borderRadius: 2
        }}
      >
        <Typography color="text.secondary">직원을 선택하세요.</Typography>
      </Paper>
    );

  const { name, position, deptName, email, phone, profileUrl } = selectedEmployee;

  return (
    <Paper
      sx={{
        height: '100%',
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 2,
      }}
    >
      {/* 상단 - 프로필 */}
      <Box sx={{ mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Avatar
              alt={name}
              src={profileUrl || '/assets/images/users/avatar-1.png'}
              sx={{ width: 72, height: 72, border: '2px solid rgba(255,255,255,0.1)' }}
            />
          </Grid>
          <Grid item xs>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>
              {name}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              {position} / {deptName}
            </Typography>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 2 }} />

      {/* 중간 - 상세 정보 */}
      <Box sx={{ flexGrow: 1 }}>
        <Stack spacing={1.5}>
          <Typography variant="body2">
            <strong>이메일 :</strong> {email || '정보 없음'}
          </Typography>
          <Typography variant="body2">
            <strong>전화번호 :</strong> {phone || '정보 없음'}
          </Typography>
          <Typography variant="body2">
            <strong>입사일 :</strong> 2024-01-01
          </Typography>
        </Stack>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)', my: 2 }} />

      {/* 하단 - 추가 정보 박스 */}
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 0.5, color: 'rgba(255,255,255,0.6)' }}>
          소속 부서
        </Typography>
        <Typography variant="body2">{deptName}</Typography>
      </Box>
    </Paper>
  );
}
