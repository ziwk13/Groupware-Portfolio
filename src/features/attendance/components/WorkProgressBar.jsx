import { Box, Typography } from '@mui/material';

export default function WorkProgressBar({ percent = 80, color = '#4cd964' }) {
  return (
    <Box sx={{ position: 'relative', width: '100%', height: 24, borderRadius: 12, backgroundColor: '#f8d7da' }}>
      {/* 근무 진행 바 */}
      <Box
        sx={{
          width: `${percent}%`,
          height: '100%',
          backgroundColor: color,
          borderRadius: '12px',
          transition: 'width 0.5s ease'
        }}
      />
      {/* 퇴근 라벨 */}
      <Typography
        variant="body2"
        sx={{
          position: 'absolute',
          right: 12,
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'white',
          fontWeight: 'bold'
        }}
      >
        퇴근
      </Typography>
    </Box>
  );
}
