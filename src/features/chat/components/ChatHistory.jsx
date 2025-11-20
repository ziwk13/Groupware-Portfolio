import PropTypes from 'prop-types';
import React from 'react';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import { gridSpacing } from 'store/constant';
import AttachmentListView from 'features/attachment/components/AttachmentListView';

export default function ChatHistory({ data, theme, user }) {
  
  const formatChatTime = (isoString) => {
    if (!isoString) return '';
    try {
      return new Date(isoString).toLocaleTimeString('ko-KR', {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true
      });
    } catch (error) {
      console.error('Invalid time format:', isoString);
      return isoString;
    }
  };
  console.log('history', history);

  return (
    <Grid container spacing={gridSpacing}>
      {data.map((history, index) => (
        <React.Fragment key={index}>
          {/* 1. 시스템 메시지 */}
          {history.messageType === 'SYSTEM' ? ( 
            <Grid size={12}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  my: 3,
                  px: 2
                }}
              >
                {/* 카드(Card) 형태를 제거하고 텍스트만 표시하여 배경과 일체화 */}
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'text.secondary',
                    bgcolor: 'rgba(0, 0, 0, 0.05)',
                    textAlign: 'center',
                    fontWeight: 500,
                    fontSize: '0.875rem'
                  }}
                >
                  {history.content}
                </Typography>

                {history.attachments && history.attachments.length > 0 && (
                    <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', width: '100%' }}> 
                        <AttachmentListView attachments={history.attachments} height="auto" type='chat' />
                    </Box>
                )}
                
                {/* 시간 표시 - 텍스트 아래에 작게 표시 */}
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'text.disabled', 
                    mt: 0.5 
                  }}
                >
                  {formatChatTime(history.createdAt)}
                </Typography>
              </Box>
            </Grid>
          ) : /* 2. 내가 보낸 메시지 */
          String(history.employeeId) === String(user.id) ? (
            <Grid size={12}>
              <Grid container spacing={gridSpacing}>
                <Grid size={{ xs: 0, sm: 5 }} />
                <Grid size={{ xs: 12, sm: 7 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'flex-end',
                      gap: 0.5 
                    }}
                  >
                    {history.unreadCount > 0 && (
                      <Typography
                        variant='caption'
                        sx={{
                          color: 'primary.main',
                          fontWeight: 'bold',
                          mb: 1,
                          whiteSpace: 'nowrap' // 숫자 줄바꿈 방지
                        }}
                      >
                        {history.unreadCount}
                      </Typography>
                    )}
                    <Card
                      sx={{
                        display: 'inline-block',
                        bgcolor: 'primary.light',
                        ...theme.applyStyles('dark', { bgcolor: 'grey.500' }),
                        maxWidth: '100%' // Card가 Grid 영역을 넘지 않도록 설정
                      }}
                    >
                      {/* Grid 제거 및 Flex 구조로 변경 */}
                      <CardContent sx={{ p: 2, pb: '16px !important', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        
                        {history.content && (
                          <Typography variant="body2" sx={{ ...theme.applyStyles('dark', { color: 'dark.900' }), wordBreak: 'break-word' }}>
                            {history.content}
                          </Typography>
                        )}

                        {/* 파일 첨부 영역: minWidth를 주어 찌그러짐 방지 */}
                        {history.attachments && history.attachments.length > 0 && (
                          <Box sx={{ mt: history.content ? 1 : 0, width: '100%' }}>
                            <AttachmentListView attachments={history.attachments} height="auto" type='chat' />
                          </Box>
                        )}

                        <Typography align="right" variant="subtitle2" sx={{ ...theme.applyStyles('dark', { color: 'dark.900' }), mt: 0.5 }}>
                          {formatChatTime(history.createdAt)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          ) : (
            /* 3. 상대방이 보낸 메시지 */
            <Grid size={12}>
              <Grid container spacing={gridSpacing}>
                <Grid size={{ xs: 12, sm: 7 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'flex-start',
                      gap: 0.5
                    }}
                  >
                    <Card
                      sx={{
                        display: 'inline-block',
                        bgcolor: 'secondary.light',
                        ...theme.applyStyles('dark', { bgcolor: 'dark.900' }),
                        maxWidth: '100%'
                      }}
                    >
                      {/* Grid 제거 및 Flex 구조로 변경 */}
                      <CardContent sx={{ p: 2, pb: '16px !important', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>
                          {history.senderName || '상대방'}
                        </Typography>

                        {history.content && (
                          <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                            {history.content}
                          </Typography>
                        )}

                        {/* 파일 첨부 영역: minWidth를 주어 찌그러짐 방지 */}
                        {history.attachments && history.attachments.length > 0 && (
                          <Box sx={{ mt: history.content ? 1 : 0, width: '100%' }}>
                            <AttachmentListView attachments={history.attachments} height="auto" type='chat' />
                          </Box>
                        )}

                        <Typography align="right" variant="subtitle2" sx={{ mt: 0.5 }}>
                          {formatChatTime(history.createdAt)}
                        </Typography>
                      </CardContent>
                    </Card>
                    {history.unreadCount > 0 && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'primary.main',
                          fontWeight: 'bold',
                          mb: 1,
                          whiteSpace: 'nowrap'
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