import './ApprovalStyles.css';
import ApprovalFormHeader from './ApprovalFormHeader';
import RejectCommentBlock from './RejectCommentBlock';

export default function BusinessTripTemplate({
  approvalLines,
  approvalReferences,
  templateValues,
  setTemplateValues,
  readOnly,
  docNo,
  draftUser,
  draftDept,
  draftPosition,
  draftDate
}) {
  const handleChange = (key, value) => {
    if (readOnly) return;
    setTemplateValues((prev) => ({ ...prev, [key]: value }));
  };

  const today = (() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  })();

  const formatDate = (v) => (v ? v.split('T')[0] : '');

  return (
    <div className="approval-wrapper">
      <ApprovalFormHeader
        title="출장계획서"
        draftUser={draftUser}
        draftDept={draftDept}
        draftPosition={draftPosition}
        draftDate={draftDate}
        docNo={docNo}
        approvalLines={approvalLines}
        approvalReferences={approvalReferences}
      />

      <div className="approval-body">
        <table className="form-table" style={{ width: '100%' }}>
          <tbody>
            {/* 출장기간 */}
            <tr>
              <td className="form-th">출장기간</td>

              <td className="form-td">
                {readOnly ? (
                  <input
                    type="text"
                    className="input-date"
                    style={{ width: '100%' }}
                    value={`${formatDate(templateValues.startDate)} ~ ${formatDate(templateValues.endDate)}`}
                    readOnly
                  />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="date"
                      className="input-date"
                      value={formatDate(templateValues.startDate)}
                      min={today}
                      onChange={(e) => handleChange('startDate', e.target.value + 'T00:00:00')}
                    />
                    <span>~</span>
                    <input
                      type="date"
                      className="input-date"
                      value={formatDate(templateValues.endDate)}
                      min={templateValues.startDate ? formatDate(templateValues.startDate) : today}
                      onChange={(e) => handleChange('endDate', e.target.value + 'T00:00:00')}
                    />
                  </div>
                )}
              </td>

              <td className="form-th" style={{ width: '80px' }}>
                출장지
              </td>

              <td className="form-td">
                <input
                  type="text"
                  className="input-select"
                  style={{ width: '100%', height: '32px' }}
                  readOnly={readOnly}
                  value={templateValues.tripLocation || ''}
                  onChange={(e) => handleChange('tripLocation', e.target.value)}
                />
              </td>
            </tr>

            {/* 교통편 */}
            <tr>
              <td className="form-th">교통편</td>
              <td className="form-td" colSpan={3}>
                <input
                  type="text"
                  className="input-select"
                  style={{ width: '100%', height: '32px' }}
                  readOnly={readOnly}
                  value={templateValues.transportation || ''}
                  onChange={(e) => handleChange('transportation', e.target.value)}
                />
              </td>
            </tr>

            {/* 출장목적 */}
            <tr>
              <td className="form-th">출장목적</td>
              <td className="form-td" colSpan={3}>
                <input
                  type="text"
                  className="input-select"
                  style={{ width: '100%', height: '32px' }}
                  readOnly={readOnly}
                  value={templateValues.tripPurpose || ''}
                  onChange={(e) => handleChange('tripPurpose', e.target.value)}
                />
              </td>
            </tr>

            {/* 비고 */}
            <tr>
              <td className="form-th">비고</td>
              <td className="form-td" colSpan={3}>
                <textarea
                  className="textarea-reason"
                  style={{ height: '200px' }}
                  readOnly={readOnly}
                  value={templateValues.tripRemark || ''}
                  onChange={(e) => handleChange('tripRemark', e.target.value)}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      {readOnly && <RejectCommentBlock approvalLines={approvalLines} />}
    </div>
  );
}
