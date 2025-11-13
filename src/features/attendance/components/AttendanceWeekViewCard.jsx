import React, { useMemo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'store';
import { Box, Typography, IconButton, Stack, Button } from '@mui/material';
import { fetchSelectedWeekAttendance } from 'features/attendance/api/attendanceApi';
import dayjs from 'dayjs';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import MainCard from 'ui-component/cards/MainCard';
import useAuth from 'hooks/useAuth';

export default function AttendanceWeekViewCard({ employeeId: propEmployeeId }) {
  const dispatch = useDispatch();
  const { selectedWeek, loading, today } = useSelector((state) => state.attendance);
  const { isLoggedIn, isRefreshing, isInitialized, user } = useAuth();

  const employeeId = useMemo(() => propEmployeeId || user?.employeeId, [propEmployeeId, user?.employeeId]);

  // 기준 주차 (월요일 시작)
  const [weekStart, setWeekStart] = useState(dayjs().startOf('week').add(1, 'day').format('YYYY-MM-DD'));

  const handlePrevWeek = () => setWeekStart(dayjs(weekStart).subtract(7, 'day').format('YYYY-MM-DD'));
  const handleNextWeek = () => setWeekStart(dayjs(weekStart).add(7, 'day').format('YYYY-MM-DD'));
  const handleCurrentWeek = () => setWeekStart(dayjs().startOf('week').add(1, 'day').format('YYYY-MM-DD'));

  useEffect(() => {
    if (isInitialized && isLoggedIn && !isRefreshing && employeeId && weekStart) {
      dispatch(fetchSelectedWeekAttendance({ employeeId, weekStart }));
    }
  }, [dispatch, employeeId, weekStart, isInitialized, isLoggedIn, isRefreshing, today]);

  const records = useMemo(() => (selectedWeek?.records ? selectedWeek.records : []), [selectedWeek]);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = dayjs(weekStart).add(i, 'day');
    const record = records.find((r) => dayjs(r.attendanceDate).isSame(date, 'day'));

    const start = record?.startTime ? dayjs(record.startTime).format('HH:mm') : null;
    const end = record?.endTime ? dayjs(record.endTime).format('HH:mm') : null;
    const totalMinutes = record?.startTime && record?.endTime ? dayjs(record.endTime).diff(dayjs(record.startTime), 'minute') : 0;
    const total = totalMinutes > 0 ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m` : null;

    const isVacation = record?.workStatus === 'VACATION';
    const isHoliday = record?.workStatus === 'HOLIDAY';

    return {
      date,
      label: `${date.date()}일 (${['일', '월', '화', '수', '목', '금', '토'][date.day()]})`,
      start,
      end,
      total,
      isVacation,
      isHoliday
    };
  });

  const monday = dayjs(weekStart);
  const sunday = dayjs(weekStart).add(6, 'day');

  if (!isInitialized || isRefreshing) {
    return (
      <MainCard
        title="주간 근무 현황"
        sx={{
          borderRadius: 2,
          p: 3,
          textAlign: 'center'
        }}
      />
    );
  }

  return (
    <MainCard
      title="주간 근무 현황"
      sx={{
        borderRadius: 2,
        p: 3
      }}
    >
      {/* ===== 상단 네비게이션 ===== */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2, mt: 1 }}>
        {/* 왼쪽: 주차 이동 버튼 */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton onClick={handlePrevWeek} color="inherit">
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>

          <Typography variant="h5" fontWeight={500}>
            {monday.format('YYYY.MM.DD')} ~ {sunday.format('YYYY.MM.DD')}
          </Typography>

          <IconButton onClick={handleNextWeek} color="inherit">
            <ArrowForwardIosIcon fontSize="small" />
          </IconButton>
        </Stack>

        {/* 오른쪽: 오늘 버튼 */}
        <Button
          onClick={handleCurrentWeek}
          color="primary"
          sx={{
            fontWeight: 600,
            fontSize: '0.95rem',
            '&:hover': { textDecoration: 'underline' }
          }}
        >
          오늘
        </Button>
      </Stack>

      {/* 주간 표 */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          borderRadius: 2,
          overflow: 'hidden',
          border: `1px solid`
        }}
      >
        {weekDays.map((day, i) => (
          <Box
            key={i}
            sx={{
              p: 2,
              textAlign: 'center',
              borderRight: i !== 6 ? `1px dashed` : 'none',
              minHeight: 100
            }}
          >
            <Typography variant="subtitle1" color="text.secondary" fontWeight={500} mb={0.5}>
              {day.label}
            </Typography>

            {day.isVacation ? (
              <Typography variant="h6" color="info.main" fontWeight={600} mt={1}>
                연차
              </Typography>
            ) : day.isHoliday ? (
              <Typography variant="h6" color="warning.main" fontWeight={600} mt={1}>
                휴일
              </Typography>
            ) : day.start || day.end ? (
              <Box sx={{ mt: 1, fontSize: '0.9rem', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                <Typography color="text.primary">출 : {day.start || '-'}</Typography>
                <Typography color="text.primary">퇴 : {day.end || ''}</Typography>
                <Typography color="text.primary">총 : {day.total || ''}</Typography>
              </Box>
            ) : (
              <Box sx={{ height: '3.2rem' }} />
            )}
          </Box>
        ))}
      </Box>
    </MainCard>
  );
}
