import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import CommonDataGrid from 'features/list/components/CommonDataGrid';
import { codeAPI } from 'features/code/api/codeAPI';

export default function CodeList({ selectedPrefix, onRowClick, refreshKey }) {
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // selectedPrefix 또는 refreshKey가 변경될 때마다 API를 호출
  useEffect(() => {
    if (!selectedPrefix) {
      setSubCategories([]);
      return;
    }

    const fetchSubCategories = async () => {
      setLoading(true);
      setError(null);
      setSubCategories([]); // 로딩 시작 시 목록을 비워 이전 데이터가 보이는 것을 방지
      try {
        const data = await codeAPI.getAllCode(selectedPrefix);
        setSubCategories(data);
      } catch (err) {
        setError(err.message || '데이터를 불러오는데 실패했습니다.');
        setSubCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubCategories();
  }, [selectedPrefix, refreshKey]);

  const subCategoryColumns = [
    {
      field: 'code',
      headerName: '코드',
      flex: 1,
      minWidth: 80,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'codeDescription',
      headerName: '코드 설명',
      flex: 2,
      minWidth: 120,
      headerAlign: 'center',
      align: 'left'
    }
  ];

  return (
    <MainCard
      title="소분류"
      content={false}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid',
        '& .MuiCardHeader-root': { padding: 1.5 }
      }}
    >
      {!selectedPrefix && (
        <Box
          sx={{
            p: 3,
            flex: 1,
            minHeight: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'text.secondary'
          }}
        >
          대분류 코드를 선택하세요
        </Box>
      )}

      {selectedPrefix && (
        <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <CommonDataGrid
            rows={subCategories}
            columns={subCategoryColumns}
            loading={loading}
            error={error}
            scrollEnabled={true}
            getRowId={(row) => row.commonCodeId}
            onRowClick={(params) => onRowClick(params.row)}
            hideFooter={true}
          />
        </Box>
      )}
    </MainCard>
  );
}