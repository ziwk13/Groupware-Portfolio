// EmployeeList.jsx
import { Box, List, ListItemButton, Paper, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { organizationAPI } from '../api/organizationApi';
import Avatar from 'ui-component/extended/Avatar';
import Stack from '@mui/material/Stack';
import MainCard from 'ui-component/cards/MainCard';
import DefaultAvatar from 'assets/images/profile/default_profile.png';
import { getImageUrl } from 'api/getImageUrl'

export default function EmployeeList({
  selectedDept,
  onSelectEmployee,
  refreshList,
  selectedEmployeeId,
  showHeader = true
}) {
  const [employees, setEmployees] = useState([]);

  // 부서를 클릭할 때마다 그 부서의 직원 목록을 새로 불러옴
  useEffect(() => {
    if (!selectedDept) return;

    organizationAPI
      .getEmployeesByDeptCode(selectedDept)
      .then((data) => setEmployees(Array.isArray(data) ? data : []))
      .catch((err) => console.error('직원 목록 가져오기 실패', err));
  }, [selectedDept, refreshList]);

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
          '& .MuiCardHeader-root': { padding: 1.5 }
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
        '& .MuiCardHeader-root': { padding: 1.5 }
      }}
    >
      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <Paper sx={{ height: '100%', boxShadow: 'none', background: 'transparent', p: 0 }}>
          {employees.length === 0 ? (
            <Typography color="text.secondary" sx={{ p: 2 }}>
              직원이 없습니다.
            </Typography>
          ) : (
            <List disablePadding>
              {employees.map((emp) => (
                <ListItemButton
                  key={emp.employeeId}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('employee', JSON.stringify(emp));

                    // 커스텀 드래그 미리보기 (선명한 프로필 형태)
                    const dragPreview = document.createElement('div');
                    dragPreview.style.position = 'absolute';
                    dragPreview.style.top = '-99999px';
                    dragPreview.style.zIndex = '9999';
                    dragPreview.style.display = 'flex';
                    dragPreview.style.alignItems = 'center';
                    dragPreview.style.gap = '8px';
                    dragPreview.style.padding = '6px 10px';
                    dragPreview.style.border = '1px solid rgba(0,0,0,0.15)';
                    dragPreview.style.borderRadius = '8px';
                    dragPreview.style.background = '#fff';
                    dragPreview.style.boxShadow = '0 2px 6px rgba(0,0,0,0.1)';
                    dragPreview.style.fontSize = '13px';
                    dragPreview.style.color = '#333';
                    dragPreview.style.fontWeight = '500';

                    // 프로필 이미지
                    const img = document.createElement('img');
                    img.src = emp.profileImg ? getImageUrl(emp.profileImg) : DefaultAvatar;
                    img.style.width = '32px';
                    img.style.height = '32px';
                    img.style.borderRadius = '50%';
                    img.style.objectFit = 'cover';

                    // 이름 + 직급
                    const text = document.createElement('span');
                    text.textContent = `${emp.name} ${emp.position}`;

                    dragPreview.appendChild(img);
                    dragPreview.appendChild(text);
                    document.body.appendChild(dragPreview);

                    e.dataTransfer.setDragImage(dragPreview, 0, 0);

                    // 드래그 끝나면 프리뷰 제거
                    setTimeout(() => document.body.removeChild(dragPreview), 0);
                  }}
                  selected={selectedEmployeeId === emp.employeeId} // 선택된 직원이면 시각적으로 강조
                  onClick={() => onSelectEmployee(emp)}
                  sx={{ px: 2, py: 1.25, cursor: 'grab' }}
                >
                  <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
                    <Avatar
                      alt={emp.name}
                      src={emp.profileImg ? getImageUrl(emp.profileImg) : DefaultAvatar}
                    />
                    <Stack>
                      <Typography variant="subtitle1">{`${emp.name} ${emp.position}`}</Typography>
                    </Stack>
                  </Stack>
                </ListItemButton>
              ))}
            </List>
          )}
        </Paper>
      </Box>
    </MainCard>
  );
}
