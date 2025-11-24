import { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, Divider, Paper, TextField,
    Stack, Button, Dialog, DialogTitle, DialogContent,
    DialogActions
} from '@mui/material';
import postAPI from '../api/postAPI';
import PostCommentForm from './PostCommentForm';
import PostCommentList from './PostCommentList';
import postCommentAPI from '../api/postCommentAPI';
import postViewLogAPI from '../api/postViewLogAPI';
import useAuth from 'hooks/useAuth';
import AttachmentDropzone from 'features/attachment/components/AttachmentDropzone';

// 날짜 포맷 함수
const formatDate = (dateString) => {
    if (!dateString) return '';
    return dateString.split('T')[0];
};

export default function PostDetail({ postId }) {
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    const { user } = useAuth();
    const loginEmployeeId = user?.employeeId;

    const [comments, setComments] = useState([]);

    // 수정 상태
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');

    // 첨부파일 관리
    const [deletedFiles, setDeletedFiles] = useState([]); // 삭제할 기존 파일 ID들
    const [newFiles, setNewFiles] = useState([]); // 새 업로드 파일들

    // 조회수
    const [viewCount, setViewCount] = useState(0);

    // 게시글 삭제 모달
    const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);

    // 게시글 상세 조회

    const fetchPostDetail = useCallback(async () => {
        try {
            const data = await postAPI.detailPost(postId);

            setPost(data);
            setEditTitle(data.title);
            setEditContent(data.content);

            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    }, [postId]);

    // 댓글 조회
    const fetchComments = useCallback(async () => {
        try {
            const res = await postCommentAPI.getCommentsByPostId(postId, {
                page: 0,
                size: 20
            });
            setComments(res.data.data.content ?? []);
        } catch (err) {
            console.error(err);
        }
    }, [postId]);

    // 조회수 증가
    useEffect(() => {
        if (!postId) return;

        const updateViewCount = async () => {
            try {
                await postViewLogAPI.increaseView(postId);
                const res = await postViewLogAPI.getViewCount(postId);
                setViewCount(res.data.data);
            } catch (err) {
                console.error("조회수 업데이트 실패:", err);
            }
        };

        updateViewCount();
    }, [postId]);

    // 최초 로딩
    useEffect(() => {
        if (postId) {
            fetchPostDetail();
            fetchComments();
        }
    }, [fetchPostDetail, fetchComments]);

    if (loading) return <Typography sx={{ mt: 5 }}>로딩 중...</Typography>;
    if (!post) return <Typography sx={{ mt: 5 }}>게시글을 불러올 수 없습니다.</Typography>;

    // 파일 다운로드 (fetch)
    const handleDownload = async (file) => {
        try {
            const response = await fetch(`/api/attachmentFiles/download/${file.fileId}`, {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) throw new Error('다운로드 실패');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.originalName;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
        }
    };

    /* -------------------------------
       게시글 + 첨부파일 수정 저장
    ------------------------------- */
const handleSaveEdit = async () => {
    try {
        const formData = new FormData();
        formData.append("title", editTitle);
        formData.append("content", editContent);
        formData.append("isNotification", post.isNotification ?? false);

        // 삭제할 파일 ID들 추가
        deletedFiles.forEach(id => formData.append("deleteFileIds", id));

        newFiles.forEach(file => {
            formData.append("multipartFile", file);
        });

        await postAPI.updatePost(postId, formData);

        setIsEditing(false);
        setDeletedFiles([]);
        setNewFiles([]);

        fetchPostDetail();
    } catch (err) {
        console.error("게시글 수정 실패:", err);
    }
};


    /* -------------------------------
       게시글 삭제
    ------------------------------- */
    const handleDeleteClick = () => {
        setOpenDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        try {
            await postAPI.deletePost(postId);
            setOpenDeleteConfirm(false);
            window.history.back();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <Box sx={{ mt: 3 }}>
            {/* 게시글 상세 */}
            <Paper sx={{ p: 4, borderRadius: 4 }}>

                {/* 수정 모드 */}
                {isEditing ? (
                    <>
                        {/* 제목 */}
                        <TextField
                            fullWidth
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            sx={{ mb: 2 }}
                        />

                        {/* 내용 */}
                        <TextField
                            fullWidth
                            multiline
                            rows={10}
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            sx={{ mb: 2 }}
                        />

                        {/* 기존 첨부파일 */}
                        <Box sx={{ mt: 3 }}>
                            <Typography variant="h6" sx={{ mb: 1 }}>
                                기존 첨부파일
                            </Typography>

                            {(!post.attachmentFiles || post.attachmentFiles.length === 0) && (
                                <Typography sx={{ opacity: 0.6 }}>첨부된 파일 없음</Typography>
                            )}

                            <Stack spacing={1}>
                                {post.attachmentFiles?.map((file) => (
                                    <Stack
                                        key={file.fileId}
                                        direction="row"
                                        spacing={2}
                                        alignItems="center"
                                        sx={{ p: 1, border: '1px solid #ddd', borderRadius: 2 }}
                                    >
                                        <Typography sx={{ flex: 1 }}>
                                            {file.originalName} ({Math.round(file.size / 1024)} KB)
                                        </Typography>

                                        <Button
                                            size="small"
                                            color="error"
                                            onClick={() => {
                                                setDeletedFiles(prev => [...prev, file.fileId]);
                                                setPost(prev => ({
                                                    ...prev,
                                                    attachmentFiles: prev.attachmentFiles.filter(
                                                        f => f.fileId !== file.fileId
                                                    )
                                                }));
                                            }}
                                        >
                                            삭제
                                        </Button>
                                    </Stack>
                                ))}
                            </Stack>
                        </Box>

                        {/* 새 첨부파일 */}
                        <Box sx={{ mt: 3 }}>
                            <Typography variant="h6" sx={{ mb: 1 }}>
                                새로 추가할 파일
                            </Typography>

                            <AttachmentDropzone
                                height={120}
                                attachments={newFiles}
                                setAttachments={setNewFiles}
                            />
                        </Box>

                        {/* 버튼 */}
                        <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
                            <Button variant="contained" onClick={handleSaveEdit}>
                                저장
                            </Button>

                            <Button
                                variant="outlined"
                                onClick={() => {
                                    setIsEditing(false);
                                    setDeletedFiles([]);
                                    setNewFiles([]);
                                    fetchPostDetail();
                                }}
                            >
                                취소
                            </Button>
                        </Stack>
                    </>
                ) : (
                    <>
                        {/* 제목 */}
                        <Typography variant="h3" sx={{ fontWeight: 700, mb: 3 }}>
                            {post.title}
                        </Typography>

                        {/* 작성자 · 날짜 · 조회수 */}
                        <Stack direction="row" spacing={3} sx={{ mb: 3, fontSize: '14px', opacity: 0.8 }}>
                            <Typography>작성자: {post.employeeName}</Typography>
                            <Typography>작성일: {formatDate(post.createdAt)}</Typography>
                            <Typography>조회수: {viewCount}</Typography>
                        </Stack>

                        <Divider sx={{ my: 3 }} />

                        {/* 내용 */}
                        <Typography
                            variant="body1"
                            sx={{
                                whiteSpace: 'pre-line',
                                fontSize: '1.1rem',
                                lineHeight: 1.75
                            }}
                        >
                            {post.content}
                        </Typography>

                        {/* 첨부파일 */}
                        {post.attachmentFiles && post.attachmentFiles.length > 0 && (
                            <Box sx={{ mt: 4 }}>
                                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                                    첨부파일
                                </Typography>

                                <Stack spacing={1}>
                                    {post.attachmentFiles.map((file) => (
                                        <Button
                                            key={file.fileId}
                                            variant="outlined"
                                            sx={{ justifyContent: 'flex-start' }}
                                            onClick={() => handleDownload(file)}
                                        >
                                            {file.originalName} ({Math.round(file.size / 1024)} KB)
                                        </Button>
                                    ))}
                                </Stack>
                            </Box>
                        )}

                        {/* 수정 / 삭제 */}
                        {post.employeeId === loginEmployeeId && (
                            <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => {
                                        setIsEditing(true);
                                        setDeletedFiles([]);
                                        setNewFiles([]);
                                    }}
                                >
                                    수정
                                </Button>

                                <Button variant="outlined" color="error" onClick={handleDeleteClick}>
                                    삭제
                                </Button>
                            </Stack>
                        )}
                    </>
                )}
            </Paper>

            {/* 댓글 */}
            <Paper sx={{ p: 4, mt: 3, borderRadius: 4 }}>
                <PostCommentForm
                    postId={post.postId}
                    employeeId={loginEmployeeId}
                    onSuccess={fetchComments}
                />

                <PostCommentList
                    comments={comments}
                    refresh={fetchComments}
                    loginEmployeeId={loginEmployeeId}
                />
            </Paper>

            {/* 삭제 모달 */}
            <Dialog
                open={openDeleteConfirm}
                onClose={() => setOpenDeleteConfirm(false)}
                sx={{
                    '& .MuiDialog-paper': {
                        borderRadius: 3,
                        minWidth: 360
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 700, textAlign: 'center', fontSize: '1.1rem' }}>
                    게시글 삭제
                </DialogTitle>

                <DialogContent>
                    <Typography sx={{ textAlign: 'center', fontSize: '0.9rem' }}>
                        게시글을 삭제하시겠습니까?
                    </Typography>
                </DialogContent>

                <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
                    <Button color="error" onClick={handleConfirmDelete}>
                        삭제
                    </Button>
                    <Button onClick={() => setOpenDeleteConfirm(false)}>취소</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
