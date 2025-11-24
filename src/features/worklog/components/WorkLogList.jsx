import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import DefaultAvatar from 'assets/images/profile/default_profile.png';
import { getImageUrl } from 'api/getImageUrl';

// material-ui
import {Box, Grid, Button, Checkbox, CircularProgress, Alert} from '@mui/material';
import { IconClipboard, IconClipboardCheck } from '@tabler/icons-react';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';

import CommonDataGrid from '../../list/components/CommonDataGrid';
import GridPaginationActions from '../../list/components/GridPaginationActions';
import { deleteWorkLog, getWorkLogList } from '../api/worklogAPI';
import _ from 'lodash';


export default function WorkLogList({workLogListType}) {
	// 페이지 네비, 로딩, 오류 문구
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [showAlert, setShowAlert] = useState(false);
	const [alertMessage, setAlertMessage] = useState('');

	// 업무일지 리스트 조회
	const [selectedWorkLogIds, setSelectedWorkLogIds] = useState([]);		// boxId 목록
	const [selectedWorkLogData, setSelectedWorkLogData] = useState([]); // mail 객체 목록
	const [page, setPage] = useState(0);
	const [totalPages, setTotalPages] = useState(1);
	const [size, setSize] = useState(10);
	const [reload, setReload] = useState(false);
	const [rows, setRows] = useState([]);
	const [columns, setColumns] = useState([]);

	// 페이지네비 공용 컴포넌트
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [data, setData] = useState({
		content: [],
		totalPages: 0,
		totalElements: 0,
		number: 0,
		size: 10
	});
	const handlePageChange = (event, newPage) => {
		setPage(newPage - 1); 
	};
	const handleRowsPerPageChange = (newSize) => {
		setRowsPerPage(newSize);
		setSize(newSize);   // 기존 size와 연결
		setPage(0);         // 페이지 리셋
	};

	// 업무일지 리스트 조회
	const loadList = () => {
		setLoading(true);
		getWorkLogList(workLogListType, page, size)
			.then((res) => {
				const list = res.content.map((worklog) => {
					const raw = worklog.workDate;

					let workDateText = '';
					if(raw) {
						const [datePart, timePartFull] = raw.split('T');
						if(datePart && timePartFull) {
							const [year, month, day] = datePart.split('-');
							const [hour, minute] = timePartFull.split(':');
							workDateText = `${year.slice(2)}.${month}.${day}`;
						} else {
							workDateText = raw;
						}
					}

					return {
						...worklog,
						id: worklog.workLogId,
						workDateText,
						employeeName: worklog.employeeName,
						employeeProfileImg: worklog.employeeProfileImg,
						employeeDepartment: worklog.employeeDepartment
					};
				});
				
				console.log('rows 확인:', list[0]);

				setRows(list);
				setTotalPages(res.totalPages);
				setSelectedWorkLogIds([]);
				setSelectedWorkLogData([]);
			})
			.catch(console.error)
			.finally(() => setLoading(false));
	}

	// 체크박스 선택 (단일)
	const handleSelectOne = (row) => {
		setSelectedWorkLogIds((prev) => {
			const updated = prev.includes(row.workLogId) ? prev.filter((id) => id !== row.workLogId) : [...prev, row.workLogId];
			const target = rows.filter((r) => updated.includes(r.workLogId));
			setSelectedWorkLogData(target);
			return updated;
		})
	}

	// 체크박스 선택 (전체)
	const handleSelectAll = () => {
		if(selectedWorkLogIds.length === rows.length) {
			setSelectedWorkLogIds([]);
			setSelectedWorkLogData([]);
		} else {
			const all = rows.map((r) => r.workLogId);
			const allObjects = [...rows];
			setSelectedWorkLogIds(all);
			setSelectedWorkLogData(allObjects);
		}
	}

	// 상세페이지 이동 + 읽음 처리
	const handleRowClick = async (params) => {
		const workLogId = params.row.workLogId;

		setRows((prev) =>
			prev.map((row) =>
				row.workLogId === workLogId ? { ...row, isRead: true } : row
			)
		);

		navigate(`/worklog/detail/${workLogId}`);
	}

	// 업무일지 수정
	const handleModify = () => {
		if(selectedWorkLogData.length === 0) {
			setAlertMessage("수정 할 업무일지를 선택해주세요.");
			setShowAlert(true);
			return;
		}

		if(selectedWorkLogData.length > 1) {
			setAlertMessage("업무일지를 1개만 선택해주세요.");
			setShowAlert(true);
			return;
		}

		const workLogId = selectedWorkLogData[0].workLogId;
		navigate(`/worklog/write/${workLogId}`);
	}

	// 업무일지 삭제
	const handleDelete = async () => {
		if(selectedWorkLogIds.length === 0) {
			setAlertMessage("삭제할 업무일지를 선택해주세요.")
			setShowAlert(true);
			return;
		}

		try {
			await deleteWorkLog(selectedWorkLogIds);
			setSelectedWorkLogIds([]);
			setReload(prev => !prev);
		} catch (err) {
			console.error(err);
			setAlertMessage("업무일지 삭제에 실패했습니다.");
			setShowAlert(true);
		}
	}

	// 업무일지 리스트 타입, 페이지, 리스트 수 변경시 스크롤 맨 위로
		useEffect(() => {
			loadList();
			window.scrollTo(0, 0);
		}, [workLogListType, page, size, reload]);

	// 업무일지 리스트 타입 변경시 체크박스 초기화
	useEffect(() => {
		setSelectedWorkLogIds([]);
		setSelectedWorkLogData([]);
		setPage(0);
	}, [workLogListType]);

	// 페이지 네비 이동 || 리스트 개수 변경시 체크박스 초기화
	useEffect(() => {
		setSelectedWorkLogIds([]);
	}, [page, size]);

	// 리스트 호출
	useEffect(() => {
		loadList();
	}, [workLogListType, page, size, reload]);

	// 리스트 테이블 정의
	useEffect(() => {
		const cols = [];

		cols.push(
			{
				field: 'checkbox',
				headerName: '',
				width:60,
				headerAlign: 'center',
				align: 'center',
				headerClassName: 'checkbox-col-header',
				cellClassName: 'checkbox-col-cell',
				sortable: false,
				renderHeader: () => (
					<Checkbox checked={selectedWorkLogIds.length === rows.length && rows.length > 0} onChange={handleSelectAll}/>
				),
				renderCell: (params) => (
					<Checkbox 
						checked={selectedWorkLogIds.includes(params.row.workLogId)}
						onClick={e => {
							e.stopPropagation();
							handleSelectOne(params.row);
						}}
					/>
				)
			}
		);

		if(workLogListType !== 'personal') {
			cols.push(
				{
					field: 'isRead',
					headerName: <IconClipboard size={22} stroke={1.5} style={{ marginTop: '4px' }} />,
					width: 50,
					headerAlign: 'center',
					align: 'center',
					headerClassName: 'checkbox-col-header',
					cellClassName: 'checkbox-col-cell',
					sortable: false,
					renderCell: (params) =>
						params.row.isRead ? (
							<IconClipboardCheck size={22} stroke={1.5} color="#1976d2" />
						) : (
							<IconClipboard size={22} stroke={1.5} />
						)
				}
			)
		}

		cols.push(
			{
				field: 'employeeName',
				headerName: '작성자',
				width:250,
				align: 'center',
				sortable:false,
				renderCell: (params) => (
					<Chip
						label={`${params.row.employeeName} (${params.row.employeeDepartment})`}
						avatar={
							<Avatar
								alt={params.row.employeeName}
								src={
									params.row.employeeProfileImg
										? getImageUrl(params.row.employeeProfileImg)
										: DefaultAvatar
								}
								sx={{ width: 32, height: 32 }}
							/>
						}
						variant="outlined"
					/>
				)
			},
			{
				field: 'title',
				headerName: '제목',
				flex: 1,
				sortable: false,
				renderCell: (params) => (
					<Box sx={{wordBreak:'break-all'}}>{params.value}</Box>
				)
			},
			{
				field: 'workTypeName',
				headerName: '업무 분류',
				width:150,
				align: 'center',
				sortable:false,
			},
			{
				field: 'workOptionName',
				headerName: '세부업무',
				width:150,
				align: 'center',
				sortable:false,
			},
			{
				field: 'workDateText',
				headerName: '업무일',
				width:150,
				align: 'center',
				sortable:false,
			},
		);

		setColumns(cols);
	}, [rows, selectedWorkLogIds, workLogListType])
	
	return (
		<MainCard
			sx={{
				'& .checkbox-col-cell': {
					display:'flex !important',
					paddingLeft: '0 !important',
					paddingRight: '0 !important',
					justifyContent: 'center !important',
					alignItems: 'center !important',
				},
				'& .checkbox-col-header': {
					display:'flex',
					paddingLeft: '0 !important',
					paddingRight: '0 !important',
					justifyContent: 'center !important',
					alignItems: 'center !important',
				},
				'& .MuiDataGrid-row:hover': {
					cursor: 'pointer',
				},
				'& .MuiDataGrid-cell:focus': { outline: 'none !important' },
				'& .MuiDataGrid-cell:focus-within': { outline: 'none !important' },
				'& .MuiDataGrid-columnHeader:focus': { outline: 'none !important' },
				'& .MuiDataGrid-columnHeader:focus-within': { outline: 'none !important' },
			}}
			title={
				<Grid container spacing={gridSpacing} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
					<Box sx={{display:"flex", gap:"5px"}}>
						<Button variant="contained" onClick={() => navigate(`/worklog/write`)}>작성</Button>
						{workLogListType === "personal" && <Button variant="contained" onClick={handleModify}>수정</Button>}
						{workLogListType === "personal" && <Button variant="contained" onClick={handleDelete}>삭제</Button>}
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
			}
			content={false}
		>
			{loading ? (
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
			) : (
				<>
					<CommonDataGrid rows={rows} columns={columns} loading={loading} onRowClick={handleRowClick} hideFooterSelectedRowCount/>
					<GridPaginationActions
						totalPages={totalPages}
						page={page + 1}
						onPageChange={handlePageChange}
						rowsPerPage={rowsPerPage}
						onRowsPerPageChange={handleRowsPerPageChange}
						loading={loading}
						rowsPerPageOptions={[10, 20, 30]}
					/>
				</>
			)}
			
		</MainCard>
	);
}
