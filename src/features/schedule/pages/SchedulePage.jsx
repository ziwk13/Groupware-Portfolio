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
import Toolbar from 'features/schedule/components/Toolbar';
import AddEventForm from 'features/schedule/components/AddEventForm';
import CalendarStyled from 'features/schedule/components/CalendarStyled';
import Loader from 'ui-component/Loader';
import MainCard from 'ui-component/cards/MainCard';
import SubCard from 'ui-component/cards/SubCard';
import { dispatch, useSelector } from 'store';
import { getEvents, addEvent, updateEvent, deleteEvent } from 'features/schedule/api/scheduleApi';
import AddAlarmTwoToneIcon from '@mui/icons-material/AddAlarmTwoTone';
import { format } from 'date-fns';
import useAuth from 'hooks/useAuth';
import { Alert, Grid, Box, Typography } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import koLocale from '@fullcalendar/core/locales/ko';

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

  const modalType = searchParams.get('modal');
  const modalId = searchParams.get('id');
  const isModalOpen = Boolean(modalType);

  const openAddModal = () => navigate('/schedule?modal=add', { replace: false });
  const openEditModal = (id) => navigate(`/schedule?modal=edit&id=${id}`, { replace: false });
  const closeModal = () => navigate('/schedule', { replace: true });

  const canEdit = (evOrCalendarEvent) => {
    const creatorId = evOrCalendarEvent?.extendedProps?.employeeId ?? evOrCalendarEvent?.employeeId ?? null;
    return creatorId === employeeId;
  };

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

  useEffect(() => {
    if (employeeId) dispatch(getEvents(employeeId));
  }, [employeeId]);

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

  const handleRangeSelect = (arg) => {
    calendarRef.current?.getApi().unselect();
    setSelectedRange({ start: arg.start, end: arg.end });
    setSelectedEvent(null);
    openAddModal();
  };

  const handleEventSelect = (arg) => {
    openEditModal(arg.event.id);
  };

  const handleEventUpdate = async (argOrId, maybeData) => {
    let scheduleId;
    let payload;

    if (argOrId?.event) {
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {statusMessage && (
            <Alert
              severity={
                statusMessage.includes('실패') || statusMessage.includes('에러') || statusMessage.includes('오류') ? 'error' : 'success'
              }
              sx={{ p: 0.5, px: 1.5, fontSize: '0.875rem', whiteSpace: 'nowrap' }}
            >
              {statusMessage}
            </Alert>
          )}
          <Button color="secondary" variant="contained" onClick={openAddModal}>
            <AddAlarmTwoToneIcon fontSize="small" style={{ marginRight: 6 }} />
            일정 추가
          </Button>
        </Box>
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
            locale={koLocale}
            events={events.map((e) => {
              const categoryColorMap = {
                회의: '#42A5F5',
                출장: '#66BB6A',
                휴가: '#F4A460',
                프로젝트: '#AB47BC',
                기타: '#9E9E9E'
              };

              const color = categoryColorMap[e.categoryName] || '#60A5FA';

              return {
                id: e.scheduleId,
                title: e.title,
                start: new Date(e.startTime),
                end: new Date(e.endTime),
                backgroundColor: color,
                borderColor: color,
                textColor: '#fff',
                display: 'block',
                extendedProps: {
                  content: e.content,
                  employeeId: e.employeeId,
                  categoryName: e.categoryName
                }
              };
            })}
            eventDidMount={(info) => {
              const color = info.event.backgroundColor;
              info.el.style.setProperty('background-color', color, 'important');
              info.el.style.setProperty('border-color', color, 'important');
              info.el.style.setProperty('color', '#fff', 'important');
            }}
            eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
            selectable
            editable
            weekends
            height={matchSm ? 'auto' : 720}
            headerToolbar={false}
            select={handleRangeSelect}
            eventDrop={(info) => {
              const ev = info.event;
              const isVacation = ev.extendedProps?.categoryName === '휴가';
              if (isVacation) {
                info.revert();
                return;
              }
              handleEventUpdate(info);
            }}
            eventResize={(info) => {
              const ev = info.event;
              const isVacation = ev.extendedProps?.categoryName === '휴가';
              if (isVacation) {
                info.revert();
                return;
              }

              handleEventUpdate(info);
            }}
            eventAllow={(dropInfo, draggedEvent) => {
              const isVacation = draggedEvent.extendedProps?.categoryName === '휴가';
              if (isVacation) return false;
              return canEdit(draggedEvent);
            }}
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
