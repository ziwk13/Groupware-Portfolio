// 조직도 모달
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Button,
  Divider,
  Box,
} from "@mui/material";
import { useState } from "react";
import { gridSpacing } from "store/constant";
import MainCard from "ui-component/cards/MainCard";
import OrganizationTree from "./OrganizationTree";
import EmployeeList from "./EmployeeList";
import EmployeeDetail from "./EmployeeDetailBase";

export default function OrganizationModal({ open, onClose }) {
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      disableScrollLock
      // 둥근 모서리 고정 + 외곽 높이 고정 + 외곽 스크롤 금지
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: "16px !important",
          height: "85vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        },
      }}
      PaperProps={{
        sx: {
          minWidth: "60vw",
          // width: "60vw",
          maxWidth: "60vw",
          height: "85vh", // 원래 유지하던 값 그대로
          // background: "transparent",
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
        }}
      >
        조직도
      </DialogTitle>

      <Divider sx={{ mb: 2 }} />

      <DialogContent
        sx={{
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Grid
          container
          spacing={gridSpacing}
          justifyContent="center"
          wrap="nowrap"
          sx={{
            flex: 1,
            flexWrap: "nowrap",
            alignItems: "stretch",
            overflow: "hidden", // ✅ 그리드 레벨에서도 외부 스크롤 차단
            minHeight: "400px", // ✅ 진성 요청대로 최소 높이 유지
          }}
        >
          {/* 부서 */}
          <Grid
            size={{ xs: 12, md: 4 }}
            sx={{
              height: "100%",
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden", // ✅ 컬럼 외부 스크롤 차단
            }}
          >
            <MainCard
              title="부서"
              content={false}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                border: "1px solid",
                '& .MuiCardHeader-root': {
                  padding: 1.5
                }
              }}
            >
              {/* ✅ 이 박스 안에서만 스크롤 */}
              <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
                <OrganizationTree setSelectedDept={setSelectedDept} />
              </Box>
            </MainCard>
          </Grid>

          {/* 직원 목록 */}
          <Grid
            size={{ xs: 12, md: 4 }}
            sx={{
              height: "100%",
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden"
            }}
          >
            {/* 가운데 컬럼도 독립 스크롤 */}
            <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
              <EmployeeList
                selectedDept={selectedDept}
                setSelectedEmployee={setSelectedEmployee}
              />
            </Box>
          </Grid>

          {/* 직원 상세 */}
          <Grid
            size={{ xs: 12, md: 4 }}
            sx={{
              height: "100%",
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden"
            }}
          >
            {/* 오른쪽 컬럼도 독립 스크롤 */}
            <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
              {/* {list.length == nul} */}
              <EmployeeDetail employee={selectedEmployee} />
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          닫기
        </Button>
      </DialogActions>
    </Dialog>
  );
}
