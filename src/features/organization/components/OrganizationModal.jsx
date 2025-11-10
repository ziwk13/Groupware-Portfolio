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
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';   // 개별 직원 삭제 아이콘
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'; // 전체 삭제 아이콘
import ForwardIcon from '@mui/icons-material/Forward';             // 직원 추가(화살표) 아이콘
import { useState, useRef, useEffect } from 'react';
import { gridSpacing } from 'store/constant';
import MainCard from 'ui-component/cards/MainCard';
import EmployeeDetail from './EmployeeDetailBase'; // 직원 삭세정보 컴포넌트
import EmployeeList from './EmployeeList';         // 직원 목록 컴포넌트
import OrganizationTree from './OrganizationTree'; // 부서 트리 컴포넌트
import DefaultAvatar from 'assets/images/profile/default_profile.png';
import { getImageUrl } from 'utils/getImageUrl';

export default function OrganizationModal({ open, onClose, list = [], setList }) {
  // 선택된 부서 정보
  const [selectedDept, setSelectedDept] = useState(null);
  // 선택된 직원
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  // 직원 선택 시 실행 - EmployeeList -> EmployeeDetail로 정보 전달
  const handleSelectEmployee = (employee) => setSelectedEmployee(employee);

  // 직원 추가 - 선택한 직원을 특정 박스에 추가
  const handleAddEmployee = (type) => {
    if (!selectedEmployee) return;
    const updated = [...list];
    const idx = updated.findIndex((item) => item.name === type);
    if (idx === -1) return;
    // 직원 중복 체크
    const exists = updated[idx].empList.some((emp) => emp.employeeId === selectedEmployee.employeeId);
    if (!exists) {
      updated[idx].empList.push(selectedEmployee);
      setList(updated);
    }
  };

  // 모든 직원 삭제
  const handleClearEmployees = (type) => {
    const updated = [...list];
    const idx = updated.findIndex((item) => item.name === type);
    if (idx === -1) return;
    updated[idx].empList = [];
    setList(updated);
  };

  // 특정 직원 한 명만 제거
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
      {/* 제목 */}
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
              />
            </Box>
          </Grid>

          {/* 오른쪽 수신/참조/숨은참조 박스 */}
          <Grid size={{ xs: 12, md: list.length > 0 ? 4 : 4 }}>
            <Box
              sx={{
                height: '100%',
                flex: 1,
                minHeight: 0,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                gap: list.length > 0 ? 1 : 0
              }}
            >
              {/* 리스트가 비어있으면 직원 상세 정보 표시 */}
              {list.length === 0 ? (
                <EmployeeDetail employee={selectedEmployee} />
              ) : (
                list.map((item, idx) => {
                  const scrollRef = useRef(null);

                  // 직원이 추가될 때마다 스크롤 하단 이동
                  useEffect(() => {
                    if (scrollRef.current) {
                      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                    }
                  }, [item.empList.length]);

                  return (
                    <Box key={idx} sx={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 0 }}>
                      {/* 화살표 */}
                      <IconButton
                        color="primary"
                        onClick={() => handleAddEmployee(item.name)}
                        sx={{
                          flexShrink: 0,       // 고정 위치로 변경
                          left: '-9px',        // 원하는 만큼 왼쪽 이동 (조절 가능)
                          top: '8px',
                        }}
                      >
                        <ForwardIcon />
                      </IconButton>

                      {/* 우측 박스 */}
                      <MainCard
                        title={
                          // 우측 박스 소제목
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
                            {/* 전체 삭제 버튼 */}
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => {
                                if (window.confirm("모든 직원을 삭제하시겠습니까?")) {
                                  handleClearEmployees(item.name);
                                }
                              }}
                              sx={{ width: 30, height: 30, mr: 0.9 }}
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
                          },
                          minHeight: '183px', // 고정 높이 유지
                          maxHeight: '183px', // 고정
                          justifyContent: 'flex-start'
                        }}
                      >
                        {/*  스크롤 영역 */}
                        <Box
                          ref={scrollRef}
                          sx={{
                            flex: 1,
                            overflowY: 'auto',
                            scrollbarGutter: 'stable',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-start',
                            alignItems: 'stretch',
                            p: 0,
                            maxHeight: '183px', // 전체 카드 높이와 동일
                            '&::-webkit-scrollbar': { width: '6px' },
                            '&::-webkit-scrollbar-thumb': {
                              borderRadius: '3px'
                            }
                          }}
                        >
                          {/* 직원 존재 시 */}
                          {item.empList.length > 0 ? (
                            item.empList.map((emp, i) => (
                              <ListItemButton
                                key={i}
                                sx={{
                                  px: 1.2,
                                  py: 0.8,
                                  borderRadius: 0,
                                  height: '58px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  flex: '0 0 auto',
                                  position: 'relative'
                                }}
                              >
                                {/* 직원 프로필 */}
                                <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                                  <Avatar
                                    alt={emp.name}
                                    src={emp.profileImg ? getImageUrl(emp.profileImg) : DefaultAvatar}
                                    sx={{ width: 36, height: 36 }}
                                  />
                                  <Stack sx={{ lineHeight: 1 }}>
                                    <Typography
                                      variant="subtitle1"
                                      sx={{ fontWeight: 500, fontSize: '0.9rem' }}
                                    >
                                      {`${emp.name} ${emp.position}`}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      sx={{ fontSize: '0.75rem' }}
                                    >
                                      {emp.departmentName}
                                    </Typography>
                                  </Stack>
                                </Stack>

                                {/* 개별 삭제 */}
                                <IconButton
                                  sx={{ position: 'relative', right: '2px' }}
                                  size="small"
                                  color="error"
                                  onClick={() =>
                                    handleRemoveEmployee(item.name, emp.employeeId)}
                                >
                                  <PersonRemoveIcon fontSize="small" />
                                </IconButton>
                              </ListItemButton>
                            ))
                          ) : (
                            // 직원이 없을 떄 문구 표시
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
                  );
                })
              )}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      {/* 하단 닫기 버튼 */}
      <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          닫기
        </Button>
      </DialogActions>
    </Dialog>
  );
}
