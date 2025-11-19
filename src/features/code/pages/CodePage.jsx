import { useEffect, useState } from 'react';

import { Box, Button, Grid, Stack, Alert } from '@mui/material';

import { gridSpacing } from 'store/constant';
import MainCard from 'ui-component/cards/MainCard';
import CommonDataGrid from 'features/list/components/CommonDataGrid';
import CodeList from 'features/code/components/CodeList';
import CodeForm from 'features/code/components/CodeForm';

import { codeAPI } from 'features/code/api/codeAPI';

import { useMenu } from 'contexts/MenuContext';

const initialState = {
  commonCodeId: null,
  code: null,
  codeDescription: null,
  value1: null,
  value2: null,
  value3: null,
  sortOrder: 0,
  isDisabled: false,
  creator: null,
  createdAt: null,
  updater: null,
  updatedAt: null
};

export default function CodePage() {
  const [mainCategories, setMainCategories] = useState([]);
  const [selectedPrefix, setSelectedPrefix] = useState(null);
  const [selectedCodeDetail, setSelectedCodeDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // DataGrid용 에러
  const [subRefreshKey, setSubRefreshKey] = useState(0); // 소분류 목록 새로고침을 위한 Key

  // 사용자 피드백용 Alert 상태
  const [alertInfo, setAlertInfo] = useState({
    open: false,
    message: '',
    severity: 'info' // 'success', 'error', 'warning', 'info'
  });

  const { refreshMenuData, relevantMenuPrefixes } = useMenu();

  // 대분류 API 호출 로직
  const fetchMainCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await codeAPI.getAllPrefix();
      setMainCategories(data);
    } catch (err) {
      const fetchError = err.message || '데이터를 불러오는데 실패했습니다.';
      setError(fetchError); // DataGrid에 에러 표시
      setAlertInfo({ open: true, message: fetchError, severity: 'error' }); // 상단에 알림 표시
    } finally {
      setLoading(false);
    }
  };

  // 대분류 API 첫 로드
  useEffect(() => {
    fetchMainCategories();
  }, []);

  // 대분류 행 클릭 시
  const handleCategoryClick = (category) => {
    setAlertInfo({ open: false }); // 다른 항목 선택 시 알림 닫기
    setSelectedPrefix(category.code);
    setSelectedCodeDetail(null); // 소분류 폼 초기화
  };

  // 소분류 행 클릭 시
  const handleSubCategoryClick = (code) => {
    setAlertInfo({ open: false }); // 다른 항목 선택 시 알림 닫기
    setSelectedCodeDetail(code); // 폼에 선택된 데이터 바인딩
  };

  // 신규 버튼 클릭 시
  const handleNewClick = () => {
    setAlertInfo({ open: false }); // 알림 닫기
    // 폼을 '신규' 상태로 설정 (initialState 사용)
    setSelectedCodeDetail(initialState);
  };

  // 폼 입력 변경 핸들러
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSelectedCodeDetail((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
    }));
  };

  // 저장 버튼 클릭 시
  const handleSave = async () => {
    setAlertInfo({ open: false }); // 이전 알림 닫기

    if (!selectedCodeDetail) {
      setAlertInfo({
        open: true,
        message: '저장할 데이터가 없습니다. 신규 버튼을 클릭하거나 항목을 선택하세요.',
        severity: 'warning'
      });
      return;
    }

    setLoading(true);
    setError(null); // DataGrid 에러 상태 초기화

    try {
      let response; // API 응답 (APIResponseDTO)

      if (selectedCodeDetail.commonCodeId) {
        // 수정 (ID가 있음)
        response = await codeAPI.updateCode(selectedCodeDetail.commonCodeId, selectedCodeDetail);
      } else {
        // 신규 (ID가 없음)
        const newCodeData = {
          ...selectedCodeDetail,
          prefix: selectedPrefix // selectedPrefix가 null이면 대분류(접두사)로 생성됨
        };
        response = await codeAPI.createCode(newCodeData);
      }

      // API 응답 DTO에 data 필드가 있는지 확인
      if (response && response.data) {
        setAlertInfo({ open: true, message: response.message || '저장되었습니다.', severity: 'success' });

        // 대분류/소분류 모두 새로고침
        fetchMainCategories(); // 대분류 목록 새로고침
        setSubRefreshKey((prevKey) => prevKey + 1); // CodeList(소분류) 새로고침 트리거

        // 신규 저장 시에도 폼 데이터 유지 (응답 DTO로 채움)
        setSelectedCodeDetail(response.data);

        // 저장된 코드의 접두사(selectedPrefix)가 MenuContext가 관심있는 목록에 포함되어 있다면
        if (relevantMenuPrefixes && relevantMenuPrefixes.includes(selectedPrefix)) {
          // MenuContext의 데이터 갱신 함수 호출
          if (typeof refreshMenuData === 'function') {
            refreshMenuData();
          }
        }
      } else {
        const errorMsg = response.message || '저장에 실패했습니다.';
        setError(errorMsg); // (선택적) DataGrid에도 에러 전파가 필요하다면 유지
        setAlertInfo({ open: true, message: errorMsg, severity: 'error' });
      }
    } catch (err) {
      const errorMsg = err.message || '저장 중 알 수 없는 오류가 발생했습니다.';
      setError(errorMsg); // (선택적) DataGrid 에러
      setAlertInfo({ open: true, message: `저장 실패: ${errorMsg}`, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const mainCategoryColumns = [
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
    <>
      <MainCard
        title={
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Button variant="outlined" color="secondary" onClick={handleNewClick} disabled={loading}>
              신규
            </Button>
            <Button variant="contained" color="primary" onClick={handleSave} disabled={loading || !selectedCodeDetail}>
              {loading ? '저장 중...' : '저장'}
            </Button>
          </Stack>
        }
        secondary={
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', width: '100%' }}>
            {alertInfo.open && (
              <Alert severity={alertInfo.severity} onClose={() => setAlertInfo({ open: false })} sx={{ width: '100%', py: 0.3 }}>
                {alertInfo.message}
              </Alert>
            )}
          </Stack>
        }
        content={false}
        sx={{
          height: '80vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            padding: 3
          }}
        >
          <Grid
            container
            spacing={gridSpacing}
            justifyContent="center"
            wrap="nowrap"
            sx={{
              flex: 1,
              flexWrap: 'nowrap',
              alignItems: 'stretch',
              overflow: 'hidden',
              minHeight: '400px'
            }}
          >
            {/* 대분류 */}
            <Grid
              size={{ xs: 12, md: 4 }}
              sx={{
                height: '100%',
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
              <MainCard
                title="대분류"
                content={false}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  border: '1px solid',
                  '& .MuiCardHeader-root': {
                    padding: 1.5
                  }
                }}
              >
                <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
                  <CommonDataGrid
                    rows={mainCategories}
                    columns={mainCategoryColumns}
                    loading={loading}
                    error={error} // DataGrid용 에러 상태 전달
                    scrollEnabled={true}
                    getRowId={(row) => row.commonCodeId}
                    onRowClick={(params) => handleCategoryClick(params.row)}
                    hideFooter={true}
                  />
                </Box>
              </MainCard>
            </Grid>

            {/* 중분류 (CodeList) */}
            <Grid
              size={{ xs: 12, md: 4 }}
              sx={{
                height: '100%',
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
              <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                <CodeList selectedPrefix={selectedPrefix} onRowClick={handleSubCategoryClick} refreshKey={subRefreshKey} />
              </Box>
            </Grid>

            {/* 상세 (CodeForm) */}
            <Grid
              size={{ xs: 12, md: 4 }}
              sx={{
                height: '100%',
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
              <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                <CodeForm selectedPrefix={selectedPrefix} selectedData={selectedCodeDetail} onFormChange={handleFormChange} />
              </Box>
            </Grid>
          </Grid>
        </Box>
      </MainCard>
    </>
  );
}