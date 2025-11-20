import PropTypes from 'prop-types';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Button from '@mui/material/Button';
import CardMedia from '@mui/material/CardMedia';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';

// project imports
import { AuthProvider, APP_AUTH } from 'config';

// assets
import Jwt from 'assets/images/icons/jwt.svg';

// ==============================|| SOCIAL BUTTON ||============================== //

export default function LoginProvider({ currentLoginWith }) {
  const theme = useTheme();
  const downLG = useMediaQuery((theme) => theme.breakpoints.down('lg'));

  const [searchParams] = useSearchParams();
  const auth = searchParams.get('auth'); // get auth and set route based on that

  const loginHandlers = {
    Jwt: '/login'
  };

  const buttonData = [
    { name: 'jwt', icon: Jwt, url: loginHandlers.Jwt }
  ];

  const currentLoginExists = buttonData.some((button) => button.name === currentLoginWith);

  return (
    <Stack
      direction="row"
      sx={{ gap: 1, justifyContent: 'center', '& .MuiButton-startIcon': { mr: { xs: 0, md: 1 }, ml: { xs: 0, sm: -0.5, md: 1 } } }}
    >
      {buttonData
        .filter((button) => {
          if (auth) {
            return button.name !== auth;
          }
          if (currentLoginExists) {
            return button.name !== currentLoginWith;
          }
          return button.name !== APP_AUTH;
        })
        .map((button) => (
          <Tooltip title={button.name} key={button.name}>
            <Button
              sx={{
                borderColor: theme.vars.palette.grey[300],
                color: theme.vars.palette.grey[900],
                '&:hover': { borderColor: theme.vars.palette.primary[400], backgroundColor: theme.vars.palette.primary[100] }
              }}
              variant="outlined"
              color="secondary"
              startIcon={<CardMedia component="img" src={button.icon} alt={button.name} />}
              component={RouterLink}
              to={button.url}
              target="_blank"
            >
              {!downLG && button.name}
            </Button>
          </Tooltip>
        ))}
    </Stack>
  );
}

LoginProvider.propTypes = { currentLoginWith: PropTypes.string };
