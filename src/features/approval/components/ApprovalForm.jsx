// material-ui
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Autocomplete from '@mui/material/Autocomplete';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import PersonAddAlt1OutlinedIcon from '@mui/icons-material/PersonAddAlt1Outlined';

// third party
import { Formik } from 'formik';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import StartAndEndDateTime from './StartAndEndDateTime';

// assets

// autocomplete options
const top100Films = [
  { title: 'The Shawshank Redemption', year: 1994 },
  { title: 'The Godfather', year: 1972, date: true },
  { title: 'The Godfather: Part II', year: 1974 },
  { title: 'The Dark Knight', year: 2008 }
];

// ==============================|| ADD NEW FORM ||============================== //

export default function ApprovalForm({
  selectedForm,
  setSelectedForm,
  startTime,
  setStartTime,
  endTime,
  setEndTime
}) {

  // 40px 높이를 위한 공통 스타일
  const customInputStyle = {
    // 기본 MuiInputBase-root의 높이를 40px로 설정
    '& .MuiInputBase-root': {
      height: 40
    },
    // 내부 input 패딩 조정
    // 40px 높이(size="small")의 기본값은 8.5px
    '& .MuiInputBase-input': {
      padding: '8.5px 14px'
    },
    // 라벨 위치 조정
    '& .MuiInputLabel-root.MuiInputLabel-outlined': {
      transform: 'translate(14px, 9.5px) scale(1)'
    },
    // 축소된 라벨 위치 조정
    // size="small"의 기본값 -6px
    '& .MuiInputLabel-root.MuiInputLabel-outlined.MuiInputLabel-shrink': {
      transform: 'translate(14px, -6px) scale(0.75)'
    }
  };

  return (
    <Formik
      initialValues={{
        files: null
      }}
      onSubmit={(values) => {
        console.log('values', values);
        // submit form
      }}
    >
      {({ values, handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <MainCard
            title={
              <Stack direction="row" sx={{ flexWrap: 'wrap', gap: { xs: 1, lg: 2 } }}>
                <Button variant="contained" color="primary" type="submit" sx={{ height: '35px' }}>
                  기안
                </Button>
                <Button variant="outlined" color="primary" type="submit" sx={{ height: '35px' }} endIcon={<PersonAddAlt1OutlinedIcon />}>
                  결재선 수정
                </Button>
              </Stack>
            }
            sx={{ '& .MuiCardHeader-root': { flexWrap: 'wrap', gap: 1.5 }, '& .MuiCardHeader-action': { flex: 'unset' } }}
          >
            <Grid container spacing={3}>
              <Grid item size={12}>
                <Grid container spacing={2}>
                  <Grid item size={3}>
                    <Autocomplete
                      id="combo-box-demo"
                      options={top100Films}
                      getOptionLabel={(option) => option.title}
                      // Autocomplete 값이 변경될 때 selectedForm state를 업데이트
                      onChange={(event, newValue) => {
                        setSelectedForm(newValue);
                      }}
                      renderInput={(params) => <TextField {...params} label="결재 양식" sx={customInputStyle} />}
                    />
                  </Grid>
                  <Grid item size={9}>
                    <TextField fullWidth id="outlined-title" label="제목" sx={customInputStyle} />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item size={12}>
                <TextField fullWidth multiline rows={5} placeholder={'상신 의견'}></TextField>
              </Grid>
              <Grid item size={12}></Grid>
              {selectedForm && selectedForm.date === true && (
                <Grid item size={12}>
                  <StartAndEndDateTime startTime={startTime} setStartTime={setStartTime} endTime={endTime} setEndTime={setEndTime} />
                </Grid>
              )}
            </Grid>
          </MainCard>
        </form>
      )}
    </Formik>
  );
}
