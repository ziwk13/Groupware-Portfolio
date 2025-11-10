import { Box, Typography } from '@mui/material';

export default function WorkProgressBar({
  currentMinutes = 0, // 이번 주 누적 근무시간 (분)
  targetMinutes = 2400 // 목표 근무시간 (기본 40h)
}) {
  const percent = Math.min((currentMinutes / targetMinutes) * 100, 100);
  const remainingMinutes = Math.max(targetMinutes - currentMinutes, 0);

  const currentHours = Math.floor(currentMinutes / 60);
  const currentMins = currentMinutes % 60;
  const remainHours = Math.floor(remainingMinutes / 60);
  const remainMins = remainingMinutes % 60;

  return (
    <Box sx={{ width: '100%', p: 1 }}>
      {/* 상단 텍스트 */}
      <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5, color: '#F9FAFB' }}>
        주간누적 {currentHours}시간 {currentMins}분 / 40시간
      </Typography>

      <Typography variant="body2" sx={{ mb: 1, color: '#9CA3AF' }}>
        이번주 {remainHours}시간 {remainMins}분 더 필요해요.
      </Typography>

      {/* 진행 바 */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: 20,
          borderRadius: 12,
          backgroundColor: 'rgba(255,255,255,0.08)',
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            width: `${percent}%`,
            height: '100%',
            background: percent >= 100 ? 'linear-gradient(90deg, #34D399, #10B981)' : 'linear-gradient(90deg, #3B82F6, #60A5FA)',
            borderRadius: 12,
            transition: 'width 0.6s ease'
          }}
        />
        <Typography
          variant="caption"
          sx={{
            position: 'absolute',
            right: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#F9FAFB',
            fontWeight: 600
          }}
        >
          {percent >= 100 ? '완료' : `${Math.round(percent)}%`}
        </Typography>
      </Box>
    </Box>
  );
}
