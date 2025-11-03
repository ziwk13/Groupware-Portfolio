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
import { DropzopType } from 'config';

const DropzoneWrapper = styled('div')(({ theme }) => ({
  outline: 'none',
  padding: theme.spacing(5, 1),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.vars.palette.background.paper,
  border: `1px dashed ${theme.vars.palette.secondary.main}`,
}));

// ==============================|| UPLOAD - MULTIPLE FILE ||============================== //

export default function MultiFileUpload({ error, showList = false, files, type, setFieldValue, sx, onUpload }) {
  // 공용으로 하면 좋을듯
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
      if (files) {
        setFieldValue('files', [
          ...files,
          ...acceptedFiles.map((file) =>
            Object.assign(file, {
              preview: URL.createObjectURL(file)
            })
          )
        ]);
      } else {
        setFieldValue(
          'files',
          acceptedFiles.map((file) =>
            Object.assign(file, {
              preview: URL.createObjectURL(file)
            })
          )
        );
      }
    }
  });

  const onRemoveAll = () => {
    setFieldValue('files', null);
  };

  const onRemove = (file) => {
    const filteredItems = files && files.filter((_file) => _file !== file);
    setFieldValue('files', filteredItems);
  };

  return (
    <>
      <Box
        sx={{
          width: '100%',
          ...(type === DropzopType.standard && { width: 'auto', display: 'flex' }),
          ...sx
        }}
      >
        <Box {...(type === DropzopType.standard && { alignItems: 'center' })}>
          <Stack direction="row" mb={'10px'}>
            <CustomButton onClick={open} variant="contained" color="primary" type="button" 
              sx={{ height: '35px', lineHeight:'35px', px:2, fontSize:14}}>
              파일첨부
            </CustomButton>
          </Stack>
          <DropzoneWrapper {...getRootProps()}
            sx={{
              ...(type === DropzopType.standard && {
                p: 0,
                m: 1,
                width: 64,
                height: 64
              }),
              ...(isDragActive && { opacity: 0.72 }),
              ...((isDragReject || error) && {
                color: 'error.main',
                borderColor: 'error.light',
                bgcolor: 'error.lighter'
              }),

              // 스타일 직접 지정 (조기완)
              height:200,
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
              <PlaceholderContent type={type} sx={{height:'100%'}}/>
            )}
            {files && files.length > 0 && <FilesPreview files={files} showList={showList} onRemove={onRemove} type={type} />}
          </DropzoneWrapper>
          {type === DropzopType.standard && files && files.length > 1 && (
            <Button variant="contained" size="small" color="error" onClick={onRemoveAll} sx={{ px: 0.75 }}>
              Remove all
            </Button>
          )}
        </Box>
        {fileRejections.length > 0 && <RejectionFiles fileRejections={fileRejections} />}
        {/* {files && files.length > 0 && <FilesPreview files={files} showList={showList} onRemove={onRemove} type={type} />} */}
      </Box>
      
      {/*   하단 버튼
      {type !== DropzopType.standard && files && files.length > 0 && (
        <Stack direction="row" sx={{ justifyContent: 'flex-end', mt: 2, gap: 2 }}>
          <Button color="error" onClick={onRemoveAll}>
            Remove all
          </Button>
          <Button variant="contained" onClick={onUpload}>
            Upload files
          </Button>
        </Stack>
      )}
      */}
    </>
  );
}

MultiFileUpload.propTypes = {
  error: PropTypes.any,
  showList: PropTypes.bool,
  files: PropTypes.any,
  type: PropTypes.any,
  setFieldValue: PropTypes.any,
  sx: PropTypes.any,
  onUpload: PropTypes.any
};
