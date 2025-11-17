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

// 메일 재작성
export const rewriteMail = async (mailId, formData) => {
  return axiosServices.put(`/api/mails/${mailId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

// 메일 리스트 조회
export const getMailList = async (mailboxType, page=0, size=10) => {
  const res = await axiosServices.get('/api/mails', {
    params: { type: mailboxType, page, size }
  });

  return res.data.data;
};

// 메일 상세 조회
export const detailMail = async (mailId) => {
	return axiosServices.get(`/api/mails/${mailId}`, {
    params: {isRead : true}
  });
}

// 메일함 이동
export const moveMail = async (mailIds, targetType) => {
  return axiosServices.post('/api/mails/move', {mailIds, targetType});
};

// 메일 삭제(소프트삭제)
export const deleteMail = async (mailIds, targetType) => {
  return axiosServices.delete('/api/mails/delete', {
    data : {mailIds, targetType}
  });
}