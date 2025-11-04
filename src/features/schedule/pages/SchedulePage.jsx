import { useEffect, useRef, useState } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import FullCalendar from '@fullcalendar/react';
import listPlugin from '@fullcalendar/list';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import timelinePlugin from '@fullcalendar/timeline';
import interactionPlugin from '@fullcalendar/interaction';
import Toolbar from '../components/Toolbar';
import AddEventForm from '../components/AddEventForm';
import CalendarStyled from '../components/CalendarStyled';
import Loader from 'ui-component/Loader';
import MainCard from 'ui-component/cards/MainCard';
import SubCard from 'ui-component/cards/SubCard';
import { dispatch, useSelector } from 'store';
import { getEvents, addEvent, updateEvent, deleteEvent } from '../slices/scheduleSlice';
import AddAlarmTwoToneIcon from '@mui/icons-material/AddAlarmTwoTone';
import { format } from 'date-fns';

// 서버(LocalDateTime) 포맷: 타임존 없이 2025-11-03T15:00:00
const fmtLocal = (d) => (d ? format(new Date(d), "yyyy-MM-dd'T'HH:mm:ss") : null);

export default function Calendar({ employeeId }) {
  const calendarRef = useRef(null);
  const matchSm = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const { events, loading, error } = useSelector((state) => state.schedule);

  const [date, setDate] = useState(new Date());
  const [view, setView] = useState(matchSm ? 'listWeek' : 'dayGridMonth');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    dispatch(getEvents());
  }, []);

  // 날짜/뷰 제어
  const handleDateToday = () => {
    const api = calendarRef.current?.getApi();
    api?.today();
    setDate(api?.getDate() ?? new Date());
  };

  const handleViewChange = (newView) => {
    const api = calendarRef.current?.getApi();
    api?.changeView(newView);
    setView(newView);
  };

  useEffect(() => {
    const api = calendarRef.current?.getApi();
    const newView = matchSm ? 'listWeek' : 'dayGridMonth';
    if (api && api.view?.type !== newView) {
      api.changeView(newView);
      setView(newView);
    }
  }, [matchSm]);

  const handleDatePrev = () => {
    const api = calendarRef.current?.getApi();
    api?.prev();
    setDate(api?.getDate() ?? new Date());
  };
  const handleDateNext = () => {
    const api = calendarRef.current?.getApi();
    api?.next();
    setDate(api?.getDate() ?? new Date());
  };

  // 새 범위 선택
  const handleRangeSelect = (arg) => {
    calendarRef.current?.getApi().unselect();
    setSelectedRange({ start: arg.start, end: arg.end });
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  // 이벤트 클릭(수정 모달)
  const handleEventSelect = (arg) => {
    const found = events.find((e) => e.scheduleId === Number(arg.event.id));
    setSelectedEvent(found ?? null);
    setSelectedRange(null);
    setIsModalOpen(true);
  };

  //  수정(모달 or 드래그/리사이즈)
  const handleEventUpdate = (argOrId, maybeData) => {
    let scheduleId;
    let payload;

    //  case 1: FullCalendar 드래그/리사이즈
    if (argOrId?.event) {
      const e = argOrId.event;
      scheduleId = Number(e.id);

      //  기존 이벤트 데이터 유지 (description 등)
      const existing = events.find((ev) => ev.scheduleId === scheduleId);

      payload = {
        ...existing, // content, categoryCode 등 유지
        title: e.title,
        startTime: fmtLocal(e.start),
        endTime: fmtLocal(e.end || e.start)
      };
    }
    // case 2: 모달(EditForm)
    else {
      scheduleId = Number(argOrId);
      payload = {
        ...maybeData,
        startTime: fmtLocal(maybeData.startTime),
        endTime: fmtLocal(maybeData.endTime || maybeData.startTime)
      };
    }

    if (!scheduleId || !payload?.startTime) return;
    dispatch(updateEvent(scheduleId, payload));
    handleModalClose();
  };

  // 생성
  const handleEventCreate = (data) => {
    const payload = {
      title: data.title,
      content: data.content,
      categoryCode: data.categoryCode || 'MEETING',
      employeeId: employeeId || 1,
      startTime: fmtLocal(data.startTime),
      endTime: fmtLocal(data.endTime || data.startTime),
      isDeleted: false
    };
    dispatch(addEvent(payload));
    handleModalClose();
  };

  // 삭제
  const handleEventDelete = (scheduleId) => {
    dispatch(deleteEvent(scheduleId));
    handleModalClose();
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
    setSelectedRange(null);
  };

  if (loading) return <Loader />;
  if (error) return <div style={{ padding: 20, color: 'red' }}>❌ 일정 로드 중 오류: {error.message}</div>;

  return (
    <MainCard
      title="일정 관리"
      secondary={
        <Button color="secondary" variant="contained" onClick={() => setIsModalOpen(true)}>
          <AddAlarmTwoToneIcon fontSize="small" sx={{ mr: 0.75 }} />
          일정 추가
        </Button>
      }
    >
      <CalendarStyled>
        <Toolbar
          date={date}
          view={view}
          onClickNext={handleDateNext}
          onClickPrev={handleDatePrev}
          onClickToday={handleDateToday}
          onChangeView={handleViewChange}
        />

        <SubCard>
          <FullCalendar
            ref={calendarRef}
            plugins={[listPlugin, dayGridPlugin, timelinePlugin, timeGridPlugin, interactionPlugin]}
            initialView={view}
            initialDate={date}
            timeZone="local"
            events={events.map((e) => ({
              id: e.scheduleId,
              title: e.title,
              start: new Date(e.startTime),
              end: new Date(e.endTime),
              backgroundColor: e.colorCode || '#60A5FA',
              extendedProps: { content: e.content } // ✅ description 유지용
            }))}
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false // ✅ 24시간제 표시
            }}
            selectable
            editable
            weekends
            height={matchSm ? 'auto' : 720}
            headerToolbar={false}
            select={handleRangeSelect}
            eventDrop={handleEventUpdate}
            eventResize={handleEventUpdate}
            eventClick={handleEventSelect}
          />
        </SubCard>
      </CalendarStyled>

      <Dialog maxWidth="sm" fullWidth open={isModalOpen} onClose={handleModalClose} slotProps={{ paper: { sx: { p: 0 } } }}>
        {isModalOpen && (
          <AddEventForm
            key={selectedEvent?.scheduleId ?? 'new'} // ✅ 새로운 일정이면 완전 새 Form 인스턴스
            event={selectedEvent}
            range={selectedRange}
            onCancel={handleModalClose}
            handleCreate={handleEventCreate}
            handleDelete={handleEventDelete}
            handleUpdate={handleEventUpdate}
          />
        )}
      </Dialog>
    </MainCard>
  );
}
