import React, { useState } from 'react';
import PropTypes from 'prop-types';

// material-ui
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Pagination from '@mui/material/Pagination';

// assets
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';

export default function GridPaginationActions({
  totalPages,
  page,
  onPageChange,
  rowsPerPage,
  onRowsPerPageChange,
  loading,
  error,
  rowsPerPageOptions = [10, 20, 30]
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const isDisabled = loading || !!error;

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleRowsChange = (newSize) => {
    onRowsPerPageChange(newSize);
    handleClose();
  };

  return (
    <Grid sx={{ p: 3 }} size={12}>
      <Grid container spacing={3} sx={{ justifyContent: 'space-between' }}>
        <Grid>
          <Pagination count={totalPages} page={page} onChange={onPageChange} color="primary" disabled={isDisabled} />
        </Grid>
        <Grid>
          <Button
            size="large"
            sx={{ color: 'grey.900' }}
            color="secondary"
            endIcon={<ExpandMoreRoundedIcon />}
            onClick={handleClick}
            disabled={isDisabled}
          >
            {rowsPerPage} 개씩
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
                vertical: 'top',
                horizontal: 'right'
              }}
              transformOrigin={{
                vertical: 'bottom',
                horizontal: 'right'
              }}
            >
              {rowsPerPageOptions.map((size) => (
                <MenuItem key={size} onClick={() => handleRowsChange(size)}>
                  {size} 개씩
                </MenuItem>
              ))}
            </Menu>
          )}
        </Grid>
      </Grid>
    </Grid>
  );
}

GridPaginationActions.propTypes = {
  totalPages: PropTypes.number.isRequired,
  page: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  onRowsPerPageChange: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.any,
  rowsPerPageOptions: PropTypes.arrayOf(PropTypes.number)
};
