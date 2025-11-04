import React from 'react'
import FilesPreview from '../third-party/dropzone/FilePreview'
import { styled } from '@mui/material/styles';

const AttachmentListBox = styled('div')(({ theme }) => ({
  outline: 'none',
  padding: theme.spacing(5, 1),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.vars.palette.background.paper,
  border: `1px dashed ${theme.vars.palette.secondary.main}`,
}));

function AttachmentListView({attachments = []}) {
  return (
    <AttachmentListBox sx={{height:200, padding:'10px', overflowY:'auto', display:'flex', flexDirection:'column', justifyContent:'flex-start', gap:5}}>
     {attachments.length === 0 ? (
        <p style={{ color: '#aaa' }}>첨부된 파일이 없습니다.</p>
      ) : (
        attachments.map((file) => (
          <div key={file.fileId}>{file.originalName}</div>
        ))
      )}

      {/* <FilesPreview /> */}
    </AttachmentListBox>
  )
}

export default AttachmentListView