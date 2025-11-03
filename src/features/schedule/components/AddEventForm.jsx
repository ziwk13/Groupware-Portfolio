import PropTypes from 'prop-types';
import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  FormHelperText,
  Grid as Grid,
  IconButton,
  Stack,
  Switch,
  TextField,
  Tooltip
} from '@mui/material';
import { LocalizationProvider, MobileDateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import * as Yup from 'yup';
import { useFormik, Form, FormikProvider } from 'formik';
import { useEffect } from 'react';
import { gridSpacing } from 'store/constant';
import DateRangeIcon from '@mui/icons-material/DateRange';
import DeleteIcon from '@mui/icons-material/Delete';

// ==============================|| ADD / EDIT EVENT FORM ||============================== //

// event / range → 초기값 계산
function getInitialValues(event, range) {
  const now = new Date();
  const toDate = (v) => (v ? new Date(v) : null);

  return {
    title: event?.title || '',
    content: event?.content || '',
    allDay: event?.allDay || false,
    startTime: toDate(event?.startTime) || toDate(range?.start) || now,
    endTime: toDate(event?.endTime) || toDate(range?.end) || now
  };
}

export default function AddEventForm({ event, range, handleDelete, handleCreate, handleUpdate, onCancel }) {
  const isCreating = !event;

  const EventSchema = Yup.object().shape({
    title: Yup.string().max(255).required('Title is required'),
    content: Yup.string().max(5000),
    endTime: Yup.date().when('startTime', (start, schema) =>
      start ? schema.min(start, 'End date must be later than start date') : schema
    ),
    startTime: Yup.date()
  });

  // ✅ enableReinitialize false로 설정 → 무한루프 방지
  const formik = useFormik({
    initialValues: getInitialValues(event, range),
    validationSchema: EventSchema,
    enableReinitialize: false,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        const data = {
          title: values.title,
          content: values.content,
          allDay: values.allDay,
          startTime: values.startTime,
          endTime: values.endTime
        };

        if (event) {
          handleUpdate(event.scheduleId || event.id, data);
        } else {
          handleCreate(data);
        }

        resetForm();
        onCancel();
        setSubmitting(false);
      } catch (error) {
        console.error('Submit error:', error);
        setSubmitting(false);
      }
    }
  });

  const { values, errors, touched, handleSubmit, isSubmitting, getFieldProps, setFieldValue, setValues } = formik;

  // ✅ event, range 바뀔 때만 값 리셋 (무한루프 방지)
  useEffect(() => {
    setValues(getInitialValues(event, range));
  }, [event, range, setValues]);

  const handleDeleteClick = () => {
    if (!event) return;
    const ok = window.confirm('정말로 이 일정을 삭제하시겠습니까?');
    if (ok) handleDelete(event.scheduleId || event.id);
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
                  error={Boolean(touched.content && errors.content)}
                  helperText={touched.content && errors.content}
                />
              </Grid>

              {/* All Day */}
              <Grid size={12}>
                <FormControlLabel control={<Switch checked={values.allDay} {...getFieldProps('allDay')} />} label="All day" />
              </Grid>

              {/* 시작 날짜 */}
              <Grid size={{ xs: 12, md: 6 }}>
                <MobileDateTimePicker
                  label="Start date"
                  value={values.startTime}
                  format="yyyy-MM-dd HH:mm"
                  onChange={(d) => setFieldValue('startTime', d)}
                  slots={{ openPickerIcon: () => <DateRangeIcon /> }}
                  slotProps={{ textField: { fullWidth: true } }}
                />
                {touched.startTime && errors.startTime && <FormHelperText error>{errors.startTime}</FormHelperText>}
              </Grid>

              {/* 종료 날짜 */}
              <Grid size={{ xs: 12, md: 6 }}>
                <MobileDateTimePicker
                  label="End date"
                  value={values.endTime}
                  format="yyyy-MM-dd HH:mm"
                  onChange={(d) => setFieldValue('endTime', d)}
                  slots={{ openPickerIcon: () => <DateRangeIcon /> }}
                  slotProps={{ textField: { fullWidth: true } }}
                />
                {touched.endTime && errors.endTime && <FormHelperText error>{errors.endTime}</FormHelperText>}
              </Grid>
            </Grid>
          </DialogContent>

          {/* 하단 버튼 */}
          <DialogActions sx={{ p: 3 }}>
            <Grid container sx={{ justifyContent: 'space-between', alignItems: 'center', width: 1 }}>
              {/* 삭제 */}
              <Grid>
                {!isCreating && (
                  <Tooltip title="Delete Event">
                    <IconButton onClick={handleDeleteClick} size="large" disabled={isSubmitting}>
                      <DeleteIcon color="error" />
                    </IconButton>
                  </Tooltip>
                )}
              </Grid>

              {/* 취소 / 추가 */}
              <Grid>
                <Stack direction="row" sx={{ alignItems: 'center', gap: 2 }}>
                  <Button type="button" variant="outlined" onClick={onCancel}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="contained" disabled={isSubmitting}>
                    {event ? 'Edit' : 'Add'}
                  </Button>
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
  onCancel: PropTypes.func
};
