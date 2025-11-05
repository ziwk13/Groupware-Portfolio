import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import CardMedia from '@mui/material/CardMedia';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import SkeletonEarningCard from 'ui-component/cards/Skeleton/EarningCard';
import Button from './Buttons';

export default function EarningCard({ isLoading }) {
  const theme = useTheme();

  // 현재 시간 상태값
  const [currentTime, setCurrentTime] = useState(new Date());

  // 1초마다 갱신되는
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      {isLoading ? (
        <SkeletonEarningCard />
      ) : (
        <MainCard
          border={false}
          content={false}
          sx={{
            bgcolor: 'secondary.dark',
            ...theme.applyStyles('dark', { bgcolor: 'dark.dark' }),
            color: '#fff',
            overflow: 'hidden',
            position: 'relative',
            '&:after': {
              content: '""',
              position: 'absolute',
              width: 210,
              height: 210,
              background: theme.vars.palette.secondary[800],
              ...theme.applyStyles('dark', {
                background: `linear-gradient(210.04deg, ${theme.vars.palette.secondary.dark} -50.94%, rgba(144, 202, 249, 0) 95.49%)`
              }),
              borderRadius: '50%',
              top: { xs: -85 },
              right: { xs: -95 }
            },
            '&:before': {
              content: '""',
              position: 'absolute',
              width: 210,
              height: 210,
              background: theme.vars.palette.secondary[800],
              ...theme.applyStyles('dark', {
                background: `linear-gradient(140.9deg, ${theme.vars.palette.secondary.dark} -14.02%, rgba(144, 202, 249, 0) 85.50%)`
              }),
              borderRadius: '50%',
              top: { xs: -125 },
              right: { xs: -15 },
              opacity: 0.5
            }
          }}
        >
          <Box sx={{ p: 2.25 }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between' }}></Stack>
            <Stack direction="row" sx={{ alignItems: 'center' }}>
              <Typography sx={{ fontSize: '1.55rem', fontWeight: 500, mr: 1, mt: 1.75, mb: 0.75 }}>근태 관리</Typography>
            </Stack>
            <Typography sx={{ fontSize: '1.1rem', fontWeight: 400, color: 'secondary.200' }}>{formattedTime}</Typography>
          </Box>
          <Button variant="contained">Contained</Button>
        </MainCard>
      )}
    </>
  );
}

EarningCard.propTypes = { isLoading: PropTypes.bool };
