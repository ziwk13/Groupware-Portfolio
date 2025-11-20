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
    severity: 'info'
  });

  const [list, setList] = useState([
    { name: '결재자', empList: [] },
    { name: '참조자', empList: [] }
  ]);

  const approvers = list.find((item) => item.name === '결재자')?.empList || [];
  const references = list.find((item) => item.name === '참조자')?.empList || [];

  const [selectedForm, setSelectedForm] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [open, setOpen] = useState(false);

  const getStatusChip = (statusValue) => {
    switch (statusValue) {
      case 'DOC_APPROVED':
        return <Chip label="최종 승인" size="small" color="success" />;
      case 'DOC_REJECTED':
        return <Chip label="최종 반려" size="small" color="error" />;
      case 'LINE_APPROVED':
        return <Chip label="승인" size="small" color="success" />;
      case 'AWAITING':
        return <Chip label="대기" size="small" color="warning" />;
      case 'PENDING':
        return <Chip label="미결" size="small" color="primary" />;
      default:
        return null;
    }
  };

  // 상세 조회 시 초기 데이터 세팅
  useEffect(() => {
    if (!initialData) return;

    setSelectedForm(initialData.approvalTemplate);
    setTemplateValues((prev) => ({ ...prev, ...initialData }));

    const approverEmps = initialData.approvalLines ?? [];
    const refEmps = initialData.approvalReferences?.map((ref) => ref.referrer) ?? [];

    setList([
      { name: '결재자', empList: approverEmps },
      { name: '참조자', empList: refEmps }
    ]);
  }, [initialData]);

  // 프론트 검증 로직
  const validateFront = () => {
    if (!selectedForm) {
      return '양식을 선택해주세요.';
    }

    const templateType = selectedForm.value2; // VACATION / BUSINESS_TRIP

    // 공통
    if (!approvers || approvers.length === 0) {
      return '결재자를 최소 1명 이상 선택해주세요.';
    }

    // 1) 휴가 검증
    if (templateType === 'VACATION') {
      if (!templateValues.vacationTypeCode) {
        return '휴가 종류를 선택해주세요.';
      }
      if (!templateValues.startDate || !templateValues.endDate) {
        return '휴가 시작/종료 날짜를 선택해주세요.';
      }
      if (!templateValues.vacationReason || templateValues.vacationReason.trim() === '') {
        return '휴가 사유를 입력해주세요.';
      }
    }

    // 2) 출장 검증
    if (templateType === 'BUSINESS_TRIP') {
      if (!templateValues.startDate || !templateValues.endDate) {
        return '출장 시작/종료 날짜를 선택해주세요.';
      }
      if (!templateValues.tripLocation || templateValues.tripLocation.trim() === '') {
        return '출장지를 입력해주세요.';
      }
      if (!templateValues.transportation || templateValues.transportation.trim() === '') {
        return '교통편을 입력해주세요.';
      }
      if (!templateValues.tripPurpose || templateValues.tripPurpose.trim() === '') {
        return '출장 목적을 입력해주세요.';
      }
    }

    return null;
  };

  //  상신 처리

  const handleFormSubmit = async (values, { setSubmitting }) => {
    if (readOnly) {
      setSubmitting(false);
      return;
    }

    //  프론트 검증 실행
    const errorMessage = validateFront();
    if (errorMessage) {
      setAlertInfo({
        open: true,
        message: errorMessage,
        severity: 'warning'
      });
      setSubmitting(false);
      return;
    }

    // 제목/내용 기본 세팅
    let title = (values.title || '').trim();
    let content = (values.content || '').trim();

    const templateLabel = selectedForm?.value1 || '기타 양식';

    if (!title) title = `${user?.name || '사용자'} (${user?.position}) - ${templateLabel}`;
    if (!content) content = `${templateLabel} 신청합니다.`;

    let formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('templateCode', selectedForm.code);

    toFormData(templateValues, formData);

    approvers.forEach((approver, index) => {
      formData.append(`approvalLines[${index}].approverId`, approver.employeeId);
      formData.append(`approvalLines[${index}].approvalOrder`, index + 1);
    });

    references.forEach((referrer, index) => {
      formData.append(`approvalReferences[${index}].referrerId`, referrer.employeeId);
    });

    if (attachments && attachments.length > 0) {
      attachments.forEach((file) => formData.append('multipartFile', file));
    }

    try {
      setSubmitting(true);

      await createApproval(formData);

      setAlertInfo({
        open: true,
        message: '결재가 성공적으로 상신되었습니다.',
        severity: 'success'
      });

      setTimeout(() => navigate('/approval/list/draft'), 1000);
    } catch (error) {
      const errorMessage = error.response?.data?.message || '상신 실패';
      setAlertInfo({
        open: true,
        message: errorMessage,
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
            onOpenModal={() => !readOnly && setOpen(true)}
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
                    draftUser={initialData?.creator?.name ?? user?.name}
                    draftDept={initialData?.creator?.department ?? user?.departmentName}
                    draftPosition={initialData?.creator?.position ?? user?.positionName}
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

        {/* 우측: 결재자/참조자 타임라인 */}
        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          <Grid container spacing={gridSpacing}>
            {/* 결재자 */}
            <Grid size={12}>
              <SubCard title="결재자" darkTitle={true}>
                <Timeline sx={{ m: 0, p: 0, '& .MuiTimelineItem-root': { minHeight: 0 } }}>
                  {approvers.map((approver, index) => {
                    const emp = initialData ? approver.approver : approver;
                    const profileImg = emp?.profileImg ?? null;

                    return (
                      <TimelineItem key={index} sx={{ '&::before': { content: 'none' } }}>
                        <TimelineSeparator>
                          <TimelineDot color="primary" />
                          {index < approvers.length - 1 && <TimelineConnector sx={{ bgcolor: 'primary.light' }} />}
                        </TimelineSeparator>

                        <TimelineContent sx={{ pb: index < approvers.length - 1 ? 2 : 0, pt: '6px' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                              label={`${emp?.name ?? '정보 없음'} ${emp?.position ?? ''}`}
                              avatar={
                                <Avatar
                                  alt={emp?.name ?? '정보 없음'}
                                  src={profileImg ? getImageUrl(profileImg) : DefaultAvatar}
                                  sx={{ width: 36, height: 36 }}
                                />
                              }
                              onClick={handleClick}
                              variant="outlined"
                            />

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
                    );
                  })}
                </Timeline>
              </SubCard>
            </Grid>

            {/* 참조자 */}
            <Grid size={12}>
              <SubCard title="참조자" darkTitle={true}>
                <Timeline sx={{ m: 0, p: 0, '& .MuiTimelineItem-root': { minHeight: 0 } }}>
                  {references.map((ref, index) => {
                    const profileImg = ref?.profileImg ?? null;

                    return (
                      <TimelineItem key={index} sx={{ '&::before': { content: 'none' } }}>
                        <TimelineSeparator>
                          <TimelineDot color="primary" />
                          {index < references.length - 1 && <TimelineConnector sx={{ bgcolor: 'primary.light' }} />}
                        </TimelineSeparator>

                        <TimelineContent sx={{ pb: index < references.length - 1 ? 2 : 0, pt: '6px' }}>
                          <Chip
                            label={`${ref?.name ?? '정보 없음'} ${ref?.position ?? ''}`}
                            avatar={<Avatar alt={ref?.name} src={profileImg ? getImageUrl(profileImg) : DefaultAvatar} />}
                            onClick={handleClick}
                            variant="outlined"
                          />
                        </TimelineContent>
                      </TimelineItem>
                    );
                  })}
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
