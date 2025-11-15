import LeaveTemplate from 'features/approval/components/approvalTemplate/LeaveTemplate';
import BusinessTripTemplate from 'features/approval/components/approvalTemplate/BusinessTripTemplate';

const templateMap = {
  AT1: LeaveTemplate,
  AT2: BusinessTripTemplate
};

export default function TemplateRenderer({
  template,
  approvalLines,
  approvalReferences,
  templateValues,
  setTemplateValues,
  readOnly = false,
  docNo
}) {
  if (!template) return null;

  const Component = templateMap[template.code];

  if (!Component) return <div>지원되지 않는 템플릿입니다.</div>;

  return (
    <Component
      approvalLines={approvalLines}
      approvalReferences={approvalReferences}
      templateValues={templateValues || {}}
      setTemplateValues={setTemplateValues}
      readOnly={readOnly}
      docNo={docNo}
    />
  );
}
