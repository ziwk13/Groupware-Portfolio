// axios.js

/**
 * axios setup
 */

import axios from 'axios';

// axios 인스턴스 생성
// 이 설정이 있어야 브라우저가 자동으로 HttpOnly 쿠키를 요청에 포함시킴
const axiosServices = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL || 'http://localhost:8080/',
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

    // 401(Unauthorized) 에러이고, 재시도한 요청이 아니며, 토큰 갱신 요청 자체가 실패한 것이 아닌지 확인
    if (error.response.status === 401 && !originalRequest._retry && originalRequest.url !== '/api/auth/refresh') {
      originalRequest._retry = true; // 재시도 플래그 설정

      try {
        // 리프레시 토큰은 HttpOnly 쿠키로 자동 전송됨
        // /api/auth/refresh 호출 시 빈 객체({})를 전송 (컨트롤러가 쿠키에서 읽음)
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

    // 401 에러가 아니거나, 이미 재시도했거나, 리프레시 요청이 실패한 경우
    if (error.response.status === 401) {
      forceLogout(); // 최종적으로 401이면 로그아웃
    }

    // 다른 모든 에러는 그대로 반환
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