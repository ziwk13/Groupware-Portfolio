import * as React from 'react';
import { Stack, Typography, Box, useTheme } from '@mui/material';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';

export default function WorkTimeCard() {
  const theme = useTheme();

  const [checkInTime, setCheckInTime] = React.useState('10:41:32');
  const [checkOutTime, setCheckOutTime] = React.useState('-');

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'rgba(255,255,255,0.05)',
        borderRadius: '12px',
        p: 2,
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: 'inset 0 0 10px rgba(0,0,0,0.2)',
        minWidth: 700
      }}
    >
      <Stack direction="row" spacing={5} alignItems="center" justifyContent="center">
        {/* 출근 시간 */}
        <Stack alignItems="center" spacing={0.5}>
          <Typography variant="body2" sx={{ color: theme.palette.grey[400], fontWeight: 400 }}>
            출근 시간
          </Typography>
          <Typography variant="h6" sx={{ color: theme.palette.grey[50], fontWeight: 600 }}>
            {checkInTime}
          </Typography>
        </Stack>

        {/* 화살표 */}
        <ArrowForwardIosRoundedIcon sx={{ color: theme.palette.grey[500], fontSize: 20 }} />

        {/* 퇴근 시간 */}
        <Stack alignItems="center" spacing={0.5}>
          <Typography variant="body2" sx={{ color: theme.palette.grey[400], fontWeight: 400 }}>
            퇴근 시간
          </Typography>
          <Typography variant="h6" sx={{ color: theme.palette.grey[50], fontWeight: 600 }}>
            {checkOutTime}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
}
