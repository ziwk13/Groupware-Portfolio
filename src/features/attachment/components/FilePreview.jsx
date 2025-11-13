import PropTypes from 'prop-types';
// material-ui
import { useTheme } from '@mui/material/styles';
import CardMedia from '@mui/material/CardMedia';
import List from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';
import IconButton from '@mui/material/IconButton';

// project imports
import useConfig from 'hooks/useConfig';
import getDropzoneData from 'utils/getDropzoneData';

// assets
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { Typography } from '@mui/material';

// ==============================|| MULTI UPLOAD - PREVIEW ||============================== //

export default function FilesPreview({ showList = false, files, onRemove }) {
  const {
    state: { borderRadius }
  } = useConfig();
  const theme = useTheme();

  const hasFile = files.length > 0;

  const formatBytes = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <List
      disablePadding
      sx={{
        ...(hasFile && { my: 3 }),
        margin:0
      }}
    >
      {files.map((file, index) => {
        const { key, name, size, preview, type = '' } = getDropzoneData(file, index);

        if (showList) {
          return (
            <ListItem
              key={key}
              sx={{
                p: 0,
                m: 0.5,
                width: 80,
                height: 80,
                borderRadius: `${borderRadius}px`,
                position: 'relative',
                display: 'inline-flex',
                verticalAlign: 'text-top',
                border: 'solid 1px',
                borderColor: 'grey.400',
                ...theme.applyStyles('dark', { borderColor: 'divider' })
              }}
            >
              {type?.includes('image') && <CardMedia component="img" alt="preview" src={preview} sx={{ width: 1 }} />}
              {!type?.includes('image') && <InsertDriveFileOutlinedIcon style={{ width: '100%', fontSize: '1.5rem' }} />}

              {onRemove && (
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => onRemove(file)}
                  sx={{
                    fontSize: '0.875rem',
                    bgcolor: 'background.paper',
                    p: 0,
                    width: 'auto',
                    height: 'auto',
                    top: -8,
                    right: -8,
                    position: 'absolute',
                    ...theme.applyStyles('dark', { '& .MuiSvgIcon-root': { backgroundColor: 'dark.dark' } })
                  }}
                >
                  <HighlightOffIcon style={{ fontSize: '1rem' }} />
                </IconButton>
              )}
            </ListItem>
          );
        }

        return (
          <ListItem
            key={key}
            sx={{
              my: 1,
              px: 2,
              py: 0.75,
              borderRadius: `${borderRadius}px`,
              border: 'solid 1px',
              borderColor: 'grey.400',
              ...theme.applyStyles('dark', { borderColor: 'divider' })
            }}
          >
            <InsertDriveFileOutlinedIcon sx={{ color: 'secondary.main', width: 30, height: 30, fontSize: '1.15rem', mr: 0.5 }} />
            <ListItemText
              primary={typeof file === 'string' ? 
                file : 
                <Typography sx={{whiteSpace:'nowrap', textOverflow:'ellipsis', overflow:'hidden'}}>{name}</Typography>
              }
              secondary={typeof file === 'string' ? '' : formatBytes(size)}
              slotProps={{ primary: { variant: 'subtitle2' }, secondary: { variant: 'caption' } }}
            />

            {onRemove && (
              <IconButton edge="end" size="small" onClick={() => onRemove(file)} color="error">
                <HighlightOffIcon style={{ fontSize: '1.15rem' }} />
              </IconButton>
            )}
          </ListItem>
        );
      })}
    </List>
  );
}

FilesPreview.propTypes = { 
  showList: PropTypes.bool, 
  files: PropTypes.any, 
  onRemove: PropTypes.any, 
};
