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
import { Alert, Grid } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';

// 서버(LocalDateTime) 포맷
const fmtLocal = (d) => (d ? format(new Date(d), "yyyy-MM-dd'T'HH:mm:ss") : null);

export default function Calendar() {
  const calendarRef = useRef(null);
  const matchSm = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const { events, loading, error } = useSelector((state) => state.schedule);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [date, setDate] = useState(new Date());
  const [view, setView] = useState(matchSm ? 'listWeek' : 'dayGridMonth');
  const [selectedRange, setSelectedRange] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  const { user } = useAuth();
  const employeeId = user?.employeeId;

  // URL 단일원본
  const modalType = searchParams.get('modal'); // 'add' | 'edit' | null
  const modalId = searchParams.get('id');
  const isModalOpen = Boolean(modalType);

  const openAddModal = () => navigate('/schedule?modal=add', { replace: false });
  const openEditModal = (id) => navigate(`/schedule?modal=edit&id=${id}`, { replace: false });
  const closeModal = () => navigate('/schedule', { replace: true });

  const canEdit = (evOrCalendarEvent) => {
    const creatorId = evOrCalendarEvent?.extendedProps?.employeeId ?? evOrCalendarEvent?.employeeId ?? null;
    return Number(creatorId) === Number(employeeId);
  };

  // 일정 생성
  const handleEventCreate = async (data) => {
    const payload = {
      title: data.title,
      content: data.content,
      categoryCode: data.categoryCode || 'SC01',
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

  // URL 파라미터와 events를 기반으로 선택 상태 세팅
  useEffect(() => {
    if (!modalType) {
      setSelectedEvent(null);
      setSelectedRange(null);
      return;
    }
    if (modalType === 'edit' && modalId && events?.length) {
      const found = events.find((e) => e.scheduleId === Number(modalId));
      setSelectedEvent(found ?? null);
      setSelectedRange(null);
    }
    if (modalType === 'add') {
      setSelectedEvent(null);
      if (!selectedRange) setSelectedRange(null);
    }
  }, [modalType, modalId, events]);

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
    openAddModal();
  };

  // 이벤트 클릭 (모달 열기)
  const handleEventSelect = (arg) => {
    openEditModal(arg.event.id);
  };

  // 일정 수정 (드래그, 리사이즈 포함 + 폼 저장 공통)
  const handleEventUpdate = async (argOrId, maybeData) => {
    let scheduleId;
    let payload;

    if (argOrId?.event) {
      // === 드래그/리사이즈 경로 ===
      const e = argOrId.event;
      scheduleId = Number(e.id);
      const existing = events.find((ev) => ev.scheduleId === scheduleId);

      if (!canEdit(e)) {
        alert('이 일정은 작성자만 수정할 수 있습니다.');
        argOrId.revert?.();
        return;
      }

      const existingCategoryCode = existing?.categoryCode ?? e.extendedProps?.categoryCode;

      payload = {
        title: e.title ?? existing?.title,
        startTime: fmtLocal(e.start),
        endTime: fmtLocal(e.end || e.start),
        categoryCode: existingCategoryCode
      };

      await dispatch(updateEvent(scheduleId, payload));
      return;
    } else {
      // === 폼 저장 경로 ===
      scheduleId = Number(argOrId);
      payload = {
        ...maybeData,
        startTime: fmtLocal(maybeData.startTime),
        endTime: fmtLocal(maybeData.endTime || maybeData.startTime)
      };
    }

    if (!scheduleId || !payload?.startTime) return;
    await dispatch(updateEvent(scheduleId, payload));
    closeModal();
  };

  // 일정 삭제
  const handleEventDelete = async (scheduleId) => {
    await dispatch(deleteEvent(scheduleId));
    closeModal();
  };

  if (loading) return <Loader />;
  if (error) return <div style={{ padding: 20, color: 'red' }}>❌ 일정 로드 중 오류: {error.message}</div>;

  return (
    <MainCard
      title="일정 관리"
      secondary={
        <Button color="secondary" variant="contained" onClick={openAddModal}>
          <AddAlarmTwoToneIcon fontSize="small" style={{ marginRight: 6 }} />
          일정 추가
        </Button>
      }
    >
      {statusMessage && (
        <Grid item xs={12}>
          <Alert
            severity={
              statusMessage.includes('실패') || statusMessage.includes('에러') || statusMessage.includes('오류') ? 'error' : 'success'
            }
            sx={{ width: '100%', mb: 2 }}
          >
            {statusMessage}
          </Alert>
        </Grid>
      )}

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
                employeeId: e.employeeId,
                categoryCode: e.categoryCode
              }
            }))}
            eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
            selectable
            editable
            weekends
            height={matchSm ? 'auto' : 720}
            headerToolbar={false}
            select={handleRangeSelect}
            eventDrop={handleEventUpdate}
            eventResize={handleEventUpdate}
            eventAllow={(dropInfo, draggedEvent) => canEdit(draggedEvent)}
            eventClick={handleEventSelect}
          />
        </SubCard>
      </CalendarStyled>

      <Dialog maxWidth="sm" fullWidth open={isModalOpen} onClose={closeModal} slotProps={{ paper: { sx: { p: 0 } } }}>
        {isModalOpen && (
          <AddEventForm
            key={selectedEvent?.scheduleId ?? 'new'}
            event={selectedEvent}
            range={selectedRange}
            onCancel={closeModal}
            handleCreate={handleEventCreate}
            handleDelete={handleEventDelete}
            handleUpdate={handleEventUpdate}
            employeeId={employeeId}
            setStatusMessage={setStatusMessage}
          />
        )}
      </Dialog>
    </MainCard>
  );
}
