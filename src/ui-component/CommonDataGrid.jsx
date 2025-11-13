import React from 'react';

// material-ui
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// mui-x
import { DataGrid } from '@mui/x-data-grid';

function CustomNoRowsOverlay() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'auto', minHeight: '200px' }}>
      <Typography>데이터가 없습니다.</Typography>
    </Box>
  );
}

function ErrorDisplay({ message }) {
  return (
    <Box
      sx={{
        p: 3,
        textAlign: 'center',
        height: 'auto',
        minHeight: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Typography color="error">데이터 조회 실패: {message}</Typography>
    </Box>
  );
}

export default function CommonDataGrid({ rows, columns, loading, error, ...props }) {
  if (error) {
    return <ErrorDisplay message={error} />;
  }

  return (
    <Box sx={{ width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        getRowHeight={() => 'auto'}
        autoHeight
        hideFooterPagination={true}
        disableRowSelectionOnClick
        disableColumnMenu
        slots={{
          noRowsOverlay: CustomNoRowsOverlay
        }}
        sx={{
          // 개별 헤더 셀
          '& .MuiDataGrid-columnHeader': {
            borderRight: '1px solid rgba(224, 224, 224, 1)'
          },
          // 모든 데이터 셀 공통
          '& .MuiDataGrid-cell': {
            borderRight: '1px solid rgba(224, 224, 224, 1)',
            py: 1,
            px: 1.5,
            display: 'flex',
            alignItems: 'center'
          },
          // 헤더 행 컨테이너
          '& .MuiDataGrid-columnHeaders': {
            borderBottom: '1px solid rgba(224, 224, 224, 1)'
          },
          // 마지막 열 테두리 제거
          '& .MuiDataGrid-columnHeader:last-of-type, & .MuiDataGrid-cell:last-of-type': {
            borderRight: 'none'
          },
          // 'textCenter' 클래스 셀 (수평 중앙 정렬)
          '& .MuiDataGrid-cell--textCenter': {
            justifyContent: 'center'
          },
          // 'textRight' 클래스 셀 (수평 우측 정렬)
          '& .MuiDataGrid-cell--textRight': {
            justifyContent: 'flex-end'
          },
          // 헤더 제목 컨테이너 (정렬)
          '& .MuiDataGrid-columnHeaderTitleContainer': {
            justifyContent: 'center'
          }
        }}
        {...props}
      />
    </Box>
  );
}

CommonDataGrid.propTypes = {
  rows: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string // ApprovalList에서 문자열(message)을 전달하므로 string
};