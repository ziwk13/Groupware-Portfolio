import { Link as RouterLink } from 'react-router-dom';

// material-ui
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// project imports
import { DASHBOARD_PATH } from 'config';

// assets
import logo from 'assets/images/logo.png';

// ==============================|| MAIN LOGO ||============================== //

export default function LogoSection() {
  return (
    <Link
      component={RouterLink}
      to={DASHBOARD_PATH}
      aria-label="theme-logo"
      underline="none"
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <img width="32" height="32" src={logo} alt="Logo" />
        <Typography variant="h3" sx={{ color: 'text.primary', fontWeight: 1000, pl:'7px'}}>
          STARTUP
        </Typography>
      </Stack>
    </Link>
  );
}