import React from 'react';
import 'features/approval/components/approvalTemplate/ApprovalStyles.css';

// 날짜
function formatKoreanDate(date) {
  const d = new Date(date);
  const day = d.getDay();
  const week = ['일', '월', '화', '수', '목', '금', '토'];

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const dayNum = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${dayNum}(${week[day]})`;
}
// 날짜2
function formatDate(date) {
  const d = new Date(date);
  const day = d.getDay();

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const dayNum = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${dayNum}`;
}

export default function ApprovalFormHeader({ title, draftUser, draftDept, draftDate, docNo, draftPosition, approvalLines }) {
  const safeDate = draftDate ? draftDate : new Date();
  const displayDate = formatKoreanDate(safeDate);
  const displayDate2 = formatDate(safeDate);

  let approver = null;

  if (approvalLines && approvalLines.length > 0) {
    approver = approvalLines.find((line) => line.approvalStatus?.value1 === 'AWAITING');
  }
  return (
    <>
      {/* 제목 */}
      <h1 className="approval-title">{title}</h1>

      {/* 헤더 전체 레이아웃 */}
      <div
        style={{
          display: 'flex',
          gap: approver ? '240px' : '350px',
          justifyContent: 'center',
          marginBottom: '20px'
        }}
      >
        {/* 왼쪽 기안자 정보 */}
        <table className="info-table" style={{ width: '400px' }}>
          <tbody>
            <tr>
              <td className="th">기안자</td>
              <td className="td">{draftUser}</td>
            </tr>
            <tr>
              <td className="th">소속</td>
              <td className="td">{draftDept}</td>
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
        <div style={{ display: 'flex', gap: '20px' }}>
          <table className="sign-table-split">
            <tbody>
              <tr>
                <td className="sign-th-vertical" rowSpan={3}>
                  신청
                </td>
                <td className="sign-rank-horizontal">{draftPosition}</td>
              </tr>
              <tr>
                <td className="sign-name-horizontal">{draftUser}</td>
              </tr>
              <tr>
                <td className="sign-blank-horizontal" style={{ fontSize: '14px' }}>
                  {approver ? displayDate2 : ''}
                </td>
              </tr>
            </tbody>
          </table>

          {approver && (
            <table className="sign-table-split">
              <tbody>
                <tr>
                  <td className="sign-th-vertical" rowSpan={3}>
                    승인
                  </td>
                  <td className="sign-rank-horizontal">{approver.approver.position}</td>
                </tr>
                <tr>
                  <td className="sign-name-horizontal">{approver.approver.name}</td>
                </tr>
                <tr>
                  <td className="sign-blank-horizontal"></td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
