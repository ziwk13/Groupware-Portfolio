// third party
import { combineReducers } from 'redux';

// project imports
import snackbarReducer from './slices/snackbar';
import scheduleReducer from '../features/schedule/slices/scheduleSlice';
import attendanceReducer from '../features/attendance/slices/attendanceSlice';

// ==============================|| COMBINE REDUCER ||============================== //

const reducer = combineReducers({
  snackbar: snackbarReducer,
  schedule: scheduleReducer,
  attendance: attendanceReducer
});

export default reducer;
