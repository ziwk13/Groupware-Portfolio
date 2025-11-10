// JWTContext.jsx

import PropTypes from 'prop-types';
import { createContext, useEffect, useReducer } from 'react';

// reducer - state management
import { LOGIN, LOGOUT } from 'store/actions';
import accountReducer from 'store/accountReducer';

// project imports
import Loader from 'ui-component/Loader';
import axios from 'utils/axios';
// mypageAPI에서 updatePassword도 가져오도록 수정
import { updateEmployeeInfo, updatePassword as apiUpdatePassword } from '../features/mypage/api/mypageAPI';
import { getImageUrl } from 'utils/getImageUrl';
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
        // init 과정에서 에러 발생 시 로그아웃
        dispatch({
          type: LOGOUT
        });
      }
    };

    init();
  }, []); // 컴포넌트 마운트 시 1회만 실행

  const login = async (email, password) => {
    const response = await axios.post('/api/auth/login', { username: email, password });

    // 서버가 HttpOnly 쿠키(accessToken, refreshToken)를 설정함
    // 응답 body에는 user 정보(EmployeeResponseDTO)만 있음
    const user = response.data;

    // Context state 업데이트
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
    // OrganizationPage에서 EmployeeResponseDTO 객체 자체를 필요로 하므로 .data.data를 반환
    return response.data.data;
  };

  // 관리자가 '다른' 직원의 정보를 수정하는 함수
  const adminUpdateEmployee = async (employeeId, employeeData) => {
    const response = await axios.patch(`/api/employees/updateEmployeeByAdmin/${employeeId}`, employeeData);
    // register와 마찬가지로 APIResponseDTO에서 실제 Employee DTO 객체를 반환
    return response.data.data;
  };

  const logout = async () => {
    try {
      // 서버에 로그아웃 요청을 보내 HttpOnly 쿠키를 만료시킴
      await axios.post('/api/auth/logout');
    } catch (error) {
      // 서버 요청에 실패하더라도 (예: 네트워크 오류, 서버 다운)
      // 클라이언트 측에서는 로그아웃을 진행함
      console.error('Logout API call failed:', error);
    } finally {
      // API 호출 성공/실패 여부와 관계없이 클라이언트 상태를 로그아웃으로 변경
      dispatch({ type: LOGOUT });
    }
  };

  const resetPassword = async (id) => {
    return axios.patch(`/api/employees/initPassword/${id}`,{});
  };

  // 사용자 정보 업데이트 함수 (연락처 등)
  const updateProfile = async (data) => {
    const response = await updateEmployeeInfo(data);
    const updatedUser = response.data.data;

    // 프로필 변경은 user 객체가 변경되므로 dispatch로 전역 상태 업데이트
    dispatch({
      type: LOGIN,
      payload: {
        isLoggedIn: true,
        user: updatedUser
      }
    });
  };

  // 비밀번호 변경 함수 추가
  const updatePassword = async (data) => {
    return apiUpdatePassword(data);
  };

  // 프로필 이미지 URL을 반환하는 함수
  const getProfileImg = () => {
    if (state.user && state.user.profileImg && state.user.profileImg !== '') {
      return getImageUrl(state.user.profileImg);
    }

    // 위 조건에 맞지 않으면, import된 기본 이미지 경로 반환
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
