// src/views/organization/OrganizationPage.jsx
// 조직도 페이지 컴포넌트
// - 전체 페이지형 레이아웃으로 구성된 조직도 화면
// - 모달과 달리,  항상 화면에 고정된 형태
// - 좌측 : 부서 / 가운데 : 직원 목록 / 우측 : 직원 정보

import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import EmployeeDetail from "./EmployeeDetail";
import EmployeeList from "./EmployeeList";
import OrganizationModal from "./OrganizationModal";
import OrganizationTree from "./OrganizationTree";

// OrganizationPage 컴포넌트
export default function OrganizationPage() {
  // 페이지 내 상태 관리
  const [ selectedDept, setSelectedDept ] = useState(null);
  const [ selectedEmployee, setSelectedEmployee ] = useState(null);

  // 모달용 상태관리
  const [ open, setOpen ] = useState(false);
  const [ chosenEmployee, setChosenEmployee ] = useState(null);  // 선택된 직원

  return (
    <>
    <Grid container spacing={2}>
      {/* 좌측 : 부서 */}
      <Grid item xs={4}>
        <OrganizationTree setSelectedDept={setSelectedDept} />
      </Grid>

      {/* 가운데 : 직원 목록 */}
      <Grid item xs={4}>
        <EmployeeList
          selectedDept={selectedDept}
          setSelectedEmployee={setSelectedEmployee}
        />
      </Grid>
      {/* 우측 : 직원 정보 */}
      <Grid item xs={4}>
        <EmployeeDetail selectedEmployee={selectedEmployee} />
      </Grid>
    </Grid>

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

        {chosenEmployee && (
          <Typography variant="body1" sx={{ mt: 2 }}>
            선택된 직원 : {chosenEmployee.name} ({chosenEmployee.deptName})
          </Typography>
        )}
    </>
  );
}
