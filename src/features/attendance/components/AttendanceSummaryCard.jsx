import { useEffect, useState } from 'react';
import { Grid, Typography, Box, useTheme } from '@mui/material';
import axios from 'api/axios';
import MainCard from 'ui-component/cards/MainCard';
import useAuth from 'hooks/useAuth';

export default function AttendanceSummaryCard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState({
    totalDays: 0,
    totalMinutes: 0,
    remainingLeave: 0,
    lateCount: 0
  });

  useEffect(() => {
    const fetchSummary = async () => {
      if (!user?.employeeId) return;
      try {
        const response = await axios.get(`/api/attendances/summary/${user.employeeId}`);
        setSummary(response.data.data);
      } catch (error) {
        console.error('근태 요약 조회 실패:', error);
      }
    };
    fetchSummary();
  }, [user?.employeeId]);

  // 총 근무시간 포맷팅
  const hours = Math.floor(summary.totalMinutes / 60);
  const minutes = summary.totalMinutes % 60;

  return (
    <MainCard
      title="전체 근무내역"
      sx={{
        mt: 0.1,
        p: 3,
        borderRadius: 2
      }}
    >
      <Grid container spacing={2} justifyContent="space-between" alignItems="center">
        {/* 총 근무일수 */}
        <Grid item xs={12} sm={6} md={3}>
          <Box textAlign="center">
            <Typography variant="body1" color="text.secondary">
              총 근무일수
            </Typography>
            <Typography variant="h5" color="text.primary" fontWeight="bold">
              {summary.totalDays}일
            </Typography>
          </Box>
        </Grid>

        {/* 총 근무시간 (시간 + 분) */}
        <Grid item xs={12} sm={6} md={3}>
          <Box textAlign="center">
            <Typography variant="body1" color="text.secondary">
              총 근무시간
            </Typography>
            <Typography variant="h5" color="text.primary" fontWeight="bold">
              {hours}시간 {minutes}분
            </Typography>
          </Box>
        </Grid>

        {/* 잔여 연차 */}
        <Grid item xs={12} sm={6} md={3}>
          <Box textAlign="center">
            <Typography variant="body1" color="text.secondary">
              잔여 연차
            </Typography>
            <Typography variant="h5" color="text.primary" fontWeight="bold">
              {summary.remainingLeave}일
            </Typography>
          </Box>
        </Grid>

        {/* 이번주 지각 */}
        <Grid item xs={12} sm={6} md={3}>
          <Box textAlign="center">
            <Typography variant="body1" color="text.secondary">
              이번주 지각
            </Typography>
            <Typography variant="h5" color="error.main" fontWeight="bold">
              {summary.lateCount}회
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </MainCard>
  );
}
