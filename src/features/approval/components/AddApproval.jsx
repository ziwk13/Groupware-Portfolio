// material-ui
import Grid from '@mui/material/Grid';
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot } from '@mui/lab';
import { Box, Typography } from '@mui/material';
import { useEffect } from 'react';

// project imports
import TemplateRenderer from 'features/approval/components/approvalTemplate/TemplateRenderer';
import { gridSpacing } from 'store/constant';
import SubCard from 'ui-component/cards/SubCard';

import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import ApprovalForm from './ApprovalForm';
import { useState } from 'react';
import useAuth from 'hooks/useAuth';

import DefaultAvatar from 'assets/images/profile/default_profile.png';
import { getImageUrl } from 'api/getImageUrl';

import OrganizationModal from 'features/organization/components/OrganizationModal';

// react-router-dom import
import { useNavigate } from 'react-router-dom';
// api import
import { createApproval } from '../api/approvalAPI';

// assets
function handleClick() {}

function toFormData(obj, form = new FormData(), prefix = '') {
  for (const key in obj) {
    const value = obj[key];
    const formKey = prefix ? `${prefix}[${key}]` : key;

    if (value instanceof File) {
      form.append(formKey, value);
    } else if (value !== null && typeof value === 'object') {
      toFormData(value, form, formKey);
    } else if (value !== undefined) {
      form.append(formKey, value);
    }
  }
  return form;
}

export default function AddApproval({ readOnly = false, initialData = null, onExportPDF }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [templateValues, setTemplateValues] = useState({});

  const [alertInfo, setAlertInfo] = useState({
    open: false,
    message: '',
    severity: 'info' // 'success', 'error', 'warning', 'info'
  });

  const [list, setList] = useState([
    {
      name: '결재자',
      empList: []
    },
    {
      name: '참조자',
      empList: []
    }
  ]);

  // list state에서 approvers와 references 추출
  const approvers = list.find((item) => item.name === '결재자')?.empList || [];
  const references = list.find((item) => item.name === '참조자')?.empList || [];

  const [selectedForm, setSelectedForm] = useState(null); // 선택한 결재 양식
  const [attachments, setAttachments] = useState([]); // 첨부파일

  // 모달 제어용 state
  const [open, setOpen] = useState(false);

  const getStatusChip = (statusValue) => {
    switch (statusValue) {
      case 'DOC_APPROVED':
        return <Chip label="최종 승인" size="small" color="success" />;
      case 'DOC_REJECTED':
        return <Chip label="최종 반려" size="small" color="error" />;
      case 'LINE_APPROVED':
        return <Chip label="승인" size="small" color="success" />;
      case 'AWAITING': // 결재 대기 (내 차례)
        return <Chip label="대기" size="small" color="warning" />;
      case 'PENDING': // 미결 (내 차례 아님)
        return <Chip label="미결" size="small" color="primary" />;

      default:
        return null;
    }
  };

  //  상세조회(initialData)일 때 상태 초기화
  useEffect(() => {
    if (!initialData) return;

    // 템플릿 정보 그대로 세팅
    setSelectedForm(initialData.approvalTemplate);

    // 템플릿 관련 값 전체를 templateValues로 전달
    setTemplateValues((prev) => ({
      ...prev,
      ...initialData
    }));

    // 결재선 / 참조자 초기화
    const approverEmps = initialData.approvalLines ?? [];
    const refEmps = initialData.approvalReferences?.map((ref) => ref.referrer) ?? [];

    setList([
      { name: '결재자', empList: approverEmps },
      { name: '참조자', empList: refEmps }
    ]);
  }, [initialData]);

  const handleFormSubmit = async (values, { setSubmitting }) => {
    // 읽기 전용 모드에서는 제출 로직 수행 X
    if (readOnly) {
      setSubmitting(false);
      return;
    }
    if (!approvers || approvers.length === 0) {
      setAlertInfo({
        open: true,
        message: '결재자를 최소 1명 이상 선택해주세요.',
        severity: 'warning'
      });
      setSubmitting(false);
      return;
    }

    let title = (values.title || '').trim();
    let content = (values.content || '').trim();

    // selectedForm이 null일 수 있으므로 null 체크 추가
    const templateLabel = selectedForm?.value1 || '기타 양식';

    if (!title) {
      title = `${user?.name || '사용자'} (${user?.position}) - ${templateLabel}`;
    }

    if (!content) {
      content = `${templateLabel} 신청합니다.`;
    }

    let formData = new FormData();

    formData.append('title', title);
    formData.append('content', content);
    formData.append('templateCode', selectedForm.code);
    for (const pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    toFormData(templateValues, formData);
    const templateData = templateValues || {};

    // 결재선(ApprovalLines) 추가
    approvers.forEach((approver, index) => {
      formData.append(`approvalLines[${index}].approverId`, approver.employeeId);
      formData.append(`approvalLines[${index}].approvalOrder`, index + 1); // 순서는 1부터 시작
    });

    // 참조자(ApprovalReferences) 추가
    references.forEach((referrer, index) => {
      formData.append(`approvalReferences[${index}].referrerId`, referrer.employeeId);
    });

    // 첨부파일(multipartFile) 추가
    if (attachments && attachments.length > 0) {
      attachments.forEach((file) => {
        formData.append('multipartFile', file);
      });
    }

    // API 호출
    try {
      setSubmitting(true);

      for (const pair of formData.entries()) {
        console.log('FORMDATA:', pair[0], pair[1]);
      }

      // templateValues to formdata
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
  };
  const headerApprovalLines = initialData?.approvalLines || [];
  const finalDecisionLine = headerApprovalLines
    ?.filter((line) => ['APPROVED', 'REJECTED'].includes(line.approvalStatus?.value1))
    ?.sort((a, b) => new Date(b.approvalDate) - new Date(a.approvalDate))[0];
  return (
    <>
      <div style={{ marginTop: '20px' }}></div>
      <Grid container spacing={gridSpacing} sx={{ alignItems: 'flex-start' }}>
        {/* 좌측: 작성 폼 */}
        <Grid size={{ xs: 12, md: 6, lg: 9 }}>
          <ApprovalForm
            selectedForm={selectedForm}
            setSelectedForm={setSelectedForm}
            attachments={attachments}
            approvalLines={headerApprovalLines}
            setAttachments={setAttachments}
            approvers={approvers}
            initialData={initialData}
            references={references}
            onOpenModal={() => {
              if (!readOnly) setOpen(true);
            }}
            onFormSubmit={handleFormSubmit}
            alertInfo={alertInfo}
            setAlertInfo={setAlertInfo}
            TemplateRendererSlot={
              selectedForm ? (
                <div id="approval-document-area">
                  <TemplateRenderer
                    template={selectedForm}
                    approvalLines={headerApprovalLines}
                    approvalReferences={references}
                    templateValues={templateValues}
                    setTemplateValues={setTemplateValues}
                    readOnly={readOnly}
                    docNo={initialData?.docId}
                    draftUser={initialData?.creator?.name}
                    draftDept={initialData?.creator?.department}
                    draftPosition={initialData?.creator?.position}
                    draftDate={initialData?.createdAt}
                    approvalDate={finalDecisionLine?.approvalDate}
                    initialData={initialData}
                  />
                </div>
              ) : null
            }
            readOnly={readOnly}
            onExportPDF={onExportPDF}
          />
        </Grid>

        {/* 우측: 결재자 / 참조자 타임라인 */}
        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          <Grid container spacing={gridSpacing}>
            <Grid size={12}>
              <SubCard title="결재자" darkTitle={true}>
                <Timeline sx={{ m: 0, p: 0, '& .MuiTimelineItem-root': { minHeight: 0 } }}>
                  {approvers.map((approver, index) => (
                    <TimelineItem key={index} sx={{ '&::before': { content: 'none' } }}>
                      <TimelineSeparator>
                        <TimelineDot color="primary" />
                        {index < approvers.length - 1 && <TimelineConnector sx={{ bgcolor: 'primary.light' }} />}
                      </TimelineSeparator>

                      <TimelineContent
                        sx={{
                          pb: index < approvers.length - 1 ? 2 : 0,
                          pt: '6px'
                        }}
                      >
                        {/* 아바타 */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={
                              initialData
                                ? `${approver.approver.name} ${approver.approver.position}`
                                : `${approver.name} ${approver.position}`
                            }
                            avatar={
                              <Avatar
                                alt={initialData ? approver.approver.name : approver.name}
                                src={
                                  (initialData ? approver.approver.profileImg : approver.profileImg)
                                    ? getImageUrl(initialData ? approver.approver.profileImg : approver.profileImg)
                                    : DefaultAvatar
                                }
                                sx={{ width: 36, height: 36 }}
                              />
                            }
                            onClick={handleClick}
                            variant="outlined"
                          />

                          {/* 상태 칩  */}

                          {readOnly &&
                            getStatusChip(
                              approver.approvalStatus?.value1 === 'APPROVED'
                                ? 'LINE_APPROVED'
                                : approver.approvalStatus?.value1 === 'REJECTED'
                                  ? 'DOC_REJECTED'
                                  : approver.approvalStatus?.value1 === 'AWAITING'
                                    ? 'AWAITING'
                                    : 'PENDING'
                            )}
                        </Box>
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              </SubCard>
            </Grid>

            <Grid size={12}>
              <SubCard title="참조자" darkTitle={true}>
                <Timeline sx={{ m: 0, p: 0, '& .MuiTimelineItem-root': { minHeight: 0 } }}>
                  {references.map((ref, index) => (
                    <TimelineItem key={index} sx={{ '&::before': { content: 'none' } }}>
                      <TimelineSeparator>
                        <TimelineDot color="primary" />
                        {index < references.length - 1 && <TimelineConnector sx={{ bgcolor: 'primary.light' }} />}
                      </TimelineSeparator>
                      <TimelineContent
                        sx={{
                          pb: index < references.length - 1 ? 2 : 0,
                          pt: '6px'
                        }}
                      >
                        <Chip
                          label={`${ref.name} ${ref.position}`}
                          avatar={<Avatar alt={ref.name} src={ref.profileImg ? getImageUrl(ref.profileImg) : DefaultAvatar} />}
                          onClick={handleClick}
                          variant="outlined"
                        />
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              </SubCard>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* 조직도 모달 */}
      <OrganizationModal open={open && !readOnly} onClose={() => setOpen(false)} list={list} setList={setList} />
    </>
  );
}
