import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, Typography } from '@mui/material';
import AttachmentDropzone from 'features/attachment/components/AttachmentDropzone';
import { useState } from 'react';
import { syncHR } from '../api/employeeAPI';

export default function SyncHRModal({ open, onClose }) {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [fileWarning, setFileWarning] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [syncResult, setSyncResult] = useState(null);

  const handleStateReset = () => {
    setFile(null);
    setIsLoading(false);
    setFileWarning(false);
    setApiError(null);
    setSyncResult(null);
  };

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = async () => {
    setFileWarning(false);
    setApiError(null);
    setSyncResult(null);

    if (!file) {
      setFileWarning(true);
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('multipartFile', file[0]);

    try {
      const response = await syncHR(formData);
      const result = response.data.data;
      setSyncResult(result);
      setFile(null);
    } catch (error) {
      console.error('인사연동 실패:', error);
      setApiError('인사연동 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      TransitionProps={{
        onExited: handleStateReset
      }}
      PaperProps={{
        sx: {
          maxWidth: syncResult ? '25vw' : '50vw',
          boxShadow: 'none',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center' }}>
        <Typography sx={{ fontWeight: 700, fontSize: '1.4rem' }}>{'인사연동'}</Typography>
        {!syncResult && (
          <>
            <Typography variant="body1" color="textSecondary">
              아래 순서로 작성된 CSV 파일을 업로드해 주세요.
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>
              [아이디, 입사일, 이름, 연락처, 재직상태, 권한, 부서, 직급]
            </Typography>
          </>
        )}
        {syncResult && (
          <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
            결과
          </Typography>
        )}
      </DialogTitle>
      <Divider sx={{ mb: 2 }} />

      <DialogContent sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '0 24px' }}>
        {fileWarning && (
          <Alert severity="warning" sx={{ width: '100%', py: 0.3, mb: 2 }}>
            파일을 업로드해 주세요.
          </Alert>
        )}

        {apiError && (
          <Alert severity="error" sx={{ width: '100%', py: 0.3, mb: 2 }}>
            {apiError}
          </Alert>
        )}

        {syncResult && (
          <>
            <Alert severity="success" sx={{ width: '100%', py: 0.3, mb: 1 }}>
              성공: {syncResult.success}건
            </Alert>
            <Alert severity="warning" sx={{ width: '100%', py: 0.3, mb: 1 }}>
              중복: {syncResult.duplicate}건
            </Alert>
            <Alert severity="error" sx={{ width: '100%', py: 0.3, mb: 2 }}>
              실패: {syncResult.fail}건
            </Alert>
          </>
        )}

        {!syncResult && (
          <Grid item size={12}>
            <AttachmentDropzone
              attachments={file}
              setAttachments={setFile}
              height={100}
              multiple={false}
              accept={{
                'text/csv': ['.csv'],
                'application/vnd.ms-excel': ['.csv']
              }}
            />
          </Grid>
        )}
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', pb: 2, pt: 2 }}>
        {!syncResult && (
          <Button onClick={handleSubmit} variant="contained" color="secondary" disabled={isLoading}>
            {isLoading ? '업로드 중...' : '인사연동'}
          </Button>
        )}
        <Button onClick={handleClose} variant="contained" color="primary">
          닫기
        </Button>
      </DialogActions>
    </Dialog>
  );
}
