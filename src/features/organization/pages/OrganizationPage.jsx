import { Box, Button, Grid, Stack, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { useEffect, useState } from 'react';
import { gridSpacing } from 'store/constant';
import MainCard from 'ui-component/cards/MainCard';

import OrganizationTree from 'features/organization/components/OrganizationTree';
import EmployeeList from 'features/organization/components/EmployeeList';
import EmployeeForm from '../components/EmployeeForm';
import { codeAPI } from 'features/code/api/codeAPI';
import useAuth from 'hooks/useAuth';
import Alert from '@mui/material/Alert';
import EmployeeHistoryModal from 'features/employee/components/EmployeeHistoryModal';
import SyncHRModal from 'features/employee/components/SyncHRModal';
import { deleteEmployee } from 'features/employee/api/employeeAPI';

// 신규 직원 생성을 위한 기본 템플릿
const defaultNewEmployee = {
  employeeId: null,
  username: '',
  name: '',
  email: '',
  phoneNumber: '',
  hireDate: new Date().toISOString().split('T')[0],
  status: null,
  department: null,
  position: null,
  role: null,
  profileImg: 'default_profile.png'
};

const findIdByValue1 = (list = [], value1) => {
  if (!Array.isArray(list) || !value1) {
    return null;
  }
  const found = list.find((item) => item.value1 === value1);
  return found ? found.commonCodeId : null;
};

export default function OrganizationPage() {
  // 1. 상태 변수 관리
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formData, setFormData] = useState(null);
  const [refreshList, setRefreshList] = useState(0);
  const [openHistory, setOpenHistory] = useState(false);
  const [openSyncHR, setOpenSyncHR] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState({ open: false, onConfirm: null });


  // Autocomplete(드롭다운)용 공통 코드
  const [commonCodes, setCommonCodes] = useState({
    status: [],
    positions: [],
    roles: []
  });

  const [alertInfo, setAlertInfo] = useState({
    open: false,
    message: '',
    severity: 'info' // 'success', 'error', 'warning', 'info'
  });

  const { register, adminUpdateEmployee, resetPassword } = useAuth();

  const resetPasswordHandler = async () => {
    setAlertInfo({ open: false });
    try {
      await resetPassword(selectedEmployee.employeeId);

      setAlertInfo({
        open: true,
        message: '비밀번호가 성공적으로 초기화되었습니다.',
        severity: 'success'
      });
    } catch (error) {
      console.error('비밀번호 초기화 실패:', error);
      const errorMessage = error.response?.data?.message || error.message;
      setAlertInfo({
        open: true,
        message: `비밀번호 초기화 중 오류가 발생했습니다: ${errorMessage}`,
        severity: 'error'
      });
    }
  };

  const handleCloseConfirm = () => setConfirmDialog({ open: false, onConfirm: null });

  // 2. 데이터 로딩 (공통 코드)
  useEffect(() => {
    // 페이지 마운트 시 공통 코드(직급, 재직상태, 권한)를 불러옴
    const loadCommonCodes = async () => {
      try {
        const [statusRes, positionsRes, rolesRes] = await Promise.all([
          codeAPI.getAllCodeWithoutRoot('ES'),
          codeAPI.getAllCodeWithoutRoot('PS'),
          codeAPI.getAllCodeWithoutRoot('AU'),
        ]);
        setCommonCodes({
          status: statusRes,
          positions: positionsRes,
          roles: rolesRes
        });
      } catch (error) {
        console.error('공통 코드 로딩 실패:', error);
        setAlertInfo({
          open: true,
          message: '필수 코드 로딩에 실패했습니다. 페이지를 새로고침해주세요.',
          severity: 'error'
        });
      }
    };
    loadCommonCodes();
  }, []);

  // 3. 부서가 변경될 때의 로직
  useEffect(() => {
    if (formData && !formData.employeeId) {
      setFormData((prev) => ({
        ...prev,
        department: selectedDept?.commonCodeId || null
      }));
    }
  }, [selectedDept]);

  const handleSelectEmployee = (employee) => {
    setSelectedEmployee(employee);

    // 공통 코드가 로드되었는지 확인
    const { status, positions, roles } = commonCodes;
    if (!status.length || !positions.length || !roles.length) {
      console.error('공통 코드가 아직 로드되지 않아 맵핑에 실패했습니다.');
      setFormData(employee);
      return;
    }

    // 원본 데이터를 복사하여, 문자열 -> ID로 변환
    const formReadyData = {
      ...employee,
      // 헬퍼 함수를 사용해 문자열 값을 ID 값으로 맵핑
      status: findIdByValue1(status, employee.status),
      position: findIdByValue1(positions, employee.position),
      role: findIdByValue1(roles, employee.role)
    };

    setFormData(formReadyData);
  };

  // (2) '신규' 버튼 클릭 시
  const handleNew = () => {
    setAlertInfo({ open: false });
    setSelectedEmployee(null);
    const defaultStatusId = findIdByValue1(commonCodes.status, 'ACTIVE'); // '재직'
    const defaultRoleId = findIdByValue1(commonCodes.roles, 'ROLE_USER'); // '일반'

    setFormData({
      ...defaultNewEmployee,
      department: selectedDept?.commonCodeId || null,
      status: defaultStatusId, // '재직' 상태 ID로 기본값 설정
      role: defaultRoleId // '일반' 권한 ID로 기본값 설정
    });
  };

  const handleSave = async () => {
    setAlertInfo({ open: false });

    if (!formData) {
      setAlertInfo({ open: true, message: '저장할 데이터가 없습니다.', severity: 'warning' });
      return;
    }

    // DTO 스펙에 맞게 데이터 가공
    const requestData = {
      username: formData.username,
      name: formData.name,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      hireDate: formData.hireDate,
      status: formData.status,
      profileImg: formData.profileImg,
      department: selectedDept.commonCodeId,
      position: formData.position,
      role: formData.role
    };

    try {
      let response;
      if (formData.employeeId) {
        response = await adminUpdateEmployee(formData.employeeId, requestData);
        setAlertInfo({ open: true, message: '직원 정보가 수정되었습니다.', severity: 'success' });
      } else {
        if (!formData.username) {
          setAlertInfo({ open: true, message: '신규 직원은 아이디가 필요합니다.', severity: 'warning' });
          return;
        }

        response = await register(requestData);
        setAlertInfo({ open: true, message: '신규 직원이 등록되었습니다.', severity: 'success' });
      }

      handleSelectEmployee(response);
      setRefreshList((prev) => prev + 1);
    } catch (error) {
      console.error('저장 실패:', error);
      const errorMessage = error.response?.data?.message || error.message;
      setAlertInfo({ open: true, message: `저장 중 오류가 발생했습니다: ${errorMessage}`, severity: 'error' });
    }
  };

  const handleDelete = () => {
    if (!formData?.employeeId) return;

    setConfirmDialog({
      open: true,
      onConfirm: async () => {
        try {
          await deleteEmployee(formData.employeeId);
          setAlertInfo({ open: true, message: '사원이 삭제되었습니다.', severity: 'success' });
          handleNew();
          setRefreshList((prev) => prev + 1);
        } catch (error) {
          console.error('삭제 실패:', error);
          const errorMessage = error.response?.data?.message || error.message;
          setAlertInfo({ open: true, message: `삭제 중 오류가 발생했습니다: ${errorMessage}`, severity: 'error' });
        }
      }
    });
  };

  return (
    <>
      <MainCard
        title={
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Button variant="outlined" color="secondary" onClick={handleNew}>
              신규
            </Button>
            <Button variant="contained" color="primary" onClick={handleSave}>
              저장
            </Button>
            <Button variant="outlined" color="primary" onClick={() => setOpenSyncHR(true)}>
              업로드
            </Button>
          </Stack>
        }
        secondary={
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
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
            {/* 1. 부서 트리 */}
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
                title="부서"
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
                <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                  <OrganizationTree setSelectedDept={setSelectedDept} />
                </Box>
              </MainCard>
            </Grid>

            {/* 2. 직원 목록 */}
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
                <EmployeeList
                  selectedDept={selectedDept?.commonCodeId}
                  onSelectEmployee={handleSelectEmployee}
                  refreshList={refreshList}
                  selectedEmployeeId={formData?.employeeId}
                />
              </Box>
            </Grid>

            {/* 3. 인사 정보 폼 */}
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
                <EmployeeForm
                  formData={formData}
                  setFormData={setFormData}
                  commonCodes={commonCodes}
                  selectedDeptInfo={selectedDept}
                  resetPasswordHandler={resetPasswordHandler}
                  onOpenModal={() => setOpenHistory(true)}
                  onDelete={handleDelete}
                />
              </Box>
            </Grid>
          </Grid>
        </Box>
      </MainCard>
      <EmployeeHistoryModal open={openHistory} onClose={() => setOpenHistory(false)} employee={selectedEmployee} />
      <SyncHRModal open={openSyncHR} onClose={() => setOpenSyncHR(false)}/>

      <Dialog open={confirmDialog.open} onClose={handleCloseConfirm}>
        <DialogTitle>사원 삭제 확인</DialogTitle>
        <DialogContent>
          <DialogContentText>정말로 이 사원을 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm}>취소</Button>
          <Button
            onClick={() => {
              confirmDialog.onConfirm?.();
              handleCloseConfirm();
            }}
            color="error"
            variant="contained"
          >
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}