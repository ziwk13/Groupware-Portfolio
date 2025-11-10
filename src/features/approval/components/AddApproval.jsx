// material-ui
import Grid from '@mui/material/Grid';
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot } from '@mui/lab';

// project imports
import { gridSpacing } from 'store/constant';
import SubCard from 'ui-component/cards/SubCard';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import ApprovalForm from './ApprovalForm';
import { useState } from 'react';

import DefaultAvatar from 'assets/images/profile/default_profile.png';
import { getImageUrl } from 'utils/getImageUrl';

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

export default function AddApproval() {
  const navigate = useNavigate();

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

  const handleFormSubmit = async (values, { setSubmitting }) => {
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
            onOpenModal={() => setOpen(true)}
            onFormSubmit={handleFormSubmit}
            alertInfo={alertInfo}
            setAlertInfo={setAlertInfo}
          />
        </Grid>
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
                          avatar={<Avatar alt={approver.name} src={approver.profileImg ? getImageUrl(approver.profileImg) : DefaultAvatar} />}
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
                contentSX={{ display: 'flex', justifyContent: 'left', alignItems: 'center', flexWrap: 'wrap', gap: 0.5, '&:last-child': { pb: 2.5 } }}
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
      <OrganizationModal open={open} onClose={() => setOpen(false)} list={list} setList={setList} />
    </>
  );
}