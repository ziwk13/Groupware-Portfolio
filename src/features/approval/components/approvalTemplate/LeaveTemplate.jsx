import 'features/approval/components/approvalTemplate/ApprovalStyles.css';
import ApprovalFormHeader from './ApprovalFormHeader';
import useAuth from 'hooks/useAuth';
import { useEffect, useState } from 'react';
import { getVacationTypes } from '../../api/approvalAPI';

export default function LeaveTemplate({ approvalLines, approvalReferences, templateValues, setTemplateValues, readOnly, docNo }) {
  const { user } = useAuth();
  const [vacationTypes, setVacationTypes] = useState([]);

  useEffect(() => {
    getVacationTypes().then(setVacationTypes).catch(console.error);
  }, []);

  const handleChange = (key, value) => {
    if (readOnly) return;
    setTemplateValues((prev) => ({ ...prev, [key]: value }));
  };

  // 날짜만 추출
  const formatDate = (v) => (v ? v.split('T')[0] : '');

  useEffect(() => {
    if (!templateValues.startDate || !templateValues.endDate) return;

    const start = new Date(templateValues.startDate);
    const end = new Date(templateValues.endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) return;
    if (end < start) return;

    // 차이 계산 (밀리초 기준)
    const diffMs = end - start;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1; // 양끝 포함

    setTemplateValues((prev) => ({
      ...prev,
      vacationDays: diffDays
    }));
  }, [templateValues.startDate, templateValues.endDate]);

  return (
    <div style={{ width: '95%', maxWidth: '1050px', margin: '0 auto' }}>
      <ApprovalFormHeader
        title="휴가신청서"
        draftUser={user?.name}
        draftDept={user?.department}
        draftDate={new Date()}
        docNo={docNo}
        draftPosition={user?.position}
        approvalLines={approvalLines}
        approvalReferences={approvalReferences}
      />

      <table className="form-table" style={{ width: '100%' }}>
        <tbody>
          <tr>
            <td className="form-th">휴가 종류</td>
            <td className="form-td">
              <select
                className="input-select"
                style={{ width: '280px' }}
                value={templateValues.vacationTypeCode || ''}
                onChange={(e) => handleChange('vacationTypeCode', e.target.value)}
                disabled={readOnly}
              >
                <option value="">선택</option>
                {vacationTypes.map((type) => (
                  <option key={type.commonCodeId} value={type.commonCodeId}>
                    {type.value2}
                  </option>
                ))}
              </select>
            </td>
          </tr>

          <tr>
            <td className="form-th">휴가 기간</td>
            <td className="form-td">
              <input
                type="date"
                className="input-date"
                value={formatDate(templateValues.startDate)}
                onChange={(e) => handleChange('startDate', e.target.value + 'T00:00:00')}
                disabled={readOnly}
              />
              ~
              <input
                type="date"
                className="input-date"
                value={formatDate(templateValues.endDate)}
                onChange={(e) => handleChange('endDate', e.target.value + 'T00:00:00')}
                disabled={readOnly}
              />
              <span style={{ marginLeft: '12px' }}>사용일수 : </span>
              <input type="text" className="input-days" value={templateValues.vacationDays || ''} readOnly />일
            </td>
          </tr>

          <tr>
            <td className="form-th">휴가 사유</td>
            <td className="form-td">
              <textarea
                className="textarea-reason"
                style={{ height: '180px' }}
                value={templateValues.vacationReason || ''}
                onChange={(e) => handleChange('vacationReason', e.target.value)}
                readOnly={readOnly}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
