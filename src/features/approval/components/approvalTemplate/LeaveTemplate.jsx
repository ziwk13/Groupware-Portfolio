import 'features/approval/components/approvalTemplate/ApprovalStyles.css';
import ApprovalFormHeader from './ApprovalFormHeader';
import { useEffect, useState } from 'react';
import { getVacationTypes } from '../../api/approvalAPI';

export default function LeaveTemplate({
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
  const [vacationTypes, setVacationTypes] = useState([]);

  useEffect(() => {
    getVacationTypes().then(setVacationTypes).catch(console.error);
  }, []);

  const handleChange = (key, value) => {
    if (readOnly) return;
    setTemplateValues((prev) => ({ ...prev, [key]: value }));
  };

  const formatDate = (v) => (v ? v.split('T')[0] : '');

  // 사용일수 자동계산
  useEffect(() => {
    if (!templateValues.startDate || !templateValues.endDate) return;

    const start = new Date(templateValues.startDate);
    const end = new Date(templateValues.endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) return;
    if (end < start) return;

    const diffMs = end - start;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;

    setTemplateValues((prev) => ({
      ...prev,
      vacationDays: diffDays
    }));
  }, [templateValues.startDate, templateValues.endDate]);

  // 휴가 종류 라벨 찾기
  const vacationTypeLabel = vacationTypes.find((v) => v.commonCodeId === templateValues.vacationTypeCode)?.value2 || '';

  return (
    <div style={{ width: '95%', maxWidth: '1050px', margin: '0 auto' }}>
      <ApprovalFormHeader
        title="휴가신청서"
        draftUser={draftUser}
        draftDept={draftDept}
        draftPosition={draftPosition}
        draftDate={draftDate}
        approvalLines={approvalLines}
        approvalReferences={approvalReferences}
        docNo={docNo}
      />

      <table className="form-table" style={{ width: '100%' }}>
        <tbody>
          {/* 휴가 종류 */}
          <tr>
            <td className="form-th">휴가 종류</td>
            <td className="form-td">
              {readOnly ? (
                <span>{vacationTypeLabel}</span>
              ) : (
                <select
                  className="input-select"
                  style={{ width: '280px' }}
                  value={templateValues.vacationTypeCode || ''}
                  onChange={(e) => handleChange('vacationTypeCode', e.target.value)}
                >
                  <option value="">선택</option>
                  {vacationTypes.map((type) => (
                    <option key={type.commonCodeId} value={type.commonCodeId}>
                      {type.value2}
                    </option>
                  ))}
                </select>
              )}
            </td>
          </tr>

          {/* 휴가 기간 */}
          <tr>
            <td className="form-th">휴가 기간</td>
            <td className="form-td">
              {readOnly ? (
                <span>
                  {formatDate(templateValues.startDate)} ~ {formatDate(templateValues.endDate)}
                  <span style={{ marginLeft: '12px' }}>사용일수 : {templateValues.vacationDays || ''}일</span>
                </span>
              ) : (
                <>
                  <input
                    type="date"
                    className="input-date"
                    value={formatDate(templateValues.startDate)}
                    onChange={(e) => handleChange('startDate', e.target.value + 'T00:00:00')}
                  />
                  ~
                  <input
                    type="date"
                    className="input-date"
                    value={formatDate(templateValues.endDate)}
                    onChange={(e) => handleChange('endDate', e.target.value + 'T00:00:00')}
                  />
                  <span style={{ marginLeft: '12px' }}>
                    사용일수 :
                    <input type="text" className="input-days" value={templateValues.vacationDays || ''} readOnly />일
                  </span>
                </>
              )}
            </td>
          </tr>

          {/* 휴가 사유 */}
          <tr>
            <td className="form-th">휴가 사유</td>
            <td className="form-td">
              {readOnly ? (
                <div style={{ minHeight: '180px', whiteSpace: 'pre-wrap' }}>{templateValues.vacationReason || ''}</div>
              ) : (
                <textarea
                  className="textarea-reason"
                  style={{ height: '180px' }}
                  value={templateValues.vacationReason || ''}
                  onChange={(e) => handleChange('vacationReason', e.target.value)}
                />
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
