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
import useAuth from 'hooks/useAuth';

// 서버(LocalDateTime) 포맷: 타임존 없이 2025-11-03T15:00:00
const fmtLocal = (d) => (d ? format(new Date(d), "yyyy-MM-dd'T'HH:mm:ss") : null);

export default function Calendar() {
  const calendarRef = useRef(null);
  const matchSm = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const { events, loading, error } = useSelector((state) => state.schedule);

  const [date, setDate] = useState(new Date());
  const [view, setView] = useState(matchSm ? 'listWeek' : 'dayGridMonth');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const { user } = useAuth();
  const employeeId = user?.employeeId;

  //  작성자만 수정 가능하도록 하는 함수
  const canEdit = (event) => {
    const creatorId = event.extendedProps?.employeeId || event.employeeId;
    return Number(creatorId) === Number(employeeId);
  };

  // 일정 생성
  const handleEventCreate = async (data) => {
    const payload = {
      title: data.title,
      content: data.content,
      categoryCode: data.categoryCode || 'MEETING',
      employeeId: employeeId || 1,
      startTime: fmtLocal(data.startTime),
      endTime: fmtLocal(data.endTime || data.startTime),
      isDeleted: false
    };

    const created = await dispatch(addEvent(payload));
    return created;
  };

  // 일정 불러오기
  useEffect(() => {
    if (employeeId) dispatch(getEvents(employeeId));
  }, [employeeId]);

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

  // 이벤트 클릭 (모달 열기)
  const handleEventSelect = (arg) => {
    const found = events.find((e) => e.scheduleId === Number(arg.event.id));
    setSelectedEvent(found ?? null);
    setSelectedRange(null);
    setIsModalOpen(true);
  };

  // 일정 수정 (드래그, 리사이즈 포함)
  const handleEventUpdate = (argOrId, maybeData) => {
    let scheduleId;
    let payload;

    if (argOrId?.event) {
      const e = argOrId.event;
      scheduleId = Number(e.id);
      const existing = events.find((ev) => ev.scheduleId === scheduleId);

      // 주최자만 드래그/리사이즈 허용
      if (!canEdit(e)) {
        alert('이 일정은 작성자만 수정할 수 있습니다.');
        argOrId.revert?.();
        return;
      }

      payload = {
        ...existing,
        title: e.title,
        startTime: fmtLocal(e.start),
        endTime: fmtLocal(e.end || e.start)
      };
    } else {
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

  // 일정 삭제
  const handleEventDelete = async (scheduleId) => {
    await dispatch(deleteEvent(scheduleId));
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
              extendedProps: {
                content: e.content,
                employeeId: e.employeeId //  작성자 ID 포함
              }
            }))}
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }}
            selectable
            editable
            weekends
            height={matchSm ? 'auto' : 720}
            headerToolbar={false}
            select={handleRangeSelect}
            eventDrop={handleEventUpdate}
            eventResize={handleEventUpdate}
            eventAllow={(dropInfo, draggedEvent) => canEdit(draggedEvent)} //  작성자만 이동 가능
            eventClick={handleEventSelect}
          />
        </SubCard>
      </CalendarStyled>

      <Dialog maxWidth="sm" fullWidth open={isModalOpen} onClose={handleModalClose} slotProps={{ paper: { sx: { p: 0 } } }}>
        {isModalOpen && (
          <AddEventForm
            key={selectedEvent?.scheduleId ?? 'new'}
            event={selectedEvent}
            range={selectedRange}
            onCancel={handleModalClose}
            handleCreate={handleEventCreate}
            handleDelete={handleEventDelete}
            handleUpdate={handleEventUpdate}
            employeeId={employeeId}
          />
        )}
      </Dialog>
    </MainCard>
  );
}
