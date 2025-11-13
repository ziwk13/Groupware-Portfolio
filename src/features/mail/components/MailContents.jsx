import React from 'react';
import { useEffect, useState } from 'react';

// material-ui
import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Checkbox, Typography} from '@mui/material';
import {IconMail, IconMailOpened } from '@tabler/icons-react';
import axiosServices from 'api/axios';

export default function MailContents({mailboxType}) {
  const [mails, setMails] = useState([]);

  useEffect(() => {
    axiosServices
      .get('/api/mails', { params: { type: mailboxType } })
      .then((res) => {
      console.log(res.data.data.content);
      setMails(res.data.data.content);
    })
      .catch(console.error);
  }, [mailboxType]);
  
  // useEffect(() => {
  //   setMails([
  //     { mailId: 1, senderName: '테스트 사용자', title: '테스트 메일', sendAt: '2025-11-06', isRead: false },
  //     { mailId: 2, senderName: '홍길동', title: '업무 일정 공유드립니다', sendAt: '2025-11-05', isRead: true }
  //   ]);
  // }, []);


  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><Checkbox color="primary" /></TableCell>
            <TableCell><IconMail size={22} stroke={1.5}/></TableCell>
            <TableCell>보낸 사람</TableCell>
            <TableCell>제목</TableCell>
            <TableCell>받은날짜</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {mails.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center">
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                  메일이 없습니다.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            mails.map((mail) => (
              <TableRow key={mail.mailId} hover>
                <TableCell><Checkbox color="primary" /></TableCell>
                <TableCell align="center">
                  {mail.isRead ? (
                    <IconMailOpened size={22} stroke={1.5} color="#1976d2" />
                  ) : (
                    <IconMail size={22} stroke={1.5}/>
                  )}
                </TableCell>
                <TableCell>{mail.receivers}</TableCell>
                <TableCell>{mail.title}</TableCell>
                <TableCell>
                  {new Date(mail.receivedAt).toLocaleString('ko-KR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
