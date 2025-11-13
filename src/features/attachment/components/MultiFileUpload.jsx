import React, { useRef } from 'react';
import PropTypes from 'prop-types';
// material-ui
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';

// third party
import { useDropzone } from 'react-dropzone';

// project imports
import FilesPreview from './FilePreview';
import PlaceholderContent from './PlaceHolderContent';
import RejectionFiles from './RejectionFile';

const DropzoneWrapper = styled('div')(({ theme }) => ({
  outline: 'none',
  padding: theme.spacing(5, 1),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.vars.palette.background.paper,
  border: `1px dashed ${theme.vars.palette.secondary.main}`,
}));

// ==============================|| UPLOAD - MULTIPLE FILE ||============================== //

export default function MultiFileUpload({ showList = false, files, onFilesChange, height="200px"}) {
  const CustomButton = styled(Button)({
    height: 35,
    lineHeight: '35px',
    padding: '0 12px',
    textTransform: 'none',
    fontSize: 14
  });

  const inputRef = useRef(null);
  const { getRootProps, getInputProps, isDragActive, isDragReject, fileRejections, open } = useDropzone({
    multiple: true,
    noClick: true,
    onDrop: (acceptedFiles) => {
      const updatedFiles = [
        ...(files || []),
        ...acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        ),
      ];
      onFilesChange(updatedFiles);
    },
  });

  const onRemove = (file) => {
    const updatedFiles = files.filter((_file) => _file !== file);
    onFilesChange(updatedFiles);
  };

  return (
    <>
      <Box sx={{width: '100%'}}>
        <Box>
          <Stack direction="row" mb={'10px'}>
            <CustomButton onClick={open} variant="contained" color="primary" type="button" 
              sx={{ height: '35px', lineHeight:'35px', px:2, fontSize:14}}>
              파일첨부
            </CustomButton>
          </Stack>
          <DropzoneWrapper {...getRootProps()}
            sx={{
              ...(isDragActive && { opacity: 0.72 }),
              ...((isDragReject) && {
                color: 'error.main',
                borderColor: 'error.light',
                bgcolor: 'error.lighter'
              }),

              height:height,
              minHeight:'150px',
              padding:'10px',
              overflowY:'auto',
              display:'flex',
              flexDirection:'column',
              justifyContent:'flex-start',
              gap:5
            }}
          >
            <input {...getInputProps()} />
            {(!files || files.length === 0) && (
              <PlaceholderContent sx={{height:'100%'}}/>
            )}
            {files && files.length > 0 && <FilesPreview files={files} showList={showList} onRemove={onRemove}/>}
          </DropzoneWrapper>
        </Box>

        {/* 경고 문구 */}
        {fileRejections.length > 0 && <RejectionFiles fileRejections={fileRejections} />}
      </Box>
    </>
  );
}

MultiFileUpload.propTypes = {
  showList: PropTypes.bool,
  files: PropTypes.any,
  onFilesChange: PropTypes.func,
};
