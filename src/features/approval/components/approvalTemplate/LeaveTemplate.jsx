import 'features/approval/components/approvalTemplate/ApprovalStyles.css';
import ApprovalFormHeader from './ApprovalFormHeader';
import useAuth from 'hooks/useAuth';
import { useEffect, useState } from 'react';
import { getVacationTypes } from '../../api/approvalAPI';
import RejectCommentBlock from './RejectCommentBlock';

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
  draftDate,
  initialData
}) {
  const { user } = useAuth();
  const [vacationTypes, setVacationTypes] = useState([]);

  const today = (() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  })();

  useEffect(() => {
    getVacationTypes().then(setVacationTypes).catch(console.error);
  }, []);

  // 초기값 적용
  useEffect(() => {
    if (!initialData) return;

    if (initialData.vacationType?.commonCodeId) {
      setTemplateValues((prev) => ({
        ...prev,
        vacationTypeCode: initialData.vacationType.commonCodeId
      }));
    }
  }, [initialData, setTemplateValues]);

  const handleChange = (key, value) => {
    if (readOnly) return;
    setTemplateValues((prev) => ({ ...prev, [key]: value }));
  };

  const formatDate = (v) => (v ? v.split('T')[0] : '');

  useEffect(() => {
    if (!templateValues.startDate || !templateValues.endDate) return;

    const start = new Date(templateValues.startDate);
    const end = new Date(templateValues.endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return;

    const diffMs = end - start;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;

    setTemplateValues((prev) => ({
      ...prev,
      vacationDays: diffDays
    }));
  }, [templateValues.startDate, templateValues.endDate]);

  return (
    <div className="approval-wrapper">
      <ApprovalFormHeader
        title="휴가신청서"
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
                  min={today}
                  onChange={(e) => handleChange('startDate', e.target.value + 'T00:00:00')}
                  disabled={readOnly}
                />
                ~
                <input
                  type="date"
                  className="input-date"
                  min={templateValues.startDate ? formatDate(templateValues.startDate) : today}
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
      {readOnly && <RejectCommentBlock approvalLines={approvalLines} />}
    </div>
  );
}
