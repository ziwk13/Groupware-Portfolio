import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
// material-ui
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import { Alert } from '@mui/material';


// third party
import { useDropzone } from 'react-dropzone';

// project imports
import FilesPreview from './FilePreview';
import PlaceholderContent from './PlaceHolderContent';

const DropzoneWrapper = styled('div')(({ theme }) => ({
  outline: 'none',
  padding: theme.spacing(5, 1),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.vars.palette.background.paper,
  border: `1px dashed ${theme.vars.palette.secondary.main}`,
}));

// ==============================|| UPLOAD - MULTIPLE FILE ||============================== //

export default function MultiFileUpload({ showList = false, files, onFilesChange, height="200px", multiple=true, accept=undefined, maxSize=10*1024*1024, onOpenFileDialog}) {
  const [showAlert, setShowAlert] = useState(false);
  const hasFiles = files && files.length > 0;
  
  const CustomButton = styled(Button)({
    height: 35,
    lineHeight: '35px',
    padding: '0 12px',
    textTransform: 'none',
    fontSize: 14
  });

  const { getRootProps, getInputProps, isDragActive, isDragReject, fileRejections, open } = useDropzone({
    multiple: multiple,
    accept: accept,
    noClick: true,
    maxSize: maxSize,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length === 0) {
        // 허용되지 않은 파일 업로드 시 리스트에 존재하는 파일 리셋되지 않도록 유지
        return;
      }

      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, { preview: URL.createObjectURL(file) })
      );

      const updatedFiles = multiple
        ? [...(files || []), ...newFiles]
        : newFiles;                      
        
      onFilesChange(updatedFiles);
    }
  });

  useEffect(() => {
    if(onOpenFileDialog) {
      onOpenFileDialog(open);
    }
  }, [onOpenFileDialog, open]);
  
  const isRejectState = isDragActive && isDragReject; 


  const onRemove = (file) => {
    const updatedFiles = files.filter((_file) => _file !== file);
    onFilesChange(updatedFiles);
  };

  useEffect(() => {
    if (fileRejections.length > 0) {
      // 새로운 reject가 생기면 다시 보여주기
      setShowAlert(true);
    }
  }, [fileRejections]);

  
  return (
    <>
      <Box sx={{width: '100%'}}>
        <Box>
          <Stack direction="row" mb={'10px'} sx={{justifyContent:'space-between'}}>
            <CustomButton onClick={open} variant="contained" color="primary" type="button" 
              sx={{ height: '35px', lineHeight:'35px', px:2, fontSize:14}}>
              파일첨부
            </CustomButton>
            <Box>
              {fileRejections.length > 0 && showAlert && (
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
                  {fileRejections[0]?.errors[0]?.code === "too-many-files" && "파일은 1개만 업로드할 수 있습니다."}
                  {fileRejections[0]?.errors[0]?.code === "file-invalid-type" && "허용되지 않은 파일 형식입니다."}
                  {fileRejections[0]?.errors[0]?.code === "file-too-large" && `파일 용량은 ${Math.floor(maxSize/1024/1024)}MB 이하여야 합니다.`}
                </Alert>
              )}
            </Box>
          </Stack>
          <DropzoneWrapper {...getRootProps()}
            sx={{
              ...(isDragActive && !isRejectState && { opacity: 0.72 }),
              ...(isRejectState && !hasFiles && {color: 'error.main', borderColor: 'error.light', bgcolor: 'error.lighter'}),

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
      </Box>
    </>
  );
}

MultiFileUpload.propTypes = {
  showList: PropTypes.bool,
  files: PropTypes.any,
  onFilesChange: PropTypes.func,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  multiple: PropTypes.bool,
  accept: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  maxSize: PropTypes.number
};
