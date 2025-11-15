import axiosServices from '../../../api/axios';

// status 값(FE)을 실제 API 엔드포인트(BE)로 매핑
const urlMapping = {
  pending: '/api/approvals/pending',
  draft: '/api/approvals/drafted',
  completed: '/api/approvals/completed',
  reference: '/api/approvals/referenced'
};

/**
 * 결재 목록을 조회하는 API
 * @param {string} status - 목록 상태 (pending, draft, completed, reference)
 * @param {number} page - 페이지 번호 (0-based)
 * @param {number} size - 페이지 당 항목 수
 * @returns {Promise<object>} - 페이징된 결재 문서 데이터
 */
export const getApprovalList = async (status, page = 0, size = 10) => {
  const url = urlMapping[status];
  if (!url) {
    return Promise.reject(new Error('Invalid approval status'));
  }

  try {
    const response = await axiosServices.get(url, {
      params: {
        page, // 0-based page
        size
      }
    });
    // 실제 페이징 데이터가 담긴 response.data.data 반환
    return response.data.data;
  } catch (error) {
    // 에러를 상위로 전파
    console.error(`Failed to fetch approval list for status: ${status}`, error);
    throw error;
  }
};

/**
 * 새 결재 문서를 생성(상신)하는 API
 * @param {FormData} formData - 결재 문서 데이터 (FormData 객체)
 * @returns {Promise<object>} - 생성된 결재 문서 데이터
 */
export const createApproval = async (formData) => {
  try {
    const response = await axiosServices.post('/api/approvals', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to create approval', error);
    throw error;
  }
};

/**
 * 결재 양식 템플릿 목록 조회 API
 * GET /api/approvals/templates
 */

export const getApprovalTemplates = async () => {
  try {
    const response = await axiosServices.get('/api/approvals/templates');
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch approval templates', error);
    throw error;
  }
};

/**
 * 휴가 종류 목록 조회 API
 * GET /api/commoncodes/vacation-types
 */
export const getVacationTypes = async () => {
  const response = await axiosServices.get('/api/commoncodes/vacation-types');
  return response.data.data; // 실제 CommonCode 목록
};

/**
 *  결재 문서 상세 조회 API
 *  GET /api/approvals/${docId}
 */
export const getApprovalDetail = async (docId) => {
  const response = await axiosServices.get(`/api/approvals/${docId}`);
  return response.data.data;
};

/**
 *  결재 처리(승인 , 반려)
 *  /api/approvals/decide
 */
export const decideApproval = async (payload) => {
  const response = await axiosServices.patch('/api/approvals/decide', payload);
  return response.data.data;
};
