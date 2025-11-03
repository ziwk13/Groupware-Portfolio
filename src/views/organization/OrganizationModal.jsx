// 조직도 모달 (Berry WidgetData 스타일)
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Button,
  Divider
} from "@mui/material";
import { useState } from "react";
import { gridSpacing } from "store/constant";
import MainCard from "ui-component/cards/MainCard";
import OrganizationTree from "./OrganizationTree";
import EmployeeList from "./EmployeeList";
import EmployeeDetailCard from "./EmployeeDetailCard";

export default function OrganizationModal({ open, onClose }) {
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={false}
      disableScrollLock
      PaperProps={{
        sx: {
          width: "100vw",
          height: "90vh",
          background: "transparent",
          boxShadow: "none",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <DialogTitle
        sx={{
          textAlign: "center",
          fontWeight: 700,
          fontSize: "1.4rem",
          color: "#fff",
        }}
      >
        조직도
      </DialogTitle>
      <Divider sx={{ borderColor: "rgba(255,255,255,0.15)", mb: 2 }} />

      <DialogContent sx={{ flex: 1, overflow: "hidden" }}>
        {/* === Berry의 Data/index.jsx 구조와 동일 === */}
        <Grid container spacing={gridSpacing}>
          <Grid size={{ xs: 12, lg: 4, md: 6 }}>
            <MainCard title="부서" content={false}>
              <OrganizationTree setSelectedDept={setSelectedDept} />
            </MainCard>
          </Grid>

          <Grid size={{ xs: 12, lg: 4, md: 6 }}>
            <MainCard title="직원 목록" content={false}>
              <EmployeeList
                selectedDept={selectedDept}
                setSelectedEmployee={setSelectedEmployee}
              />
            </MainCard>
          </Grid>

          <Grid size={{ xs: 12, lg: 4, md: 12 }}>
            <EmployeeDetailCard selectedEmployee={selectedEmployee} />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          color="inherit"
          sx={{
            borderColor: "rgba(255,255,255,0.3)",
            color: "#fff",
            px: 4,
            py: 1,
          }}
        >
          닫기
        </Button>
      </DialogActions>
    </Dialog>
  );
}
