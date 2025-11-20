// TemplateRenderer.jsx
import LeaveTemplate from 'features/approval/components/approvalTemplate/LeaveTemplate';
import BusinessTripTemplate from 'features/approval/components/approvalTemplate/BusinessTripTemplate';
import useAuth from 'hooks/useAuth';
import 'features/approval/components/approvalTemplate/ApprovalStyles.css';

const templateMap = {
  LeaveTemplate,
  BusinessTripTemplate
};

export default function TemplateRenderer({
  template,
  approvalLines,
  approvalReferences,
  templateValues,
  setTemplateValues,
  readOnly = false,
  docNo,
  draftUser,
  draftDept,
  draftPosition,
  draftDate,
  initialData
}) {
  if (!template) return null;

  const Component = templateMap[template.value3];
  if (!Component) return <div>지원되지 않는 템플릿입니다.</div>;

  const { user } = useAuth();

  const finalDraftUser = draftUser || user?.name;
  const finalDraftDept = draftDept || user?.department;
  const finalDraftPosition = draftPosition || user?.position;
  const finalDraftDate = draftDate || '';

  return (
    <Component
      approvalLines={approvalLines}
      approvalReferences={approvalReferences}
      templateValues={templateValues || {}}
      setTemplateValues={setTemplateValues}
      readOnly={readOnly}
      docNo={docNo}
      draftUser={finalDraftUser}
      draftDept={finalDraftDept}
      draftPosition={finalDraftPosition}
      draftDate={finalDraftDate}
      initialData={initialData}
    />
  );
}
