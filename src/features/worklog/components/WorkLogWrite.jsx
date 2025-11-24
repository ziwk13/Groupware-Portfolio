import React, {useState, useEffect} from 'react'
import { useNavigate, useParams } from 'react-router-dom';

import {Grid, Button, Box, TextField, MenuItem, Alert} from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';
import ReactQuill from 'features/editor/components/ReactQuill';
import { getMyInfo } from '../../employee/api/employeeAPI';

// 달력 import
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { detailWorkLog, getWorkLogCodes, submitWorkLog, updateWorkLog } from '../api/worklogAPI';

function WorkLogWrite({worklogId}) {
	const navigate = useNavigate();
	const isEdit = !!worklogId;
	const [loading, setLoading] = useState(false);
	const [showAlert, setShowAlert] = useState(false);
	const [alertMessage, setAlertMessage] = useState('');

	const [valueBasic, setValueBasic] = React.useState(new Date());	// 업무일
	const [writer, setWriter] = useState('');	// 작성자
	const [title, setTitle] = useState('');		// 제목
	const [content, setContent] = useState('');	// 업무내용

	// 업무 코드 조회
	const [workTypes, setWorkTypes] = useState([]);
	const [workOptions, setWorkOptions] = useState([]);
	const [workTypeId, setWorkTypeId] = useState('');
  const [workOptionId, setWorkOptionId] = useState('');	
	const [filteredWorkOptions, setFilteredWorkOptions] = useState([]);

	// 업무 select 데이터 매핑(부모 업무에 따라 세부업무 내용이 바뀜)
	const handleChangeWorkType = (e) => {
		const selectedId = e.target.value;
		setWorkTypeId(selectedId);

		// 선택된 업무 타입 찾기
		const selectedType = workTypes.find(t => t.commonCodeId === selectedId);

		if (selectedType) {
			const typeCode = selectedType.code; // ex: "WT1"

			// value3 로 필터링
			const filtered = workOptions.filter(opt => opt.value3 === typeCode);

			setFilteredWorkOptions(filtered);
			setWorkOptionId(''); // 기존 선택 리셋
		}
	};

	// 페이지 이동시 스크롤 맨 위로
  useEffect(() => {
		window.scrollTo(0, 0);
	}, []);
	
	// 작성자 이름 가져오기
	useEffect(() => {
		getMyInfo()
			.then((res) => {
				setWriter(res.data.data);
			})
			.catch(console.error);
	}, []);

	// 업무 코드 select 데이터 받아오기
	useEffect(() => {
		getWorkLogCodes()
			.then((res) => {
				console.log(res);
				setWorkTypes(res.data.data.workTypes);
				setWorkOptions(res.data.data.workOptions);
			})
			.catch(console.error);
	}, [])

	// 수정 시 업무분류에 맞는 세부업무 데이터 가져오기
	useEffect(() => {
		if (!workTypeId || workTypes.length === 0 || workOptions.length === 0) return;

		const selectedType = workTypes.find(t => t.commonCodeId === workTypeId);
		if (!selectedType) return;

		const typeCode = selectedType.code;
		const filtered = workOptions.filter(opt => opt.value3 === typeCode);
		setFilteredWorkOptions(filtered);
	}, [workTypeId, workTypes, workOptions]);

	// 업무일지 등록
	const handleSubmitWorkLog = async () => {
    if (!workTypeId) { setAlertMessage("업무를 선택해주세요."); setShowAlert(true); return; }
    if (!workOptionId) { setAlertMessage("세부업무를 선택해주세요."); setShowAlert(true); return; }
    if (!title || title.trim() === "") { setAlertMessage("제목을 입력해주세요."); setShowAlert(true); return; }
    const now = new Date();
    if (valueBasic > now) { setAlertMessage("미래 날짜는 선택할 수 없습니다."); setShowAlert(true); return; }

    const dateStr = valueBasic.toLocaleString("sv-SE").replace(" ", "T");

    try {
      if (isEdit) {
        const body = {
          workDate: dateStr,
          workTypeId,
          workOptionId,
          title,
          content
        };
        await updateWorkLog(worklogId, body);
      } else {
        // 신규 등록일 때: FormData + POST
        const formData = new FormData();
        formData.append('workDate', dateStr);
        formData.append('workTypeId', workTypeId);
        formData.append('workOptionId', workOptionId);
        formData.append('title', title);
        formData.append('content', content);

        await submitWorkLog(formData);
      }

      navigate('/worklog/list/all');
    } catch (err) {
      console.error(err);
      setAlertMessage(isEdit ? "업무일지 수정에 실패했습니다." : "업무일지 등록에 실패했습니다.");
      setShowAlert(true);
    }
  };


	// 수정 : 기존 업무일지 정보 가져오기
	useEffect(() => {
    if (!worklogId) return;

    setLoading(true);
    detailWorkLog(worklogId)
      .then((res) => {
        const data = res.data.data;
        setTitle(data.title);
        setWorkTypeId(data.workTypeId);
        setWorkOptionId(data.workOptionId);
        setContent(data.content);
        if (data.workDate) {
          setValueBasic(new Date(data.workDate));
        }
      })
      .finally(() => setLoading(false));
  }, [worklogId]);



	return (
		<>
			<Grid container spacing={gridSpacing} sx={{minHeight:'100%'}}>
				<Grid size={12}>
					<MainCard sx={{minHeight:'100%'}}>
						<Grid container spacing={gridSpacing}>
							<Grid size={12} sx={{display:'flex', alignItems: 'center', justifyContent: 'space-between' }}>
								<Box sx={{display:'flex', justifyContent:'space-between', gap:'5px'}}>
									<Button variant="contained" onClick={handleSubmitWorkLog} sx={{padding:'0 16px', height:'35px', lineHeight:'35px'}}>등록</Button>
								</Box>

								<Grid>
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
							</Grid>
							<Grid size={12} sx={{display:'flex', gap:'20px'}}>
								<Box sx={{flex:1}}>
									<LocalizationProvider dateAdapter={AdapterDateFns}>
										<DatePicker
											label="업무일"
											format="yy.MM.dd"
											slotProps={{ textField: { fullWidth: true } }}
											value={valueBasic}
											onChange={(newValue) => {
												setValueBasic(newValue);
											}}
											disableFuture
										/>
									</LocalizationProvider>
								</Box>
								<Box sx={{flex:1}}>
									<TextField fullWidth label="작성자" value={`${writer?.name || ''} (${writer?.department})`} InputProps={{readOnly:true}}></TextField> 
								</Box>
							</Grid>
							<Grid size={12} sx={{display:'flex', gap:'20px'}}>
								<Box sx={{flex:1}}>
									<TextField
										select
										fullWidth
										label="업무"
										defaultValue={""}
										value={workTypeId}
										onChange={handleChangeWorkType}
									>
										{workTypes.map((item) => (
											<MenuItem key={item.commonCodeId} value={item.commonCodeId}>
												{item.codeDescription}
											</MenuItem>
										))}
									</TextField>
								</Box>
								<Box sx={{flex:1}}>
									<TextField
										select
										fullWidth
										label="세부업무"
										value={workOptionId}
										onChange={e => setWorkOptionId(e.target.value)}
									>
										{filteredWorkOptions.map((item) => (
											<MenuItem key={item.commonCodeId} value={item.commonCodeId}>
												{item.codeDescription}
											</MenuItem>
										))}
									</TextField>
								</Box>
							</Grid>
							<Grid size={12}>
								<TextField fullWidth label="제목" value={title} onChange = {e => {setTitle(e.target.value)}}/>
							</Grid>
							<Grid size={12}>
								<ReactQuill value={content} onChange = {setContent} editorMinHeight="calc(100vh - 500px)"/>
							</Grid>
						</Grid>
					</MainCard>
				</Grid>
			</Grid>
		</>
	)
}

export default WorkLogWrite