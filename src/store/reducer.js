// third party
import { combineReducers } from 'redux';

// project imports
import snackbarReducer from './slices/snackbar';
import scheduleReducer from 'features/schedule/api/scheduleApi';
import attendanceReducer from 'features/attendance/api/attendanceApi';

// ==============================|| COMBINE REDUCER ||============================== //

const reducer = combineReducers({
  snackbar: snackbarReducer,
  schedule: scheduleReducer,
  attendance: attendanceReducer
});

export default reducer;
