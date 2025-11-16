import axiosServices from 'api/axios';

// 백엔드 주소
const API_BASE_URL = 'http://localhost:8080/api';
const COMMON_CODE_URL = `${API_BASE_URL}/commoncodes`;

export const codeAPI = {
  /**
   * 전체 대분류(접두사) 코드 조회
   */
  getAllPrefix: async () => {
    try {
      const res = await axiosServices.get(`${COMMON_CODE_URL}`);
      const data = res.data?.data;
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error('전체 코드 조회 실패:', err);
      return [];
    }
  },

  /**
   * prefix 기반 하위 공통 코드 조회. (예: 'DP' -> 부서 목록)
   * @param {string} prefix - 조회할 공통 코드의 접두사 (예: 'DP', 'ST', 'PS', 'RL')
   * @returns {Promise<Array>} - 조회된 공통 코드 배열
   */
  getAllCode: async (prefix) => {
    try {
      const res = await axiosServices.get(`${COMMON_CODE_URL}/prefix/${prefix}`);
      const data = res.data?.data;
      return Array.isArray(data) ? data : []; // data가 배열인지 확인 후 반환
    } catch (err) {
      console.error(`'${prefix}' 접두사 코드 조회 실패:`, err);
      return [];
    }
  },

  /**
   * 전체 부서 목록 조회
   */
  getDepartments: async () => {
    try {
      const res = await axiosServices.get(`${COMMON_CODE_URL}/department`);
      const data = res.data?.data;
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error('부서 목록 조회 실패:', err);
      return [];
    }
  },

  /**
   * 전체 재직 상태 목록 조회
   */
  getEmployeeStatus: async () => {
    try {
      const res = await axiosServices.get(`${COMMON_CODE_URL}/status`);
      const data = res.data?.data;
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error('재직 상태 목록 조회 실패:', err);
      return [];
    }
  },

  /**
   * 전체 직급 목록 조회
   */
  getPositions: async () => {
    try {
      const res = await axiosServices.get(`${COMMON_CODE_URL}/position`);
      const data = res.data?.data;
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error('직급 목록 조회 실패:', err);
      return [];
    }
  },

  /**
   * 전체 권한 목록 조회
   */
  getRoles: async () => {
    try {
      const res = await axiosServices.get(`${COMMON_CODE_URL}/role`);
      const data = res.data?.data;
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error('권한 목록 조회 실패:', err);
      return [];
    }
  },

  /**
   * 새로운 공통 코드 생성 (관리자용)
   * @param {object} codeData - 생성할 코드 데이터 (CommonCodeRequestDTO)
   * @returns {Promise<object>} - API 응답 객체
   */
  createCode: async (codeData) => {
    try {
      const res = await axiosServices.post(COMMON_CODE_URL, codeData);
      return res.data; // 성공/실패 여부를 포함한 전체 APIResponseDTO 반환
    } catch (err) {
      console.error('공통 코드 생성 실패:', err);
      // 오류 발생 시, 백엔드에서 보낸 오류 메시지를 포함한 객체 반환
      return err.response?.data || { message: '코드 생성 중 오류가 발생했습니다.', data: null };
    }
  },

  /**
   * 기존 공통 코드 수정 (관리자용)
   * @param {number|string} id - 수정할 코드의 ID
   * @param {object} codeData - 수정할 코드 데이터 (CommonCodeRequestDTO)
   * @returns {Promise<object>} - API 응답 객체
   */
  updateCode: async (id, codeData) => {
    try {
      console.log(codeData, 'codeData');
      const res = await axiosServices.patch(`${COMMON_CODE_URL}/${id}`, codeData);
      return res.data; // 성공/실패 여부를 포함한 전체 APIResponseDTO 반환
    } catch (err) {
      console.error('공통 코드 수정 실패:', err);
      return err.response?.data || { message: '코드 수정 중 오류가 발생했습니다.', data: null };
    }
  }
};
