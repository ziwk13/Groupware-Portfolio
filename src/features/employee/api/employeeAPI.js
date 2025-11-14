import axiosServices from 'api/axios';

/**
 * (GET) 내 정보 조회 API
 */
export const getMyInfo = () => {
  return axiosServices.get('/api/employees/myInfo');
};

/**
 * (PATCH) 사용자 본인 정보 수정 API (연락처, 프로필 이미지 등)
 * @param {object} data - FormData { phoneNumber, profileImgFile }
 */
export const updateEmployeeByUser = (data) => {
  return axiosServices.patch('/api/employees/updateEmployeeByUser', data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

/**
 * (PATCH) 관리자가 직원 정보 수정 API
 * @param {string} employeeId - 직원 ID
 * @param {object} employeeData - 수정할 직원 데이터
 */
export const updateEmployeeByAdmin = (employeeId, employeeData) => {
  return axiosServices.patch(`/api/employees/updateEmployeeByAdmin/${employeeId}`, employeeData);
};

/**
 * (PATCH) 관리자가 직원 비밀번호 초기화 API
 * @param {string} id - 직원 ID
 */
export const initPassword = (id) => {
  return axiosServices.patch(`/api/employees/initPassword/${id}`, {});
};

/**
 * (PATCH) 사용자 본인 비밀번호 변경 API
 * @param {object} data - { currentPassword, newPassword }
 */
export const updatePassword = (data) => {
  return axiosServices.patch('/api/auth/updateEmployeePassword', data);
};

/**
 * (GET) 특정 사원 인사 정보 수정 이력 조회 API
 * @param {string} employeeId - 조회할 직원 ID
 * @param {object} params - 페이징 파라미터 { page, size }
 */
export const getEmployeeHistory = (employeeId, params) => {
  return axiosServices.get(`/api/employees/history/${employeeId}`, { params });
};

/**
 * (post) 인사 정보 동기화 (CSV 파일 업로드)
 * @param {object} data - FormData { multipartFile }
 */
export const syncHR = (data) => {
  return axiosServices.post('/api/auth/synchr', data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};