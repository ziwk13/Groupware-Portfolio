import React from 'react';

// material-ui
import {Box, Pagination, OutlinedInput, MenuItem, Menu, InputAdornment, Grid, Button} from '@mui/material';

// project imports
import WorkLogContents from './WorkLogContents';
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';

// assets
import { IconSearch } from '@tabler/icons-react';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';

export default function WorkLogList({workLogListType}) {
	const [anchorEl, setAnchorEl] = React.useState(null);
	const handleClick = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};
	return (
		<MainCard
			title={
				<Grid container spacing={gridSpacing} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
					<Box sx={{display:"flex", gap:"5px"}}>
						<Button variant="contained">작성</Button>
					</Box>
					<Grid>
						<Box sx={{display:"flex"}}>
							<Button size="large" sx={{ color: 'grey.900' }} color="secondary" endIcon={<ExpandMoreRoundedIcon />} onClick={handleClick}>
								10개씩 보기
							</Button>
							{anchorEl && (
								<Menu
									id="menu-user-list-style1"
									anchorEl={anchorEl}
									keepMounted
									open={Boolean(anchorEl)}
									onClose={handleClose}
									variant="selectedMenu"
									anchorOrigin={{
										vertical: 'bottom',
										horizontal: 'right'
									}}
									transformOrigin={{
										vertical: 'top',
										horizontal: 'right'
									}}
								>
									<MenuItem onClick={handleClose}>10개씩 보기</MenuItem>
									<MenuItem onClick={handleClose}>20개씩 보기</MenuItem>
									<MenuItem onClick={handleClose}>30개씩 보기</MenuItem>
								</Menu>
							)}
						</Box>
					</Grid>
				</Grid>
			}
			content={false}
		>
			<WorkLogContents worklogType = {workLogListType} />
			<Grid sx={{ p: 3 }} size={12}>
				<Grid container spacing={gridSpacing} sx={{ justifyContent: 'center' }}>
					<Grid>
						<Pagination count={10} color="primary" />
					</Grid>
				</Grid>
			</Grid>
		</MainCard>
	);
}
