import axiosServices from "utils/axios"; // 공통 axios 설정 불러오기

// 백엔드 주소
const API_BASE_URL = "http://localhost:8080/api"; // 백엔드의 기본 주소
const COMMON_CODE_URL = `${API_BASE_URL}/commoncodes`;

export const organizationAPI = {
  // 부서 목록 조회
  getDepartments: async () => {
    try {
      const res = await axiosServices.get(`${COMMON_CODE_URL}/department`);
      
      // APIResponseDTO 형태일 수도 있으니 data 필드 우선 확인(없으면 res.data 사용)
      const data = res.data?.data || res.data;
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error("부서 목록 조회 실패:", err);
      // 임시 더미데이터 반환
      return [
        { code: "DP1", value1: "스타트업", value2: null },
        { code: "DP2", value1: "경영지원본부", value2: "DP1" },
        { code: "DP3", value1: "인사팀", value2: "DP2" },
      ];
    }
  },

  // 재직 상태 목록 조회
  getEmployeeStatus: async () => {
    try {
      const res = await axiosServices.get(`${COMMON_CODE_URL}/status`);
      const data = res.data?.data || res.data;
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error("재직 상태 목록 조회 실패:", err);
      return [];
    }
  },

  // 직급 목록 조회
  getPositions: async () => {
    try {
      const res = await axiosServices.get(`${COMMON_CODE_URL}/position`);
      const data = res.data?.data || res.data;
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error("직급 목록 조회 실패:", err);
      return [];
    }
  },

  // 권한 목록 조회
  getRoles: async () => {
    try {
      const res = await axiosServices.get(`${COMMON_CODE_URL}/role`);
      const data = res.data?.data || res.data;
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error("권한 목록 조회 실패:", err);
      return [];
    }
  },

  // 특정 부서의 직원 목록 조회(부서를 클릭했을때 실행되는 함수)
  getEmployeesByDeptCode: async (deptCode) => {
    try {
      const res = await axiosServices.get(`${API_BASE_URL}/employees/department/${deptCode}`, {
        withCredentials: true,
      });
      const data = res.data?.data || res.data;
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error(`직원 목록 조회 실패 (${deptCode}):`, err);
      return [];
    }
  },

};
