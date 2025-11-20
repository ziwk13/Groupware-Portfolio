import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import {Box, Grid, CircularProgress, Typography, Button, TextField} from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';
import axiosServices from 'api/axios';


export default function WorkLogDetail({worklogId}) {
	const navigate = useNavigate();
	const [worklog, setWorklog] = useState(null);	// 메일 상세 데이터

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
		<Grid container spacing={gridSpacing}>
			<Grid size={12}>
				<MainCard>
					<Box sx={{display:'flex', justifyContent:'space-between'}}>
						<Button variant="contained" onClick={() => navigate(-1)} sx={{padding:'0 16px', height:'35px', lineHeight:'35px'}}>뒤로</Button>
					</Box>

					<Grid container spacing={gridSpacing}>
						<Grid size={12} sx={{display:'flex', alignItems: 'center', justifyContent: 'space-between' }}>
							<Box sx={{flex:1}}>
								<Typography variant="h4" color="textSecondary">업무일 : {worklog.workDate}</Typography>
							</Box>
							<Box sx={{flex:1}}>
								<Typography variant="h4" color="textSecondary">작성자 : {worklog.employeeName}</Typography>
							</Box>
						</Grid>
						
						<Grid size={12} sx={{display:'flex', gap:'20px'}}>
							<Box sx={{flex:1}}>
								<Typography variant="h4" color="textSecondary">업무분류 : {worklog.workOptionName}</Typography>
							</Box>
							<Box sx={{flex:1}}>
								<Typography variant="h4" color="textSecondary">세부업무 : {worklog.workOptionName}</Typography>
							</Box>
						</Grid>
						<Grid>
							<Typography variant="h4" color="textSecondary">제목 : {worklog.title}</Typography>
						</Grid>
					</Grid>

					<Typography variant="h4" color="textSecondary">내용 :</Typography>
					<Box dangerouslySetInnerHTML={{ __html: worklog.content }}/>
				</MainCard>
			</Grid>
		</Grid>

		
	);
}
