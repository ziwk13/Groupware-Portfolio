// 댓글 / 작성 수정 폼 (댓글을 입력하고, 전송, 검증, 수정 모드 처리를 담당하는 폼. 입력 UI + 이벤트 처리)
import { useState } from "react";
import { Box, Button, TextField } from "@mui/material";
import postCommentAPI from "../api/postCommentAPI";

export default function PostCommentForm({ postId, employeeId, onSuccess }) {
  const [content, setContent] = useState("");

  const handleSubmit = async () => {
    if (!content.trim()) return;

    try {
      await postCommentAPI.createComment({
        postId,
        employeeId,
        content
      });

      setContent("");
      onSuccess(); // 부모에게 “추가 완료” 알림
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
      <TextField
        fullWidth
        placeholder="댓글을 입력하세요."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <Button variant="contained" onClick={handleSubmit}>
        등록
      </Button>
    </Box>
  );
}
