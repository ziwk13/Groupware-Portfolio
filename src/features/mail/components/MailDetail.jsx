import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { getMyInfo } from 'features/employee/api/employeeAPI';
import { moveMail, deleteMail } from 'features/mail/api/mailAPI';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import DefaultAvatar from 'assets/images/profile/default_profile.png';
import { getImageUrl } from 'api/getImageUrl';

// material-ui
import {
  Box,
  Grid,
  CircularProgress,
  Button,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Alert
} from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';
import axiosServices from 'api/axios';
import AttachmentListView from 'features/attachment/components/AttachmentListView';

export default function MailDetail() {
  const navigate = useNavigate();
  const { mailId } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const boxId = searchParams.get('boxId');

  const [mail, setMail] = useState(null); // 메일 상세 데이터
  const [loading, setLoading] = useState(false); // 로딩중
  const [myInfo, setMyInfo] = useState(null);

  // Alert useState
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  // 개인보관함/휴지통 이동
  const handleMoveMailType = async (type) => {
    try {
      await moveMail([mail.boxId], type);
      navigate(`/mail/list/${mail.mailboxType}`);
    } catch (err) {
      console.error('메일함 이동 실패: ', err);
      setAlertMessage('메일함 이동에 실패했습니다.');
      setShowAlert(true);
    }
  };

  // 영구삭제
  const handleDelete = async () => {
    if (!mail) return;

    try {
      await deleteMail([mail.boxId], 'TRASH');
      navigate('/mail/list/TRASH');
    } catch (err) {
      console.error('메일 삭제 실패: ', err);
      setAlertMessage('메일 삭제에 실패했습니다.');
      setShowAlert(true);
    }
  };

  // Chip 컴포넌트 렌더링 함수
  const renderReceiverChips = (list) => {
    if (!list || list.length === 0) return '';

    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {list.map((r, idx) => (
          <Chip
            key={idx}
            label={`${r.email} (${r.name})`}
            avatar={
              <Avatar
                alt={r.name}
                src={r.profileImg ? getImageUrl(r.profileImg) : DefaultAvatar}
              />
            }
            variant="outlined"
          />
        ))}
      </Box>
    );
  };

  // 접속한 유저 정보 가져오기
  useEffect(() => {
    getMyInfo().then((res) => {
      setMyInfo(res.data.data);
      console.log('유저 정보 : ', res.data.data);
    });
  }, []);

  // 상세조회한 메일이 본인의 메일인지 체크
  const canReply =
    myInfo && mail
      ? mail.mailboxType === 'INBOX' &&
        myInfo.email !== mail.senderEmail &&
        mail.senderName !== '정보 없음'
      : false;
  const myboxMail = mail && mail.mailboxType === 'MYBOX';
  const trashMail = mail && mail.mailboxType === 'TRASH';
  const myMail = mail && mail.senderEmail === myInfo?.email;

  // 페이지 이동시 스크롤 맨 위로
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!mailId) return;

    setLoading(true);
    axiosServices
      .get(`/api/mails/${mailId}`, {
        params: { isRead: true, boxId }
      })
      .then((res) => {
        console.log('메일 상세 데이터:', res.data.data);
        setMail(res.data.data);
      })
      .catch((err) => {
        console.error('메일 상세 조회 실패:', err);
      })
      .finally(() => setLoading(false));
  }, [mailId, boxId]);

  if (loading || !myInfo) {
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

  if (!mail) {
    return (
      <MainCard>
        <Box sx={{ textAlign: 'center', p: 3 }}>메일이 존재하지 않습니다...</Box>
      </MainCard>
    );
  }

  return (
    <Grid container spacing={gridSpacing} sx={{ minHeight: '100%' }}>
      <Grid size={12}>
        <MainCard sx={{ minHeight: '100%' }}>
          <Grid container spacing={gridSpacing}>
            <Grid size={12} sx={{ display: 'flex', gap: '5px' }}>
              {myMail && (
                <Button variant="contained" onClick={() => navigate(`/mail/write/${mailId}`)}>
                  재작성
                </Button>
              )}
              {canReply && (
                <Button
                  variant="contained"
                  onClick={() => navigate(`/mail/write/${mailId}?mode=reply`)}
                >
                  회신
                </Button>
              )}
              {!myboxMail && (
                <Button variant="contained" onClick={() => handleMoveMailType('MYBOX')}>
                  이동
                </Button>
              )}
              {!trashMail && (
                <Button variant="contained" onClick={() => handleMoveMailType('TRASH')}>
                  삭제
                </Button>
              )}
              {trashMail && (
                <Button variant="contained" onClick={handleDelete}>
                  영구삭제
                </Button>
              )}

              <Grid sx={{ marginLeft: 'auto' }}>
                {showAlert && (
                  <Alert
                    severity={'error'}
                    onClose={() => setShowAlert(false)}
                    sx={{
                      flex: 1,
                      height: '35px',
                      py: 0,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {alertMessage}
                  </Alert>
                )}
              </Grid>
              <Button
                variant="contained"
                onClick={() => navigate(`/mail/list/${mail.mailboxType}`)}
              >
                목록
              </Button>
            </Grid>

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
                      <Chip
                        label={`${mail.senderEmail} (${mail.senderName})`}
                        avatar={
                          <Avatar
                            alt={mail.senderName}
                            src={
                              mail.senderProfileImg
                                ? getImageUrl(mail.senderProfileImg)
                                : DefaultAvatar
                            }
                          />
                        }
                        variant="outlined"
                      />
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
                    <TableCell colSpan={3}>{renderReceiverChips(mail.to)}</TableCell>
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
                    <TableCell colSpan={3}>{renderReceiverChips(mail.cc)}</TableCell>
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
                      <TableCell colSpan={3}>{renderReceiverChips(mail.bcc)}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Grid>

            {/* 첨부파일 영역 */}
            {mail.attachments?.length > 0 && (
              <Grid size={12}>
                <AttachmentListView attachments={mail.attachments} />
              </Grid>
            )}

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
                dangerouslySetInnerHTML={{
                  __html: mail.content ? mail.content : '내용이 없습니다.'
                }}
              />
            </Grid>
          </Grid>
        </MainCard>
      </Grid>
    </Grid>
  );
}
