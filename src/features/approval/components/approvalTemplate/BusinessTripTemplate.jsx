// BusinessTripTemplate.jsx
import './ApprovalStyles.css';
import ApprovalFormHeader from './ApprovalFormHeader';
import useAuth from 'hooks/useAuth';

export default function BusinessTripTemplate({ approvalLines, approvalReferences, templateValues, setTemplateValues, readOnly, docNo }) {
  const { user } = useAuth();

  const handleChange = (key, value) => {
    if (readOnly) return;
    setTemplateValues((prev) => ({ ...prev, [key]: value }));
  };

  const formatDate = (v) => (v ? v.split('T')[0] : '');

  return (
    <div style={{ width: '95%', maxWidth: '1050px', margin: '0 auto' }}>
      <ApprovalFormHeader
        title="출장신청서"
        draftUser={user?.name}
        draftDept={user?.department}
        draftDate={new Date()}
        docNo={docNo}
        draftPosition={user?.position}
        approvalLines={approvalLines}
        approvalReferences={approvalReferences}
      />

      <h2 style={{ marginTop: '40px', marginBottom: '15px', fontSize: '22px' }}>출장내용</h2>

      <table className="form-table" style={{ width: '100%' }}>
        <tbody>
          {/* 출장기간 */}
          <tr>
            <td className="form-th">출장기간</td>
            <td className="form-td">
              {readOnly ? (
                <span>
                  {formatDate(templateValues.startDate)} ~ {formatDate(templateValues.endDate)}
                </span>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="date"
                    className="input-date"
                    value={formatDate(templateValues.startDate)}
                    onChange={(e) => handleChange('startDate', e.target.value + 'T00:00:00')}
                  />
                  <span>~</span>
                  <input
                    type="date"
                    className="input-date"
                    value={formatDate(templateValues.endDate)}
                    onChange={(e) => handleChange('endDate', e.target.value + 'T00:00:00')}
                  />
                </div>
              )}
            </td>

            <td className="form-th" style={{ width: '80px' }}>
              출장지
            </td>
            <td className="form-td">
              {readOnly ? (
                <span>{templateValues.tripLocation}</span>
              ) : (
                <input
                  type="text"
                  className="input-select"
                  style={{ width: '100%', height: '32px' }}
                  value={templateValues.tripLocation || ''}
                  onChange={(e) => handleChange('tripLocation', e.target.value)}
                />
              )}
            </td>
          </tr>

          {/* 교통편 */}
          <tr>
            <td className="form-th">교통편</td>
            <td className="form-td" colSpan={3}>
              {readOnly ? (
                <span>{templateValues.transportation}</span>
              ) : (
                <input
                  type="text"
                  className="input-select"
                  style={{ width: '100%', height: '32px' }}
                  value={templateValues.transportation || ''}
                  onChange={(e) => handleChange('transportation', e.target.value)}
                />
              )}
            </td>
          </tr>

          {/* 목적 */}
          <tr>
            <td className="form-th">출장목적</td>
            <td className="form-td" colSpan={3}>
              {readOnly ? (
                <span>{templateValues.tripPurpose}</span>
              ) : (
                <input
                  type="text"
                  className="input-select"
                  style={{ width: '100%', height: '32px' }}
                  value={templateValues.tripPurpose || ''}
                  onChange={(e) => handleChange('tripPurpose', e.target.value)}
                />
              )}
            </td>
          </tr>

          {/* 비고 */}
          <tr>
            <td className="form-th">비고</td>
            <td className="form-td" colSpan={3}>
              {readOnly ? (
                <span>{templateValues.tripRemark}</span>
              ) : (
                <textarea
                  className="textarea-reason"
                  style={{ height: '200px' }}
                  value={templateValues.tripRemark || ''}
                  onChange={(e) => handleChange('tripRemark', e.target.value)}
                />
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
