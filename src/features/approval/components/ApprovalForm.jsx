// material-ui
import { Button, Grid, Stack, Box, Alert } from '@mui/material';
import PersonAddAlt1OutlinedIcon from '@mui/icons-material/PersonAddAlt1Outlined';

// third party
import { Formik } from 'formik';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import AttachmentDropzone from 'features/attachment/components/AttachmentDropzone';
import ApprovalFormModal from 'features/approval/components/ApprovalFormModal';
import RejectCommentModal from 'features/approval/components/approvalTemplate/RejectCommentModal';
import AttachmentListView from 'features/attachment/components/AttachmentListView';
// react
import { useState, useEffect } from 'react';
import useAuth from 'hooks/useAuth';
import { useNavigate } from 'react-router-dom';
// api
import { getApprovalTemplates } from 'features/approval/api/approvalAPI';

import { decideApproval } from '../api/approvalAPI';

// ==============================|| ADD NEW FORM ||============================== //

export default function ApprovalForm({
  selectedForm,
  setSelectedForm,
  attachments,
  setAttachments,
  onOpenModal,
  onFormSubmit,
  alertInfo,
  setAlertInfo,
  TemplateRendererSlot,
  readOnly = false,
  approvers,
  initialData,
  approvalLines,
  onExportPDF
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
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

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

  const myPendingLine = approvalLines?.find(
    (line) => line.approvalStatus?.value1 === 'AWAITING' && line.approver?.employeeId === user?.employeeId
  );
  const isMyTurn = readOnly && !!myPendingLine;

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

                  {/* 승인 */}
                  {isMyTurn && (
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="outlined"
                        color="secondary"
                        sx={{ height: '35px' }}
                        onClick={async () => {
                          try {
                            await decideApproval({
                              lineId: myPendingLine.lineId,
                              statusCodeId: 9
                            });
                            setAlertInfo({
                              open: true,
                              message: '승인되었습니다.',
                              severity: 'success'
                            });
                            setTimeout(() => navigate('/approval/list/pending'), 800);
                          } catch (err) {
                            setAlertInfo({
                              open: true,
                              message: err.response?.data?.message || '승인 실패',
                              severity: 'error'
                            });
                          }
                        }}
                      >
                        승인
                      </Button>
                      <Button variant="outlined" color="error" sx={{ height: '35px' }} onClick={() => setRejectModalOpen(true)}>
                        반려
                      </Button>
                    </Stack>
                  )}
                  {readOnly && (
                    <Button variant="contained" color="primary" sx={{ height: '35px' }} onClick={onExportPDF}>
                      PDF 다운로드
                    </Button>
                  )}

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
                  <Grid>
                    <Box mt={2}>{TemplateRendererSlot}</Box>
                  </Grid>
                )}
              </Grid>
              <Grid item xs={12}>
                {!readOnly && (
                  <Grid item xs={12} sx={{ mt: 1 }}>
                    <AttachmentDropzone attachments={attachments} setAttachments={setAttachments} height={100} readOnly={readOnly} />
                  </Grid>
                )}
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
          {readOnly && initialData?.attachmentFiles?.length > 0 && (
            <Grid item xs={12}>
              <Box mt={2}>
                <h3 style={{ marginBottom: '10px' }}>첨부파일</h3>
                <AttachmentListView attachments={initialData.attachmentFiles} />
              </Box>
            </Grid>
          )}
          <RejectCommentModal
            open={rejectModalOpen}
            onClose={() => setRejectModalOpen(false)}
            onSubmit={async (comment) => {
              try {
                await decideApproval({
                  lineId: myPendingLine.lineId,
                  statusCodeId: 10,
                  comment: comment
                });

                setAlertInfo({
                  open: true,
                  message: '반려되었습니다.',
                  severity: 'success'
                });

                setRejectModalOpen(false);

                setTimeout(() => {
                  navigate('/approval/list/pending');
                }, 1000);
              } catch (err) {
                setAlertInfo({
                  open: true,
                  message: err.response?.data?.message || '반려 실패',
                  severity: 'error'
                });
              }
            }}
          />
        </>
      )}
    </Formik>
  );
}
