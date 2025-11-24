import { Button, Grid, TextField, Box, Alert } from '@mui/material';
import { Formik } from 'formik';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import AttachmentDropzone from 'features/attachment/components/AttachmentDropzone';
import postAPI from '../api/postAPI';

export default function PostWriteForm({ category }) {
  const navigate = useNavigate();

  const [attachments, setAttachments] = useState([]);
  const [alertInfo, setAlertInfo] = useState({
    open: false,
    severity: 'success',
    message: ''
  });

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

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('content', values.content);

      // 공지/알림 값
      formData.append('isNotification', values.isNotification);
      formData.append('alert', values.alert);

      // 첨부파일 추가
      attachments.forEach((file) => {
        formData.append('multipartFile', file);
      });

      await postAPI.createPost(category, formData);

      setAlertInfo({
        open: true,
        severity: 'success',
        message: '게시글이 성공적으로 등록되었습니다.'
      });

      setTimeout(() => {
        navigate(`/post/list/${category}`);
      }, 1000);
    } catch (err) {
      console.error(err);
      setAlertInfo({
        open: true,
        severity: 'error',
        message: '게시글 등록 실패'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={{
        title: '',
        content: '',
        isNotification: false,
        alert: false
      }}
      onSubmit={handleSubmit}
    >
      {({ values, handleSubmit: formikSubmit, handleChange, handleBlur, isSubmitting }) => (
        <form onSubmit={formikSubmit}>
          <MainCard
            title={
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  sx={{ height: '35px' }}
                  disabled={isSubmitting}
                >
                  게시글 등록
                </Button>

                {alertInfo?.open && (
                  <Alert
                    severity={alertInfo.severity}
                    onClose={() => setAlertInfo({ ...alertInfo, open: false })}
                    sx={{
                      height: '35px',
                      py: 0,
                      alignItems: 'center',
                      width: 'fit-content',
                      ml: 'auto'
                    }}
                  >
                    {alertInfo.message}
                  </Alert>
                )}
              </Box>
            }
            sx={{
              '& .MuiCardHeader-root': { flexWrap: 'wrap', gap: 1.5 },
              '& .MuiCardHeader-action': { flex: 'unset' }
            }}
          >
            <Grid container spacing={3}>
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

              <Grid item size={9}>
                <TextField
                  fullWidth
                  multiline
                  rows={10}
                  placeholder="내용을 입력하세요."
                  name="content"
                  value={values.content}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </Grid>

              <Grid item size={9}>
                <AttachmentDropzone
                  height={120}
                  attachments={attachments}
                  setAttachments={setAttachments}
                />
              </Grid>
            </Grid>
          </MainCard>
        </form>
      )}
    </Formik>
  );
}
