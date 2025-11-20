// RejectCommentBlock.jsx

const APPROVAL_LINE_STATUS = {
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  AWAITING: 'AWAITING',
  PENDING: 'PENDING'
};

export default function RejectCommentBlock({ approvalLines }) {
  if (!approvalLines) return null;

  const rejectedLine = approvalLines.find((line) => line.approvalStatus?.value1 === APPROVAL_LINE_STATUS.REJECTED);

  if (!rejectedLine || !rejectedLine.comment) return null;

  return (
    <div
      style={{
        marginTop: '20px',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        background: '#fafafa'
      }}
    >
      <strong style={{ fontSize: '15px' }}>반려 의견</strong>

      <div
        style={{
          marginTop: '10px',
          marginBottom: '8px',
          fontWeight: 600,
          fontSize: '14px'
        }}
      >
        {rejectedLine.approver?.name}{' '}
        {rejectedLine.approver?.position && <span style={{ color: '#666' }}>{rejectedLine.approver.position}</span>}
      </div>

      <div style={{ fontSize: '14px', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{rejectedLine.comment}</div>
    </div>
  );
}
