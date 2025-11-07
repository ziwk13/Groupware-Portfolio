import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import AttachmentDropzone from 'ui-component/extended/AttachmentDropzone';

// material-ui
import { useColorScheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Slide from '@mui/material/Slide';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { ThemeMode } from 'config';
import { gridSpacing } from 'store/constant';
import ReactQuill from 'ui-component/third-party/ReactQuill';


// animation
function Transition(props) {
  return <Slide direction="up" {...props} />;
}

// 메일 API 함수 호출
import { uploadAttachments } from '../api/mailAPI';
import { sendMail } from '../api/mailAPI';

export default function MailWrite() {
	// 요청할 메일 정보 데이터
	const [title, setTitle] = useState('');
	const [content, setContent] = useState('');
	const [to, setTo] = useState('');
	const [cc, setCc] = useState('');
	const [bcc, setBcc] = useState('');
  const [attachments, setAttachments] = useState([]);


  const [open, setOpen] = useState(false);
  const { colorScheme } = useColorScheme();

  const [ccBccValue, setCcBccValue] = useState(false);
  const handleCcBccChange = (event) => {
	setCcBccValue((prev) => !prev);
  };

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

	const handleReplyClick = async () => {
    const formData = new FormData();
    attachments.forEach((file) => formData.append('files', file));

    try {
      const res = await uploadAttachments(formData);
      console.log('✅ 업로드 성공:', res.data);
      alert('첨부파일 업로드 성공!');
    } catch (err) {
      console.error('❌ 업로드 실패:', err);
      alert('업로드 중 오류 발생');
    }
  };

	const handleSendMail = async () => {
		const formData = new FormData();

		// MailSendRequestDTO 필드 (임의 값)
		formData.append('title', title);
		formData.append('content', content);
		formData.append('to', to);
		formData.append('cc', cc);
		formData.append('bcc', bcc);

		// 첨부파일 (Dropzone에서 선택된 파일)
		attachments.forEach((file) => formData.append('files', file));

		try {
			const res = await sendMail(formData);
			console.log('✅ 메일 전송 성공:', res.data);
			alert('메일 전송 성공!');
		} catch (err) {
			console.error('❌ 메일 전송 실패:', err);
			alert('메일 전송 중 오류가 발생했습니다.');
		}
	}

  return (
	<Grid container spacing={gridSpacing}>
		<Grid size={12}>
			<MainCard>
				<Grid container spacing={gridSpacing}>
				<Grid size={12}>
					<Box sx={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
					<Button variant="contained" onClick={handleSendMail}>Reply</Button>

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
					<TextField fullWidth label="수신자" value={to} onChange = {e => setTo(e.target.value)}/>
				</Grid>
				<Grid sx={{ display: ccBccValue ? 'block' : 'none' }} size={12}>
					<Collapse in={ccBccValue}>
					{ccBccValue && (
						<Grid container spacing={gridSpacing}>
							<Grid size={12}>
								<TextField fullWidth label="참조" value={cc} onChange = {e => setCc(e.target.value)}/>
							</Grid>
							<Grid size={12}>
								<TextField fullWidth label="숨은 참조" value={bcc} onChange = {e => setBcc(e.target.value)}/>
							</Grid>
						</Grid>
					)}
					</Collapse>
				</Grid>

				{/* quill editor */}
				<Grid size={12}>
					<ReactQuill value={content} onChange = {e => setContent(e.target.value)} />
				</Grid>
				<Grid size={12}>
					<AttachmentDropzone attachments={attachments} setAttachments={setAttachments} height={"150px"}/>
				</Grid>
				</Grid>
			</MainCard>
		</Grid>
	</Grid>
  );
}
