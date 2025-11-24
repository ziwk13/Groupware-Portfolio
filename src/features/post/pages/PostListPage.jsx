import PostList from '../components/PostList';

import { useParams } from 'react-router';

export default function PostListPage() {
  
  const { category } = useParams();
  return <PostList category={category} />;
}