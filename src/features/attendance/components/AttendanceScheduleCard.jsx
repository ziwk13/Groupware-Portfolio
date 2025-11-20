// ==============================|| AttendanceScheduleCard.jsx ||============================== //
import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'store';
import { getEvents } from 'features/schedule/api/scheduleApi';
import MainCard from 'ui-component/cards/MainCard';
import { Typography, Box, Divider } from '@mui/material';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import useAuth from 'hooks/useAuth';
import { useNavigate } from 'react-router-dom';

dayjs.locale('ko');

export default function AttendanceScheduleCard() {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { events, loading } = useSelector((state) => state.schedule);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.employeeId) {
      dispatch(getEvents(user.employeeId));
    }
  }, [dispatch, user]);

  const startOfWeek = dayjs().startOf('week').add(1, 'day');
  const endOfWeek = startOfWeek.add(6, 'day');

  const thisWeekEvents = useMemo(() => {
    return events.filter((event) => {
      const start = dayjs(event.startTime);
      return start.isAfter(startOfWeek.startOf('day')) && start.isBefore(endOfWeek.endOf('day'));
    });
  }, [events]);

  // 카드 고정 높이
  const CARD_HEIGHT = 300;

  return (
    <MainCard
      title="이번 주 일정"
      sx={{
        height: CARD_HEIGHT,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        minHeight: 0,
        '& .MuiCardHeader-root': {
          px: 1.5,
          py: 1.7,
          alignItems: 'center'
        },
        '& .MuiCardHeader-title': {
          fontSize: '1.1rem',
          fontWeight: 700
        }
      }}
      contentSX={{
        p: 2,
        flex: 1,
        overflowY: 'auto',
        minHeight: 0
      }}
    >
      {loading ? (
        <Typography variant="body2" color="text.secondary">
          불러오는 중...
        </Typography>
      ) : thisWeekEvents.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          이번 주 등록된 일정이 없습니다.
        </Typography>
      ) : (
        thisWeekEvents.map((e, index) => (
          <Box key={e.scheduleId || index} sx={{ mb: 1 }}>
            <Typography
              variant="subtitle1"
              color="text.primary"
              sx={{ mb: 2, cursor: 'pointer', transition: 'color 0.2s ease' }}
              onClick={() => navigate(`/schedule?modal=edit&id=${e.scheduleId}`)}
            >
              {e.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {dayjs(e.startTime).format('MM/DD HH:mm')} ~ {dayjs(e.endTime).format('MM/DD HH:mm')}
            </Typography>
            {index < thisWeekEvents.length - 1 && <Divider sx={{ my: 1 }} />}
          </Box>
        ))
      )}
    </MainCard>
  );
}
