import { useState, useEffect } from 'react';
import ReactQuill from 'features/editor/components/ReactQuill';
// material-ui
import {Box, Grid, CircularProgress } from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';
import axiosServices from 'api/axios';
import AttachmentListView from 'features/attachment/components/AttachmentListView';


import { detailMail } from '../api/mailAPI';
import { useParams } from 'react-router-dom';


export default function MailDetail() {
	const {mailId} = useParams();
	const [mail, setMail] = useState(null);	// 메일 상세 데이터
	const [loading, setLoading] = useState(false);	// 로딩중

	useEffect(() => {
    if (!mailId) return;

		setLoading(true);
    axiosServices
      .get(`/api/mails/${mailId}`)
      .then((res) => {
        console.log('메일 상세 데이터:', res.data.data);
        setMail(res.data.data);
      })
      .catch((err) => {
        console.error('메일 상세 조회 실패:', err);
      })
			.finally(() => setLoading(false));
  }, [mailId]);

	if(loading) {
		return (
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					py: 5,
					gap: 2
				}}
			>
				<CircularProgress size={32} />
				<Box sx={{ fontSize: 14, color: 'text.secondary' }}>불러오는 중...</Box>
			</Box>
		)
	}

	if (!mail) {
    return (
      <MainCard>
        <Box sx={{ textAlign: 'center', p: 3 }}>메일이 존재하지 않습니다...</Box>
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
						<Box>수신자 : {mail.to?.join(' , ')}</Box>
					</Grid>
					<Grid size={12}>
						<Box>참조 : {mail.cc?.join(' , ')}</Box>
					</Grid>
					<Grid size={12}>
						<Box>내용 :</Box>
						<Box dangerouslySetInnerHTML={{ __html: mail.content }}/>
					</Grid>
				</Grid>
				{/* 메일 상세 부분 */}

				<Box sx={{height:"30px"}}></Box>
				<AttachmentListView attachments = {mail.attachments}/>
			</MainCard>
		</Grid>
	</Grid>
	);
}
