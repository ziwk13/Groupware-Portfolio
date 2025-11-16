// material-ui
import { Button, Grid, Autocomplete, Stack, TextField, Box, Alert } from '@mui/material';
import PersonAddAlt1OutlinedIcon from '@mui/icons-material/PersonAddAlt1Outlined';

// third party
import { Formik } from 'formik';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import StartAndEndDateTime from 'features/date/components/StartAndEndDateTime';
import AttachmentDropzone from 'features/attachment/components/AttachmentDropzone';
import ApprovalFormModal from 'features/approval/components/ApprovalFormModal';

// react
import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, List, ListItemButton, ListItemText } from '@mui/material';
import useAuth from 'hooks/useAuth';
// api
import { getApprovalTemplates } from 'features/approval/api/approvalAPI';

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
  setAlertInfo,
  TemplateRendererSlot,
  readOnly = false
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

  const [templateList, setTemplateList] = useState([]);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const templates = await getApprovalTemplates();
        setTemplateList(templates);
      } catch (error) {
        console.error(error);
      }
    }
    fetchTemplates();
  }, []);

  return (
    <Formik initialValues={{ title: '', content: '' }} onSubmit={onFormSubmit}>
      {({ values, handleSubmit, handleChange, handleBlur, isSubmitting }) => (
        <>
          {/* form 영역 */}
          <form onSubmit={handleSubmit}>
            <MainCard
              title={
                <Stack direction="row" sx={{ flexWrap: 'wrap', gap: { xs: 1, lg: 2 } }}>
                  {!readOnly && (
                    <>
                      <Button
                        variant="outlined"
                        color="primary"
                        sx={{ height: '35px' }}
                        onClick={() => !readOnly && setFormModalOpen(true)}
                      >
                        양식 선택
                      </Button>

                      <Button
                        variant="outlined"
                        color="primary"
                        type="button"
                        sx={{ height: '35px' }}
                        endIcon={<PersonAddAlt1OutlinedIcon />}
                        onClick={() => !readOnly && onOpenModal()}
                      >
                        결재선 수정
                      </Button>

                      <Button variant="contained" color="primary" type="submit" sx={{ height: '35px' }} disabled={isSubmitting}>
                        상신
                      </Button>
                    </>
                  )}

                  <Box sx={{ flexGrow: 1 }} />

                  {alertInfo.open && (
                    <Alert
                      severity={alertInfo.severity}
                      onClose={() => setAlertInfo({ ...alertInfo, open: false })}
                      sx={{
                        flex: 1,
                        height: '35px',
                        display: 'flex',
                        alignItems: 'center',
                        px: 2,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {alertInfo.message}
                    </Alert>
                  )}
                </Stack>
              }
            >
              <Grid container spacing={3}>
                {TemplateRendererSlot && (
                  <Grid item xs={12}>
                    <Box mt={2}>{TemplateRendererSlot}</Box>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <AttachmentDropzone attachments={attachments} setAttachments={setAttachments} height={100} readOnly={readOnly} />
                </Grid>
              </Grid>
            </MainCard>
          </form>
          <ApprovalFormModal
            open={formModalOpen}
            onClose={() => setFormModalOpen(false)}
            templates={templateList}
            onSelect={(item) => {
              setSelectedForm(item);
              setFormModalOpen(false);
            }}
          />
        </>
      )}
    </Formik>
  );
}
