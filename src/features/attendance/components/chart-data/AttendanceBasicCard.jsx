import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

// material-ui
import { useColorScheme, useTheme } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { Menu, MenuItem } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';

// redux
import { useDispatch, useSelector } from 'react-redux';
import { fetchTodayAttendance, clockIn, clockOut, updateWorkStatus } from 'features/attendance/slices/attendanceSlice';
import { fetchWeeklyAttendance } from 'features/attendance/slices/attendanceSlice';

// project imports
import useAuth from 'hooks/useAuth';
import useConfig from 'hooks/useConfig';
import SkeletonTotalGrowthBarChart from 'ui-component/cards/Skeleton/TotalGrowthBarChart';
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';
import WorkProgressBar from '../WorkProgressBar';

// chart data
import barChartOptions from './total-growth-bar-chart';

export default function AttendanceBasicCard({ isLoading }) {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const dispatch = useDispatch();
  const { colorScheme } = useColorScheme();
  const { user, isLoggedIn } = useAuth();

  // Redux 상태
  const { today, loading } = useSelector((state) => state.attendance);
  const { weekly } = useSelector((state) => state.attendance);

  // 로그인된 사원 ID
  const employeeId = user?.employeeId || user?.id;

  // 현재 시간
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 요일
  const days = ['일', '월', '화', '수', '목', '금', '토'];

  const formattedTime = `${currentTime.getFullYear()}년 ${String(currentTime.getMonth() + 1).padStart(2, '0')}월 ${String(
    currentTime.getDate()
  ).padStart(2, '0')}일 (${days[currentTime.getDay()]}) ${String(currentTime.getHours()).padStart(2, '0')}:${String(
    currentTime.getMinutes()
  ).padStart(2, '0')}:${String(currentTime.getSeconds()).padStart(2, '0')}`;

  // 초기 렌더링 시 오늘 근태 조회
  useEffect(() => {
    if (isLoggedIn && employeeId) {
      dispatch(fetchTodayAttendance(employeeId));
      dispatch(fetchWeeklyAttendance(employeeId));

      const interval = setInterval(() => {
        dispatch(fetchWeeklyAttendance(employeeId));
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [dispatch, employeeId, isLoggedIn]);

  // 출근 / 퇴근 핸들러
  const handleClockIn = async () => {
    await dispatch(clockIn(employeeId));
    dispatch(fetchTodayAttendance(employeeId));
    dispatch(fetchWeeklyAttendance(employeeId));
  };

  const handleClockOut = async () => {
    await dispatch(clockOut(employeeId));
    dispatch(fetchTodayAttendance(employeeId));
    dispatch(fetchWeeklyAttendance(employeeId));
  };

  // 근무상태 변경 메뉴
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  //  근무상태 변경 핸들러
  const handleWorkStatusChange = (statusCode) => {
    dispatch(updateWorkStatus({ employeeId, statusCode }));
    handleClose();
  };

  // 근무 상태 표시 맵
  const workStatusMap = {
    NORMAL: '정상근무',
    LATE: '지각',
    EARLY_LEAVE: '조퇴',
    ABSENT: '결근',
    VACATION: '휴가',
    OUT_ON_BUSINESS: '외근',
    OFF: '퇴근'
  };

  // 스타일 관련
  const {
    state: { fontFamily }
  } = useConfig();
  const [chartOptions, setChartOptions] = useState(barChartOptions);
  const textPrimary = theme.vars.palette.text.primary;
  const divider = theme.vars.palette.divider;
  const grey500 = theme.vars.palette.grey[500];
  const primary200 = theme.vars.palette.primary[200];
  const primaryDark = theme.vars.palette.primary.dark;
  const secondaryMain = theme.vars.palette.secondary.main;
  const secondaryLight = theme.vars.palette.secondary.light;

  useEffect(() => {
    setChartOptions({
      ...barChartOptions,
      chart: { ...barChartOptions.chart, fontFamily },
      colors: [primary200, primaryDark, secondaryMain, secondaryLight],
      xaxis: { ...barChartOptions.xaxis, labels: { style: { colors: textPrimary } } },
      yaxis: { ...barChartOptions.yaxis, labels: { style: { colors: textPrimary } } },
      grid: { borderColor: divider },
      tooltip: { theme: colorScheme },
      legend: {
        ...(barChartOptions.legend ?? {}),
        labels: { ...(barChartOptions.legend?.labels ?? {}), colors: grey500 }
      }
    });
  }, [colorScheme, fontFamily, primary200, primaryDark, secondaryMain, secondaryLight, textPrimary, grey500, divider]);

  return (
    <>
      {isLoading ? (
        <SkeletonTotalGrowthBarChart />
      ) : (
        <MainCard>
          <Stack sx={{ gap: gridSpacing }}>
            {/* ===== 헤더 ===== */}
            <Stack sx={{ gap: 1 }}>
              <Typography variant={isSmall ? 'h5' : 'h3'} sx={{ color: 'secondary.200' }}>
                {formattedTime}
              </Typography>
            </Stack>
            <Box sx={{ mt: 1, mb: 1 }}>
              <WorkProgressBar currentMinutes={weekly?.totalMinutes || 0} targetMinutes={weekly?.targetMinutes || 2400} />
            </Box>

            <Box
              sx={{
                mt: 2,
                p: 2,
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(4px)',
                color: '#E5E7EB'
              }}
            >
              {/* 출근 시간 */}
              <Box sx={{ flex: 1, textAlign: 'center' }}>
                <Typography variant="subtitle1" sx={{ color: '#9CA3AF', mb: 0.5 }}>
                  출근 시간
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {today?.startTime
                    ? new Date(today.startTime).toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })
                    : '-'}
                </Typography>
              </Box>

              {/* 화살표 */}
              <Box sx={{ flex: 0.3, textAlign: 'center' }}>
                <Typography variant="h5" sx={{ color: '#9CA3AF' }}>
                  ➜
                </Typography>
              </Box>

              {/* 퇴근 시간 */}
              <Box sx={{ flex: 1, textAlign: 'center' }}>
                <Typography variant="subtitle1" sx={{ color: '#9CA3AF', mb: 0.5 }}>
                  퇴근 시간
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {today?.endTime
                    ? new Date(today.endTime).toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })
                    : '-'}
                </Typography>
              </Box>

              {/* 근무 상태 */}
              <Box sx={{ flex: 1, textAlign: 'center' }}>
                <Typography variant="subtitle1" sx={{ color: '#9CA3AF', mb: 0.5 }}>
                  근무 상태
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    color: today?.workStatus === 'OUT_ON_BUSINESS' ? '#FBBF24' : today?.workStatus === 'NORMAL' ? '#60A5FA' : '#E5E7EB'
                  }}
                >
                  {workStatusMap[today?.workStatus] || '-'}
                </Typography>
              </Box>
            </Box>
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <Stack
                direction="row"
                spacing={2}
                sx={{
                  justifyContent: 'flex-end',
                  width: '100%',
                  mt: 1
                }}
              >
                {/* 출근하기 */}
                <Button
                  variant="outlined"
                  onClick={handleClockIn}
                  disabled={loading}
                  sx={{
                    borderColor: '#D1D5DB',
                    color: '#60A5FA',
                    borderRadius: '12px',
                    width: isSmall ? '90px' : '110px',
                    height: isSmall ? '35px' : '40px',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    '&:hover': {
                      borderColor: '#60A5FA',
                      backgroundColor: 'rgba(96, 165, 250, 0.1)'
                    }
                  }}
                >
                  출근하기
                </Button>

                {/* 퇴근하기 */}
                <Button
                  variant="outlined"
                  onClick={handleClockOut}
                  disabled={loading}
                  sx={{
                    borderColor: '#D1D5DB',
                    color: '#F87171',
                    borderRadius: '12px',
                    width: isSmall ? '90px' : '110px',
                    height: isSmall ? '35px' : '40px',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    '&:hover': {
                      borderColor: '#F87171',
                      backgroundColor: 'rgba(248, 113, 113, 0.1)'
                    }
                  }}
                >
                  퇴근하기
                </Button>

                {/* 근무상태 변경 */}
                <Button
                  variant="outlined"
                  onClick={handleClick}
                  disabled={today?.workStatus === 'CLOCK_OUT' || today?.workStatus === 'OFF' || today?.workStatus === 'EARLY_LEAVE'}
                  sx={{
                    borderColor: '#D1D5DB',
                    color: '#FBBF24',
                    borderRadius: '12px',
                    width: isSmall ? '80px' : '110px',
                    height: isSmall ? '35px' : '40px',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    '&:hover': {
                      borderColor: '#FBBF24',
                      backgroundColor: 'rgba(251, 191, 36, 0.1)'
                    },
                    opacity:
                      today?.workStatus === 'CLOCK_OUT' || today?.workStatus === 'OFF' || today?.workStatus === 'EARLY_LEAVE' ? 0.5 : 1,
                    cursor:
                      today?.workStatus === 'CLOCK_OUT' || today?.workStatus === 'OFF' || today?.workStatus === 'EARLY_LEAVE'
                        ? 'not-allowed'
                        : 'pointer'
                  }}
                >
                  근무상태 변경
                </Button>

                {/* 상태 변경 메뉴 */}
                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                >
                  <MenuItem onClick={() => handleWorkStatusChange('out-on-business')}>외근</MenuItem>
                  <MenuItem onClick={() => handleWorkStatusChange('return-to-office')}>사내 복귀</MenuItem>
                </Menu>
              </Stack>
            </Stack>
          </Stack>
        </MainCard>
      )}
    </>
  );
}

AttendanceBasicCard.propTypes = { isLoading: PropTypes.bool };
