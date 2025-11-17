import React from 'react';
import { Box, Divider, FormControlLabel, List, ListItem, ListItemText, Stack, Switch, TextField, Typography } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';

// CodePage로부터 selectedData(폼 데이터)와 onFormChange(변경 핸들러)를 props로 받음
function CodeForm({ selectedPrefix, selectedData, onFormChange }) {
  // 날짜 포맷팅 헬퍼 함수
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    // 유효하지 않은 날짜인 경우 빈 문자열 반환
    return isNaN(date.getTime()) ? '' : date.toLocaleString();
  };

  // 폼이 보이지 않아야 할 때 (selectedData가 null일 때)
  if (!selectedData) {
    const message = selectedPrefix
      ? "소분류를 선택하거나 \n '신규' 버튼을 클릭해주세요"
      : "대분류를 선택하거나 \n '신규' 버튼을 클릭해주세요";

    return (
      <MainCard
        title="코드 상세"
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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'text.secondary',
            whiteSpace: 'pre-line', // \n 줄바꿈 적용
            textAlign: 'center'
          }}
        >
          {message}
        </Box>
      </MainCard>
    );
  }

  // value, checked, onChange를 모두 부모(CodePage)로부터 전달받은 props(selectedData, onFormChange)로 연결
  return (
    <MainCard
      title="코드 상세"
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
          overflowY: 'auto'
        }}
      >
        <Stack spacing={2.5}>
          <TextField
            name="code"
            label="코드"
            value={selectedData.code || ''}
            onChange={onFormChange}
            fullWidth
            InputLabelProps={{ shrink: !!selectedData.code }}
          />
          <TextField
            name="codeDescription"
            label="코드 설명"
            value={selectedData.codeDescription || ''}
            onChange={onFormChange}
            fullWidth
            InputLabelProps={{ shrink: !!selectedData.codeDescription }}
          />
          <TextField
            name="value1"
            label="값 1"
            value={selectedData.value1 || ''}
            onChange={onFormChange}
            fullWidth
            InputLabelProps={{ shrink: !!selectedData.value1 }}
            multiline // 내용이 길어지면 세로로 늘어나도록 수정
            minRows={1} // 최소 1줄 높이 유지
          />
          <TextField
            name="value2"
            label="값 2"
            value={selectedData.value2 || ''}
            onChange={onFormChange}
            fullWidth
            InputLabelProps={{ shrink: !!selectedData.value2 }}
            multiline // 내용이 길어지면 세로로 늘어나도록 수정
            minRows={1} // 최소 1줄 높이 유지
          />
          <TextField
            name="value3"
            label="값 3"
            value={selectedData.value3 || ''}
            onChange={onFormChange}
            fullWidth
            InputLabelProps={{ shrink: !!selectedData.value3 }}
            multiline // 내용이 길어지면 세로로 늘어나도록 수정
            minRows={1} // 최소 1줄 높이 유지
          />
          <TextField
            name="sortOrder"
            label="정렬 순서"
            type="number"
            value={selectedData.sortOrder || 0}
            onChange={onFormChange}
            fullWidth
            InputLabelProps={{ shrink: !!selectedData.sortOrder }}
            InputProps={{ inputProps: { min: 1 } }}
          />

          <FormControlLabel
            control={<Switch name="isDisabled" checked={selectedData.isDisabled || false} onChange={onFormChange} />}
            label="비활성화"
          />

          {/* 기존 데이터일 경우에만 필드 표시 */}
          {selectedData.commonCodeId && (
            <>
              <Divider sx={{ pt: 1 }} />
              <List component="nav" sx={{ width: '100%', py: 0, '&& .MuiListItem-root': { px: 0 } }}>
                <ListItem>
                  <ListItemText primary={<Typography sx={{ fontSize: 14, color: 'text.secondary' }}>생성자</Typography>} />
                  <Typography sx={{ fontSize: 14 }} align="right">
                    {selectedData.creator || ''}
                  </Typography>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText primary={<Typography sx={{ fontSize: 14, color: 'text.secondary' }}>생성일시</Typography>} />
                  <Typography sx={{ fontSize: 14 }} align="right">
                    {formatDate(selectedData.createdAt)}
                  </Typography>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText primary={<Typography sx={{ fontSize: 14, color: 'text.secondary' }}>수정자</Typography>} />
                  <Typography sx={{ fontSize: 14 }} align="right">
                    {selectedData.updater || ''}
                  </Typography>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText primary={<Typography sx={{ fontSize: 14, color: 'text.secondary' }}>수정일시</Typography>} />
                  <Typography sx={{ fontSize: 14 }} align="right">
                    {formatDate(selectedData.updatedAt)}
                  </Typography>
                </ListItem>
              </List>
            </>
          )}
        </Stack>
      </Box>
    </MainCard>
  );
}

export default CodeForm;