// material-ui
import Grid from '@mui/material/Grid';
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot } from '@mui/lab';
import { Box } from '@mui/material';
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

// 날짜 포맷팅 함수
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

export default function AddApproval({ readOnly = false, initialData = null }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [templateValues, setTemplateValues] = useState({});

  // 알림 상태
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

  const [startTime, setStartTime] = useState(new Date()); // 결재 시작일
  const [endTime, setEndTime] = useState(new Date()); // 결재 종료일
  const [selectedForm, setSelectedForm] = useState(null); // 선택한 결재 양식
  const [attachments, setAttachments] = useState([]); // 첨부파일

  // 모달 제어용 state
  const [open, setOpen] = useState(false);

  //  상세조회(initialData)일 때 상태 초기화
  useEffect(() => {
    if (!initialData) return;

    // 결재 양식 (CommonCode DTO)
    if (initialData.approvalTemplate) {
      setSelectedForm(initialData.approvalTemplate);
    }

    // 시작/종료일
    if (initialData.startDate) {
      setStartTime(new Date(initialData.startDate));
    }
    if (initialData.endDate) {
      setEndTime(new Date(initialData.endDate));
    }

    // 결재자 / 참조자 리스트
    const approverEmps = initialData.approvalLines?.map((line) => line.approver) ?? [];
    const refEmps = initialData.approvalReferences?.map((ref) => ref.referrer) ?? [];

    setList([
      { name: '결재자', empList: approverEmps },
      { name: '참조자', empList: refEmps }
    ]);

    // 첨부파일은
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

    const templateLabel = selectedForm.value1;

    if (!title) {
      title = `${user?.name || '사용자'} (${user?.position}) - ${templateLabel}`;
    }

    if (!content) {
      content = `${templateLabel} 신청합니다.`;
    }

    const formData = new FormData();

    formData.append('title', title);
    formData.append('content', content);

    if (selectedForm) {
      formData.append('templateCode', selectedForm.code);
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

  return (
    <>
      <Grid container spacing={gridSpacing} sx={{ alignItems: 'flex-start' }}>
        {/* 좌측: 작성 폼 */}
        <Grid size={{ xs: 12, md: 6, lg: 9 }}>
          <ApprovalForm
            selectedForm={selectedForm}
            setSelectedForm={setSelectedForm}
            startTime={startTime}
            setStartTime={setStartTime}
            endTime={endTime}
            setEndTime={setEndTime}
            attachments={attachments}
            setAttachments={setAttachments}
            approvers={approvers}
            references={references}
            onOpenModal={() => {
              if (!readOnly) setOpen(true);
            }}
            onFormSubmit={handleFormSubmit}
            alertInfo={alertInfo}
            setAlertInfo={setAlertInfo}
            TemplateRendererSlot={
              selectedForm ? (
                <TemplateRenderer
                  template={selectedForm}
                  approvalLines={approvers}
                  approvalReferences={references}
                  templateValues={templateValues}
                  setTemplateValues={setTemplateValues}
                  readOnly={readOnly}
                  docNo={initialData?.docNo}
                  draftUser={initialData?.creator?.name}
                  draftDept={initialData?.creator?.department}
                  draftPosition={initialData?.creator?.position}
                  draftDate={initialData?.createdAt}
                />
              ) : null
            }
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
                      <TimelineContent sx={{ pb: index < approvers.length - 1 ? 2 : 0, pt: '6px' }}>
                        <Chip
                          label={`${approver.name} ${approver.position}`}
                          avatar={
                            <Avatar alt={approver.name} src={approver.profileImg ? getImageUrl(approver.profileImg) : DefaultAvatar} />
                          }
                          onClick={handleClick}
                          variant="outlined"
                        />
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              </SubCard>
            </Grid>

            <Grid size={12}>
              <SubCard
                title="참조자"
                darkTitle={true}
                contentSX={{
                  display: 'flex',
                  justifyContent: 'left',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 0.5,
                  '&:last-child': { pb: 2.5 }
                }}
              >
                {references.map((ref, index) => (
                  <Chip
                    key={index}
                    label={`${ref.name} ${ref.position}`}
                    avatar={<Avatar alt={ref.name} src={ref.profileImg ? getImageUrl(ref.profileImg) : DefaultAvatar} />}
                    onClick={handleClick}
                    variant="outlined"
                  />
                ))}
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
