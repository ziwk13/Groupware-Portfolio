import { useState, useEffect, useRef } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useNavigate, useParams } from 'react-router-dom';
import AttachmentDropzone from 'features/attachment/components/AttachmentDropzone';
import PersonAddAlt1OutlinedIcon from '@mui/icons-material/PersonAddAlt1Outlined';
import OrganizationModal from 'features/organization/components/OrganizationModal';
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import DefaultAvatar from "assets/images/profile/default_profile.png";
import { getImageUrl } from "api/getImageUrl";

// material-ui
import { useColorScheme } from '@mui/material/styles';
import{Button, Collapse, Grid, Link, TextField, Box, CircularProgress, Alert}  from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { ThemeMode } from 'config';
import { gridSpacing } from 'store/constant';
import ReactQuill from 'features/editor/components/ReactQuill';

// 메일 API 함수 호출
import { sendMail, detailMail  } from '../api/mailAPI';

export default function MailWrite({mailId}) {
	const navigate = useNavigate();
	const quillRef = useRef(null);
	// const {mailId} = useParams();
	const searchParams = new URLSearchParams(location.search);
	const isReply = searchParams.get("mode") === "reply";
	const isRewrite = !!mailId && !isReply;		// 재작성

	// 요청할 메일 정보 데이터
	const [title, setTitle] = useState('');
	const [content, setContent] = useState('');
	const [to, setTo] = useState('');
	const [cc, setCc] = useState('');
	const [bcc, setBcc] = useState('');
  const [attachments, setAttachments] = useState([]);
	const [loading, setLoading] = useState(false);	// 로딩중

	// Alert useState
	const [showAlert, setShowAlert] = useState(false);
	const [alertMessage, setAlertMessage] = useState('');

  const { colorScheme } = useColorScheme();

  const [ccBccValue, setCcBccValue] = useState(false);
  const handleCcBccChange = (event) => {
	setCcBccValue((prev) => !prev);
  };

	// 페이지 이동시 스크롤 맨 위로
  useEffect(() => {
		window.scrollTo(0, 0);
	}, []);

	let composePosition = {};

  const [position, setPosition] = useState(true);
  if (!position) {
		composePosition = {
			'& .MuiDialog-container': {
			justifyContent: 'flex-end',
			alignItems: 'flex-end',
			'& .MuiPaper-root': { mb: 0, borderRadius: '12px 12px 0px 0px', maxWidth: 595 }
			}
		};
  }

	// 날짜 포맷 메소드
	const formatDateTime = (dateString) => {
		if(!dateString) return '';
		const d = new Date(dateString);
		return d.toLocaleString('ko-KR', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	// 메일 작성
	const handleSendMail = async () => {
		if(loading) return;

		if(!title) {setAlertMessage("제목을 작성해주세요."); setShowAlert(true); return;} 
		if(!to) {setAlertMessage("수신자를 추가해주세요."); setShowAlert(true); return;} 

		setLoading(true);
		await new Promise(resolve => setTimeout(resolve, 0));

    const formData = new FormData();

    formData.append('title', title);
    formData.append('content', content);
    formData.append('to', to);
    formData.append('cc', cc);
    formData.append('bcc', bcc);

    // Dropzone 파일 중 서버파일이 아닌 것만 실제 업로드
    attachments.forEach(file => {
      if (!file.isServerFile) {
        formData.append('files', file);
      }
    });

    try {
      await sendMail(formData);
      navigate('/mail/list/INBOX');
    } catch (err) {
      console.error(err);
			setLoading(false);
			setAlertMessage("메일 발송에 실패했습니다."); setShowAlert(true);
    }
  };

	const extractEmail = (raw) => {
		if (!raw) return '';

		// 앞부분에 있는 공백 제거
		const text = raw.trim();

		// 괄호 시작 전까지가 이메일
		const idx = text.indexOf('(');
		if (idx !== -1) {
			return text.substring(0, idx).trim();
		}

		// 혹시 ( )가 없다면 그대로 반환
		return text;
	};

	// 조직도에 전달할 데이터
	const mapToOrgEmp = (email) => ({
		email,
		name: extractEmail(email).split('@')[0],  // 최소한 이름 생성
		employeeId: email,                        // unique key 역할
		position: '',
		departmentName: '',
		profileImg: ''
	});

	// 재작성일 때: 기존 메일 detail 불러오기
  useEffect(() => {
    if (!mailId) return;

		setLoading(true);

    detailMail(mailId)
      .then(res => {
        const data = res.data.data;

				
				if(isReply) {
					// *** 회신 ***
					setTitle(`Re: ${data.title || ''}`);
					const replyTemplate = `
<br/>
<hr/>
<br/><b>보낸사람:</b> ${data.senderEmail || ''}<br/><b>보낸시간:</b> ${formatDateTime(data.sendAt)}<br/><b>제목:</b> ${data.title || ''}<br/><br/>${data.content || ''}
`;
					setContent(replyTemplate);

					// 회신이라 발신자가 수신자로 들어감
					const senderEmail = extractEmail(data.senderEmail || '');
					setTo(senderEmail);

					// 참조, 숨은참조 초기화
					setCc('');
					setBcc('');

					// 첨부파일 초기화 (참고 사이트에서도 첨부파일은 포함하지 않음)
					setAttachments([]);
					
					setList([
						{name: '수신자', empList: senderEmail ? [mapToOrgEmp(senderEmail)] : []},
						{name: '참조', empList: []},
						{name: '숨은참조', empList: []}
					]);
				} else if(isRewrite) {
					// *** 재작성 ***
					setTitle(data.title);
					setContent(data.content);
					setTo((data.to || []).map(r => r.email).join(', '));
					setTo((data.cc || []).map(r => r.email).join(', '));
					setTo((data.bcc || []).map(r => r.email).join(', '));
	
					// 기존 첨부파일 Dropzone에 맞게 가공
					if (data.attachments) {
						setAttachments(
							data.attachments.map(file => ({
								...file,
								isServerFile: true // 기존 파일임 표시
							}))
						);
					}

					setList([
						{ 
							name: '수신자', 
							empList: (data.to || []).map(r => ({
								email: r.email,
								name: r.name,
								position: r.position,
								departmentName: r.department,
								profileImg: r.profileImg,
								employeeId: r.email   // 고유값 역할
							}))
						},
						{
							name: '참조',
							empList: (data.cc || []).map(r => ({
								email: r.email,
								name: r.name,
								position: r.position,
								departmentName: r.department,
								profileImg: r.profileImg,
								employeeId: r.email
							}))
						},
						{
							name: '숨은참조',
							empList: (data.bcc || []).map(r => ({
								email: r.email,
								name: r.name,
								position: r.position,
								departmentName: r.department,
								profileImg: r.profileImg,
								employeeId: r.email
							}))
						}
					]);
				}

      })
      .catch(console.error)
			.finally(() => setLoading(false));
  }, [mailId, isReply, isRewrite]);


	// 조직도 연결하기
  const [open, setOpen] = useState(false);
	const [list, setList] = useState([
		{ name: '수신자', empList: [] },
		{ name: '참조', empList: [] },
		{ name: '숨은참조', empList: [] }
	])

	// 조직도 컴포넌트 열기
	const openOrganModal = () => {
		setOpen(true);
	}

	useEffect(() => {
		const toList = list[0].empList.map(e => extractEmail(e.email));
		const ccList = list[1].empList.map(e => extractEmail(e.email));
		const bccList = list[2].empList.map(e => extractEmail(e.email));

		setTo(toList.join(', '));
		setCc(ccList.join(', '));
		setBcc(bccList.join(', '));
	}, [list]);


	// 메일 본문 ReactQuill 커스텀
	const modules = {
		toolbar: {
			container: [
				[{ header: [1, 2, false] }],
				["bold", "italic", "underline"],
				["image"]
			]
		},
		imageResize: {
			modules: ['Resize', 'DisplaySize']
		}
	};



	if(mailId && loading) {
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

	if (loading) {
		return (
			<Box sx={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				height: '60vh',
				gap: 2,
			}}>
				<CircularProgress size={32} />
				<Box sx={{ fontSize: 14, color: 'text.secondary' }}>메일을 발송중 입니다...</Box>
			</Box>
		);
	}

  return (
		<>
			<Grid container spacing={gridSpacing}>
				<Grid size={12}>
					<MainCard>
						<Grid container spacing={gridSpacing}>
							<Grid size={12}>
								<Box sx={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:'5px'}}>
									<Button variant="contained" onClick={handleSendMail} sx={{padding:'0 16px', height:'35px', lineHeight:'35px'}}>발송</Button>
									<Button
										variant="contained"
										color="primary"
										type="button"
										sx={{ height: '35px', lineHeight:'35px', padding:'0 16px', marginRight:'auto' }}
										endIcon={<PersonAddAlt1OutlinedIcon />}
										onClick={openOrganModal}
									>
										받는 사람
									</Button>
									<Grid sx={{marginLight:'auto', marginRight:'10px'}}>
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

									<Link
										component={RouterLink}
										to="#"
										color={colorScheme === ThemeMode.DARK ? 'primary' : 'secondary'}
										onClick={handleCcBccChange}
										underline="hover"
									>
										CC & BCC
									</Link>
								</Box>
							</Grid>
							<Grid size={12}>
								<TextField fullWidth label="제목" value={title} onChange = {e => setTitle(e.target.value)}/>
							</Grid>
							<Grid size={12}>
								<Box sx={{ mb: '4px', fontSize: '14px', fontWeight: 600, color: 'text.primary' }}>수신자</Box>
								<Box 
									sx={{
										display: 'flex',
										flexWrap: 'wrap',
										gap: '6px',
										cursor: 'pointer',
										border: '1px solid #d0d7de',
										borderRadius: '6px',
										padding: '10px',
										minHeight: '48px',
										bgcolor: 'background.paper'
									}} 
									onClick={openOrganModal}>
									{list[0].empList.map((e, idx) => (
										<Chip
											key={idx}
											label={`${e.email} (${e.name})`}
											avatar={
												<Avatar
													alt={e.name}
													src={e.profileImg ? getImageUrl(e.profileImg) : DefaultAvatar}
												/>
											}
											variant="outlined"
											onDelete={() => {
												const newList = [...list];
												newList[0].empList = newList[0].empList.filter((_, i) => i !== idx);
												setList(newList);
											}}
										/>
									))}
								</Box>
							</Grid>
							<Grid sx={{ display: ccBccValue ? 'block' : 'none' }} size={12}>
								<Collapse in={ccBccValue}>
								{ccBccValue && (
									<Grid container spacing={gridSpacing}>
										<Grid size={12}>
											<Box sx={{ mb: '4px', fontSize: '14px', fontWeight: 600, color: 'text.primary' }}>참조</Box>
											<Box 
												sx={{
													display: 'flex',
													flexWrap: 'wrap',
													gap: '6px',
													cursor: 'pointer',
													border: '1px solid #d0d7de',
													borderRadius: '6px',
													padding: '10px',
													minHeight: '48px',
													bgcolor: 'background.paper'
												}} 
												onClick={openOrganModal}>
												{list[1].empList.map((e, idx) => (
													<Chip
														key={idx}
														label={`${e.email} (${e.name})`}
														avatar={
															<Avatar
																alt={e.name}
																src={e.profileImg ? getImageUrl(e.profileImg) : DefaultAvatar}
															/>
														}
														variant="outlined"
														onDelete={() => {
															const newList = [...list];
															newList[1].empList = newList[1].empList.filter((_, i) => i !== idx);
															setList(newList);
														}}
													/>
												))}
											</Box>
										</Grid>
										<Grid size={12}>
											<Box sx={{ mb: '4px', fontSize: '14px', fontWeight: 600, color: 'text.primary' }}>숨은참조</Box>
											<Box 
												sx={{
													display: 'flex',
													flexWrap: 'wrap',
													gap: '6px',
													cursor: 'pointer',
													border: '1px solid #d0d7de',
													borderRadius: '6px',
													padding: '10px',
													minHeight: '48px',
													bgcolor: 'background.paper'
												}} 
												onClick={openOrganModal}>
												{list[2].empList.map((e, idx) => (
													<Chip
														key={idx}
														label={`${e.email} (${e.name})`}
														avatar={
															<Avatar
																alt={e.name}
																src={e.profileImg ? getImageUrl(e.profileImg) : DefaultAvatar}
															/>
														}
														variant="outlined"
														onDelete={() => {
															const newList = [...list];
															newList[1].empList = newList[1].empList.filter((_, i) => i !== idx);
															setList(newList);
														}}
													/>
												))}
											</Box>
										</Grid>
									</Grid>
								)}
								</Collapse>
							</Grid>

							{/* quill editor */}
							<Grid size={12}>
								<ReactQuill value={content} onChange = {setContent} ref={quillRef} modules={modules}/>
							</Grid>
							<Grid size={12}>
								<AttachmentDropzone attachments={attachments} setAttachments={setAttachments} height={"150px"}/>
							</Grid>
						</Grid>
					</MainCard>
				</Grid>
			</Grid>

			{/* 조직도 모달 */}
			<OrganizationModal open={open} onClose={() => setOpen(false)} list={list} setList={setList} />
		</>
  );
}
