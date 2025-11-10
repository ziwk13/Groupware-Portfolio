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

// assets
function handleClick() {}

export default function AddApproval() {
  const [approvers, setApprovers] = useState([
    {
      employeeId: 1,
      username: '일승인',
      position: '과장',
      profileImg: 'APPROVAL/2025/11/09/0ee159432c9440608caa091df28e33a0.png'
    },
    {
      employeeId: 2,
      username: '이승인',
      position: '팀장',
      profileImg: '/assets/images/users/avatar-2.png'
    },
    {
      employeeId: 3,
      username: '김결재',
      position: '인사과장',
      profileImg: '/assets/images/users/avatar-1.png'
    }
  ]); // 결재자 정보

  const [references, setReferences] = useState([
    {
      employeeId: 4,
      username: '박참조',
      position: '사원',
      profileImg: '/assets/images/users/avatar-3.png'
    },
    {
      employeeId: 5,
      username: '박참조',
      position: '사원',
      profileImg: '/assets/images/users/avatar-3.png'
    },
    {
      employeeId: 6,
      username: '박참조',
      position: '사원',
      profileImg: '/assets/images/users/avatar-3.png'
    },
    {
      employeeId: 7,
      username: '박참조',
      position: '사원',
      profileImg: '/assets/images/users/avatar-3.png'
    },
    {
      employeeId: 8,
      username: '박참조',
      position: '사원',
      profileImg: '/assets/images/users/avatar-3.png'
    }
  ]); // 참조자 정보

  const [startTime, setStartTime] = useState(new Date()); // 결재 시작일
  const [endTime, setEndTime] = useState(new Date()); // 결재 종료일
  const [selectedForm, setSelectedForm] = useState(null); // 선택한 결재 양식
  const [attachments, setAttachments] = useState([]);

  return (
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
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 3 }}>
        <Grid container spacing={gridSpacing}>
          <Grid size={12}>
            <SubCard
              title="결재자"
              darkTitle={true}
            >
              <Timeline sx={{ m: 0, p: 0, '& .MuiTimelineItem-root': { minHeight: 0 } }}>
                {approvers.map((approver, index) => (
                  <TimelineItem key={index} sx={{ '&::before': { content: 'none' } }}>
                    <TimelineSeparator>
                      <TimelineDot color="primary" />
                      {/* 마지막 항목이 아니면 Connector(연결선) 표시 */}
                      {index < approvers.length - 1 && <TimelineConnector sx={{ bgcolor: 'primary.light' }} />}
                    </TimelineSeparator>

                    {/* 마지막 항목이 아닐 경우 하단 여백(pb)을 줘서 Chip들이 겹치지 않게 함 */}
                    <TimelineContent sx={{ pb: index < approvers.length - 1 ? 2 : 0, pt: '6px' }}>
                      <Chip
                        label={`${approver.username} ${approver.position}`}
                        avatar={<Avatar alt={approver.username} src={approver.profileImg ? getImageUrl(approver.profileImg) : DefaultAvatar} />}
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
                  label={`${ref.username} ${ref.position}`}
                  avatar={<Avatar alt={ref.username} src={ref.profileImg ? getImageUrl(ref.profileImg) : DefaultAvatar} />}
                  onClick={handleClick}
                  variant="outlined"
                />
              ))}
            </SubCard>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}