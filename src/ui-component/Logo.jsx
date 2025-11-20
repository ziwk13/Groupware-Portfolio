import PropTypes from 'prop-types';
import { Stack, Typography } from '@mui/material';

import logo from 'assets/images/logo.png';
// ==============================|| LOGO SVG ||============================== //

export default function Logo() {

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <img width="32" height="32" src={logo} alt="Logo" />
      <Typography variant="h3" sx={{ color: 'text.primary', fontWeight: 1000, pl: '7px' }}>
        STARTUP
      </Typography>
    </Stack>
  );
}

Logo.propTypes = { dark: PropTypes.bool };
