// 댓글 리스트 (부모에서 내려준 comments만 렌더링)
import PostCommentItem from "./PostCommentItem";

export default function PostCommentList({ comments, loginEmployeeId, refresh }) {
  return (
    <>
      {comments?.map((c) => (
        <PostCommentItem
          key={c.commentId}
          comment={c}
          loginEmployeeId={loginEmployeeId}
          refresh={refresh}
        />
      ))}
    </>
  );
}
