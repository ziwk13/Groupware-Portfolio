import PropTypes from 'prop-types';
// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';

// third party
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

import Quill from 'quill';
import ImageResize from 'quill-image-resize-module-react';

Quill.register('modules/imageResize', ImageResize);

// project imports
import { ThemeDirection } from 'config';
import useConfig from 'hooks/useConfig';
import { withAlpha } from 'utils/colorUtils';

// ==============================|| QUILL EDITOR ||============================== //

export default function ReactQuillDemo({ value, editorMinHeight = 125, onChange, modules }) {
  const {
    state: { fontFamily }
  } = useConfig();
  const theme = useTheme();

  return (
    <Box
      sx={{
        '& .quill': {
          bgcolor: 'grey.50',
          borderRadius: '12px',
          '& .ql-toolbar': {
            bgcolor: 'grey.100',
            borderColor: 'primary.light',
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px'
          },
          '& .ql-container': {
            fontFamily,
            borderColor: 'primary.light',
            borderBottomLeftRadius: '12px',
            borderBottomRightRadius: '12px',
            '& .ql-editor': { minHeight: editorMinHeight }
          }
        },
        ...(theme.direction === ThemeDirection.RTL && { '& .ql-snow .ql-picker-label::before ': { ml: 2 } }),

        ...theme.applyStyles('dark', {
          '& .quill': {
            bgcolor: 'dark.main',
            '& .ql-toolbar': {
              bgcolor: 'dark.light',
              borderColor: withAlpha(theme.vars.palette.dark.light, 0.2)
            },
            '& .ql-container': { borderColor: `${withAlpha(theme.vars.palette.dark.light, 0.2)} !important` }
          }
        })
      }}
    >
      <ReactQuill {...(value && { value })} {...(onChange && { onChange })} {...(modules && {modules})} />
    </Box>
  );
}

ReactQuillDemo.propTypes = { value: PropTypes.string, editorMinHeight: PropTypes.number, onChange: PropTypes.func, modules: PropTypes.any };
