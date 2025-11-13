// material-ui
import Grid from '@mui/material/Grid';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { renderTimeViewClock } from '@mui/x-date-pickers/timeViewRenderers';
import Box from '@mui/material/Box';

// assets
import CalendarTodayTwoToneIcon from '@mui/icons-material/CalendarTodayTwoTone';
import ko from 'date-fns/locale/ko';

// ==============================|| VIEW RENDERER DATETIME ||============================== //

export default function StartAndEndDateTime({ startTime, setStartTime, endTime, setEndTime }) {
  return (
    <Box
      sx={{
        '&.MuiTypography-root-MuiClock-meridiemText': {
          color: 'inherit'
        }
      }}
    >
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
        <Grid container spacing={3}>
          <Grid size={6}>
            <DateTimePicker
              label="시작 날짜"
              format="yyyy/MM/dd hh:mm a"
              slots={{ openPickerIcon: () => <CalendarTodayTwoToneIcon /> }}
              slotProps={{ textField: { fullWidth: true } }}
              value={startTime}
              onChange={(newValue) => setStartTime(newValue)}
              viewRenderers={{
                hours: renderTimeViewClock,
                minutes: renderTimeViewClock,
                seconds: renderTimeViewClock
              }}
            />
          </Grid>
          <Grid size={6}>
            <DateTimePicker
              label="종료 날짜"
              format="yyyy/MM/dd hh:mm a"
              slots={{ openPickerIcon: () => <CalendarTodayTwoToneIcon /> }}
              slotProps={{ textField: { fullWidth: true } }}
              value={endTime}
              onChange={(newValue) => setEndTime(newValue)}
              viewRenderers={{
                hours: null,
                minutes: null,
                seconds: null
              }}
            />
          </Grid>
        </Grid>
      </LocalizationProvider>
    </Box>
  );
}
