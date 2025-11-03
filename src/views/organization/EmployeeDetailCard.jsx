import React from "react";
import { Box, Typography, Divider, Avatar } from "@mui/material";
import MainCard from "ui-component/cards/MainCard";

function EmployeeDetailCard({ selectedEmployee }) {
  if (!selectedEmployee) {
    return (
      <MainCard title="직원 상세" content={false} sx={{ height: "100%" }}>
        <Box
          sx={{
            p: 3,
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "text.secondary",
          }}
        >
          직원을 선택하세요.
        </Box>
      </MainCard>
    );
  }

  const {
    employeeName,
    positionName,
    departmentName,
    email,
    phoneNumber,
    hireDate,
    profileUrl
  } = selectedEmployee;

  return (
    <MainCard title="직원 상세" content={false} sx={{ height: "100%" }}>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Avatar
            alt={employeeName}
            src={profileUrl || ""}
            sx={{ width: 64, height: 64, mr: 2 }}
          />
          <Box>
            <Typography variant="h6">{employeeName}</Typography>
            <Typography variant="subtitle2" color="text.secondary">
              {positionName} / {departmentName}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Typography variant="body2">
          <strong>이메일:</strong> {email}
        </Typography>
        <Typography variant="body2">
          <strong>전화번호:</strong> {phoneNumber}
        </Typography>
        <Typography variant="body2">
          <strong>입사일:</strong> {hireDate}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="caption" color="text.secondary">
          소속 부서
        </Typography>
        <Typography variant="body2">{departmentName}</Typography>
      </Box>
    </MainCard>
  );
}

// ✅ 이거 없으면 import 오류 발생
export default EmployeeDetailCard;
