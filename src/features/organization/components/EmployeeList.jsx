// EmployeeList
// 직원 목록 컴포넌트
// - 좌측 부서 트리에서 부서를 클릭했을 때, 해당 부서의 직원들을 불러와 보여줌.

import { Box, List, ListItemButton, Paper, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { organizationAPI } from '../api/organizationApi';
import Avatar from 'ui-component/extended/Avatar';
import Stack from '@mui/material/Stack';
import MainCard from 'ui-component/cards/MainCard';

// 컴포넌트
export default function EmployeeList({ selectedDept, onSelectEmployee, refreshList, selectedEmployeeId, showHeader = true }) {
  // 직원 목록 데이터를 저장할 state
  const [employees, setEmployees] = useState([]);
  // activeId는 이제 부모(OrganizationPage)로부터 selectedEmployeeId로 받음

  // 1. 부서가 선택되거나, refreshList 값이 바뀔 때마다 직원 목록을 새로 불러옴
  useEffect(() => {
    if (!selectedDept) return; // 선택된 부서가 없으면 API 호출 X

    organizationAPI
      .getEmployeesByDeptCode(selectedDept) // 백엔드 API 요청
      .then((data) => {
        // 데이터가 배열 형태인지 검증하고, 아니면 빈 배열로 초기화
        setEmployees(Array.isArray(data) ? data : []);
        // setActiveId(null); // 부모가 관리하므로 이젠 필요 없음
      })
      .catch((err) => console.error('직원 목록 가져오기 실패', err));
  }, [selectedDept, refreshList]); // 의존성 배열 -> selectedDept 또는 refreshList가 변경될 때마다 실행

  // 직원이 없거나 부서가 선택이 안됐을 때
  if (!selectedDept) {
    return (
      <MainCard
        title="직원 목록"
        content={false}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',

          border: '1px solid',
          '& .MuiCardHeader-root': {
            padding: 1.5
          }
        }}
      >
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
          부서를 선택하세요.
        </Box>
      </MainCard>
    );
  }

  // 2. 렌더링
  return (
    <MainCard
      title={`직원 목록 (${employees.length}명)`}
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
      {/* 제목(MainCard.title)은 고정, 아래 내용만 스크롤 */}
      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        {/* 내부 표면만 사용, 이중 스크롤 방지 */}
        <Paper sx={{ height: '100%', boxShadow: 'none', background: 'transparent', p: 0 }}>
          {employees.length === 0 ? (
            <Typography color="text.secondary" sx={{ p: 2 }}>
              직원이 없습니다.
            </Typography>
          ) : (
            // 직원 리스트
            <List disablePadding>
              {employees.map((emp) => {
                return (
                  <ListItemButton
                    key={emp.employeeId}
                    selected={selectedEmployeeId === emp.employeeId} // 부모의 폼 데이터 ID와 비교
                    onClick={() => {
                      // setActiveId(emp.employeeId); // 부모가 관리
                      onSelectEmployee(emp); // 부모에게 선택된 직원 객체 전달
                    }}
                    sx={{ px: 2, py: 1.25 }}
                  >
                    <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
                      <Avatar alt={emp.name} src={emp.profileImg} />
                      <Stack>
                        <Typography variant="subtitle1">{`${emp.name} ${emp.position}`}</Typography>
                      </Stack>
                    </Stack>
                  </ListItemButton>
                );
              })}
            </List>
          )}
        </Paper>
      </Box>
    </MainCard>
  );
}
