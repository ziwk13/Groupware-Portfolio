// material-ui

// project imports
import ApprovalList from '../components/ApprovalList';
import { useParams } from 'react-router';

export default function ApprovalListPage() {
  const { status } = useParams();
  return (
    <ApprovalList status={status}/>
  );
}
