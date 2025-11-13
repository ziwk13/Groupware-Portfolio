import React from 'react';
import PropTypes from 'prop-types';
import { styled, useTheme } from '@mui/material/styles';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import DownloadIcon from '@mui/icons-material/Download';
import { Typography, Box } from '@mui/material';
import axiosServices from 'api/axios';


const AttachmentListBox = styled('div')(({ theme }) => ({
  outline: 'none',
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.vars.palette.background.paper,
  border: `1px dashed ${theme.vars.palette.secondary.main}`,
  overflowY: 'auto'
}));

export default function AttachmentListView({ attachments = [], height="200px"}) {
  const theme = useTheme();
  const hasFile = attachments.length > 0;

  const formatBytes = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = async (file) => {
    try {
      const res = await axiosServices.get(`/api/attachmentFiles/download/${file.fileId}`, {
        responseType: 'blob'
      });

      const blob = new Blob([res.data], {type:'application/octet-stream'});
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = file.originalName;
      link.click();
      window.URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error("다운로드 실패: ", err);
    }
  };

  return (
    <AttachmentListBox sx={{height:{height}, minHeight:'150px'}}>
      {!hasFile ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#999'
          }}
        >
          <InsertDriveFileOutlinedIcon sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
          <Typography variant="body2">첨부된 파일이 없습니다.</Typography>
        </Box>
      ) : (
        <List disablePadding sx={{ margin: 0 }}>
          {attachments.map((file) => (
            <ListItem
              key={file.fileId}
              sx={{
                my: 1,
                px: 2,
                py: 0.75,
                borderRadius: theme.shape.borderRadius,
                border: '1px solid',
                borderColor: 'grey.400',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <InsertDriveFileOutlinedIcon
                sx={{
                  color: 'secondary.main',
                  width: 30,
                  height: 30,
                  fontSize: '1.15rem',
                  mr: 1
                }}
              />
              <ListItemText
                primary={
                  <Typography sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {file.originalName}
                  </Typography>
                }
                secondary={formatBytes(file.size)}
                slotProps={{
                  primary: { variant: 'subtitle2' },
                  secondary: { variant: 'caption' }
                }}
              />
              <IconButton edge="end" size="small" color="primary" onClick={() => handleDownload?.(file)}>
                <DownloadIcon sx={{ fontSize: '1.15rem' }} />
              </IconButton>
            </ListItem>
          ))}
        </List>
      )}
    </AttachmentListBox>
  );
}

AttachmentListView.propTypes = {
  attachments: PropTypes.array,
};
