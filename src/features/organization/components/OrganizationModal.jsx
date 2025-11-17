// ==============================|| ORGANIZATION MODAL ||============================== //
// 조직도 모달: 부서 트리 + 직원 목록 + 수신/참조/숨은참조자 선택 UI

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
  ListItemButton,
  Alert,
  Tooltip
} from '@mui/material';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import ForwardIcon from '@mui/icons-material/Forward';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { useState, useRef, useEffect } from 'react';
import { gridSpacing } from 'store/constant';
import MainCard from 'ui-component/cards/MainCard';
import EmployeeDetail from './EmployeeDetailBase';
import EmployeeList from './EmployeeList';
import OrganizationTree from './OrganizationTree';
import DefaultAvatar from 'assets/images/profile/default_profile.png';
import { getImageUrl } from 'api/getImageUrl';

export default function OrganizationModal({ open, onClose, list = [], setList }) {
  // 상태 관리
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [targetType, setTargetType] = useState(null);
  const [tempList, setTempList] = useState([]);
  const scrollRefs = useRef([]);

  // 알림창 상태
  const [alertInfo, setAlertInfo] = useState({
    open: false,
    message: '',
    severity: 'warning'
  });

  // 모달 열릴 때 리스트 복제
  useEffect(() => {
    if (open) {
      setTempList(JSON.parse(JSON.stringify(list)));
    }
  }, [open]);

  // 직원 선택
  const handleSelectEmployee = (employee) => setSelectedEmployee(employee);

  // 알림창 표시
  const showAlert = (message, severity = 'warning') => {
    setAlertInfo({ open: true, message, severity });
  };

  // 직원 추가 (왼쪽에서 오른쪽으로, 또는 드래그 앤 드롭으로)
  const handleAddEmployee = (type, employeeData = selectedEmployee, idxParam) => {
    if (!employeeData) {
      showAlert('직원을 선택해주세요.', 'warning');
      return;
    }

    const updated = [...tempList];
    const idx = updated.findIndex((item) => item.name === type);
    if (idx === -1) return;

    // 다른 구분에 이미 포함된 경우
    const alreadyExists = updated.some((box) =>
      box.empList.some((emp) => emp.employeeId === employeeData.employeeId)
    );
    if (alreadyExists) {
      showAlert(`${employeeData.name} 님은 이미 다른 구분에 추가되어 있습니다.`, 'warning');
      return;
    }

    // 같은 구분 내 중복 방지
    const exists = updated[idx].empList.some(
      (emp) => emp.employeeId === employeeData.employeeId
    );
    if (exists) {
      showAlert(`${employeeData.name} 님은 이미 ${type}에 포함되어 있습니다.`, 'warning');
      return;
    }

    // 직원 추가 및 스크롤 이동
    updated[idx].empList.push(employeeData);
    setTempList(updated);

    const scrollIndex = idxParam ?? idx;
    setTimeout(() => {
      const ref = scrollRefs.current[scrollIndex];
      if (ref) ref.scrollTo({ top: ref.scrollHeight, behavior: 'smooth' });
    }, 50);
  };

  // 직원 전체삭제
  const handleClearEmployees = (type) => {
    const updated = [...tempList];
    const idx = updated.findIndex((item) => item.name === type);
    if (idx === -1) return;
    updated[idx].empList = [];
    setTempList(updated);
  };

  // 직원 개별삭제
  const handleRemoveEmployee = (type, employeeId) => {
    const updated = [...tempList];
    const idx = updated.findIndex((item) => item.name === type);
    if (idx === -1) return;
    updated[idx].empList = updated[idx].empList.filter(
      (emp) => emp.employeeId !== employeeId
    );
    setTempList(updated);
  };

  // 직원 순서 변경 (드래그 앤 드롭 재배치 로직)
  const handleReorderEmployee = (boxName, fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;

    const updated = [...tempList];
    const boxIdx = updated.findIndex((b) => b.name === boxName);
    if (boxIdx === -1) return;


    const employees = [...updated[boxIdx].empList];
    // 배열에서 이동할 아이템 추출
    const [moved] = employees.splice(fromIndex, 1);
    // 원하는 위치에 삽입
    employees.splice(toIndex, 0, moved);

    updated[boxIdx].empList = employees;
    setTempList(updated);
  };

  // 적용 버튼
  const handleApply = () => {
    setList(tempList);
    onClose();
  };


  // 박스 높이 계산
  const getBoxHeight = () => {
    if (tempList.length === 1) return '75%';
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
      {/* 제목 + Alert */}
      {/* ... (DialogTitle과 Alert 부분은 그대로 유지) ... */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontWeight: 700,
          fontSize: '1.4rem'
        }}
      >
        조직도
        {alertInfo.open && (
          <Alert
            severity={alertInfo.severity}
            onClose={() => setAlertInfo({ ...alertInfo, open: false })}
            sx={{
              alignItems: 'center',
              ml: 2,
              flexShrink: 0,
              py: 0,
              px: 2,
              height: '35px',
              display: 'flex'
            }}
          >
            {alertInfo.message}
          </Alert>
        )}
      </DialogTitle>


      <Divider sx={{ mb: 2 }} />

      {/* 본문 */}
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
          {/* 부서 / 직원 목록 부분은 그대로 유지 */}
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

          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', height: '100%' }}>
              <EmployeeList
                selectedDept={selectedDept?.commonCodeId}
                onSelectEmployee={handleSelectEmployee}
              />
            </Box>
          </Grid>

          {/* 오른쪽 선택 박스 - 순서 변경 기능 수정된 부분 */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box
              sx={{
                height: '100%',
                flex: 1,
                minHeight: 0,
                overflow: 'visible',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: tempList.length === 1 ? 'center' : 'flex-start',
                gap: 2
              }}
            >
              {tempList.length === 0 ? (
                <EmployeeDetail employee={selectedEmployee} />
              ) : (
                tempList.map((item, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0,
                      height: getBoxHeight()
                    }}
                  >
                    <IconButton
                      color="primary"
                      onClick={() => handleAddEmployee(item.name)}
                      sx={{ flexShrink: 0, left: '-9px', top: '8px' }}
                    >
                      <ForwardIcon />
                    </IconButton>

                    <MainCard
                      title={
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            pr: 1.5
                          }}
                        >
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 500, fontSize: '0.9rem', pl: 1 }}
                          >
                            {item.name}
                          </Typography>
                          <IconButton
                          color="error"
                            size="small"
                            onClick={() => {
                              if (item.empList.length === 0) return;
                              setTargetType(item.name);
                              setOpenConfirm(true);
                            }}
                            sx={{ width: 30, height: 30, mr: 0.9 }}
                          >
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
                        handleAddEmployee(item.name, draggedEmp);
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
                      {/* 직원 리스트 */}
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
                          p: 0
                        }}
                      >
                        {item.empList.length > 0 ? (
                          item.empList.map((emp, i) => (
                            <ListItemButton
                              key={emp.employeeId}
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData('dragIndex', i);
                                e.dataTransfer.effectAllowed = 'move';

                                // ====== 커스텀 드래그 미리보기 생성 ======
                                const preview = document.createElement("div");
                                preview.style.display = "flex";
                                preview.style.alignItems = "center";
                                preview.style.gap = "8px";
                                preview.style.padding = "6px 10px";
                                preview.style.background = "white";
                                preview.style.borderRadius = "8px";
                                preview.style.boxShadow = "0 2px 6px rgba(0,0,0,0.15)";
                                preview.style.fontSize = "14px";
                                preview.style.fontWeight = "500";
                                preview.style.color = "#333";

                                // 프로필 이미지
                                const img = document.createElement("img");
                                img.src = emp.profileImg ? getImageUrl(emp.profileImg) : DefaultAvatar;
                                img.style.width = "36px";
                                img.style.height = "36px";
                                img.style.borderRadius = "50%";

                                // 이름 텍스트
                                const text = document.createElement("span");
                                text.textContent = `${emp.name} ${emp.position}`;

                                preview.appendChild(img);
                                preview.appendChild(text);

                                // 화면에 안 보이게 순간 붙였다가 dragImage로 사용 후 바로 제거
                                preview.style.position = "absolute";
                                preview.style.top = "-9999px";
                                document.body.appendChild(preview);

                                e.dataTransfer.setDragImage(preview, 0, 0);

                                // DragEnd가 끝나고 제거
                                setTimeout(() => document.body.removeChild(preview), 0);
                              }}


                              onDragEnd={(e) => {
                                // 드래그 종료 시 원상복구
                                e.currentTarget.style.opacity = '1';
                              }}
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) => {
                                e.preventDefault();
                                const fromIndex = Number(e.dataTransfer.getData('dragIndex'));
                                const toIndex = i;
                                handleReorderEmployee(item.name, fromIndex, toIndex);
                              }}
                              sx={{
                                px: 1.2,
                                height: 58,
                                minHeight: 58,
                                flex: '0 0 58px',
                                flexShrink: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                cursor: 'grab', // 커서 스타일 추가
                                '&:active': {
                                  cursor: 'grabbing'
                                },
                                transition: 'opacity 0.2s' // 부드러운 전환을 위한 CSS transition 추가
                              }}
                            >
                              <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                                <Tooltip title="">
                                  <DragIndicatorIcon sx={{ color: 'grey.600' }} />
                                </Tooltip>
                                <Avatar
                                  alt={emp.name}
                                  src={
                                    emp.profileImg
                                      ? getImageUrl(emp.profileImg)
                                      : DefaultAvatar
                                  }
                                  sx={{ width: 36, height: 36 }}
                                />
                                <Stack sx={{ lineHeight: 1 }}>
                                  <Typography
                                    variant="subtitle1"
                                    sx={{ fontWeight: 500, fontSize: '0.9rem' }}
                                  >{`${emp.name} ${emp.position}`}</Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ fontSize: '0.75rem' }}
                                  >
                                    {emp.departmentName}
                                  </Typography>
                                </Stack>
                              </Stack>

                              <Tooltip title="삭제">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() =>
                                    handleRemoveEmployee(item.name, emp.employeeId)
                                  }
                                >
                                  <PersonRemoveIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
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
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              textAlign="center"
                            >
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
      {/* ... (Dialog는 그대로 유지) ... */}
      <Dialog
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 3,
            backgroundColor: 'primary',
            minWidth: 360
          }
        }}
      >
        <DialogTitle
          textAlign="center"
          sx={{ fontWeight: 700, fontSize: '1.1rem' }}
        >{`${targetType || ''} 전체 삭제`}</DialogTitle>
        <DialogContent>
          <Typography sx={{ textAlign: 'center', fontSize: '0.9rem' }}>
            모든 {targetType || '직원'}를 삭제하시겠습니까?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button
            onClick={() => {
              handleClearEmployees(targetType);
              setOpenConfirm(false);
            }}
            color="error"
          >
            삭제
          </Button>
          <Button onClick={() => setOpenConfirm(false)} sx={{ color: 'primary' }}>
            취소
          </Button>
        </DialogActions>
      </Dialog>

      {/* 하단 버튼 */}
      <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
        {list && list.length >= 1 && (
          <Button variant="contained" color="primary" onClick={handleApply}>
            적용
          </Button>
        )}
        <Button onClick={onClose} variant="outlined" color="inherit">
          닫기
        </Button>
      </DialogActions>
    </Dialog>
  );
}