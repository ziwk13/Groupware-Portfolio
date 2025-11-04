import PropTypes from 'prop-types';
import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  FormHelperText,
  Grid as Grid, // ✅ Berry Template에서 size prop 지원 버전
  IconButton,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Autocomplete,
  Chip,
  List,
  ListItem,
  ListItemText,
  Typography
} from '@mui/material';
import { LocalizationProvider, MobileDateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import * as Yup from 'yup';
import { useFormik, Form, FormikProvider } from 'formik';
import { useEffect, useState } from 'react';
import { gridSpacing } from 'store/constant';
import DateRangeIcon from '@mui/icons-material/DateRange';
import DeleteIcon from '@mui/icons-material/Delete';
import { dispatch } from 'store';
import axios from 'utils/axios';
import { inviteParticipants } from '../slices/scheduleSlice';
import useAuth from 'hooks/useAuth';

// ==============================|| ADD / EDIT EVENT FORM ||============================== //

function getInitialValues(event, range) {
  const now = new Date();
  const toDate = (v) => (v ? new Date(v) : null);
  return {
    title: event?.title || '',
    content: event?.content || '',
    allDay: event?.allDay || false,
    startTime: toDate(event?.startTime) || toDate(range?.start) || now,
    endTime: toDate(event?.endTime) || toDate(range?.end) || now,
    selectedParticipants: []
  };
}

export default function AddEventForm({ event, range, handleDelete, handleCreate, handleUpdate, onCancel, employeeId }) {
  const isCreating = !event;
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [participants, setParticipants] = useState([]);
  const { user } = useAuth();
  const loggedInId = user?.employeeId;
  const isHost = event && Number(event.employeeId) === Number(loggedInId);

  // 직원 목록 불러오기
  useEffect(() => {
    const fetchEmployees = async () => {
      const res = await axios.get('/api/schedules/employees');
      const all = res.data?.data || [];
      const filtered = employeeId ? all.filter((emp) => emp.employeeId !== employeeId) : all;
      setEmployeeOptions(filtered);
    };
    fetchEmployees();
  }, [employeeId]);

  // 참여자 목록 불러오기
  useEffect(() => {
    const fetchParticipants = async () => {
      const id = event?.scheduleId || event?.id;
      if (!id) return;
      try {
        const res = await axios.get(`/api/schedules/${id}/participants`);
        setParticipants(res.data?.data || []);
      } catch {
        setParticipants([]);
      }
    };
    fetchParticipants();
  }, [event]);

  const EventSchema = Yup.object().shape({
    title: Yup.string().max(255).required('Title is required'),
    content: Yup.string().max(5000),
    endTime: Yup.date().when('startTime', (start, schema) => (start ? schema.min(start, 'End date must be later than start date') : schema))
  });

  const formik = useFormik({
    initialValues: getInitialValues(event, range),
    validationSchema: EventSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        const data = {
          title: values.title,
          content: values.content,
          allDay: values.allDay,
          startTime: values.startTime,
          endTime: values.endTime
        };

        let scheduleId;
        if (event) {
          scheduleId = event.scheduleId || event.id;
          if (!isHost) {
            alert('이 일정은 작성자만 수정할 수 있습니다.');
            setSubmitting(false);
            return;
          }
          await handleUpdate(scheduleId, data);
        } else {
          const created = await handleCreate(data);
          scheduleId = created?.scheduleId;
        }

        if (scheduleId && values.selectedParticipants?.length > 0) {
          const ids = values.selectedParticipants.map((p) => p.employeeId);
          await dispatch(inviteParticipants(scheduleId, ids));
        }

        resetForm();
        onCancel();
      } catch (error) {
        console.error(error);
      } finally {
        setSubmitting(false);
      }
    }
  });

  const { values, errors, touched, handleSubmit, isSubmitting, getFieldProps, setFieldValue } = formik;

  const handleDeleteClick = () => {
    if (!event) return;
    if (!isHost) {
      alert('이 일정은 작성자만 삭제할 수 있습니다.');
      return;
    }
    if (window.confirm('정말로 이 일정을 삭제하시겠습니까?')) {
      handleDelete(event.scheduleId || event.id);
    }
  };

  return (
    <FormikProvider value={formik}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
          <DialogTitle>{event ? 'Edit Event' : 'Add Event'}</DialogTitle>
          <Divider />
          <DialogContent sx={{ p: 3 }}>
            <Grid container spacing={gridSpacing}>
              {/* 제목 */}
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Title"
                  {...getFieldProps('title')}
                  InputProps={{ readOnly: event && !isHost }}
                  error={Boolean(touched.title && errors.title)}
                  helperText={touched.title && errors.title}
                />
              </Grid>

              {/* 내용 */}
              <Grid size={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  {...getFieldProps('content')}
                  InputProps={{ readOnly: event && !isHost }}
                  error={Boolean(touched.content && errors.content)}
                  helperText={touched.content && errors.content}
                />
              </Grid>

              {/* 참석자 선택 */}
              <Grid size={12}>
                <Autocomplete
                  multiple
                  options={employeeOptions}
                  getOptionLabel={(option) => option.username || ''}
                  value={values.selectedParticipants}
                  onChange={(e, val) => (isCreating || isHost) && setFieldValue('selectedParticipants', val)}
                  renderTags={(tagValue, getTagProps) =>
                    tagValue.map((option, index) => <Chip key={option.employeeId} label={option.username} {...getTagProps({ index })} />)
                  }
                  renderInput={(params) => <TextField {...params} label="참석자 선택" placeholder="직원 검색" />}
                />
              </Grid>

              {/* All Day */}
              <Grid size={12}>
                <FormControlLabel
                  control={<Switch checked={values.allDay} {...getFieldProps('allDay')} disabled={event && !isHost} />}
                  label="All day"
                />
              </Grid>

              {/* 시작 날짜 */}
              <Grid size={{ xs: 12, md: 6 }}>
                <MobileDateTimePicker
                  label="Start date"
                  value={values.startTime}
                  format="yyyy-MM-dd HH:mm"
                  onChange={(d) => (isCreating || isHost) && setFieldValue('startTime', d)}
                  slots={{ openPickerIcon: () => <DateRangeIcon /> }}
                  slotProps={{ textField: { fullWidth: true, disabled: event && !isHost } }}
                />
              </Grid>

              {/* 종료 날짜 */}
              <Grid size={{ xs: 12, md: 6 }}>
                <MobileDateTimePicker
                  label="End date"
                  value={values.endTime}
                  format="yyyy-MM-dd HH:mm"
                  onChange={(d) => (isCreating || isHost) && setFieldValue('endTime', d)}
                  slots={{ openPickerIcon: () => <DateRangeIcon /> }}
                  slotProps={{ textField: { fullWidth: true, disabled: event && !isHost } }}
                />
              </Grid>

              {/* 참여자 목록 */}
              {!isCreating && participants.length > 0 && (
                <Grid size={12} sx={{ mt: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    참여자 목록
                  </Typography>
                  <List dense>
                    {participants.map((p) => (
                      <ListItem key={p.participantId}>
                        <ListItemText
                          primary={`${p.participantUserName ?? p.participantName} (${
                            (p.participantStatusName || '').replace(/^참여\s*상태\s*-\s*/, '') || '상태 없음'
                          })`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              )}
            </Grid>
          </DialogContent>

          {/* 하단 버튼 */}
          <DialogActions sx={{ p: 3 }}>
            <Grid container sx={{ justifyContent: 'space-between', alignItems: 'center', width: 1 }}>
              <Grid>
                {isHost && !isCreating && (
                  <Tooltip title="Delete Event">
                    <IconButton onClick={handleDeleteClick} size="large" disabled={isSubmitting}>
                      <DeleteIcon color="error" />
                    </IconButton>
                  </Tooltip>
                )}
              </Grid>
              <Grid>
                <Stack direction="row" sx={{ alignItems: 'center', gap: 2 }}>
                  <Button type="button" variant="outlined" onClick={onCancel}>
                    Cancel
                  </Button>
                  {(!event || isHost) && (
                    <Button type="submit" variant="contained" disabled={isSubmitting}>
                      {event ? 'Edit' : 'Add'}
                    </Button>
                  )}
                </Stack>
              </Grid>
            </Grid>
          </DialogActions>
        </Form>
      </LocalizationProvider>
    </FormikProvider>
  );
}

AddEventForm.propTypes = {
  event: PropTypes.any,
  range: PropTypes.any,
  handleDelete: PropTypes.func,
  handleCreate: PropTypes.func,
  handleUpdate: PropTypes.func,
  onCancel: PropTypes.func,
  employeeId: PropTypes.any
};
