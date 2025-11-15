import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AddApproval from '../components/AddApproval';
import { getApprovalDetail } from '../api/approvalAPI';

export default function ApprovalDetailPage() {
  const { docId } = useParams();
  const [detailData, setDetailData] = useState(null);

  useEffect(() => {
    async function fetchDetail() {
      const result = await getApprovalDetail(docId);
      setDetailData(result);
    }
    fetchDetail();
  }, [docId]);

  if (!detailData) return <div style={{ padding: 20 }}>Loading...</div>;

  return <AddApproval mode="detail" detailData={detailData} />;
}
