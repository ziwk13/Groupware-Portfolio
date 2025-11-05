// src/views/organization/OrganizationPage.jsx
// 조직도 페이지 컴포넌트 테스트


import Button from "@mui/material/Button";
import { useState } from "react";
import OrganizationModal from "../components/OrganizationModal";

// OrganizationPage 컴포넌트
export default function OrganizationPage() {
  // 페이지 내 상태 관리
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // 모달용 상태관리
  const [open, setOpen] = useState(false);
  const [chosenEmployee, setChosenEmployee] = useState(null);  // 선택된 직원

  return (
    <>
  

      {/* 모달 테스트용 버튼 */}
      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 3 }}
        onClick={() => setOpen(true)}
      >
        조직도 열기
      </Button>

      <OrganizationModal
        open={open}
        onClose={() => setOpen(false)}
        onSelectEmployee={(emp) => setChosenEmployee(emp)}
      />

    </>
  );
}
