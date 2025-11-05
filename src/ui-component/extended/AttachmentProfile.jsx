import { useState } from 'react';

// mui
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import UploadAvatar from 'ui-component/third-party/dropzone/Avatar';
import { gridSpacing } from 'store/constant';


export default function AttachmentProfile({file, setFile}) {
  const [list, setList] = useState(false);

  return (
    <Grid container spacing={gridSpacing}>
      <Grid size={12}>
        <MainCard>
					<Grid container spacing={3}>
						<Grid size={12}>
							<Stack sx={{ alignItems: 'center' }}>
								<Stack sx={{ alignItems: 'center', gap: 1.5 }}>
									<UploadAvatar file={file} setFile={setFile}/>
									<Stack sx={{ gap: 0 }}>
										<Typography align="center" variant="caption">
											이미지 파일만 등록 가능합니다.
										</Typography>
										<Typography align="center" variant="caption">
											*.png, *.jpeg, *.jpg, *.gif
										</Typography>
									</Stack>
								</Stack>
							</Stack>
						</Grid>
						<Grid size={12}>
							<Stack direction="row" sx={{ justifyContent: 'center', alignItems: 'center', gap: 2 }}>
								<Button variant="contained" onClick={e => setFile(null)}>
									초기화
								</Button>
							</Stack>
						</Grid>
					</Grid>
        </MainCard>
      </Grid>
    </Grid>
  );
}
