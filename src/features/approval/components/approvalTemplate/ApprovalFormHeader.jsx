// 안전한 Date 파서 (마이크로초 제거)
function safeParseDate(date) {
  if (!date) return new Date();
  const trimmed = typeof date === 'string' ? date.split('.')[0] : date;
  return new Date(trimmed);
}

function formatKoreanDate(date) {
  const d = safeParseDate(date);
  if (!d) return '';
  const day = d.getDay();
  const week = ['일', '월', '화', '수', '목', '금', '토'];

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const dayNum = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${dayNum}(${week[day]})`;
}

function formatDate(date) {
  if (!date) return '';
  const d = safeParseDate(date);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const dayNum = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${dayNum}`;
}

export default function ApprovalFormHeader({ title, draftUser, draftDept, draftDate, docNo, draftPosition, approvalLines }) {
  const displayDate = formatKoreanDate(draftDate);
  const displayDate2 = formatDate(draftDate);

  const approver = [...approvalLines]
    .reverse()
    .find((line) => ['APPROVED', 'REJECTED', 'IN_PROGRESS', 'AWAITING', 'PENDING'].includes(line.approvalStatus?.value1));

  const dynamicGap = approvalLines.length !== 0 ? '20px' : 0;

  return (
    <>
      <h1 className="approval-title">{title}</h1>

      {/* 전체 헤더 레이아웃 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'stretch',
          justifyContent: 'space-between',
          width: '100%',
          marginBottom: '20px'
        }}
      >
        {/* 왼쪽 기안자 정보 */}
        <table className="info-table" style={{ width: '290px' }}>
          <tbody>
            <tr>
              <td className="th">기안자</td>
              <td className="td">{draftUser ?? '정보 없음'}</td>
            </tr>
            <tr>
              <td className="th">소속</td>
              <td className="td">{draftDept ?? '-'}</td>
            </tr>
            <tr>
              <td className="th">기안일</td>
              <td className="td">{displayDate}</td>
            </tr>
            <tr>
              <td className="th">문서번호</td>
              <td className="td">{docNo}</td>
            </tr>
          </tbody>
        </table>

        {/* 오른쪽 결재선 */}
        <div style={{ display: 'flex', gap: dynamicGap }}>
          {/* 신청 박스 */}
          <div className="sign-column">
            <div className="sign-title-vertical">신청</div>

            {/* position null-safe */}
            <div className="sign-box">{draftPosition ?? '-'}</div>

            {/* user null-safe */}
            <div className="sign-box">{draftUser ?? '정보 없음'}</div>

            <div className="sign-box" style={{ fontSize: '14px' }}>
              {displayDate2}
            </div>
          </div>

          {/* 승인 박스 (N명 대응 구조) */}
          <div style={{ display: 'flex', gap: '10px' }}>
            {approvalLines.map((line, idx) => (
              <div key={idx} className="sign-column">
                <div className="sign-title-vertical">승인</div>

                {/* approver.position null-safe */}
                <div className="sign-box">{line.approver?.position ?? '-'}</div>

                {/* approver.name null-safe */}
                <div className="sign-box">{line.approver?.name ?? '정보 없음'}</div>

                <div className="sign-box" style={{ fontSize: '14px' }}>
                  {line.approvalDate ? formatDate(line.approvalDate) : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
