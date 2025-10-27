// JWTContext.jsx

import PropTypes from 'prop-types';
import { createContext, useEffect, useReducer } from 'react';

// reducer - state management
import { LOGIN, LOGOUT } from 'store/actions';
import accountReducer from 'store/accountReducer';

// project imports
import Loader from 'ui-component/Loader';
import axios from 'utils/axios'; // axios.js에서 설정한 인스턴스

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

        // 서버 응답 구조에 따라 response.data 또는 response.data.data를 사용
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
        // init 과정에서 에러 발생 시 (예: myInfo 조회 실패, 갱신 실패 등) 로그아웃
        dispatch({
          type: LOGOUT
        });
      }
    };

    init();
  }, []); // 컴포넌트 마운트 시 1회만 실행

  const login = async (email, password) => {
    // 1. 로그인 요청
    const response = await axios.post('/api/auth/login', { username: email, password });

    // 2. 서버가 HttpOnly 쿠키(accessToken, refreshToken)를 설정함
    // 3. 응답 body에는 user 정보(EmployeeResponseDTO)만 있음
    const user = response.data;

    // 4. Context state 업데이트
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
    return response.data;
  };

  const logout = async () => {
    try {
      // 1. 서버에 로그아웃 요청을 보내 HttpOnly 쿠키를 만료시킴
      await axios.post('/api/auth/logout');
    } catch (error) {
      // 2. 서버 요청에 실패하더라도 (예: 네트워크 오류, 서버 다운)
      //    클라이언트 측에서는 로그아웃을 진행함
      console.error('Logout API call failed:', error);
    } finally {
      // 3. API 호출 성공/실패 여부와 관계없이 클라이언트 상태를 로그아웃으로 변경
      dispatch({ type: LOGOUT });
    }
  };

  const resetPassword = async (email) => {};

  const updateProfile = () => {};

  if (state.isInitialized !== undefined && !state.isInitialized) {
    return <Loader />;
  }

  return <JWTContext.Provider value={{ ...state, login, logout, register, resetPassword, updateProfile }}>{children}</JWTContext.Provider>;
}

export default JWTContext;

JWTProvider.propTypes = { children: PropTypes.node };