import { useState, useEffect } from 'react';
import ReactQuill from 'features/editor/components/ReactQuill';
import { useNavigate } from 'react-router-dom';
import { getMyInfo } from '../../employee/api/employeeAPI';

// material-ui
import {Box, Grid, CircularProgress, Button, Table, TableBody, TableRow, TableCell } from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';
import axiosServices from 'api/axios';
import AttachmentListView from 'features/attachment/components/AttachmentListView';

import { useParams } from 'react-router-dom';

export default function MailDetail() {
	const navigate = useNavigate();
	const {mailId} = useParams();
	const [mail, setMail] = useState(null);	// 메일 상세 데이터
	const [loading, setLoading] = useState(false);	// 로딩중
	const [myInfo, setMyInfo] = useState(null);

	// 접속한 유저 정보 가져오기
	useEffect(() => {
		getMyInfo().then((res) => {
			setMyInfo(res.data.data);
			console.log("유저 정보 : ", res.data.data)
		})
	}, []);

	// 상세조회한 메일이 본인의 메일인지 체크
	const canReply = myInfo && mail ? mail.mailboxType === 'INBOX' && myInfo.email !== mail.senderEmail && mail.senderName !== '정보 없음' : false;
	
	// 페이지 이동시 스크롤 맨 위로
	useEffect(() => {
		window.scrollTo(0, 0);
	}, []);

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

	if(loading || !myInfo) {
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
				<Grid container spacing={gridSpacing}>
					{canReply &&
						<Grid size={12}>
							<Button variant="contained" onClick={() => navigate(`/mail/write/${mailId}?mode=reply`)}>회신</Button>
						</Grid>
					}

					{/* 상단 정보 테이블 */}
					<Grid size={12}>
						<Table
							size="small"
							sx={{
								borderTop: '1px solid',
								borderBottom: '1px solid',
								borderColor: 'divider',
								'& td': {
									borderBottom: '1px solid',
									borderColor: 'divider',
									py: 1,
									fontSize: 14
								}
							}}
						>
							<TableBody>
								<TableRow>
									<TableCell
										sx={{
											width: 110,
											fontWeight: 600,
											bgcolor: 'background.default'
										}}
									>
										제목
									</TableCell>
									<TableCell colSpan={3}>{mail.title}</TableCell>
								</TableRow>

								<TableRow>
									<TableCell
										sx={{
											width: 110,
											fontWeight: 600,
											bgcolor: 'background.default'
										}}
									>
										보낸 사람
									</TableCell>
									<TableCell colSpan={3}>
										{mail.senderEmail} ({mail.senderName})
									</TableCell>
								</TableRow>

								<TableRow>
									<TableCell
										sx={{
											width: 110,
											fontWeight: 600,
											bgcolor: 'background.default'
										}}
									>
										수신자
									</TableCell>
									<TableCell colSpan={3}>
										{mail.to?.join(' , ')}
									</TableCell>
								</TableRow>

								<TableRow>
									<TableCell
										sx={{
											width: 110,
											fontWeight: 600,
											bgcolor: 'background.default'
										}}
									>
										참조
									</TableCell>
									<TableCell colSpan={3}>
										{mail.cc?.join(' , ')}
									</TableCell>
								</TableRow>

								{!canReply && (
									<TableRow>
										<TableCell
											sx={{
												width: 110,
												fontWeight: 600,
												bgcolor: 'background.default'
											}}
										>
											숨은참조
										</TableCell>
										<TableCell colSpan={3}>
											{mail.bcc?.join(' , ')}
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</Grid>
					
					{/* 첨부파일 영역 */}
					{mail.attachments?.length > 0 && 
						<Grid size={12}>
							<AttachmentListView attachments = {mail.attachments}/>
					</Grid>
					}
						
					{/* 본문 영역 */}
					<Grid item xs={12}>
						<Box 
						sx={{
							'& img': {
								maxWidth: '100%',
								height: 'auto',
								display: 'block',
								margin: '8px 0'
							}
						}}
						dangerouslySetInnerHTML={{ __html: mail.content }} />
					</Grid>

				</Grid>
				
			</MainCard>
		</Grid>
	</Grid>
	);
}
