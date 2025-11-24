import axiosServices from "api/axios";

// 백엔드 기본 URL 설정
const API = axiosServices.create({
  baseURL: "/api",
  withCredentials: true
});

const postCommentAPI = {
  // 댓글 등록
  createComment: (data) => {
    return API.post("/comments", data);
  },

  // 댓글 수정
  updateComment: (commentId, data) => {
    return API.put(`/comments/${commentId}`, data);
  },

  // 댓글 삭제
  deleteComment: (commentId) => {
    return API.delete(`/comments/${commentId}`);
  },

  // 게시글의 댓글 조회
  getCommentsByPostId: (postId, params) => {
    return API.get(`/comments/posts/${postId}`, { params });
  }
};

export default postCommentAPI;