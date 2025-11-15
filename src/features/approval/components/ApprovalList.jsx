// ApprovalList.jsx

import React, { useState, useEffect } from 'react';

// material-ui
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Pagination from '@mui/material/Pagination';
import Typography from '@mui/material/Typography';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';
import ApprovalContents from './ApprovalContents';
import { getApprovalList } from '../api/approvalAPI'; // API 함수 임포트

// assets
import { IconSearch } from '@tabler/icons-react';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';

const titleMapping = {
  pending: '결재 대기 목록',
  draft: '결재 기안 목록',
  completed: '결재 완료 목록',
  reference: '결재 참조 목록'
};

// ==============================|| USER LIST STYLE 1 ||============================== //

export default function ApprovalList({ status }) {
  const [anchorEl, setAnchorEl] = React.useState(null);

  // 데이터 로딩, 에러, 목록 상태
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // API 응답(페이징 객체)을 저장
  const [data, setData] = useState({
    content: [], // 실제 목록 데이터
    totalPages: 0,
    totalElements: 0,
    number: 0, // 0-based 현재 페이지
    size: 10 // 페이지 당 항목 수
  });

  // 페이지네이션 및 검색 상태
  const [page, setPage] = useState(1); // MUI Pagination은 1-based
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // status(목록 종류)가 변경될 때 page를 1로 리셋
  useEffect(() => {
    setPage(1);
  }, [status]); // status만 의존하는 이유는 page가 변경되면 어차피 아래의 useEffect가 정보를 새로 받기 때문

  useEffect(() => {
    // 데이터를 불러오는 비동기 함수
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // API는 0-based page를 사용하므로 1을 뺌
        const apiPage = page - 1;
        const response = await getApprovalList(status, apiPage, rowsPerPage);
        setData(response); // 응답받은 페이징 객체 전체를 저장
      } catch (err) {
        console.error(err);
        setError(err.message || '데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // status, page(1-based), rowsPerPage가 변경될 때마다 실행
  }, [status, page, rowsPerPage]);

  // --- 이벤트 핸들러 ---
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // 페이지 변경 핸들러
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  // Rows per page 변경 핸들러
  const handleRowsChange = (newSize) => {
    setRowsPerPage(newSize);
    setPage(1); // Rows 수를 바꾸면 1페이지로 리셋
    handleClose();
  };

  return (
    <MainCard
      title={
        <Grid container spacing={gridSpacing} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Grid>
            <Typography variant="h3">{titleMapping[status]}</Typography>
          </Grid>
          <Grid>
            <OutlinedInput
              id="input-search-list-style1"
              placeholder="Search"
              startAdornment={
                <InputAdornment position="start">
                  <IconSearch stroke={1.5} size="16px" />
                </InputAdornment>
              }
              size="small"
            />
          </Grid>
        </Grid>
      }
      content={false}
    >
      {/* ApprovalContents로 상태와 데이터를 전달 */}
      <ApprovalContents
        status={status}
        data={data.content}
        loading={loading}
        error={error}
        page={data.number} // 0-based page
        size={data.size} // rows per page
      />

      {/* 페이지네이션 및 Rows 버튼 */}
      <Grid sx={{ p: 3 }} size={12}>
        <Grid container spacing={gridSpacing} sx={{ justifyContent: 'space-between' }}>
          <Grid>
            <Pagination count={data.totalPages} page={page} onChange={handlePageChange} color="primary" />
          </Grid>
          <Grid>
            <Button size="large" sx={{ color: 'grey.900' }} color="secondary" endIcon={<ExpandMoreRoundedIcon />} onClick={handleClick}>
              {rowsPerPage} Rows
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
                <MenuItem onClick={() => handleRowsChange(10)}> 10 Rows</MenuItem>
                <MenuItem onClick={() => handleRowsChange(20)}> 20 Rows</MenuItem>
                <MenuItem onClick={() => handleRowsChange(30)}> 30 Rows </MenuItem>
              </Menu>
            )}
          </Grid>
        </Grid>
      </Grid>
    </MainCard>
  );
}
