import axiosServices from '../../../utils/axios';

/**
 * 사용자 비밀번호 변경 API
 * @param {object} data - { currentPassword, newPassword }
 */
export const updatePassword = (data) => {
  return axiosServices.patch('/api/auth/updateEmployeePassword', data);
};

/**
 * 사용자 본인 정보 수정 API (연락처 등)
 * @param {object} data - { phoneNumber }
 */
export const updateEmployeeInfo = (data) => {
  return axiosServices.patch('/api/employees/updateEmployeeByUser', data);
};