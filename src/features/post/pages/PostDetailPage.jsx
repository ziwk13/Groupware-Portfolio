import { useParams } from "react-router-dom";
import PostDetail from "../components/PostDetail";

export default function PostDetailPage() {
  const { postId } = useParams();
  return (
    <PostDetail postId={postId} />
  );
}
