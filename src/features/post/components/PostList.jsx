import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import CommonDataGrid from 'features/list/components/CommonDataGrid';
import { gridSpacing } from 'store/constant';
import MainCard from 'ui-component/cards/MainCard';
import postAPI from '../api/postAPI';
import GridPaginationActions from '../../list/components/GridPaginationActions';

export default function PostList({ category }) {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [data, setData] = useState({
    content: [],
    totalPages: 0,
    totalElements: 0,
    number: 0,
    size: 10
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // 검색어 상태
  const [keyword, setKeyword] = useState('');

  // 카테고리 바뀌면 페이지 초기화
  useEffect(() => {
    setPage(1);
  }, [category]);

  // 목록 API 호출
  useEffect(() => {
    const fetchPostList = async () => {
      setLoading(true);
      setError(null);

      try {
        const apiPage = page - 1;

        const response = await postAPI.searchPost(category, {
          page: apiPage,
          size: rowsPerPage,
          sort: ['createdAt,desc'],
          keyword: keyword
        });

        const content = response?.content ?? [];
        const number = response?.number ?? 0;
        const size = response?.size ?? 10;

        setData({
          content,
          totalPages: response?.totalPages ?? 0,
          totalElements: response?.totalElements ?? 0,
          number,
          size
        });

        const processed = content.map((row) => ({
          id: row.postId,
          postId: row.postId,
          title: row.title,
          createdAt: row.createdAt?.split('T')[0] ?? '',
          employeeName: row.employeeName
        }));

        setRows(processed);
      } catch (err) {
        console.error(err);
        setError('게시글을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchPostList();
  }, [category, page, rowsPerPage, keyword]);

  // 테이블 컬럼
  const columns = useMemo(
    () => [
      {
        field: 'postId',
        headerName: '번호',
        width: 90,
        align: 'center',
        headerAlign: 'center',
        sortable: false
      },
      {
        field: 'title',
        headerName: '제목',
        flex: 1,
        minWidth: 200,
        sortable: false
      },
      {
        field: 'createdAt',
        headerName: '등록날짜',
        width: 140,
        align: 'center',
        headerAlign: 'center',
        sortable: false
      },
      {
        field: 'employeeName',
        headerName: '작성자',
        width: 140,
        align: 'center',
        headerAlign: 'center',
        sortable: false
      }
    ],
    [navigate]
  );

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newSize) => {
    setRowsPerPage(newSize);
    setPage(1);
  };

  const handleMoveDetail = (params) => {
    navigate(`/post/detail/${params.id}`);
  };

  return (
    <MainCard
      title={
        <Grid
          container
          spacing={gridSpacing}
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          {/* 왼쪽: 타이틀 + 검색창 */}
          <Grid item sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h3">게시글 목록</Typography>

            {/* 검색창 */}
            <input
              type="text"
              placeholder="검색어 입력"
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setPage(1); // 검색어 바뀌면 1페이지로 이동
              }}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #ccc',
                marginLeft: '12px'
              }}
            />
          </Grid>

          {/* 오른쪽: 게시글 작성 버튼 */}
          <Grid item>
            <button
              style={{
                padding: '8px 12px',
                background: 'black',
                color: 'white',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer'
              }}
              onClick={() => navigate(`/post/write/${category}`)}
            >
              게시글 작성
            </button>
          </Grid>
        </Grid>
      }
      content={false}
    >
      <CommonDataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        error={error}
        onRowClick={handleMoveDetail}
      />

      <GridPaginationActions
        totalPages={data.totalPages}
        page={page}
        onPageChange={handlePageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleRowsPerPageChange}
        loading={loading}
        rowsPerPageOptions={[10, 20, 30]}
      />
    </MainCard>
  );
}
