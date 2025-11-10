// material-ui
import { Button, Grid, Autocomplete, Stack, TextField, Box, Alert } from '@mui/material';
import PersonAddAlt1OutlinedIcon from '@mui/icons-material/PersonAddAlt1Outlined';

// third party
import { Formik } from 'formik';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import StartAndEndDateTime from './StartAndEndDateTime';
import AttachmentDropzone from 'ui-component/extended/AttachmentDropzone';

// react
import { useState } from 'react';

// (임시 데이터) 실제로는 API를 통해 결재 양식 목록을 가져와야 함
const top100Films = [
  { id: 1, title: '휴가 신청서', date: true },
  { id: 2, title: '지출 결의서', date: false },
  { id: 3, title: '출장 보고서', date: true }
];

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
  onOpenModal,
  onFormSubmit,
  alertInfo,
  setAlertInfo
}) {
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
      onSubmit={onFormSubmit}
    >
      {({ values, handleSubmit, handleChange, handleBlur, isSubmitting }) => (
        <form onSubmit={handleSubmit}>
          <MainCard
            title={
              <Stack direction="row" sx={{ flexWrap: 'wrap', gap: { xs: 1, lg: 2 } }}>
                <Button variant="contained" color="primary" type="submit" sx={{ height: '35px' }} disabled={isSubmitting}>
                  기안
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  type="button"
                  sx={{ height: '35px' }}
                  endIcon={<PersonAddAlt1OutlinedIcon />}
                  onClick={onOpenModal}
                >
                  결재선 수정
                </Button>
                <Box sx={{ flexGrow: 1 }} />

                {alertInfo.open && (
                  <Alert
                    severity={alertInfo.severity}
                    onClose={() => setAlertInfo({ ...alertInfo, open: false })}
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
                      name="title"
                      value={values.title}
                      onChange={handleChange}
                      onBlur={handleBlur}
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
                  name="content"
                  value={values.content}
                  onChange={handleChange}
                  onBlur={handleBlur}
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