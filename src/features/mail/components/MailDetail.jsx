import { useState, useEffect } from 'react';
import ReactQuill from 'features/editor/components/ReactQuill';
// material-ui
import {Box, Grid, Button } from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';
import AttachmentListView from 'features/attachment/components/AttachmentListView';

import { detailMail } from '../api/mailAPI';


export default function MailDetail() {
	const [mail, setMail] = useState(null);	// 메일 상세 데이터
	const [attachments, setAttachments] = useState([]);
	const mailId = 10;

	useEffect(() => {
		const fetchMailDetail = async () => {
			try {
				const res = await detailMail(mailId);
				console.log('메일 상세 :', res.data.data);
				setMail(res.data.data);
				setAttachments(res.data.data.attachments || []);
			} catch (err) {
				console.error('메일 조회 실패', err)
			}
		};
		fetchMailDetail();
	}, []);

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
						<Box sx={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
						<Button variant="contained">상세보기 (테스트)</Button>
						</Box>
					</Grid>
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
				<AttachmentListView attachments = {attachments}/>
			</MainCard>
		</Grid>
	</Grid>
	);
}
