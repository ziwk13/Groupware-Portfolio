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
import { getImageUrl, ImagePath } from 'api/getImageUrl';
import DefaultAvatar from 'assets/images/profile/default_profile.png';
import UserAvatar from './UserAvatar';

export default function ChatHistory({ data, theme, user, roomInfo }) {
  
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

  return (
    <Grid container spacing={gridSpacing}>
      {data.map((history, index) => (
        <React.Fragment key={index}>
          {/* 시스템 메시지 */}
          {history.messageType === 'CHAT_SYSTEM' ? ( 
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
          ) : /* 내가 보낸 메시지 */
          String(history.employeeId) === String(user.id) ? (
            <Grid size={12}>
              <Grid container spacing={gridSpacing}>
                <Grid size={{ xs: 0, sm: 4 }} />
                <Grid size={{ xs: 12, sm: 8 }}>
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
                          whiteSpace: 'nowrap'
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
                        maxWidth: '100%'
                      }}
                    >
                      <CardContent sx={{ p: 2, pb: '16px !important', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        
                        {history.content && (
                          <Typography variant="body2" sx={{ ...theme.applyStyles('dark', { color: 'dark.900' }), wordBreak: 'break-word' }}>
                            {history.content}
                          </Typography>
                        )}

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
            /* 상대방이 보낸 메시지 (프로필 렌더링 추가) */
            <Grid size={12}>
              <Grid container spacing={gridSpacing}>
                <Grid size={{ xs: 12, sm: 8 }}>
                  {/* 프로필 이미지 + 메시지 박스 레이아웃 */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    
                    {/* 프로필 아바타 */}
                    <UserAvatar
                      user={{
                        name: history.senderName || '상대방',
                        avatar: history.senderProfile || roomInfo?.avatar 
                      }}
                      sx={{ width: 34, height: 34, mt: 0.5 }}
                    />

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
                        <CardContent sx={{ p: 2, pb: '16px !important', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>
                            {history.senderName || '상대방'}
                          </Typography>

                          {history.content && (
                            <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                              {history.content}
                            </Typography>
                          )}

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
  }),
  roomInfo: PropTypes.object
};