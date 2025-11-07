// EmployeeDetail
// 직원 정보 컴포넌트
import React from "react";
import { ListItem ,ListItemText, ListItemIcon , ListItemButton, List, Grid,Box, Typography, Divider, Avatar } from "@mui/material";
import MainCard from "ui-component/cards/MainCard";

import AccountCircleTwoToneIcon from '@mui/icons-material/AccountCircleTwoTone';
import MailTwoToneIcon from '@mui/icons-material/MailTwoTone';
import CalendarTodayTwoToneIcon from '@mui/icons-material/CalendarTodayTwoTone';
import BusinessTwoToneIcon from '@mui/icons-material/BusinessTwoTone';
import BadgeTwoToneIcon from '@mui/icons-material/BadgeTwoTone';
import PhonelinkRingTwoToneIcon from '@mui/icons-material/PhonelinkRingTwoTone';

function EmployeeDetail({ employee }) {
  if (!employee) {

    return (
      <MainCard title="직원 상세" content={false} 
        sx={{ height: "100%", 
        display: 'flex',flexDirection: 'column',
          border: "1px solid",
                '& .MuiCardHeader-root': {
                  padding: 1.5
                } }}>
        <Box
          sx={{
            p: 3,
            flex:1,
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


  return (
    <MainCard title="직원 상세" content={false} sx={{ height: "100%" ,
                
          border: "1px solid",
                '& .MuiCardHeader-root': {
                  padding: 1.5
                }}}>
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
      

      <Grid size={12}>
        <Grid container direction="column" sx={{ alignItems: 'center' }}>
          <Grid>
            <Avatar alt={employee?.name} src={employee?.profileImg} sx={{ height: 110, width: 110 }} />
          </Grid>
        </Grid>
      </Grid>

      <Grid size={12}>
        <List component="nav" aria-label="user details" sx={{ width: '100%' }}>
          <ListItem>
            <ListItemIcon>
              <AccountCircleTwoToneIcon sx={{ fontSize: '1.3rem' }} />
            </ListItemIcon>
            <ListItemText primary={<Typography sx={{ fontSize: 14 }}>이름</Typography>} />
            <Typography sx={{ fontSize: 14 }} align="right">
              {employee?.name}
            </Typography>
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemIcon>
              <MailTwoToneIcon sx={{ fontSize: '1.3rem' }} />
            </ListItemIcon>
            <ListItemText primary={<Typography sx={{ fontSize: 14 }}>이메일</Typography>} />
            <Typography sx={{ fontSize: 14 }} align="right">
              {employee?.email}
            </Typography>
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemIcon>
              <BusinessTwoToneIcon sx={{ fontSize: '1.3rem' }} />
            </ListItemIcon>
            <ListItemText primary={<Typography sx={{ fontSize: 14 }}>부서</Typography>} />
            <Typography sx={{ fontSize: 14 }} align="right">
              {employee?.department}
            </Typography>
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemIcon>
              <BadgeTwoToneIcon sx={{ fontSize: '1.3rem' }} />
            </ListItemIcon>
            <ListItemText primary={<Typography sx={{ fontSize: 14 }}>직급</Typography>} />
            <Typography sx={{ fontSize: 14 }} align="right">
              {employee?.position}
            </Typography>
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemIcon>
              <PhonelinkRingTwoToneIcon sx={{ fontSize: '1.3rem' }} />
            </ListItemIcon>
            <ListItemText primary={<Typography sx={{ fontSize: 14 }}>연락처</Typography>} />
            <Typography sx={{ fontSize: 14 }} align="right">
              {employee?.phoneNumber}
            </Typography>
          </ListItem>
        </List>
      </Grid>

  
    </Grid>

      </Box>
    </MainCard>
  );
}

export default EmployeeDetail;
