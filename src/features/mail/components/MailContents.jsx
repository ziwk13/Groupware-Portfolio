import React from 'react';
import { useEffect, useState } from 'react';
import {useNavigate} from 'react-router-dom';
import { getMailList } from '../api/mailAPI';

// material-ui
import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Checkbox, Typography} from '@mui/material';
import {IconMail, IconMailOpened } from '@tabler/icons-react';
import axiosServices from 'api/axios';

export default function MailContents({mailboxType, onSelectedIdsChange, page, setPage, setTotalPages, size, reload}) {
  const [mails, setMails] = useState([]);
  const [selectedMailIds, setSelectedMailIds] = useState([]);   // 체크박스
  const [allChecked, setAllChecked] = useState(false);    // 전체 선택

  const navigate = useNavigate();

  const handleOpenMailDetail =(mailId) => {
    navigate(`/mail/detail/${mailId}`);  
  }

  const handleCheck = (mail) => {
    setSelectedMailIds((prev) => {
      const updated = prev.includes(mail.boxId) ? prev.filter((id) => id !== mail.boxId) : [...prev, mail.boxId];
      // mails 배열에서 선택된 mail 데이터 추출
      const selectedMailObjects = mails.filter(m => updated.includes(m.boxId));

      // boxId 배열 + mail 객체 리스트 전달
      onSelectedIdsChange && onSelectedIdsChange(updated, selectedMailObjects);

      const allIds = mails.map(mail => mail.boxId);
      setAllChecked(updated.length === allIds.length);

      return updated;
    })
  }

  const handleCheckAll = () => {
    const allIds = mails.map(mail => mail.boxId);
    let updated = [];

    if(allChecked) {
      updated = [];
    } else {
      updated = [...allIds];
    }

    setSelectedMailIds(updated);

    // 전체 mail 객체 또는 빈 배열 전달
    const selectedMailObjects = mails.filter(m => updated.includes(m.boxId)); 
    onSelectedIdsChange && onSelectedIdsChange(updated, selectedMailObjects);
    setAllChecked(!allChecked);
  }

  useEffect(() => {
    getMailList(mailboxType, page, size)
      .then(res => {
        setMails(res.content);
        setTotalPages(res.totalPages);
      })
      .catch(console.error);
  }, [mailboxType, page, size, reload]);

  useEffect(() => {
    setSelectedMailIds([]);
    setAllChecked(false);
    onSelectedIdsChange && onSelectedIdsChange([]);
  }, [mails]);


  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{width:"60px"}}><Checkbox color="primary" checked={allChecked} onChange={handleCheckAll}/></TableCell>
            <TableCell sx={{width:"80px", textAlign:"center"}}><IconMail size={22} stroke={1.5}/></TableCell>
            <TableCell sx={{width:"120px"}}>{mailboxType === "SENT" ? "받는 사람" : "보낸 사람"}</TableCell>
            <TableCell>제목</TableCell>
            <TableCell sx={{width:"200px"}}>받은날짜</TableCell>
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
              <TableRow key={mail.mailId} hover onClick={() => handleOpenMailDetail(mail.mailId)}>
                <TableCell onClick={e => e.stopPropagation()}><Checkbox color="primary" checked={selectedMailIds.includes(mail.boxId)} onChange={(e) => handleCheck(mail)}/></TableCell>
                <TableCell align="center">
                  {mail.isRead ? (
                    <IconMailOpened size={22} stroke={1.5} color="#1976d2" />
                  ) : (
                    <IconMail size={22} stroke={1.5}/>
                  )}
                </TableCell>
                <TableCell>{mailboxType === "SENT" ? (mail.receivers?.join(', ') || '수신자 없음') : mail.senderName}</TableCell>
                <TableCell>{mail.title}</TableCell>
                <TableCell>
                  {new Date(mail.receivedAt).toLocaleString('ko-KR', {
                    year: '2-digit',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
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
