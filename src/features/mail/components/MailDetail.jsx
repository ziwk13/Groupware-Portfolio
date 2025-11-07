import { useState, useEffect } from 'react';
import ReactQuill from 'ui-component/third-party/ReactQuill';
// material-ui
import {Box, Grid, Button } from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';
import AttachmentListView from 'ui-component/extended/AttachmentListView';
import axiosServices from '../../../utils/axios';

import { detailMail } from '../api/mailAPI';
import { useParams } from 'react-router-dom';


export default function MailDetail() {
	const {mailId} = useParams();
	const [mail, setMail] = useState(null);	// 메일 상세 데이터

	useEffect(() => {
    if (!mailId) return;

    axiosServices
      .get(`/api/mails/${mailId}`)
      .then((res) => {
        console.log('메일 상세 데이터:', res.data.data);
        setMail(res.data.data);
      })
      .catch((err) => {
        console.error('메일 상세 조회 실패:', err);
      });
  }, [mailId]);

	if (!mail) {
    return (
      <MainCard>
        <Box sx={{ textAlign: 'center', p: 3 }}>⏳ 메일 정보를 불러오는 중입니다...</Box>
      </MainCard>
    );
  }

	return (
	<Grid container spacing={gridSpacing}>
		<Grid size={12}>
			<MainCard>
				{/* 메일 상세 부분 */}
				<Grid container spacing={gridSpacing}>
					<Grid size={12}>
						<Box>제목 : {mail.title}</Box>
					</Grid>
					<Grid size={12}>
						<Box>보낸 사람 : {mail.senderEmail} ({mail.senderName})</Box>
					</Grid>
					<Grid size={12}>
						<Box>수신자 : {mail.to}</Box>
					</Grid>
					<Grid size={12}>
						<Box>내용 : {mail.content}</Box>
					</Grid>
				</Grid>
				{/* 메일 상세 부분 */}

				<Box sx={{height:"30px"}}></Box>
				<AttachmentListView attachments = {mail.attachments} height={"300px"}/>
			</MainCard>
		</Grid>
	</Grid>
	);
}
