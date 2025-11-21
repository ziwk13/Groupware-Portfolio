import { Link as RouterLink } from 'react-router-dom';

// material-ui
import Link from '@mui/material/Link';
// project imports
import { DASHBOARD_PATH } from 'config';

// assets
import Logo from 'ui-component/Logo';

// ==============================|| MAIN LOGO ||============================== //

export default function LogoSection() {
  return (
    <Link component={RouterLink} to={DASHBOARD_PATH} aria-label="theme-logo" underline="none">
      <Logo />
    </Link>
  );
}
