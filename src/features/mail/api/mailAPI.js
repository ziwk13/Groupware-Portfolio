import axiosServices from 'api/axios';

// 첨부파일 업로드 함수 (테스트용)
export const uploadAttachments = async (formData) => {
  return axiosServices.post('/api/mails/attachments/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// 메일 작성
export const sendMail = async (mailData) => {
	return axiosServices.post('/api/mails', mailData, {
		headers: { 'Content-Type': 'multipart/form-data' }
	})
}

// 메일 상세 조회
export const detailMail = async (mailId) => {
	return axiosServices.get(`/api/mails/${mailId}`);
}