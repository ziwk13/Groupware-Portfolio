import { useState } from 'react';

// mui
import Grid from '@mui/material/Grid';
import FormHelperText from '@mui/material/FormHelperText';
import Stack from '@mui/material/Stack';

// project imports
import UploadMultiFile from 'features/attachment/components/MultiFileUpload';
import { gridSpacing } from 'store/constant';

export default function AttachmentDropzone({attachments, setAttachments, height, multiple, accept, maxSize}) {
  const [list, setList] = useState(false);

  // 파일 변경 시 부모로 전달
  const handleFilesChange = (newFiles) => {
    setAttachments(newFiles || []);   // 첨부파일이 존재하면 첨부파일 반환, 없으면 빈 값
  }

  return (
    <Grid container spacing={gridSpacing}>
      <Grid size={12}>
        <Grid container spacing={3}>
          <Grid size={12}>
            <Stack sx={{ alignItems: 'center', gap: 1.5 }}>
              <UploadMultiFile
                showList={list}
                files={attachments}
                onFilesChange={handleFilesChange}
                height={height}
                multiple={multiple}
                accept={accept}
                maxSize={maxSize}
              />
            </Stack>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
