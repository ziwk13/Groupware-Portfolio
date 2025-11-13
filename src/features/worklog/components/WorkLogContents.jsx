import React from 'react';
import { useEffect, useState } from 'react';
import {useNavigate} from 'react-router-dom';

// material-ui
import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Checkbox, Typography} from '@mui/material';
import {IconMail, IconMailOpened } from '@tabler/icons-react';
import axiosServices from 'api/axios';

export default function WorkLogComtents({worklogType}) {
  const [worklogs, setWorklogs] = useState([]);

  const navigate = useNavigate();

  const handleOpenWorklogDetail =(workLogId) => {
    navigate(`/worklog/detail/${workLogId}`);  
  }

  useEffect(() => {
    axiosServices
      .get('/api/worklogs', { params: { type: worklogType } })
      .then((res) => {
      console.log(res.data.data.content);
      setWorklogs(res.data.data.content);
    })
      .catch(console.error);
  }, [worklogType]);


  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{width:"60px"}}><Checkbox color="primary" /></TableCell>
            <TableCell sx={{width:"120px"}}>작성자</TableCell>
            <TableCell>제목</TableCell>
            <TableCell sx={{width:"200px"}}>업무날짜</TableCell>
            <TableCell sx={{width:"120px"}}>업무</TableCell>
            <TableCell sx={{width:"120px"}}>세부업무</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {worklogs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center">
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                  업무일지가 없습니다.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            worklogs.map((worklog) => (
              <TableRow key={worklog.workLogId} hover onClick={() => handleOpenWorklogDetail(worklog.workLogId)}>
                <TableCell onClick={e => e.stopPropagation()}><Checkbox color="primary" /></TableCell>
                <TableCell>{worklog.employeeName}</TableCell>
                <TableCell>{worklog.title}</TableCell>
                <TableCell>
                  {new Date(worklog.workDate).toLocaleString('ko-KR', {
                    year: '2-digit',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                  })}
                </TableCell>
                <TableCell>{worklog.workTypeName}</TableCell>
                <TableCell>{worklog.workOptionName}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
