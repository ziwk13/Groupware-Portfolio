import { useEffect, useMemo, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

import GridPaginationActions from 'features/list/components/GridPaginationActions';
import { getEmployeeHistory } from 'features/employee/api/employeeAPI';

export default function EmployeeHistoryModal({ open, onClose, employee }) {
  const [historyData, setHistoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 페이지네이션 상태
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  // DataGrid 컬럼 정의
  const columns = useMemo(
    () => [
      {
        field: 'changedAt',
        headerName: '변경 일시',
        flex: 1,
        minWidth: 200,
        valueFormatter: (value) => {
          if (!value) return '';
          return new Date(value).toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          });
        }
      },
      {
        field: 'fieldName',
        headerName: '변경 항목',
        flex: 1,
        minWidth: 100
      },
      {
        field: 'oldValue',
        headerName: '변경 전 값',
        flex: 1.5,
        minWidth: 100,
        sortable: false,
        valueFormatter: (value) => value ?? ' - '
      },
      {
        field: 'newValue',
        headerName: '변경 후 값',
        flex: 1.5,
        minWidth: 100,
        sortable: false,
        valueFormatter: (value) => value ?? ' - '
      },
      {
        field: 'updaterUsername',
        headerName: '변경 수행자',
        flex: 1,
        minWidth: 100,
        valueFormatter: (value) => (employee && value === employee.username ? '사용자 본인' : value)
      }
    ],
    [employee]
  );

  // 페이지 변경 핸들러
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  // 페이지 당 행 수 변경 핸들러
  const handleRowsPerPageChange = (newSize) => {
    setRowsPerPage(newSize);
    setPage(1); // 페이지 크기 변경 시 1페이지로 리셋
  };
  // -----------------------------------

  useEffect(() => {
    if (open && employee?.employeeId) {
      const fetchHistory = async () => {
        setIsLoading(true);
        try {
          const apiPage = page - 1;
          const params = {
            page: apiPage,
            size: rowsPerPage
          };
          const response = await getEmployeeHistory(employee.employeeId, params);
          const pageData = response.data.data;

          if (pageData && pageData.content) {
            setHistoryData(pageData.content);
            setTotalPages(pageData.totalPages || 0);
          } else {
            setHistoryData([]);
            setTotalPages(0);
          }
        } catch (error) {
          console.error('Failed to fetch employee history:', error);
          setHistoryData([]);
          setTotalPages(0);
        } finally {
          setIsLoading(false);
        }
      };

      fetchHistory();
    }
  }, [open, employee, page, rowsPerPage]);

  useEffect(() => {
    // 모달이 닫힐 때 상태 초기화
    if (!open) {
      setHistoryData([]);
      setTotalPages(0);
      setPage(1); // 1-based
      setRowsPerPage(10);
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        sx: {
          minWidth: '60vw',
          maxWidth: '60vw',
          height: '78vh',
          boxShadow: 'none',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', fontWeight: 700, fontSize: '1.4rem' }}>{'인사 변동 이력'}</DialogTitle>
      <Divider sx={{ mb: 2 }} />

      <DialogContent sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '0 24px' }}>
        <DataGrid
          rows={historyData}
          columns={columns}
          loading={isLoading}
          getRowId={(row) => row.historyId}
          hideFooter
          localeText={{
            noRowsLabel: '인사 정보 변동 이력이 없습니다.'
          }}
          disableSelectionOnClick
          density="compact"
          sx={{
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 600,
              fontSize: '1rem'
            }
          }}
        />
      </DialogContent>

      {totalPages > 0 && (
        <GridPaginationActions
          totalPages={totalPages}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
          loading={isLoading}
          rowsPerPageOptions={[10, 20, 50]}
        />
      )}

      <DialogActions sx={{ justifyContent: 'center', pb: 2, pt: 0 }}>
        <Button onClick={onClose} variant="contained" color="primary">
          닫기
        </Button>
      </DialogActions>
    </Dialog>
  );
}