import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteMail, moveMail, getMailList, detailMail } from '../api/mailAPI';
import {IconMail, IconMailOpened } from '@tabler/icons-react';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import DefaultAvatar from 'assets/images/profile/default_profile.png';
import { getImageUrl } from 'api/getImageUrl';

// material-ui
import {Box, Pagination, Checkbox, Grid, Button, CircularProgress, Alert} from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';

// assets
import CommonDataGrid from '../../list/components/CommonDataGrid';
import GridPaginationActions from '../../list/components/GridPaginationActions';

export default function MailList({mailboxType}) {
	const navigate = useNavigate();
	const [selectedMailIds, setSelectedMailIds] = useState([]);		// boxId 목록
	const [selectedMailData, setSelectedMailData] = useState([]); // mail 객체 목록
	const [page, setPage] = useState(0);
	const [totalPages, setTotalPages] = useState(1);
	const [size, setSize] = useState(10);
	const [reload, setReload] = useState(false);
	const [rows, setRows] = useState([]);
	const [columns, setColumns] = useState([]);
	const [loading, setLoading] = useState(false);

	// Alert useState
	const [showAlert, setShowAlert] = useState(false);
	const [alertMessage, setAlertMessage] = useState('');

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

	// 메일 재작성
	const handleRewrite = () => {
		if(selectedMailData.length === 0) {
			setAlertMessage("재작성 할 메일을 선택해주세요.");
			setShowAlert(true);
			return;
		}

		if(selectedMailData.length > 1) {
			setAlertMessage("메일을 1개만 선택해주세요.");
			setShowAlert(true);
			return;
		}

		const mailId = selectedMailData[0].mailId;
		navigate(`/mail/write/${mailId}`);
	}

	// 메일함 이동 Dialog 열기
	const openMoveDialog = () => {
		if(selectedMailIds.length === 0) {
			setAlertMessage("이동할 메일을 1개 이상 선택해주세요.");
			setShowAlert(true);
			return;
		}
		setMoveOpen(true);
	}
	
	// 메일함 이동
	const handleMove = async (mailboxType) => {
		if (selectedMailIds.length === 0) {
			setAlertMessage("이동할 메일을 1개이상 선택해주세요.")
			setShowAlert(true);
			return;
		}

		try {
			await moveMail(selectedMailIds, mailboxType);  // 메일함 이동(개인보관함, 휴지통)
			setSelectedMailIds([]);
			setReload(prev => !prev);
		} catch (err) {
			console.error(err);
			alert("이동 실패");
		}
	};

	// 메일 삭제
	const handleDelete = async (mailboxType) => {
		if (selectedMailIds.length === 0) {
			setAlertMessage("삭제할 메일을 선택해주세요.");
			setShowAlert(true);
			return;
		}

		try {
			await deleteMail(selectedMailIds, mailboxType);
			setSelectedMailIds([]);
			setReload(prev => !prev);
		} catch (err) {
			console.error(err);
			setAlertMessage("삭제 실패");
			setShowAlert(true);
		}
	}

	// 메일 리스트 조회
	const loadList = () => {
		setLoading(true);
		getMailList(mailboxType, page, size)
			.then((res) => {
				const list = res.content.map((mail) => {
					const raw = mail.receivedAt; // "2025-11-13T15:49:22.142292" 형태

					let receivedAtText = '';
					if (raw) {
						// 소수점 앞까지 자르기
						const [datePart, timePartFull] = raw.split('T');        // ["2025-11-13", "15:49:22.142292"]
						if (datePart && timePartFull) {
							const [year, month, day] = datePart.split('-');       // ["2025","11","13"]
							const [hour, minute] = timePartFull.split(':');       // ["15","49","22.142292"]
							receivedAtText = `${year.slice(2)}.${month}.${day} ${hour}:${minute}`; // 25.11.13 15:49
						} else {
							receivedAtText = raw; // 혹시 모를 예외
						}
					}
					return {
						...mail,
						id: mail.boxId,
						senderReceiver: mailboxType === 'SENT' 
							? mail.receivers?.map(r => ({
								name: r.name,
								email: r.email,
								profileImg: r.profileImg,
								position: r.position,
								department: r.department
							})) || []
							: [{
								name: mail.senderName,
								email: mail.senderEmail,
								profileImg: mail.senderProfileImg,
								position: mail.senderPosition,
								department: mail.senderDepartment
							}],
						receivedAtText,
					};
				});

				console.log('rows 확인:', list[0]);

				setRows(list);
				setTotalPages(res.totalPages);
				setSelectedMailIds([]);
				setSelectedMailData([]);
			})
			.catch(console.error)
			.finally(() => setLoading(false));
	};

	// 체크박스 선택 (단일)
	const handleSelectOne = (row) => {
		setSelectedMailIds((prev) => {
			const updated = prev.includes(row.boxId) ? prev.filter((id) => id !== row.boxId) : [...prev, row.boxId];
			const target = rows.filter((r) => updated.includes(r.boxId));
			setSelectedMailData(target);
			return updated;
		})
	}
	
	// 체크박스 선택 (전체)
	const handleSelectAll = () => {
		if(selectedMailIds.length === rows.length) {
			setSelectedMailIds([]);
			setSelectedMailData([]);
		} else {
			const all = rows.map((r) => r.boxId);
			const allObjects = [...rows];
			setSelectedMailIds(all);
			setSelectedMailData(allObjects);
		}
	}

	// 상세페이지 이동 + 읽음 처리
	const handleRowClick = async (params) => {
		const mailId = params.row.mailId;
		const boxId = params.row.boxId;

		setRows((prev) =>
			prev.map((row) =>
				row.mailId === mailId ? { ...row, isRead: true } : row
			)
		);

		try {
			await detailMail(mailId, boxId); // boxId 같이 전달 (읽음 처리)
		} catch (e) {
			console.error(e);
		}

		navigate(`/mail/detail/${mailId}?boxId=${boxId}`);
	};

	useEffect(() => {
		setSelectedMailIds([]);
		setSelectedMailData([]);
		setPage(0);
	}, [mailboxType]);

	useEffect(() => {
		setSelectedMailIds([]);
	}, [page, size]);

	// 리스트 호출 useEffect
	useEffect(() => {
		loadList();
	}, [mailboxType, page, size, reload]);

	// 메일함, 페이지, 리스트 수 변경시 스크롤 맨 위로
	useEffect(() => {
		loadList();
		window.scrollTo(0, 0);
	}, [mailboxType, page, size, reload]);

	// 메일함 이동시 Alert 열려있는거 초기화
	useEffect(() => {
		return () => {
			setShowAlert(false);
			setAlertMessage('');
		}
	}, [mailboxType]);

	// 리스트 테이블 정의
	useEffect(() => {
		const cols = [];

		// 체크박스 컬럼 (항상 존재)
		cols.push({
			field: 'checkbox',
			headerName: '',
			width: 60,
			headerAlign: 'center',
			align: 'center',
			headerClassName: 'checkbox-col-header',
			cellClassName: 'checkbox-col-cell',
			sortable: false,
			renderHeader: () => (
				<Checkbox
					checked={selectedMailIds.length === rows.length && rows.length > 0}
					// indeterminate={
					// 	selectedMailIds.length > 0 &&
					// 	selectedMailIds.length < rows.length
					// }
					onChange={handleSelectAll}
				/>
			),
			renderCell: (params) => (
				<Checkbox
					checked={selectedMailIds.includes(params.row.boxId)}
					onClick={(e) => {
						e.stopPropagation();
						handleSelectOne(params.row);
					}}
				/>
			)
		});

		if (mailboxType !== 'SENT') {
			cols.push({
				field: 'isRead',
				headerName: <IconMail size={22} stroke={1.5} style={{ marginTop: '4px' }} />,
				width: 50,
				headerAlign: 'center',
				align: 'center',
				headerClassName: 'checkbox-col-header',
				cellClassName: 'checkbox-col-cell',
				sortable: false,
				renderCell: (params) =>
					params.row.isRead ? (
						<IconMailOpened size={22} stroke={1.5} color="#1976d2" />
					) : (
						<IconMail size={22} stroke={1.5} />
					)
			});
		}

		cols.push(
			{
				field: 'senderReceiver',
				headerName: mailboxType === 'SENT' ? '받는 사람' : '보낸 사람',
				flex: 1,
				minWidth: 150,
				headerAlign: 'center',
				align: 'center',
				sortable: false,
				renderCell: (params) => {
					const list = params.value || [];

					if (list.length === 0) return null;

					const first = list[0];
					const extra = list.length - 1;

					return (
						<Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
							<Chip
								label={`${first.email} (${first.name})`}
								avatar={
									<Avatar
										alt={first.name}
										src={first.profileImg ? getImageUrl(first.profileImg) : DefaultAvatar}
										sx={{ width: 32, height: 32 }}
									/>
								}
								variant="outlined"
							/>

							{extra > 0 && (
								<Chip
									label={`+${extra}`}
									variant="outlined"
									sx={{
										backgroundColor: '#f1f1f1',
										border: '1px solid #d0d0d0',
									}}
								/>
							)}
						</Box>
					);
				}
			},
			{
				field: 'title',
				headerName: '제목',
				flex: 2,
				sortable: false,
				renderCell: (params) => (
					<Box sx={{wordBreak:'break-all'}}>{params.value}</Box>
				)
			},
			{
				field: 'receivedAtText',
				headerName: '받은 날짜',
				width: 180,
				align: 'center',
				sortable: false
			}
		);

		setColumns(cols);
	}, [rows, selectedMailIds, mailboxType]);

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
						<Button variant="contained" onClick={() => navigate(`/mail/write`)}>작성</Button>
						{mailboxType === "SENT" && <Button variant="contained" onClick={handleRewrite}>재작성</Button>}
						{mailboxType !== "MYBOX" && <Button variant="contained" onClick={() => handleMove("MYBOX")}>이동</Button>}
						{mailboxType !== "TRASH" && <Button variant="contained" onClick={() => handleMove("TRASH")}>삭제</Button>}
						{mailboxType === "TRASH" && <Button variant="contained" onClick={() => handleDelete("TRASH")}>영구삭제</Button>}
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
