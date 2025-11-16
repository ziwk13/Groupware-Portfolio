import React from 'react';

// material-ui
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// mui-x
import { DataGrid } from '@mui/x-data-grid';

function CustomNoRowsOverlay() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
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
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Typography color="error">데이터 조회 실패: {message}</Typography>
    </Box>
  );
}

export default function CommonDataGrid({
  rows,
  columns,
  loading,
  error,
  scrollEnabled = false,
  ...props
}) {
  if (error) {
    return <ErrorDisplay message={error} />;
  }

  return (
    // scrollEnabled가 true일 때 Box의 높이를 100%로 설정하여 부모 컨테이너의 높이를 따름
    <Box sx={{ width: '100%', height: scrollEnabled ? '100%' : 'auto' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        getRowHeight={() => 'auto'}
        autoHeight={!scrollEnabled} // [CHANGED] scrollEnabled 값에 따라 autoHeight 토글
        hideFooterPagination={true}
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