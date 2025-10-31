import React from 'react';

// material-ui
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

// project imports
import Avatar from 'ui-component/extended/Avatar';

// ==============================|| MOCK DATA & UTILS ||============================== //

// 이미지 경로 유틸리티
const ImagePath = {
  USERS: 'assets/images/users/' // 템플릿의 기본 이미지 경로 가정
};

// 이미지 경로를 조합해주는 간단한 함수
const getImageUrl = (name, path) => {
  return `${path}${name}`;
};

// 상신자/결재자 모두 프로필, 이름, 이메일을 갖도록 더미 데이터 수정
const dummyApprovals = [
  {
    id: '#1',
    draftDate: '2025-10-31',
    // 상신자 정보
    drafterAvatar: 'avatar-1.png',
    drafterName: '김철수 (영업팀)',
    drafterEmail: 'chulsoo.kim@example.com',
    // 결재자 정보
    approverAvatar: 'avatar-2.png',
    approverName: '박영희 (인사팀)',
    approverEmail: 'younghee.park@example.com',
    // 문서 정보
    formType: '휴가 신청서',
    title: '2025년 하계 휴가 사용 신청',
    status: 'Pending' // '진행중'
  },
  {
    id: '#2',
    draftDate: '2025-10-30',
    // 상신자 정보
    drafterAvatar: 'avatar-3.png',
    drafterName: '이민준 (개발팀)',
    drafterEmail: 'minjun.lee@example.com',
    // 결재자 정보
    approverAvatar: 'avatar-4.png',
    approverName: '최지우 (개발팀장)',
    approverEmail: 'jiwoo.choi@example.com',
    // 문서 정보
    formType: '지출 결의서',
    title: '개발용 소프트웨어 구매',
    status: 'Active' // '승인'
  },
  {
    id: '#3',
    draftDate: '2025-10-29',
    // 상신자 정보
    drafterAvatar: 'avatar-4.png',
    drafterName: '최지우 (개발팀장)',
    drafterEmail: 'jiwoo.choi@example.com',
    // 결재자 정보
    approverAvatar: 'avatar-5.png', // 결재자 임의 아바타
    approverName: '이영자 (경영지원팀)',
    approverEmail: 'youngja.lee@example.com',
    // 문서 정보
    formType: '기안서',
    title: '신규 프로젝트 인력 충원 요청',
    status: 'Rejected' // '반려'
  },
  {
    id: '#4',
    draftDate: '2025-10-28',
    // 상신자 정보
    drafterAvatar: 'avatar-2.png',
    drafterName: '박영희 (인사팀)',
    drafterEmail: 'younghee.park@example.com',
    // 결재자 정보
    approverAvatar: 'avatar-1.png',
    approverName: '김철수 (영업팀)',
    approverEmail: 'chulsoo.kim@example.com',
    // 문서 정보
    formType: '휴가 신청서',
    title: '경조 휴가 신청',
    status: 'Active' // '승인'
  }
];

// ==============================|| APPROVAL CONTENTS ||============================== //

export default function ApprovalContents({ status }) {
  const [data, setData] = React.useState(dummyApprovals);

  // '결재 기안 목록'이 아닐 때만 상신자(drafter)를 보여줌
  const showDrafter = status !== 'draft';
  // '결재 대기 목록'과 '결재 완료 목록'이 아닐 때만 결재자(approver)를 보여줌
  const showApprover = status !== 'pending' && status !== 'completed';

  return (
    <TableContainer>
      <Table
        sx={{
          tableLayout: 'fixed', // 테이블이 TableHead에 정의된 너비를 기준으로 컬럼을 그리도록
          // 컬럼 구분선
          '& .MuiTableCell-root': {
            borderRight: '1px solid rgba(224, 224, 224, 1)'
          },
          '& .MuiTableCell-root:last-child': {
            borderRight: 'none'
          },

          // TableBody 내부의 모든 TableCell의 상하 여백(padding)을 줄임
          '& .MuiTableBody-root .MuiTableCell-root': {
            py: 1.3 // py: 1는 8px (MUI 기본값 16px)
          }
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell sx={{ pl: 3, width: 50 }} align="center">
              #
            </TableCell>
            <TableCell sx={{ width: 100 }} align="center">
              기안일
            </TableCell>
            <TableCell sx={{ width: 110 }} align="center">
              결재양식
            </TableCell>
            <TableCell sx={{ width: 240 }} align="center">
              제목
            </TableCell>
            {showDrafter && (
              <TableCell sx={{ width: 250 }} align="center">
                상신자
              </TableCell>
            )}
            {showApprover && (
              <TableCell sx={{ width: 250 }} align="center">
                결재자
              </TableCell>
            )}
            <TableCell sx={{ width: 80 }} align="center">
              결재상태
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data &&
            data.map((row, index) => (
              <TableRow hover key={index}>
                <TableCell sx={{ pl: 3 }}>{row.id}</TableCell>
                <TableCell>{row.draftDate}</TableCell>
                <TableCell>{row.formType}</TableCell>
                <TableCell>
                  <Typography variant="subtitle1" noWrap>
                    {row.title}
                  </Typography>
                </TableCell>
                {showDrafter && (
                  <TableCell>
                    <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
                      <Avatar alt={row.drafterName} src={getImageUrl(row.drafterAvatar, ImagePath.USERS)} />
                      <Stack>
                        <Typography variant="subtitle1">{row.drafterName}</Typography>
                        <Typography variant="subtitle2" noWrap>
                          {row.drafterEmail}
                        </Typography>
                      </Stack>
                    </Stack>
                  </TableCell>
                )}
                {showApprover && (
                  <TableCell>
                    <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
                      <Avatar alt={row.approverName} src={getImageUrl(row.approverAvatar, ImagePath.USERS)} />
                      <Stack>
                        <Typography variant="subtitle1">{row.approverName}</Typography>
                        <Typography variant="subtitle2" noWrap>
                          {row.approverEmail}
                        </Typography>
                      </Stack>
                    </Stack>
                  </TableCell>
                )}
                <TableCell align="center">
                  {row.status === 'Active' && <Chip label="승인" size="small" color="success" />}
                  {row.status === 'Rejected' && <Chip label="반려" size="small" color="error" />}
                  {row.status === 'Pending' && <Chip label="진행중" size="small" color="warning" />}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
