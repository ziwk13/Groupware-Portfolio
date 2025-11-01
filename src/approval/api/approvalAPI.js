import axiosServices from '../../utils/axios';

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