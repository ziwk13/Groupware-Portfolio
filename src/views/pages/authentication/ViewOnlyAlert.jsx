import { useSearchParams } from 'react-router-dom';

// material-ui
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';

// project imports
import { APP_AUTH } from 'config';

export default function ViewOnlyAlert() {
  const [searchParams] = useSearchParams();
  const authParam = searchParams.get('auth') || '';

  const documentationLink = 'https://codedthemes.gitbook.io/berry/authentication';

  return (
    <>
      {!authParam ||
        (authParam !== APP_AUTH && (
          <Box
            sx={{
              maxWidth: { xs: 400, lg: 475 },
              margin: { xs: 2.5, md: 3 },
              '& > *': {
                flexGrow: 1,
                flexBasis: '50%'
              }
            }}
          >
            <Alert variant="outlined" severity="info" sx={{ alignItems: 'flex-start' }}>
              <Typography variant="h5">View Only</Typography>
              <Typography variant="h6">
                This page is view-only. To make it fully functional, please read the documentation provided{' '}
                <Link href={documentationLink} target="_blank">
                  here
                </Link>{' '}
                after purchasing the theme.
              </Typography>
            </Alert>
          </Box>
        ))}
    </>
  );
}
