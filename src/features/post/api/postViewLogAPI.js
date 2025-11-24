import axiosServices from "api/axios";

const API = axiosServices.create({
    baseURL: "/api",
    withCredentials: true
});

const postViewLogAPI = {
    // 조회수 증가 (상세페이지 들어갈 떄 호출)
    increaseView: (postId) => {
        return API.post("/post/views", { postId });
    },

    // 조화수 가져오기 (조회수 표시할 떄 호출)
    getViewCount: (postId) => {
        return API.get(`/post/views/${postId}`);
    }
};

export default postViewLogAPI;