// axios.js

/**
 * axios setup
 */

import axios from 'axios';

// --- API Base URL ---
// VITE_APP_API_URL 환경 변수가 있으면 사용하고, 없으면 기본값
export const BASE_URL = import.meta.env.VITE_APP_API_URL || 'http://boot-container:8080/';

// axios 인스턴스 생성
// 이 설정이 있어야 브라우저가 자동으로 HttpOnly 쿠키를 요청에 포함시킴
const axiosServices = axios.create({
  baseURL: BASE_URL, // 분리된 변수 사용
  withCredentials: true // 쿠키 전송을 위한 설정
});

// ==============================|| HELPER FUNCTIONS ||============================== //

// 강제 로그아웃 처리 함수
function forceLogout() {
  if (!window.location.href.includes('/login')) {
    // 로그인 페이지가 아닐 경우에만 리디렉션
    window.location.pathname = '/login';
  }
}

// ==============================|| AXIOS INTERCEPTORS ||============================== //

// --- 응답 인터셉터 ---
axiosServices.interceptors.response.use(
  // 1. 성공적인 응답은 그대로 통과
  (response) => response,

  // 2. 에러 응답 처리
  async (error) => {
    const originalRequest = error.config;

    // 401(Unauthorized) 에러일때
    if (error.response?.status === 401) {
      // 로그인 또는 리프레시 요청 자체가 401로 실패한 경우
      // 이 경우는 강제 로그아웃이 아니라, 폼에서 에러 메시지를 표시
      if (originalRequest.url === '/api/auth/login' || originalRequest.url === '/api/auth/refresh') {
        // 에러를 그대로 반환하여 AuthLogin.jsx의 catch 블록에서 처리
        return Promise.reject((error.response && error.response.data) || 'Wrong Services');
      }

      // 이미 재시도한 요청이 401을 받은 경우 (토큰 갱신 후에도 실패)
      if (originalRequest._retry) {
        console.error('Retry failed after token refresh:', error);
        forceLogout(); // 이 경우 강제 로그아웃
        return Promise.reject((error.response && error.response.data) || 'Wrong Services');
      }

      // 그 외 401 에러 -> 토큰 갱신 시도
      originalRequest._retry = true; // 재시도 플래그 설정

      try {
        // 리프레시 토큰은 HttpOnly 쿠키로 자동 전송
        await axiosServices.post('/api/auth/refresh', {});

        // 새로받은 accessToken으로 원래 실패했던 요청을 재시도
        return axiosServices(originalRequest);
      } catch (refreshError) {
        // 리프레시 토큰이 만료되었거나 유효하지 않은 경우 (갱신 실패)
        console.error('Token refresh failed:', refreshError);
        forceLogout(); // 강제 로그아웃
        return Promise.reject(refreshError);
      }
    }

    // 401이 아닌 다른 모든 에러는 그대로 반환
    return Promise.reject((error.response && error.response.data) || 'Wrong Services');
  }
);

export default axiosServices;

// --- SWR을 위한 fetcher ---
export async function fetcher(args) {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosServices.get(url, { ...config });

  return res.data;
}
