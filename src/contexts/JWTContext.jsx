// JWTContext.jsx

import PropTypes from 'prop-types';
import { createContext, useEffect, useReducer } from 'react';

// reducer - state management
import { LOGIN, LOGOUT } from 'store/actions';
import accountReducer from 'store/accountReducer';

// project imports
import Loader from 'ui-component/Loader';
import axios from 'api/axios';
import * as employeeAPI from 'features/employee/api/employeeAPI'; // employeeAPI만 사용
import { getImageUrl } from 'api/getImageUrl';
import DefaultAvatar from 'assets/images/profile/default_profile.png';

// constant
const initialState = {
  isLoggedIn: false,
  isInitialized: false,
  user: null
};

// ==============================|| JWT CONTEXT & PROVIDER ||============================== //

const JWTContext = createContext(null);

export function JWTProvider({ children }) {
  const [state, dispatch] = useReducer(accountReducer, initialState);

  // 새로고침 시 쿠키 유효성 검사
  useEffect(() => {
    const init = async () => {
      try {
        // HttpOnly 쿠키는 JS에서 접근 불가.
        // '내 정보 조회' API를 바로 호출.
        // - 쿠키가 유효하면 (accessToken) -> 성공
        // - 쿠키가 만료되면 (accessToken) -> axios 인터셉터가 401 받고 refresh 시도
        // - 쿠키가 없으면 -> 401 받고, refresh도 실패 -> catch 블록
        const response = await axios.get('/api/employees/myInfo');

        const user = response.data.data;

        // 서버에서 받은 최신 유저 정보로 로그인 상태 유지
        dispatch({
          type: LOGIN,
          payload: {
            isLoggedIn: true,
            user: user
          }
        });
      } catch (err) {
        console.error('JWTContext init error (likely no valid session):', err);
        dispatch({
          type: LOGOUT
        });
      }
    };

    init();
  }, []); // 컴포넌트 마운트 시 1회만 실행

  const login = async (email, password) => {
    const response = await axios.post('/api/auth/login', { username: email, password });
    const user = response.data;

    dispatch({
      type: LOGIN,
      payload: {
        isLoggedIn: true,
        user: user
      }
    });
  };

  const register = async (userData) => {
    const response = await axios.post('/api/auth/signup', userData);
    return response.data.data;
  };

  // 관리자가 '다른' 직원의 정보를 수정하는 함수
  const adminUpdateEmployee = async (employeeId, employeeData) => {
    const response = await employeeAPI.updateEmployeeByAdmin(employeeId, employeeData);
    return response.data.data;
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      dispatch({ type: LOGOUT });
    }
  };

  // 비밀번호 초기화
  const resetPassword = async (id) => {
    return employeeAPI.initPassword(id);
  };

  // 사용자 정보 업데이트
  const updateProfile = async (data) => {
    const response = await employeeAPI.updateEmployeeByUser(data);
    const updatedUser = response.data.data;

    dispatch({
      type: LOGIN,
      payload: {
        isLoggedIn: true,
        user: updatedUser
      }
    });
  };

  // 비밀번호 변경
  const updatePassword = async (data) => {
    return employeeAPI.updatePassword(data);
  };

  // 프로필 이미지 URL 반환
  const getProfileImg = () => {
    if (state.user && state.user.profileImg && state.user.profileImg !== '') {
      return getImageUrl(state.user.profileImg);
    }
    return DefaultAvatar;
  };

  if (state.isInitialized !== undefined && !state.isInitialized) {
    return <Loader />;
  }

  return (
    <JWTContext.Provider value={{ ...state, login, logout, register, resetPassword, updateProfile, updatePassword, adminUpdateEmployee, getProfileImg }}>
      {children}
    </JWTContext.Provider>
  );
}

export default JWTContext;

JWTProvider.propTypes = { children: PropTypes.node };