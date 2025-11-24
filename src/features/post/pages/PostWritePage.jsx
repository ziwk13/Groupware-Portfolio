import { useParams } from 'react-router-dom';
import PostWriteForm from '../components/PostWriteForm';

export default function PostWritePage() {
  const { category } = useParams();
  return <PostWriteForm category={category} />;
}
