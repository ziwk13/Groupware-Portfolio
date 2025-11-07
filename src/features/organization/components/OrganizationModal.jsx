// 조직도 모달
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Typography,
  IconButton,
  Avatar,
  Stack,
  ListItemButton
} from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import ForwardIcon from '@mui/icons-material/Forward';
import { useState, useRef, useEffect } from 'react';
import { gridSpacing } from 'store/constant';
import MainCard from 'ui-component/cards/MainCard';
import EmployeeDetail from './EmployeeDetailBase';
import EmployeeList from './EmployeeList';
import OrganizationTree from './OrganizationTree';

export default function OrganizationModal({ open, onClose, list = [], setList }) {
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeList, setEmployeeList] = useState([]);

  // 직원 클릭 시 현재 선택한 직원 저장
  const handleSelectEmployee = (employee) => setSelectedEmployee(employee);

  // 선택된 직원을 오른쪽 박스(수신자/참조자/숨은참조자)에 1명 추가
  const handleAddEmployee = (type) => {
    if (!selectedEmployee) return;
    const updated = [...list];
    const idx = updated.findIndex((item) => item.name === type);
    if (idx === -1) return;
    const exists = updated[idx].empList.some((emp) => emp.employeeId === selectedEmployee.employeeId);
    if (!exists) {
      updated[idx].empList.push(selectedEmployee);
      setList(updated);
    }
  };

  // 직원 전체 선택
  const handleSelectAllEmployees = (employee) => {
    if (!employees || employees.length === 0) {
      alert('선택한 직원이 없습니다.');
      return;
    }

    const updated = [...list];

    // 모든 박스(수신자, 참조자, 숨은 참조자)에 각각 추가
    updated.forEach((box) => {
      employees.forEach((emp) => {
        const exists = box.empList.some((e) => employeeId === emp.employeeId);
        if (!exists) {
          box.empList.push(emp);
        }
      });
    });

    setList(updated);
  };

  // 특정 박스(수신자 등)의 직원 전체 삭제
  const handleClearEmployees = (type) => {
    const updated = [...list];
    const idx = updated.findIndex((item) => item.name === type);
    if (idx === -1) return;
    updated[idx].empList = [];
    setList(updated);
  };

  // 개별 직원 삭제
  const handleRemoveEmployee = (type, employeeId) => {
    const updated = [...list];
    const idx = updated.findIndex((item) => item.name === type);
    if (idx === -1) return;
    updated[idx].empList = updated[idx].empList.filter((emp) => emp.employeeId !== employeeId);
    setList(updated);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      disableScrollLock
      sx={{
        '& .MuiDialog-paper': {
          height: '85vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }
      }}
      PaperProps={{
        sx: {
          minWidth: '60vw',
          maxWidth: '60vw',
          height: '85vh',
          boxShadow: 'none',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', fontWeight: 700, fontSize: '1.4rem' }}>조직도</DialogTitle>

      <Divider sx={{ mb: 2 }} />

      <DialogContent
        sx={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Grid
          container
          spacing={gridSpacing}
          justifyContent="center"
          wrap="nowrap"
          sx={{
            flex: 1,
            alignItems: 'stretch',
            overflow: 'hidden',
            minHeight: '400px'
          }}
        >
          {/* 부서 */}
          <Grid size={{ xs: 12, md: 4 }}>
            <MainCard
              title="부서"
              content={false}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid',
                '& .MuiCardHeader-root': { padding: 1.5 }
              }}
            >
              <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                <OrganizationTree setSelectedDept={setSelectedDept} />
              </Box>
            </MainCard>
          </Grid>

          {/* 직원 목록 */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                height: '100%'
              }}
            >
              <EmployeeList
                selectedDept={selectedDept?.commonCodeId}
                onSelectEmployee={handleSelectEmployee}
                onSelectAllEmployees={handleSelectAllEmployees}
              />
            </Box>
          </Grid>

          {/* 화살표 버튼 */}
          {list.length > 0 && (
            <Grid
              size={{ md: 0.5 }}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}
            >
              {list.map((item, index) => {
                // 각 화살표의 위치 비율 계산 (박스 간격 균등 분배)
                const topPosition = `${(100 / (list.length + 1)) * (index + 1)}%`;

                return (
                  <Box key={index} sx={{ position: 'absolute', top: topPosition }}>
                    <IconButton color="primary" onClick={() => handleAddEmployee(item.name)}>
                      <ForwardIcon />
                    </IconButton>
                  </Box>
                );
              })}
            </Grid>
          )}

          {/* 오른쪽 (직원 상세 or 수신/참조/숨은참조 박스) */}
          <Grid size={{ xs: 12, md: list.length > 0 ? 3.5 : 4 }}>
            <Box
              sx={{
                height: '100%',
                flex: 1,
                minHeight: 0,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: list.length > 0 ? 1 : 0
              }}
            >
              {list.length === 0 ? (
                <EmployeeDetail employee={selectedEmployee} />
              ) : (
                list.map((item, idx) => {
                  const scrollRef = useRef(null); // 추가: 스크롤 참조용 ref

                  // empList 길이 변화 시 자동으로 아래로 스크롤
                  useEffect(() => {
                    if (scrollRef.current) {
                      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                    }
                  }, [item.empList.length]);

                  return (
                    <MainCard
                      key={idx}
                      title={
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            pr: 1.5
                          }}
                        >
                          <Typography variant="subtitle1" sx={{ fontWeight: 500, fontSize: '0.9rem', pl: 1.2 }}>
                            {item.name}
                          </Typography>
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => handleClearEmployees(item.name)}
                            sx={{
                              width: 30,
                              height: 30,
                              mr: 0.9
                            }}
                          >
                            <DeleteForeverIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      }
                      content={false}
                      sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        border: '1px solid',
                        '& .MuiCardHeader-root': { padding: 0.1 },
                        '& .MuiCardHeader-title': {
                          fontSize: '0.9rem',
                          fontWeight: 400
                        }
                      }}
                    >
                      {/* 스크롤 */}
                      <Box
                        ref={scrollRef} // 연결
                        sx={{
                          flex: 1,
                          minHeight: 0,
                          overflowY: 'scroll',
                          p: 0,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 0,
                          maxHeight: '192px',
                          pr: '1px', // 우측 스크롤 여백 확보
                          '&::-webkit-scrollbar': { width: '6px' },
                          '&::-webkit-scrollbar-thumb': { borderRadius: '3px' }
                        }}
                      >
                        {item.empList.length > 0 ? (
                          item.empList.map((emp, i) => (
                            <ListItemButton
                              key={i}
                              sx={{
                                flex: 0,
                                px: 1.2,
                                py: 0.8,
                                borderRadius: 0,
                                height: '64px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                              }}
                            >
                              <Stack direction="row" sx={{ alignItems: 'center', gap: 1.2 }}>
                                <Avatar alt={emp.name} src={emp.profileImg} sx={{ width: 38, height: 38 }} />
                                <Stack sx={{ lineHeight: 1 }}>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 500, fontSize: '0.9rem' }}>
                                    {`${emp.name} ${emp.position}`}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                    {emp.departmentName}
                                  </Typography>
                                </Stack>
                              </Stack>

                              <IconButton
                                sx={{ ml: 'auto' }}
                                size="small"
                                color="error"
                                onClick={() => handleRemoveEmployee(item.name, emp.employeeId)}
                              >
                                <DeleteForeverIcon fontSize="small" />
                              </IconButton>
                            </ListItemButton>
                          ))
                        ) : (
                          <Box
                            sx={{
                              flex: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Typography variant="body2" color="text.secondary" textAlign="center">
                              직원이 없습니다.
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </MainCard>
                  );
                })
              )}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          닫기
        </Button>
      </DialogActions>
    </Dialog>
  );
}
