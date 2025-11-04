import axiosServices from '../../../utils/axios';

// 첨부파일 업로드 함수
export const uploadAttachments = async (formData) => {
  return axiosServices.post('/api/mails/attachments/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};