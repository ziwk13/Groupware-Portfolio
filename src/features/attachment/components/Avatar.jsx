import PropTypes from 'prop-types';
// material-ui
import { styled } from '@mui/material/styles';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';

// third party
import { useDropzone } from 'react-dropzone';

// project imports
import { withAlpha } from 'utils/colorUtils';
import useAuth from 'hooks/useAuth';

const RootWrapper = styled('div')(({ theme }) => ({
  width: 124,
  height: 124,
  borderRadius: '50%',
  border: `1px dashed ${theme.vars.palette.secondary.main}`,
  background: theme.vars.palette.secondary.light
}));

const DropzoneWrapper = styled('div')({
  zIndex: 0,
  width: '100%',
  height: '100%',
  outline: 'none',
  display: 'flex',
  overflow: 'hidden',
  borderRadius: '50%',
  position: 'relative',
  alignItems: 'center',
  justifyContent: 'center',
  '& > *': { width: '100%', height: '100%' },
  '&:hover': {
    cursor: 'pointer',
    '& .placeholder': {
      zIndex: 9
    }
  }
});

const PlaceholderWrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  position: 'absolute',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.vars.palette.text.secondary,
  backgroundColor: withAlpha(theme.vars.palette.secondary.light, 0.75),
  transition: theme.transitions.create('opacity', {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shorter
  }),
  '&:hover': { opacity: 0.85 }
}));

// ==============================|| UPLOAD - AVATAR ||============================== //

export default function AvatarUpload({file, setFile}) {
  const {getProfileImg} = useAuth();
  const { getRootProps, getInputProps, isDragActive, isDragReject, fileRejections } = useDropzone({
    accept: {'image/*': []},
    multiple: false,
    onDrop: (acceptedFiles) => {
      if(acceptedFiles.length > 0) {
        const selectedFile = acceptedFiles[0];
        const preview = URL.createObjectURL(selectedFile);
        setFile(Object.assign(selectedFile, {preview}));
      }
    }
  });

  return (
    <>
      <RootWrapper sx={{ ...((isDragReject) && { borderColor: 'error.light' }), height:'150px', width:'150px'}}>
        <DropzoneWrapper {...getRootProps()} sx={{ ...(isDragActive && { opacity: 0.6 }) }}>
          <input {...getInputProps()} />
          <CardMedia component='img' src = {file ? URL.createObjectURL(file) : getProfileImg()}/>
        </DropzoneWrapper>
      </RootWrapper>

      {fileRejections.length > 0 && (
        <Typography variant="caption" color="red">
          파일 형식이 올바르지 않습니다.
        </Typography>
      )}
    </>
  );
}

AvatarUpload.propTypes = {
  file: PropTypes.array,
  setFile: PropTypes.any,
};
