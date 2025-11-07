import { useState } from "react";
import OrganizationModal from "./OrganizationModal";

export default function TestModal() {
  const [open, setOpen] = useState(true);

  // 임시 테스트용 리스트 데이터
  const [list, setList] = useState([
    { name: "수신자", empList: [] },
    { name: "참조자", empList: [] },
    { name: "숨은참조자", empList: [] },
    { name: "결재자", empList: [] }
  ]);

  return (
    <OrganizationModal
      open={open}
      onClose={() => setOpen(false)}
      list={list}
      setList={setList}
    />
  );
}
