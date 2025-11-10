// OrganizationModal.jsx
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
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import ForwardIcon from '@mui/icons-material/Forward';
import { useState, useRef, useEffect } from 'react';
import { gridSpacing } from 'store/constant';
import MainCard from 'ui-component/cards/MainCard';
import EmployeeDetail from './EmployeeDetailBase';
import EmployeeList from './EmployeeList';
import OrganizationTree from './OrganizationTree';
import DefaultAvatar from 'assets/images/profile/default_profile.png';
import { getImageUrl } from 'utils/getImageUrl';

export default function OrganizationModal({ open, onClose, list = [], setList }) {
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [targetType, setTargetType] = useState(null);
  const [tempList, setTempList] = useState([]);
  const scrollRefs = useRef([]);

  useEffect(() => {
    if (open) setTempList(JSON.parse(JSON.stringify(list)));
  }, [open, list]);

  const handleSelectEmployee = (employee) => setSelectedEmployee(employee);

  // 중복 방지 로직 추가 (드래그 및 클릭 둘 다 작동)
  const handleAddEmployee = (type, employeeData = selectedEmployee, idxParam) => {
    if (!employeeData) return;

    const updated = [...tempList];
    const idx = updated.findIndex((item) => item.name === type);
    if (idx === -1) return;

    // 모든 박스에 대해 중복 확인
    const alreadyExists = updated.some((box) =>
      box.empList.some((emp) => emp.employeeId === employeeData.employeeId)
    );

    if (alreadyExists) {
      console.warn('이미 다른 구분(결재자/참조자 등)에 포함된 직원입니다.');
      return; // alert() 사용 안 함 → 드래그 이벤트 유지
    }

    // 현재 박스 내 중복 방지
    const exists = updated[idx].empList.some(
      (emp) => emp.employeeId === employeeData.employeeId
    );
    if (!exists) {
      updated[idx].empList.push(employeeData);
      setTempList(updated);

      // 추가 후 해당 박스로 스크롤 이동
          const scrollIndex = idxParam ?? idx;
      setTimeout(() => {
        const ref = scrollRefs.current[scrollIndex];
        if (ref) ref.scrollTo({ top: ref.scrollHeight, behavior: 'smooth' });
      }, 50);
    }
  };

  const handleClearEmployees = (type) => {
    const updated = [...tempList];
    const idx = updated.findIndex((item) => item.name === type);
    if (idx === -1) return;
    updated[idx].empList = [];
    setTempList(updated);
  };

  const handleRemoveEmployee = (type, employeeId) => {
    const updated = [...tempList];
    const idx = updated.findIndex((item) => item.name === type);
    if (idx === -1) return;
    updated[idx].empList = updated[idx].empList.filter(
      (emp) => emp.employeeId !== employeeId
    );
    setTempList(updated);
  };

  const handleApply = () => {
    setList(tempList);
    onClose();
  };


  const getBoxHeight = () => {
    if (tempList.length === 1) return '100%';
    if (tempList.length === 2) return '49%';
    if (tempList.length === 3) return '33.33%';
    return '100%';
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

      <DialogContent sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <Grid container spacing={gridSpacing} justifyContent="center" wrap="nowrap" sx={{ flex: 1, alignItems: 'stretch', overflow: 'hidden', minHeight: '400px' }}>
          {/* 부서 */}
          <Grid size={{ xs: 12, md: 4 }}>
            <MainCard title="부서" content={false} sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid', '& .MuiCardHeader-root': { padding: 1.5 } }}>
              <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                <OrganizationTree setSelectedDept={setSelectedDept} />
              </Box>
            </MainCard>
          </Grid>

          {/* 직원 목록 */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', height: '100%' }}>
              <EmployeeList selectedDept={selectedDept?.commonCodeId} onSelectEmployee={handleSelectEmployee} />
            </Box>
          </Grid>

          {/* 오른쪽 박스 영역 */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ height: '100%', flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: tempList.length > 0 ? 1 : 0 }}>
              {tempList.length === 0 ? (
                <EmployeeDetail employee={selectedEmployee} />
              ) : (
                tempList.map((item, idx) => (
                  <Box key={idx} sx={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 0, height: getBoxHeight() }}>
                    <IconButton color="primary" onClick={() => handleAddEmployee(item.name)} sx={{ flexShrink: 0, left: '-9px', top: '8px' }}>
                      <ForwardIcon />
                    </IconButton>

                    <MainCard
                      title={
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1.5 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 500, fontSize: '0.9rem', pl: 1 }}>
                            {item.name}
                          </Typography>
                          <IconButton color="error" size="small" onClick={() => {
                            if (item.empList.length === 0) return;
                            setTargetType(item.name);
                            setOpenConfirm(true);
                          }} sx={{ width: 30, height: 30, mr: 0.9 }}>
                            <DeleteForeverIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      }
                      content={false}
                      onDragOver={(e) => e.preventDefault()} 
                      onDrop={(e) => {
                        e.preventDefault();
                        const droppedData = e.dataTransfer.getData('employee');
                        if (!droppedData) return;
                        const draggedEmp = JSON.parse(droppedData);
                        handleAddEmployee(item.name, draggedEmp); // 드롭 시 추가
                      }}
                      sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        border: '1px solid',
                        '& .MuiCardHeader-root': { padding: 0.1 },
                        minHeight: '100%',
                        maxHeight: '100%',
                        justifyContent: 'flex-start'
                      }}
                    >
                      <Box
                        ref={(el) => (scrollRefs.current[idx] = el)}
                        sx={{
                          flex: 1,
                          overflowY: 'auto',
                          scrollbarGutter: 'stable',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'flex-start',
                          alignItems: 'stretch',
                          p: 0,
                          '&::-webkit-scrollbar': { width: '6px' },
                          '&::-webkit-scrollbar-thumb': { borderRadius: '3px' }
                        }}
                      >
                        {item.empList.length > 0 ? (
                          item.empList.map((emp, i) => (
                            <ListItemButton key={i} sx={{ px: 1.2, py: 0.8, borderRadius: 0, height: '58px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: '0 0 auto' }}>
                              <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                                <Avatar alt={emp.name} src={emp.profileImg ? getImageUrl(emp.profileImg) : DefaultAvatar} sx={{ width: 36, height: 36 }} />
                                <Stack sx={{ lineHeight: 1 }}>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 500, fontSize: '0.9rem' }}>{`${emp.name} ${emp.position}`}</Typography>
                                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>{emp.departmentName}</Typography>
                                </Stack>
                              </Stack>
                              <IconButton sx={{ position: 'relative', right: '2px' }} size="small" color="error" onClick={() => handleRemoveEmployee(item.name, emp.employeeId)}>
                                <PersonRemoveIcon fontSize="small" />
                              </IconButton>
                            </ListItemButton>
                          ))
                        ) : (
                          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography variant="body2" color="text.secondary" textAlign="center">
                              직원이 없습니다.
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </MainCard>
                  </Box>
                ))
              )}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)} sx={{ '& .MuiDialog-paper': { borderRadius: 3, backgroundColor: 'primary', minWidth: 360 } }}>
        <DialogTitle textAlign="center" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>{`${targetType || ''} 전체 삭제`}</DialogTitle>
        <DialogContent>
          <Typography sx={{ textAlign: 'center', fontSize: '0.9rem' }}>모든 {targetType || '직원'}을 삭제하시겠습니까?</Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button onClick={() => { handleClearEmployees(targetType); setOpenConfirm(false); }} color="error">삭제</Button>
          <Button onClick={() => setOpenConfirm(false)} sx={{ color: 'primary' }}>취소</Button>
        </DialogActions>
      </Dialog>

      <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
        {
          list && list.length >= 1 && 
          <Button variant="contained" color="primary" onClick={handleApply}>적용</Button>
        }  
        <Button onClick={onClose} variant="outlined" color="inherit">닫기</Button>
      </DialogActions>
    </Dialog>
  );
}
