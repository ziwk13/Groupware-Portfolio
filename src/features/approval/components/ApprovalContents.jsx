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
import CircularProgress from '@mui/material/CircularProgress';
import DefaultAvatar from 'assets/images/profile/default_profile.png';
import {getImageUrl} from 'utils/getImageUrl';

// project imports
import Avatar from 'ui-component/extended/Avatar';

// ==============================|| UTILS ||============================== //


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

// ==============================|| APPROVAL CONTENTS ||============================== //

export default function ApprovalContents({ status, data, loading, error, page, size }) {
  // '결재 기안 목록'이 아닐 때만 상신자(drafter)를 보여줌
  const showDrafter = status !== 'draft';
  // '결재 대기 목록'이 아닐 때만 결재자(approver)를 보여줌
  const showApprover = status !== 'pending';

  // 컬럼 수 계산 (로딩/에러 시 colSpan 위해)
  let colSpan = 5; // 기본 컬럼 (순번, 기안일, 결재양식, 제목, 결재상태)
  if (showDrafter) colSpan++;
  if (showApprover) colSpan++;

  // 결재자 열 헤더 텍스트 동적 변경
  let approverHeaderText = '결재자';
  if (status === 'reference' || status === 'completed') {
    approverHeaderText = '최종 결재자';
  }

  // API 응답(creator 객체)을 아바타 컴포넌트에 맞게 렌더링
  const renderUserStack = (user) => {
    if (!user) {
      return (
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
          <Avatar alt="Unknown User" src={DefaultAvatar} />
          <Stack>
            <Typography variant="subtitle1">정보 없음</Typography>
            <Typography variant="subtitle2" noWrap>
              -
            </Typography>
          </Stack>
        </Stack>
      );
    }
    return (
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
        <Avatar alt={user.name} src={user.profile ? getImageUrl(user.profileImg) : DefaultAvatar} />
        <Stack>
          <Typography variant="subtitle1">{`${user.name} (${user.department || '부서미지정'})`}</Typography>
          <Typography variant="subtitle2" noWrap>
            {user.email}
          </Typography>
        </Stack>
      </Stack>
    );
  };


  return (
    <TableContainer>
      <Table
        sx={{
          tableLayout: 'fixed',
          '& .MuiTableCell-root': {
            borderRight: '1px solid rgba(224, 224, 224, 1)'
          },
          '& .MuiTableCell-root:last-child': {
            borderRight: 'none'
          },
          '& .MuiTableBody-root .MuiTableCell-root': {
            py: 1.3
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
            <TableCell sx={{ width: 120 }} align="center">
              결재양식
            </TableCell>
            <TableCell sx={{ width: 240 }} align="center">
              제목
            </TableCell>
            {showDrafter && (
              <TableCell sx={{ width: 220 }} align="center">
                상신자
              </TableCell>
            )}
            {showApprover && (
              <TableCell sx={{ width: 220 }} align="center">
                {approverHeaderText}
              </TableCell>
            )}
            <TableCell sx={{ width: 100 }} align="center">
              결재상태
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={colSpan} align="center" sx={{ py: 5 }}>
                <CircularProgress />
              </TableCell>
            </TableRow>
          ) : error ? (
            <TableRow>
              <TableCell colSpan={colSpan} align="center" sx={{ py: 5 }}>
                <Typography color="error">데이터 조회 실패: {error}</Typography>
              </TableCell>
            </TableRow>
          ) : !data || data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={colSpan} align="center" sx={{ py: 5 }}>
                <Typography>데이터가 없습니다.</Typography>
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, index) => {
              // 순번 (0-based page * size + index + 1)
              const serialNumber = page * size + index + 1;
              // 기안일
              const draftDate = row.createdAt ? row.createdAt.split('T')[0] : '';
              // 상신자 정보
              const drafter = row.creator;
              // 결재자 정보
              const approver = showApprover ? row.approvalLines[0].approver : null;

              let displayStatusValue = null;
              const docStatus = row.docStatus.value1;

              // 결재 상태를 위한 조건문
              if (docStatus === 'APPROVED') {
                displayStatusValue = 'DOC_APPROVED';
              } else if (docStatus === 'REJECTED') {
                displayStatusValue = 'DOC_REJECTED';
              } else if (docStatus === 'IN_PROGRESS') {
                // Doc 상태가 'IN_PROGRESS(진행중)'이면 결재선 상태를 확인
                if (row.approvalLines && row.approvalLines.length > 0) {
                  const lineToDisplay = row.approvalLines[0];

                  const lineStatus = lineToDisplay.approvalStatus.value1;

                  if (lineStatus === 'APPROVED') {
                    displayStatusValue = 'LINE_APPROVED';
                  } else if (lineStatus === 'AWAITING') {
                    displayStatusValue = 'AWAITING';
                  } else if (lineStatus === 'PENDING') {
                    displayStatusValue = 'PENDING';
                  }
                }
              }

              return (
                <TableRow hover key={row.docId || index}>
                  <TableCell sx={{ pl: 3 }} align="center">
                    {serialNumber}
                  </TableCell>
                  <TableCell align="center">{draftDate}</TableCell>
                  <TableCell align="center">현재 미구현 기능</TableCell>
                  <TableCell>
                    <Typography variant="subtitle1" noWrap sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {row.title}
                    </Typography>
                  </TableCell>
                  {showDrafter && <TableCell>{renderUserStack(drafter)}</TableCell>}
                  {showApprover && <TableCell>{renderUserStack(approver)}</TableCell>}
                  <TableCell align="center">{getStatusChip(displayStatusValue)}</TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
