import React, { useEffect, useMemo, useState } from 'react';

// material-ui
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';
import { getApprovalList } from '../api/approvalAPI';
import CommonDataGrid from 'features/list/components/CommonDataGrid';
import Avatar from 'ui-component/extended/Avatar';
import DefaultAvatar from 'assets/images/profile/default_profile.png';
import { getImageUrl } from 'api/getImageUrl';
import GridPaginationActions from 'features/list/components/GridPaginationActions';

// assets
import { IconSearch } from '@tabler/icons-react';

const titleMapping = {
  pending: '결재 대기 목록',
  draft: '결재 기안 목록',
  completed: '결재 완료 목록',
  reference: '결재 참조 목록'
};

// ==============================|| HELPER FUNCTIONS (From ApprovalContents) ||============================== //

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
      <Avatar alt={user.name} src={user.profileImg ? getImageUrl(user.profileImg) : DefaultAvatar} />
      <Stack>
        <Typography variant="subtitle1">{`${user.name} (${user.department || '부서미지정'})`}</Typography>
        <Typography variant="subtitle2" noWrap>
          {user.email}
        </Typography>
      </Stack>
    </Stack>
  );
};

export default function ApprovalList({ status }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    content: [],
    totalPages: 0,
    totalElements: 0,
    number: 0,
    size: 10
  });
  const [processedRows, setProcessedRows] = useState([]);

  const [page, setPage] = useState(1); // MUI Pagination은 1-based
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // status(목록 종류)가 변경될 때 page를 1로 리셋
  useEffect(() => {
    setPage(1);
  }, [status]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setProcessedRows([]);

      try {
        // API는 0-based page를 사용하므로 1을 뺌
        const apiPage = page - 1;
        const response = await getApprovalList(status, apiPage, rowsPerPage);
        setData(response);

        const processed = response.content.map((row, index) => {
          // 순번 (0-based page * size + index + 1)
          const serialNumber = response.number * response.size + index + 1;
          const draftDate = row.createdAt ? row.createdAt.split('T')[0] : '';
          const drafter = row.creator;
          const approver = row.approvalLines && row.approvalLines.length > 0 ? row.approvalLines[0].approver : null;

          let displayStatusValue = null;
          const docStatus = row.docStatus.value1;

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

          return {
            id: row.docId || index, // DataGrid는 'id' 필드를 고유 식별자로 사용
            serialNumber,
            draftDate,
            formName: '현재 미구현 기능',
            title: row.title,
            drafter,
            approver,
            status: displayStatusValue
          };
        });
        setProcessedRows(processed);
      } catch (err) {
        console.error(err);
        setError(err.message || '데이터를 불러오는데 실패했습니다.');
        setProcessedRows([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [status, page, rowsPerPage]);

  const columns = useMemo(() => {
    // '결재 기안 목록'이 아닐 때만 상신자(drafter)를 보여줌
    const showDrafter = status !== 'draft';
    // '결재 대기 목록'이 아닐 때만 결재자(approver)를 보여줌
    const showApprover = status !== 'pending';

    // 결재자 열 헤더 텍스트 동적 변경
    let approverHeaderText = '결재자';
    if (status === 'reference' || status === 'completed') {
      approverHeaderText = '최종 결재자';
    }

    const baseColumns = [
      {
        field: 'serialNumber',
        headerName: '#',
        width: 70,
        align: 'center',
        headerAlign: 'center',
        sortable: false
      },
      {
        field: 'draftDate',
        headerName: '기안일',
        width: 150,
        align: 'center',
        headerAlign: 'center',
        sortable: false
      },
      {
        field: 'formName',
        headerName: '결재양식',
        width: 140,
        align: 'center',
        headerAlign: 'center',
        sortable: false
      },
      {
        field: 'title',
        headerName: '제목',
        flex: 1,  // 가장 여유가 필요한곳에 flex:1 추가 (반드시 추가해야함)
        minWidth: 150,
        sortable: false
      }
    ];

    if (showDrafter) {
      baseColumns.push({
        field: 'drafter',
        headerName: '상신자',
        width: 250,
        headerAlign: 'center',
        sortable: false,
        renderCell: (params) => renderUserStack(params.value)
      });
    }

    if (showApprover) {
      baseColumns.push({
        field: 'approver',
        headerName: approverHeaderText,
        width: 250,
        headerAlign: 'center',
        sortable: false,
        renderCell: (params) => renderUserStack(params.value)
      });
    }

    baseColumns.push({
      field: 'status',
      headerName: '결재상태',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      renderCell: (params) => getStatusChip(params.value)
    });

    return baseColumns;
  }, [status]);

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newSize) => {
    setRowsPerPage(newSize);
    setPage(1);
  };

  return (
    <MainCard
      title={
        <Grid container spacing={gridSpacing} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Grid>
            <Typography variant="h3">{titleMapping[status]}</Typography>
          </Grid>
          <Grid>
            <OutlinedInput
              id="input-search-list-style1"
              placeholder="Search"
              startAdornment={
                <InputAdornment position="start">
                  <IconSearch stroke={1.5} size="16px" />
                </InputAdornment>
              }
              size="small"
            />
          </Grid>
        </Grid>
      }
      content={false}
    >
      <CommonDataGrid rows={processedRows} columns={columns} loading={loading} error={error} />

      <GridPaginationActions
        totalPages={data.totalPages}
        page={page}
        onPageChange={handlePageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleRowsPerPageChange}
        loading={loading}
        error={error}
        rowsPerPageOptions={[10, 20, 30]}
      />
    </MainCard>
  );
}
