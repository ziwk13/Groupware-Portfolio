import { Box, Button, Typography, Stack, TextField } from "@mui/material";
import postCommentAPI from "../api/postCommentAPI";
import { useState } from "react";

// 댓글 작성 일시
const formatDateTime = (datetime) => {
  if (!datetime) return "";
  const date = new Date(datetime);
  return date.toLocaleString("ko-KR", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
};

export default function PostCommentItem({ comment, loginEmployeeId, refresh }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content); // 수정할떄 나오는 창

  // 댓글 수정 함수
  const handleUpdate = async () => {
    try {
      await postCommentAPI.updateComment(comment.commentId, {
        content: editContent
      });
      setIsEditing(false);
      refresh();
    } catch (err) {
      console.error(err);
    }
  }

  // 댓글 삭제 함수
  const handleDelete = async () => {
    try {
      await postCommentAPI.deleteComment(comment.commentId);
      refresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box sx={{ p: 2, borderBottom: "primary" }}>

      {/* 댓글 작성자 + 날짜/시간 우측 정렬 추가 */}
      <Stack direction="row" justifyContent="space-between">
        <Typography sx={{ fontWeight: 600 }}>
          {comment.employeename}
        </Typography>

        {/* 날짜/시간 */}
        <Typography sx={{ fontSize: "0.75rem", color: "gray" }}>
          {formatDateTime(comment.createdAt)}
        </Typography>
      </Stack>

      {/* 내용 or 수정창 */}
      {!isEditing ? (
        <Typography sx={{ mt: 1 }}>{comment.content}</Typography>
      ) : (
        <TextField
          fullWidth
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          sx={{ mt: 1 }}
        />
      )}

      {/* 본인일 때만 버튼 노출 */}
      {comment.employeeId === loginEmployeeId && (
        <Stack direction="row" sx={{ mt: 1 }} spacing={1}>
          {!isEditing ? (
            <>
              <Button size="small" color="primary" onClick={() => setIsEditing(true)}>
                수정
              </Button>
              <Button size="small" color="error" onClick={handleDelete}>
                삭제
              </Button>
            </>
          ) : (
            <>
              <Button size="small" color="primary" onClick={handleUpdate}>
                완료
              </Button>
              <Button size="small" color="secondary" onClick={() => setIsEditing(false)}>
                취소
              </Button>
            </>
          )}
        </Stack>
      )}

    </Box>
  );
}
