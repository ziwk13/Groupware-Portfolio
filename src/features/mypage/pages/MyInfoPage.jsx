import PropTypes from 'prop-types';
import React from 'react';

// material-ui
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';

// project imports
import UserProfile from '../components/UserProfile';
import ChangePassword from '../components/ChangePassword';
import useConfig from 'hooks/useConfig';
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';

// assets
import PersonOutlineTwoToneIcon from '@mui/icons-material/PersonOutlineTwoTone';
import VpnKeyTwoToneIcon from '@mui/icons-material/VpnKeyTwoTone';

// tabs
function TabPanel({ children, value, index, ...other }) {
  return (
    <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
      {value === index && <div>{children}</div>}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`
  };
}

// tabs option
const tabsOption = [
  {
    label: '내 정보',
    icon: <PersonOutlineTwoToneIcon />,
    caption: '내 정보 변경하기'
  },
  {
    label: '비밀번호 변경',
    icon: <VpnKeyTwoToneIcon />,
    caption: '비밀번호 변경하기'
  }
];


export default function MyInfoPage() {
  const {
    state: { borderRadius }
  } = useConfig();
  const [value, setValue] = React.useState(0);

  const handleChange = (_event, newValue) => {
    setValue(newValue);
  };

  return (
    <MainCard title="마이페이지" content={false}>
      <Grid container spacing={gridSpacing}>
        <Grid size={{ xs: 12, lg: 4 }}>
          <CardContent>
            <Tabs
              value={value}
              onChange={handleChange}
              orientation="vertical"
              variant="scrollable"
              sx={(theme) => ({
                '& .MuiTabs-flexContainer': { borderBottom: 'none' },
                '& button': {
                  color: 'grey.900',
                  minHeight: 'auto',
                  minWidth: '100%',
                  py: 1.5,
                  px: 2,
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  textAlign: 'left',
                  justifyContent: 'flex-start',
                  borderRadius: `${borderRadius}px`
                },
                '& button.Mui-selected': {
                  color: 'primary.main',
                  bgcolor: 'grey.50'
                },
                '& button > svg': {
                  marginBottom: '0px !important',
                  marginRight: 1.25,
                  marginTop: 1.25,
                  height: 20,
                  width: 20
                },
                '& button > div > span': {
                  display: 'block'
                },
                '& > div > span': {
                  display: 'none'
                },

                ...theme.applyStyles('dark', {
                  '& button': { color: 'grey.600' },
                  '& button.Mui-selected': { bgcolor: 'dark.main' }
                })
              })}
            >
              {tabsOption.map((tab, index) => (
                <Tab
                  key={index}
                  icon={tab.icon}
                  label={
                    <Stack>
                      <Typography variant="subtitle1" sx={{ color: 'inherit' }}>
                        {tab.label}
                      </Typography>
                      <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>
                        {tab.caption}
                      </Typography>
                    </Stack>
                  }
                  {...a11yProps(index)}
                />
              ))}
            </Tabs>
          </CardContent>
        </Grid>
        <Grid size={{ xs: 12, lg: 8 }}>
          <CardContent sx={{ borderLeft: '1px solid', borderColor: 'divider', height: '100%' }}>
            <TabPanel value={value} index={0}>
              <UserProfile />
            </TabPanel>
            <TabPanel value={value} index={1}>
              <ChangePassword />
            </TabPanel>
          </CardContent>
        </Grid>
      </Grid>
    </MainCard>
  );
}

TabPanel.propTypes = { children: PropTypes.any, value: PropTypes.any, index: PropTypes.any, other: PropTypes.any };
