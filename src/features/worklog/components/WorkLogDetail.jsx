import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import DefaultAvatar from "assets/images/profile/default_profile.png";
import { getImageUrl } from "api/getImageUrl";
import { getMyInfo } from 'features/employee/api/employeeAPI';
import { deleteWorkLog } from '../api/worklogAPI';

// material-ui
import {Box, Grid, CircularProgress, Typography, Button, Table, TableBody, TableRow, TableCell, Alert} from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';
import axiosServices from 'api/axios';


export default function WorkLogDetail({worklogId}) {
	const navigate = useNavigate();
	const [worklog, setWorklog] = useState(null);	// 메일 상세 데이터
	const [myInfo, setMyInfo] = useState(null);

	// Alert useState
	const [showAlert, setShowAlert] = useState(false);
	const [alertMessage, setAlertMessage] = useState('');

	// 작성일 포맷 변경
	const formatDate = (dateTime) => {
		if (!dateTime) return '';

		const [datePart] = dateTime.split('T'); // "2025-11-17"
		const [year, month, day] = datePart.split('-');

		return `${year.slice(2)}.${month}.${day}`;
	};

	const handleDelete = async () => {
		if(!worklogId) return;
		
		try {
			await deleteWorkLog([worklogId]);
			navigate('/worklog/list/personal');
		} catch (err) {
			console.error(err);
			setAlertMessage("업무일지 삭제에 실패했습니다.");
			setShowAlert(true);
		}
	}

	// 접속한 유저 정보 가져오기
  useEffect(() => {
    getMyInfo().then((res) => {
      setMyInfo(res.data.data);
      console.log('유저 정보 : ', res.data.data);
    });
  }, []);

	// 페이지 이동시 스크롤 맨 위로
  useEffect(() => {
		window.scrollTo(0, 0);
	}, []);
	
	useEffect(() => {
    if (!worklogId) return;
    axiosServices
      .get(`/api/worklogs/${worklogId}`)
      .then((res) => {
        console.log('업무일지 상세 데이터:', res.data.data);
        setWorklog(res.data.data);
      })
      .catch((err) => {
        console.error('메일 상세 조회 실패:', err);
      });
  }, [worklogId]);

	const loginUser = worklog && myInfo && worklog.employeeDepartment === myInfo.department && worklog.employeeName === myInfo.name ? true : false;

	if (!worklog) {
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
    );
  }

	return (
		<Grid container spacing={gridSpacing} sx={{minHeight:'100%'}}>
			<Grid size={12}>
				<MainCard sx={{minHeight:'100%'}}>
					<Grid container spacing={gridSpacing}>
						<Grid size={12} sx={{display:'flex', gap:'5px'}}>
							{loginUser && <Button variant="contained" onClick={() => navigate(`/worklog/write/${worklogId}`)}>수정</Button>}
							{loginUser && <Button variant="contained" onClick={handleDelete}>삭제</Button>}
							<Grid sx={{marginLeft:'auto'}}>
								{showAlert && (
									<Alert
										severity={"error"}
										onClose={() => setShowAlert(false)}
										sx={{
											flex: 1,
											height: '35px',
											py: 0,
											display: 'flex',
											alignItems: 'center',
										}}
									>
										{alertMessage}
									</Alert>
								)}
							</Grid>
							<Button variant="contained" onClick={() => navigate(`/worklog/list/all}`)} sx={{marginLeft:'auto'}}>목록</Button>
						</Grid>

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
									<TableCell sx={{width: 110, fontWeight: 600, bgcolor: 'background.default'}}>
										업무일
									</TableCell>
									<TableCell colSpan={2}>{formatDate(worklog.workDate)}</TableCell>
									<TableCell sx={{width: 110, fontWeight: 600, bgcolor: 'background.default'}}>
										작성자
									</TableCell>
									<TableCell colSpan={2}>
										<Chip
											label={`${worklog.employeeName} (${worklog.employeeDepartment})`}
											avatar={
												<Avatar
													alt={worklog.employeeName}
													src={worklog.employeeProfileImg ? getImageUrl(worklog.employeeProfileImg) : DefaultAvatar}
												/>
											}
											variant="outlined"
										/>
									</TableCell>
								</TableRow>
								<TableRow>
									<TableCell sx={{width: 110, fontWeight: 600, bgcolor: 'background.default'}}>
										업무분류
									</TableCell>
									<TableCell colSpan={2}>{worklog.workTypeName}</TableCell>
									<TableCell sx={{width: 110, fontWeight: 600, bgcolor: 'background.default'}}>
										세부업무
									</TableCell>
									<TableCell colSpan={2}>{worklog.workOptionName}</TableCell>
								</TableRow>
						
								<TableRow>
									<TableCell sx={{width: 110, fontWeight: 600, bgcolor: 'background.default'}}>
										제목
									</TableCell>
									<TableCell colSpan={6}>{worklog.title}</TableCell>
								</TableRow>
							</TableBody>
						</Table>
						</Grid>

						{/* 본문 영역 */}
						<Grid item size={12}>
							<Box 
							sx={{
								'& img': {
									maxWidth: '100%',
									height: 'auto',
									display: 'block',
									margin: '8px 0'
								}
							}}
							dangerouslySetInnerHTML={{ __html: worklog.content ? worklog.content : '내용이 없습니다.' }} />
						</Grid>
					</Grid>
				</MainCard>
			</Grid>
		</Grid>

		
	);
}
