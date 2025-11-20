import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'store';
import { Box, Typography, IconButton, Stack, Button } from '@mui/material';
import { fetchSelectedWeekAttendance, fetchAbsentDays, fetchHolidays } from 'features/attendance/api/attendanceApi';
import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import MainCard from 'ui-component/cards/MainCard';
import useAuth from 'hooks/useAuth';

export default function AttendanceWeekViewCard({ employeeId: propEmployeeId }) {
  const dispatch = useDispatch();
  dayjs.extend(weekday);

  const { selectedWeek, absentDays, holidays, today } = useSelector((state) => state.attendance);
  const { isLoggedIn, isRefreshing, isInitialized, user } = useAuth();

  const holidayCache = useRef({}); // 월 단위 공휴일 캐싱

  const employeeId = useMemo(() => propEmployeeId || user?.employeeId, [propEmployeeId, user?.employeeId]);

  const getThisMonday = () => {
    const today = dayjs();
    const day = today.day();
    const diff = day === 0 ? 6 : day - 1;
    return today.subtract(diff, 'day').format('YYYY-MM-DD');
  };

  const [weekStart, setWeekStart] = useState(getThisMonday());

  const handlePrevWeek = () => setWeekStart(dayjs(weekStart).subtract(7, 'day').format('YYYY-MM-DD'));
  const handleNextWeek = () => setWeekStart(dayjs(weekStart).add(7, 'day').format('YYYY-MM-DD'));
  const handleCurrentWeek = () => setWeekStart(getThisMonday());

  // ---------------------- API 호출 최적화 ----------------------
  useEffect(() => {
    if (!isInitialized || !isLoggedIn || isRefreshing) return;
    if (!employeeId || !weekStart) return;

    dispatch(fetchSelectedWeekAttendance({ employeeId, weekStart }));

    const year = Number(weekStart.substring(0, 4));
    const month = Number(weekStart.substring(5, 7));
    const key = `${year}-${month}`;

    // 공휴일 캐시가 없을 때만 호출
    if (!holidayCache.current[key]) {
      dispatch(fetchHolidays({ year, month })).then((res) => {
        if (res?.payload) holidayCache.current[key] = res.payload;
      });
    }

    dispatch(fetchAbsentDays({ employeeId, year, month }));
  }, [dispatch, employeeId, weekStart, isInitialized, isLoggedIn, isRefreshing, today]);

  // ---------------------- 공휴일 매핑(useMemo) ----------------------
  const holidayMap = useMemo(() => {
    const year = Number(weekStart.substring(0, 4));
    const month = Number(weekStart.substring(5, 7));
    const key = `${year}-${month}`;

    const data = holidayCache.current[key];
    if (!data) return {};

    const map = {};
    data.forEach((h) => {
      const str = String(h.locdate);
      const date = `${str.substring(0, 4)}-${str.substring(4, 6)}-${str.substring(6, 8)}`;
      map[date] = h.dateName;
    });

    return map;
  }, [weekStart]);

  const records = useMemo(() => selectedWeek?.records || [], [selectedWeek]);

  // ---------------------- 요일 데이터 useMemo 최적화 ----------------------
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = dayjs(weekStart).add(i, 'day');
      const dateStr = date.format('YYYY-MM-DD');

      const record = records.find((r) => dayjs(r.attendanceDate).isSame(date, 'day'));

      const start = record?.startTime ? dayjs(record.startTime).format('HH:mm') : null;
      const end = record?.endTime ? dayjs(record.endTime).format('HH:mm') : null;

      const totalMinutes = record?.startTime && record?.endTime ? dayjs(record.endTime).diff(dayjs(record.startTime), 'minute') : 0;

      const total = totalMinutes > 0 ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m` : null;

      const holidayName = holidayMap[dateStr];
      const isPublicHoliday = Boolean(holidayName);

      return {
        date,
        dateStr,
        label: `${date.date()}일 (${['일', '월', '화', '수', '목', '금', '토'][date.day()]})`,
        start,
        end,
        total,
        isVacation: record?.workStatus === 'VACATION',
        isWorkHoliday: record?.workStatus === 'HOLIDAY',
        isAbsent: !record && !isPublicHoliday && absentDays?.includes(dateStr),

        holidayName,
        isPublicHoliday,
        isSunday: date.day() === 0
      };
    });
  }, [weekStart, records, absentDays, holidayMap]);

  const monday = dayjs(weekStart);
  const sunday = dayjs(weekStart).add(6, 'day');

  if (!isInitialized || isRefreshing) {
    return <MainCard title="주간 근무 현황" sx={{ p: 3, textAlign: 'center' }} />;
  }

  return (
    <MainCard title="주간 근무 현황" sx={{ borderRadius: 2, p: 3 }}>
      {/* 상단 네비게이션 */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton onClick={handlePrevWeek}>
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>

          <Typography variant="h5">
            {monday.format('YYYY.MM.DD')} ~ {sunday.format('YYYY.MM.DD')}
          </Typography>

          <IconButton onClick={handleNextWeek}>
            <ArrowForwardIosIcon fontSize="small" />
          </IconButton>
        </Stack>

        <Button onClick={handleCurrentWeek} sx={{ fontWeight: 600 }}>
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
          border: '1px solid'
        }}
      >
        {weekDays.map((day, i) => (
          <Box
            key={i}
            sx={{
              p: 2,
              textAlign: 'center',
              borderRight: i !== 6 ? '1px dashed' : 'none',
              minHeight: 110
            }}
          >
            {/* 날짜 */}
            <Typography
              variant="subtitle1"
              fontWeight={600}
              sx={{
                color: day.isSunday || day.isPublicHoliday ? 'error.main' : 'text.secondary'
              }}
            >
              {day.label}
            </Typography>

            {/* 공휴일 */}
            {day.isPublicHoliday && (
              <Typography sx={{ mt: 0.3, color: 'error.main', fontSize: '0.9rem', fontWeight: 600 }}>{day.holidayName}</Typography>
            )}

            {/* 상태 출력 */}
            {day.isVacation && <Typography sx={{ mt: 1, fontSize: '0.9rem', color: 'info.main', fontWeight: 600 }}>연차</Typography>}

            {day.isWorkHoliday && <Typography sx={{ mt: 1, fontSize: '0.9rem', color: 'warning.main', fontWeight: 600 }}>휴일</Typography>}

            {day.isAbsent && <Typography sx={{ mt: 1, fontSize: '0.9rem', color: 'error.main', fontWeight: 600 }}>결근</Typography>}

            {day.start || day.end ? (
              <Box sx={{ mt: 1, fontSize: '0.9rem' }}>
                <Typography>출 : {day.start}</Typography>
                <Typography>퇴 : {day.end}</Typography>
                <Typography>총 : {day.total}</Typography>
              </Box>
            ) : (
              !day.isPublicHoliday && !day.isVacation && !day.isAbsent && <Box sx={{ height: '3.2rem' }} />
            )}
          </Box>
        ))}
      </Box>
    </MainCard>
  );
}
