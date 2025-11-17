import PropTypes from 'prop-types';
import React from 'react';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import { gridSpacing } from 'store/constant';

export default function ChatHistory({ data, theme, user }) {
  
  /**
   * DTO의 createdAt (LocalDateTime)을 '오후 5:29:01' 형식으로 포맷팅하는 함수
   */
  const formatChatTime = (isoString) => {
    if (!isoString) return '';
    try {
      // ISO 문자열 (예: "2025-11-12T17:29:01")을 Date 객체로 변환
      return new Date(isoString).toLocaleTimeString('ko-KR', {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true
      });
    } catch (error) {
      console.error('Invalid time format:', isoString);
      return isoString; // 포맷팅 실패 시 원본 반환
    }
  };

  return (
    <Grid container spacing={gridSpacing}>
      {data.map((history, index) => (
        <React.Fragment key={index}>
          {/* 1. 시스템 메시지 (DTO: employeeId가 null) */}
          {!history.employeeId ? (
            <Grid size={12}>
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
                <Card
                  sx={{
                    display: 'inline-block',
                    bgcolor: 'background.default',
                    ...theme.applyStyles('dark', { bgcolor: 'grey.700' }),
                    boxShadow: 'none',
                    borderRadius: '12px',
                    textAlign: 'center',
                    maxWidth: '80%'
                  }}
                >
                  <CardContent sx={{ p: '8px 12px !important' }}>
                    <Typography variant="body2" sx={{ ...theme.applyStyles('dark', { color: 'dark.900' }) }}>
                      {history.content}
                    </Typography>
                    <Typography variant="caption" sx={{ ...theme.applyStyles('dark', { color: 'dark.900' }), opacity: 0.7 }}>
                      {formatChatTime(history.createdAt)}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
          ) : /* 2. 내가 보낸 메시지 (DTO: employeeId가 내 user.id와 일치) */
          String(history.employeeId) === String(user.id) ? (
            <Grid size={12}>
              <Grid container spacing={gridSpacing}>
                <Grid size={{ xs: 0, sm: 5 }} />
                <Grid size={{ xs: 12, sm: 7 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-end', // 하단 정렬
                      justifyContent: 'flex-end', // 오른쪽 정렬
                      gap: 0.5 // 4px 간격
                    }}
                  >
                    {history.unreadCount > 0 && (
                      <Typography
                      variant='caption'
                      sx={{
                        color: 'primary.main',
                        fontWeight: 'bold',
                        mb: 1
                      }}
                      >
                        {history.unreadCount}
                      </Typography>
                    )}
                    <Card
                    sx={{
                      display: 'inline-block',
                        float: 'right', // (Box가 flex-end를 하므로 이젠 필요 없을 수 있음)
                        bgcolor: 'primary.light',
                        ...theme.applyStyles('dark', { bgcolor: 'grey.500' })
                    }}
                    >
                    <CardContent sx={{ p: 2, pb: '16px !important', width: 'fit-content', ml: 'auto' }}>
                      <Grid container spacing={1}>
                        <Grid size={12}>
                          <Typography variant="body2" sx={{ ...theme.applyStyles('dark', { color: 'dark.900' }) }}>
                            {history.content}
                          </Typography>
                        </Grid>
                        <Grid size={12}>
                          <Typography align="right" variant="subtitle2" sx={{ ...theme.applyStyles('dark', { color: 'dark.900' }) }}>
                            {formatChatTime(history.createdAt)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          ) : (
            /* 상대방이 보낸 메시지 */
            <Grid size={12}>
              <Grid container spacing={gridSpacing}>
                <Grid size={{ xs: 12, sm: 7 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-end', // 하단 정렬
                      justifyContent: 'flex-start', // 왼쪽 정렬
                      gap: 0.
                    }}
                  >
                    <Card
                      sx={{
                        display: 'inline-block',
                        float: 'left',
                        bgcolor: 'secondary.light',
                        ...theme.applyStyles('dark', { bgcolor: 'dark.900' })
                      }}
                    >
                    <CardContent sx={{ p: 2, pb: '16px !important' }}>
                      <Grid container spacing={1}>
                        <Grid size={12}>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>
                            {history.senderName || '상대방'}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {history.content}
                          </Typography>
                        </Grid>
                        <Grid size={12}>
                          <Typography align="right" variant="subtitle2">
                            {formatChatTime(history.createdAt)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                  {history.unreadCount > 0 && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'primary.main',
                          fontWeight: 'bold',
                          mb: 1 // Card의 paddingBottom과 맞춤
                        }}
                      >
                        {history.unreadCount}
                      </Typography>
                    )}
                    </Box>
                </Grid>
              </Grid>
            </Grid>
          )}
        </React.Fragment>
      ))}
    </Grid>
  );
}

ChatHistory.propTypes = { 
  data: PropTypes.array, 
  theme: PropTypes.any, 
  user: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string 
  })
};