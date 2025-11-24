import axiosServices from 'api/axios';

// 업무 코드 조회
export const getWorkLogCodes = () => {
	return axiosServices.get('/api/worklogs/codes');
}

// 업무일지 등록
export const submitWorkLog = (worklogData) => {
	return axiosServices.post('/api/worklogs', worklogData);
}

// 업무일지 리스트 조회
export const getWorkLogList = async (workLogType, page=0, size=10) => {
	const res = await axiosServices.get('/api/worklogs', {
		params: {type:workLogType, page, size}
	});

	return res.data.data;
}

// 업무일지 수정
export const updateWorkLog = (worklogId, worklogData) => {
  return axiosServices.put(`/api/worklogs/${worklogId}`, worklogData);
};

// 업무일지 상세조회
export const detailWorkLog = async (worklogId) => {
	return axiosServices.get(`/api/worklogs/${worklogId}`);
}

// 업무일지 삭제
export const deleteWorkLog = async (workLogIds) => {
	return axiosServices.delete('/api/worklogs', {
		data: workLogIds
	})
}