// material-ui
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Autocomplete from '@mui/material/Autocomplete';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import PersonAddAlt1OutlinedIcon from '@mui/icons-material/PersonAddAlt1Outlined';

// third party
import { Formik } from 'formik';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import StartAndEndDateTime from './StartAndEndDateTime';
import AttachmentDropzone from 'ui-component/extended/AttachmentDropzone';
import { createApproval } from '../api/approvalAPI';
import Alert from '@mui/material/Alert';

// react
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// (임시 데이터) 실제로는 API를 통해 결재 양식 목록을 가져와야 함
const top100Films = [
  { id: 1, title: '휴가 신청서', date: true },
  { id: 2, title: '지출 결의서', date: false },
  { id: 3, title: '출장 보고서', date: true }
];

// 사용자의 로컬 시간대를 기준으로 포맷팅
const formatToLocalDateTimeString = (date) => {
  const year = date.getFullYear();
  // getMonth()는 0부터 시작하므로 +1, padStart로 2자리(0X) 보정
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  // LocalDateTime (YYYY-MM-DDTHH:mm:ss) 형식 반환
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

// ==============================|| ADD NEW FORM ||============================== //

export default function ApprovalForm({
  selectedForm,
  setSelectedForm,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  attachments,
  setAttachments,
  approvers,
  references
}) {
  const navigate = useNavigate();

  const [alertInfo, setAlertInfo] = useState({
    open: false,
    message: '',
    severity: 'info' // 'success', 'error', 'warning', 'info'
  });
  // 40px 높이를 위한 공통 스타일
  const customInputStyle = {
    '& .MuiInputBase-root': {
      height: 40
    },
    '& .MuiInputBase-input': {
      padding: '8.5px 14px'
    },
    '& .MuiInputLabel-root.MuiInputLabel-outlined': {
      transform: 'translate(14px, 9.5px) scale(1)'
    },
    '& .MuiInputLabel-root.MuiInputLabel-outlined.MuiInputLabel-shrink': {
      transform: 'translate(14px, -6px) scale(0.75)'
    }
  };

  return (
    <Formik
      initialValues={{
        title: '', // 제목
        content: '' // 상신 의견
      }}
      // 백엔드 @ModelAttribute DTO 구조에 맞게 FormData 구성
      onSubmit={async (values, { setSubmitting }) => {
        const { title, content } = values;

        const formData = new FormData();

        formData.append('title', title);
        formData.append('content', content);

        if (selectedForm) {
          formData.append('templateCode', selectedForm.id);
        } else {
          setAlertInfo({
            open: true,
            message: '결재 양식을 선택해주세요.',
            severity: 'warning'
          });
          setSubmitting(false);
          return;
        }

        if (selectedForm && selectedForm.date) {
          formData.append('startDate', formatToLocalDateTimeString(startTime));
          formData.append('endDate', formatToLocalDateTimeString(endTime));
        }

        // 2. 결재선(ApprovalLines) 추가
        approvers.forEach((approver, index) => {
          formData.append(`approvalLines[${index}].approverId`, approver.employeeId);
          formData.append(`approvalLines[${index}].approvalOrder`, index + 1); // 순서는 1부터 시작
        });

        // 3. 참조자(ApprovalReferences) 추가
        references.forEach((referrer, index) => {
          formData.append(`approvalReferences[${index}].referrerId`, referrer.employeeId);
        });

        // 4. 첨부파일(multipartFile) 추가
        if (attachments && attachments.length > 0) {
          attachments.forEach((file) => {
            formData.append('multipartFile', file);
          });
        }

        // 5. API 호출
        try {
          setSubmitting(true);
          const response = await createApproval(formData);
          setAlertInfo({
            open: true,
            message: '결재가 성공적으로 상신되었습니다.',
            severity: 'success'
          });

          // 1초 후 기안 문서함으로 이동
          setTimeout(() => {
            navigate('/approval/list/draft');
          }, 1000);
        } catch (error) {
          console.error('결재 상신 실패:', error);
          const errorMessage = error.response?.data?.message || error.message;
          setAlertInfo({
            open: true,
            message: `${errorMessage}`,
            severity: 'error'
          });
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ values, handleSubmit, handleChange, handleBlur, isSubmitting }) => (
        <form onSubmit={handleSubmit}>
          <MainCard
            title={
              <Stack direction="row" sx={{ flexWrap: 'wrap', gap: { xs: 1, lg: 2 } }}>
                <Button variant="contained" color="primary" type="submit" sx={{ height: '35px' }} disabled={isSubmitting}>
                  기안
                </Button>
                <Button variant="outlined" color="primary" type="button" sx={{ height: '35px' }} endIcon={<PersonAddAlt1OutlinedIcon />}>
                  결재선 수정
                </Button>
                <Box sx={{ flexGrow: 1 }} />

                {alertInfo.open && (
                  <Alert
                    severity={alertInfo.severity}
                    onClose={() => setAlertInfo({ open: false })}
                    sx={{
                      flex: 1,
                      height: '35px',
                      py: 0,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {alertInfo.message}
                </Alert>
                  )}
              </Stack>
            }
            sx={{ '& .MuiCardHeader-root': { flexWrap: 'wrap', gap: 1.5 }, '& .MuiCardHeader-action': { flex: 'unset' } }}
          >
            <Grid container spacing={3}>
              <Grid item size={12}>
                <Grid container spacing={2}>
                  <Grid item size={3}>
                    <Autocomplete
                      id="combo-box-demo"
                      options={top100Films} // 실제로는 API로 가져온 양식 목록 사용
                      getOptionLabel={(option) => option.title}
                      onChange={(event, newValue) => {
                        setSelectedForm(newValue);
                      }}
                      value={selectedForm}
                      renderInput={(params) => <TextField {...params} label="결재 양식" sx={customInputStyle} />}
                    />
                  </Grid>
                  <Grid item size={9}>
                    <TextField
                      fullWidth
                      id="outlined-title"
                      label="제목"
                      name="title" // Formik이 추적할 이름
                      value={values.title} // Formik 값
                      onChange={handleChange} // Formik 핸들러
                      onBlur={handleBlur} // Formik 핸들러
                      sx={customInputStyle}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item size={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={5}
                  placeholder={'상신 의견'}
                  name="content" // Formik이 추적할 이름 (initialValues와 일치)
                  value={values.content} // Formik 값
                  onChange={handleChange} // Formik 핸들러
                  onBlur={handleBlur} // Formik 핸들러
                ></TextField>
              </Grid>
              {selectedForm && selectedForm.date === true && (
                <Grid item size={12}>
                  <StartAndEndDateTime startTime={startTime} setStartTime={setStartTime} endTime={endTime} setEndTime={setEndTime} />
                </Grid>
              )}

              <Grid item size={12}>
                <AttachmentDropzone attachments={attachments} setAttachments={setAttachments} height={100} />
              </Grid>
            </Grid>
          </MainCard>
        </form>
      )}
    </Formik>
  );
}
