import * as React from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

export default function OutlinedButtons() {
  return (
    <Stack direction="row" spacing={3} justifyContent="center" alignItems="center" sx={{ mt: 2 }}>
      <Button
        variant="outlined"
        size="large"
        sx={{
          borderColor: '#D1D5DB',
          color: '#111827',
          borderRadius: '12px',
          width: '140px',
          height: '48px',
          fontWeight: 600,
          fontSize: '1rem'
        }}
      >
        출근하기
      </Button>
      <Button
        variant="outlined"
        size="large"
        sx={{
          borderColor: '#D1D5DB',
          color: '#111827',
          borderRadius: '12px',
          width: '140px',
          height: '48px',
          fontWeight: 600,
          fontSize: '1rem',
          '&:hover': {
            borderColor: '#9CA3AF',
            backgroundColor: '#F9FAFB'
          }
        }}
      >
        퇴근하기
      </Button>
    </Stack>
  );
}
