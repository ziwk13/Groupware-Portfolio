import { useState, useEffect } from 'react';
import ReactQuill from 'features/editor/components/ReactQuill';
// material-ui
import {Box, Grid, Button } from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';
import AttachmentListView from 'features/attachment/components/AttachmentListView';
import axiosServices from 'api/axios';

import { useParams } from 'react-router-dom';


export default function WorkLogDetail() {
	const {worklogId} = useParams();
	const [worklog, setWorklog] = useState(null);	// 메일 상세 데이터

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
      <MainCard>
        <Box sx={{ textAlign: 'center', p: 3 }}>⏳ 업무일지 정보를 불러오는 중입니다...</Box>
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
						<Box>제목 : {worklog.title}</Box>
					</Grid>
					<Grid size={12}>
						<Box>내용 : {worklog.content}</Box>
					</Grid>
				</Grid>
				{/* 메일 상세 부분 */}

				<Box sx={{height:"30px"}}></Box>
				<AttachmentListView attachments = {worklog.attachments}/>
			</MainCard>
		</Grid>
	</Grid>
	);
}
