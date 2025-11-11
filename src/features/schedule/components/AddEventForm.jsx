import PropTypes from 'prop-types';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid as Grid,
  IconButton,
  Stack,
  Autocomplete,
  TextField,
  Tooltip,
  Chip,
  List,
  ListItem,
  ListItemText,
  Typography,
  Snackbar,
  Alert
} from '@mui/material';
import { LocalizationProvider, MobileDateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import * as Yup from 'yup';
import { useFormik, Form, FormikProvider } from 'formik';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gridSpacing } from 'store/constant';
import DateRangeIcon from '@mui/icons-material/DateRange';
import DeleteIcon from '@mui/icons-material/Delete';
import { dispatch } from 'store';
import axios from 'utils/axios';
import { inviteParticipants, getEvents, updateParticipantStatus } from '../slices/scheduleSlice';
import useAuth from 'hooks/useAuth';
import OrganizationModal from 'features/organization/components/OrganizationModal';

// ==============================|| ADD / EDIT EVENT FORM ||============================== //

function toDate(v) {
  return v ? new Date(v) : null;
}

export default function AddEventForm({ event, range, handleDelete, handleCreate, handleUpdate, onCancel, employeeId, setStatusMessage }) {
  const isCreating = !event;

  const openNowRef = useRef(new Date());

  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [participants, setParticipants] = useState([]);
  const { user } = useAuth();
  const loggedInId = user?.employeeId;
  const isHost = event && Number(event.employeeId) === Number(loggedInId);
  const navigate = useNavigate();
  const [participantStatus, setParticipantStatus] = useState(null);

  // 조직도 모달 상태
  const [orgOpen, setOrgOpen] = useState(false);
  const [orgList, setOrgList] = useState([{ name: '참석자', empList: [] }]);

  // MUI 알림 관련 상태
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, onConfirm: null });

  const handleCloseSnackbar = () => setSnackbar((prev) => ({ ...prev, open: false }));
  const handleCloseConfirm = () => setConfirmDialog({ open: false, onConfirm: null });

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

  // 카테고리 목록 (공통코드 기반)
  const categoryOptions = [
    { code: 'SC01', value1: 'MEETING', value2: '회의' },
    { code: 'SC02', value1: 'BUSINESS_TRIP', value2: '출장' },
    { code: 'SC03', value1: 'VACATION', value2: '휴가' },
    { code: 'SC04', value1: 'PROJECT', value2: '프로젝트' },
    { code: 'SC05', value1: 'ETC', value2: '기타 일정' }
  ];

  const initialValues = useMemo(() => {
    const baseNow = openNowRef.current;
    const start = toDate(event?.startTime) || toDate(range?.start) || baseNow;
    const end = toDate(event?.endTime) || toDate(range?.end) || baseNow;

    return {
      title: event?.title || '',
      content: event?.content || '',
      startTime: start,
      endTime: end,
      categoryCode: '',
      selectedParticipants: []
    };
  }, [event, range]);

  // 조직도에서 선택된 참석자 반영
  useEffect(() => {
    const selected = orgList[0]?.empList || [];
    if (!selected.length) return;

    const merged = [...values.selectedParticipants, ...selected];
    const unique = merged.filter((emp, idx, arr) => idx === arr.findIndex((e) => Number(e.employeeId) === Number(emp.employeeId)));

    if (isCreating || isHost) setFieldValue('selectedParticipants', unique);
  }, [orgList]);

  // 참여 상태 불러오기
  useEffect(() => {
    const myStatus = participants.find((p) => p.participantEmployeeId === loggedInId)?.participantStatusName;
    setParticipantStatus(myStatus === '참석' ? 'ATTEND' : myStatus === '거절' ? 'REJECT' : null);
  }, [participants, loggedInId]);

  const EventSchema = Yup.object().shape({
    title: Yup.string().max(255).required('Title is required'),
    content: Yup.string().max(5000),
    endTime: Yup.date().when('startTime', (start, schema) => (start ? schema.min(start, 'End date must be later than start date') : schema))
  });

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: EventSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        const data = {
          title: values.title,
          content: values.content,
          startTime: values.startTime,
          endTime: values.endTime,
          categoryCode: values.categoryCode
        };

        let scheduleId;
        if (event) {
          scheduleId = event.scheduleId || event.id;
          if (!isHost) {
            setSnackbar({ open: true, message: '이 일정은 작성자만 수정할 수 있습니다.', severity: 'warning' });
            setStatusMessage?.('이 일정은 작성자만 수정할 수 있습니다.');
            setSubmitting(false);
            return;
          }
          await handleUpdate(scheduleId, data);
        } else {
          const created = await handleCreate(data);
          scheduleId = created?.scheduleId;
          if (scheduleId) {
            setSnackbar({ open: true, message: '일정이 생성되었습니다.', severity: 'success' });
            setStatusMessage?.('일정이 생성되었습니다.');
          }
          resetForm();
          onCancel();
        }

        if (scheduleId && values.selectedParticipants?.length > 0) {
          const ids = values.selectedParticipants.map((p) => p.employeeId);
          await dispatch(inviteParticipants(scheduleId, ids));
        }
      } catch (error) {
        // 필요 시 에러 표시
      } finally {
        setSubmitting(false);
      }
    }
  });

  const { values, errors, touched, handleSubmit, isSubmitting, getFieldProps, setFieldValue } = formik;

  // 카테고리 초기 동기화
  const catSyncedRef = useRef(false);
  useEffect(() => {
    catSyncedRef.current = false;
  }, [event?.categoryCode, event?.categoryName]);

  useEffect(() => {
    if (catSyncedRef.current) return;
    if (event?.categoryName || event?.categoryCode) {
      const matched = categoryOptions.find(
        (opt) => opt.value2 === event.categoryName || opt.value1 === event.categoryCode || opt.code === event.categoryCode
      );
      if (matched && formik.values.categoryCode !== matched.value1) {
        formik.setFieldValue('categoryCode', matched.value1, false);
      }
      catSyncedRef.current = true;
    }
  }, [categoryOptions, event?.categoryCode, event?.categoryName, formik]);

  // 삭제 다이얼로그
  const handleDeleteClick = () => {
    if (!event) return;
    if (!isHost) {
      setSnackbar({ open: true, message: '이 일정은 작성자만 삭제할 수 있습니다.', severity: 'warning' });
      setStatusMessage?.('이 일정은 작성자만 삭제할 수 있습니다.');
      return;
    }

    setConfirmDialog({
      open: true,
      onConfirm: () => {
        handleDelete(event.scheduleId || event.id);
        setSnackbar({ open: true, message: '일정이 삭제되었습니다.', severity: 'success' });
        setStatusMessage?.('일정이 삭제되었습니다.');
      }
    });
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

              {/* 참석자 선택 (조직도 모달) */}
              <Grid size={12}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  참석자
                </Typography>

                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {values.selectedParticipants.length > 0 ? (
                    values.selectedParticipants.map((emp) => (
                      <Chip
                        key={emp.employeeId}
                        label={emp.name}
                        variant="outlined"
                        onDelete={() =>
                          (isCreating || isHost) &&
                          setFieldValue(
                            'selectedParticipants',
                            values.selectedParticipants.filter((p) => Number(p.employeeId) !== Number(emp.employeeId))
                          )
                        }
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      선택된 참석자가 없습니다.
                    </Typography>
                  )}
                </Stack>

                <Button variant="outlined" sx={{ mt: 1 }} onClick={() => setOrgOpen(true)} disabled={!(isCreating || isHost)}>
                  조직도 열기
                </Button>

                <OrganizationModal open={orgOpen} onClose={() => setOrgOpen(false)} list={orgList} setList={setOrgList} />
              </Grid>

              {/* 시작/종료 */}
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

              {/* 카테고리 선택 */}
              <Grid size={12}>
                <Autocomplete
                  options={categoryOptions}
                  getOptionLabel={(option) => option.value2}
                  value={categoryOptions.find((opt) => opt.value1 === values.categoryCode) || null}
                  onChange={(e, val) => setFieldValue('categoryCode', val?.value1 || '')}
                  isOptionEqualToValue={(option, value) => option.value1 === value.value1}
                  disabled={!isCreating && !isHost}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="카테고리 선택"
                      placeholder="카테고리를 선택하세요"
                      error={Boolean(touched.categoryCode && errors.categoryCode)}
                      helperText={touched.categoryCode && errors.categoryCode}
                    />
                  )}
                />
              </Grid>

              {/* 참여자 목록 */}
              {!isCreating && participants.length > 0 && (
                <Grid size={12} sx={{ mt: 2 }}>
                  {!isHost && (
                    <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                      <Button
                        size="small"
                        variant={participantStatus === 'ATTEND' ? 'contained' : 'outlined'}
                        sx={{
                          color: participantStatus === 'ATTEND' ? '#fff' : '#4ADE80',
                          borderColor: '#4ADE80',
                          backgroundColor: participantStatus === 'ATTEND' ? '#4ADE80' : 'transparent',
                          '&:hover': { backgroundColor: '#4ADE80', color: '#fff' },
                          textTransform: 'none',
                          fontWeight: 600
                        }}
                        onClick={async () => {
                          try {
                            await dispatch(updateParticipantStatus(event.scheduleId, loggedInId, 'ATTEND'));
                            setParticipantStatus('ATTEND');
                            setSnackbar({ open: true, message: '참석 상태로 변경되었습니다.', severity: 'success' });
                            setStatusMessage?.('참석 상태로 변경되었습니다.');
                            await dispatch(getEvents(loggedInId));
                          } catch {
                            setSnackbar({ open: true, message: '참석 상태 변경 실패', severity: 'error' });
                            setStatusMessage?.('참석 상태 변경 실패');
                          } finally {
                            onCancel();
                          }
                        }}
                      >
                        참석
                      </Button>

                      <Button
                        size="small"
                        variant={participantStatus === 'REJECT' ? 'contained' : 'outlined'}
                        sx={{
                          color: participantStatus === 'REJECT' ? '#fff' : '#F87171',
                          borderColor: '#F87171',
                          backgroundColor: participantStatus === 'REJECT' ? '#F87171' : 'transparent',
                          '&:hover': { backgroundColor: '#F87171', color: '#fff' },
                          textTransform: 'none',
                          fontWeight: 600
                        }}
                        onClick={async () => {
                          try {
                            await dispatch(updateParticipantStatus(event.scheduleId, loggedInId, 'REJECT'));
                            setParticipantStatus('REJECT');
                            setSnackbar({ open: true, message: '거절 상태로 변경되었습니다.', severity: 'warning' });
                            setStatusMessage?.('거절 상태로 변경되었습니다.');
                            await dispatch(getEvents(loggedInId));
                          } catch {
                            setSnackbar({ open: true, message: '거절 상태 변경 실패', severity: 'error' });
                            setStatusMessage?.('거절 상태 변경 실패');
                          } finally {
                            onCancel();
                          }
                        }}
                      >
                        거절
                      </Button>
                    </Stack>
                  )}

                  <Typography variant="h6" gutterBottom>
                    참여자 목록
                  </Typography>
                  <List dense>
                    {participants.map((p) => (
                      <ListItem key={p.participantId}>
                        <ListItemText
                          primary={`${p.participantName ?? ''} (${(p.participantStatusName || '').replace(/^참여\s*상태\s*-\s*/, '') || '상태 없음'})`}
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

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }} onClose={handleCloseSnackbar}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* 삭제 확인 Dialog */}
      <Dialog open={confirmDialog.open} onClose={handleCloseConfirm}>
        <DialogTitle>일정 삭제 확인</DialogTitle>
        <DialogContent>
          <DialogContentText>정말로 이 일정을 삭제하시겠습니까?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm}>취소</Button>
          <Button
            onClick={() => {
              confirmDialog.onConfirm?.();
              handleCloseConfirm();
            }}
            color="error"
            variant="contained"
          >
            삭제
          </Button>
        </DialogActions>
      </Dialog>
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
  employeeId: PropTypes.any,
  setStatusMessage: PropTypes.func
};
