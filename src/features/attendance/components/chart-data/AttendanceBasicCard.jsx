import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

import { useColorScheme, useTheme } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { Menu, MenuItem, Alert } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';

import { useDispatch, useSelector } from 'react-redux';

// 절대경로로 수정된 부분
import {
  fetchTodayAttendance,
  clockIn,
  clockOut,
  updateWorkStatus,
  fetchThisWeekAttendance,
  resetAttendanceState
} from 'features/attendance/api/attendanceApi';

import useAuth from 'hooks/useAuth';
import useConfig from 'hooks/useConfig';
import SkeletonTotalGrowthBarChart from 'ui-component/cards/Skeleton/TotalGrowthBarChart';
import MainCard from 'ui-component/cards/MainCard';
import WorkProgressBar from '../WorkProgressBar';

import barChartOptions from './total-growth-bar-chart';

export default function AttendanceBasicCard({ isLoading }) {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const dispatch = useDispatch();
  const { colorScheme } = useColorScheme();
  const { user, isLoggedIn } = useAuth();

  const { today, loading, thisWeek } = useSelector((state) => state.attendance);

  const employeeId = user?.employeeId;

  // 알림 메시지
  const [statusMessage, setStatusMessage] = useState('');

  // 알림 자동 사라짐
  useEffect(() => {
    if (!statusMessage) return;
    const timer = setTimeout(() => setStatusMessage(''), 2000);
    return () => clearTimeout(timer);
  }, [statusMessage]);

  // 현재 시간
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const formattedTime = `${currentTime.getFullYear()}년 ${String(currentTime.getMonth() + 1).padStart(2, '0')}월 ${String(
    currentTime.getDate()
  ).padStart(2, '0')}일 (${days[currentTime.getDay()]}) ${String(currentTime.getHours()).padStart(2, '0')}:${String(
    currentTime.getMinutes()
  ).padStart(2, '0')}:${String(currentTime.getSeconds()).padStart(2, '0')}`;

  // 초기 데이터 로드
  useEffect(() => {
    if (!isLoggedIn || !employeeId) {
      dispatch(resetAttendanceState());
      return;
    }
    dispatch(fetchTodayAttendance(employeeId));
    dispatch(fetchThisWeekAttendance(employeeId));

    const interval = setInterval(() => {
      dispatch(fetchThisWeekAttendance(employeeId));
    }, 60000);

    return () => clearInterval(interval);
  }, [dispatch, user]);

  // ===== 출근 =====
  const handleClockIn = async () => {
    if (today?.endTime) return setStatusMessage('이미 퇴근이 완료되었습니다.');
    if (today?.startTime) return setStatusMessage('이미 출근이 완료되었습니다.');
    await dispatch(clockIn(employeeId));
    dispatch(fetchTodayAttendance(employeeId));
    dispatch(fetchThisWeekAttendance(employeeId));
  };

  // ===== 퇴근 =====
  const handleClockOut = async () => {
    if (today?.endTime) return setStatusMessage('이미 퇴근이 완료되었습니다.');
    if (!today?.startTime) return setStatusMessage('출근 기록이 있어야 퇴근이 가능합니다.');
    await dispatch(clockOut(employeeId));
    dispatch(fetchTodayAttendance(employeeId));
    dispatch(fetchThisWeekAttendance(employeeId));
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // ===== 근무상태 변경 =====
  const handleWorkStatusClick = (event) => {
    if (today?.endTime) return setStatusMessage('이미 퇴근이 완료되었습니다.');
    if (!today?.startTime) return setStatusMessage('출근 기록이 있어야 근무상태 변경이 가능합니다.');
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const handleWorkStatusChange = (statusCode) => {
    dispatch(updateWorkStatus({ employeeId, statusCode }));
    handleClose();
  };

  const workStatusMap = {
    NORMAL: '정상근무',
    LATE: '지각',
    EARLY_LEAVE: '조퇴',
    ABSENT: '결근',
    VACATION: '휴가',
    OUT_ON_BUSINESS: '외근',
    OFF: '퇴근'
  };

  const {
    state: { fontFamily }
  } = useConfig();

  const [chartOptions, setChartOptions] = useState(barChartOptions);
  const { text, divider, grey, primary, secondary } = theme.palette;

  useEffect(() => {
    setChartOptions({
      ...barChartOptions,
      chart: { ...barChartOptions.chart, fontFamily },
      colors: [primary.light, primary.main, secondary.main, secondary.light],
      xaxis: { ...barChartOptions.xaxis, labels: { style: { colors: text.primary } } },
      yaxis: { ...barChartOptions.yaxis, labels: { style: { colors: text.primary } } },
      grid: { borderColor: divider },
      tooltip: { theme: colorScheme },
      legend: {
        ...(barChartOptions.legend ?? {}),
        labels: { ...(barChartOptions.legend?.labels ?? {}), colors: grey[500] }
      }
    });
  }, [colorScheme, fontFamily, primary, secondary, text, grey, divider]);

  return (
    <>
      {/* ===== Alert: 카드 완전 밖에서 겹쳐 띄우기 (절대 크기 영향 없음) ===== */}
      <Box sx={{ position: 'relative' }}>
        {statusMessage && (
          <Alert
            severity={statusMessage.includes('가능') || statusMessage.includes('완료') ? 'error' : 'success'}
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              zIndex: 50,
              p: 0.7,
              px: 1.5,
              fontSize: '0.875rem',
              whiteSpace: 'nowrap'
            }}
          >
            {statusMessage}
          </Alert>
        )}

        {/* ===== Main 카드 (원래 크기 유지됨) ===== */}
        <MainCard>
          <Stack spacing={1}>
            {/* ===== 시간 라인 ===== */}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant={isSmall ? 'h5' : 'h3'} color="text.primary">
                {formattedTime}
              </Typography>
            </Stack>

            {/* 근무시간 바 */}
            <Box sx={{ mt: 1, mb: 1 }}>
              <WorkProgressBar currentMinutes={thisWeek?.totalMinutes || 0} targetMinutes={thisWeek?.targetMinutes || 2400} />
            </Box>

            {/* 근무 상태 카드 */}
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              {/* 출근 */}
              <Box sx={{ flex: 1, textAlign: 'center' }}>
                <Typography variant="subtitle1" color="text.secondary" mb={0.5}>
                  출근 시간
                </Typography>
                <Typography variant="h5" fontWeight={600}>
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
                <Typography variant="h5" color="text.secondary">
                  ➜
                </Typography>
              </Box>

              {/* 퇴근 */}
              <Box sx={{ flex: 1, textAlign: 'center' }}>
                <Typography variant="subtitle1" color="text.secondary" mb={0.5}>
                  퇴근 시간
                </Typography>
                <Typography variant="h5" fontWeight={600}>
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
                <Typography variant="subtitle1" color="text.secondary" mb={0.5}>
                  근무 상태
                </Typography>
                <Typography variant="h5" fontWeight={600} color="primary.main">
                  {workStatusMap[today?.workStatus] || '-'}
                </Typography>
              </Box>
            </Box>

            {/* ===== 버튼 영역 ===== */}
            <Stack direction="row" spacing={2} justifyContent="flex-end" mt={1}>
              <Button
                variant="outlined"
                color="info"
                onClick={handleClockIn}
                disabled={loading}
                sx={{ borderRadius: 2, width: isSmall ? 90 : 110, height: isSmall ? 35 : 40 }}
              >
                출근하기
              </Button>

              <Button
                variant="outlined"
                color="secondary"
                onClick={handleClockOut}
                disabled={loading}
                sx={{ borderRadius: 2, width: isSmall ? 90 : 110, height: isSmall ? 35 : 40 }}
              >
                퇴근하기
              </Button>

              <Button
                variant="outlined"
                color="primary"
                onClick={handleWorkStatusClick}
                sx={{ borderRadius: 2, width: isSmall ? 80 : 110, height: isSmall ? 35 : 40 }}
              >
                근무상태 변경
              </Button>

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
        </MainCard>
      </Box>
    </>
  );
}

AttendanceBasicCard.propTypes = { isLoading: PropTypes.bool };
