// src/features/post/api/postAPI.js
import axiosServices from "api/axios";

const API = axiosServices.create({
    baseURL: "/api/posts",
    withCredentials: true
});

// 1. 게시글 검색
export const searchPost = async (commonCodeCode, pageable) => {
    const { page = 0, size = 10, sort = "createdAt,desc", keyword = "" } = pageable || {};

    const response = await API.get(`/search/${commonCodeCode}`, {
        params: { page, size, sort, keyword }
    });

    return response.data.data;
};

// 2. 게시글 상세
export const detailPost = async (postId) => {
    const response = await API.get(`/${postId}`);
    return response.data.data;
};

// 3. 게시글 생성
export const createPost = async (commonCodeCode, formData) => {
    const response = await API.post(`/${commonCodeCode}`, formData);
    return response.data.data;
};


// 4. 게시글 수정
export const updatePost = async (postId, formData) => {
    const response = await API.put(`/${postId}`, formData);
    return response.data.data;
};


// 5. 게시글 삭제
export const deletePost = async (postId) => {
    const response = await API.delete(`/${postId}`);
    return response.data.message;
};

// 6. 첨부파일 다운로드
export const downloadFile = async (fileId) => {
    const response = await axiosServices.get(`/api/files/download/${fileId}`, {
        responseType: "blob",
        withCredentials: true
    });
    return response;
};

const postAPI = {
    searchPost,
    createPost,
    updatePost,
    deletePost,
    detailPost,
    downloadFile
};

export default postAPI;
