// material-ui
import Grid from '@mui/material/Grid';
// @mui/lab에서 Timeline 관련 컴포넌트 import
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot } from '@mui/lab';

// project imports
import { gridSpacing } from 'store/constant';
import SubCard from 'ui-component/cards/SubCard';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import ApprovalForm from './ApprovalForm';
import { useState } from 'react';

import User1 from 'assets/images/users/avatar-1.png'; //임시 이미지
import User2 from 'assets/images/users/avatar-2.png'; //임시 이미지

// assets
function handleClick() {}

// ==============================|| ADD NEW BLOG PAGE ||============================== //

export default function AddApproval() {
  // DTO 형식에 맞는 기본(default) 결재자 데이터로 초기화
  const [approvers, setApprovers] = useState([
    {
      username: '일승인',
      position: '과장',
      profileImg: '/assets/images/users/avatar-2.png' // 예시 경로
    },
    {
      username: '이승인',
      position: '팀장',
      profileImg: '/assets/images/users/avatar-2.png' // 예시 경로
    },{
      username: '김결재',
      position: '인사과장',
      profileImg: '/assets/images/users/avatar-1.png' // 예시 경로
    },
  ]); // 결재자 정보

  // DTO 형식에 맞는 기본(default) 참조자 데이터로 초기화
  const [references, setReferences] = useState([
    {
      username: '박참조',
      position: '사원',
      profileImg: '/assets/images/users/avatar-3.png' // 예시 경로
    },{
      username: '박참조',
      position: '사원',
      profileImg: '/assets/images/users/avatar-3.png' // 예시 경로
    },{
      username: '박참조',
      position: '사원',
      profileImg: '/assets/images/users/avatar-3.png' // 예시 경로
    },{
      username: '박참조',
      position: '사원',
      profileImg: '/assets/images/users/avatar-3.png' // 예시 경로
    },{
      username: '박참조',
      position: '사원',
      profileImg: '/assets/images/users/avatar-3.png' // 예시 경로
    },
  ]); // 참조자 정보

  const [startTime, setStartTime] = useState(new Date()); // 결재 시작일
  const [endTime, setEndTime] = useState(new Date()); // 결재 종료일 (오타 수정)
  const [selectedForm, setSelectedForm] = useState(null); // 선택한 결재 양식

  return (
    <Grid container spacing={gridSpacing} sx={{ alignItems: 'flex-start' }}>
      <Grid size={{ xs: 12, md: 6, lg: 8 }}>
        <ApprovalForm
          selectedForm={selectedForm}
          setSelectedForm={setSelectedForm}
          startTime={startTime}
          setStartTime={setStartTime}
          endTime={endTime}
          setEndTime={setEndTime}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <Grid container spacing={gridSpacing}>
          <Grid size={12}>
            {/* 결재자 SubCard */}
            <SubCard
              title="결재자"
              darkTitle={true}
            >
              <Timeline sx={{ m: 0, p: 0, '& .MuiTimelineItem-root': { minHeight: 0 } }}>
                {approvers.map((approver, index) => (
                  // TimelineItem의 왼쪽 기본 여백 제거
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
                        avatar={<Avatar alt={approver.username} src={User1} />}
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
            {/* 참조자 SubCard */}
            <SubCard
              title="참조자"
              darkTitle={true}
              contentSX={{ display: 'flex', justifyContent: 'left', alignItems: 'center', flexWrap: 'wrap', gap: 0.5, '&:last-child': { pb: 2.5 } }}
            >
              {references.map((ref, index) => (
                <Chip
                  key={index}
                  label={`${ref.username} ${ref.position}`}
                  avatar={<Avatar alt={ref.username} src={User2} />}
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