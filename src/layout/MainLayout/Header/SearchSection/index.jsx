import PropTypes from 'prop-types';
import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import Popper from '@mui/material/Popper';
import Box from '@mui/material/Box';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import HomeIcon from '@mui/icons-material/Home';

// third party
import PopupState, { bindPopper, bindToggle } from 'material-ui-popup-state';

// project imports
import Transitions from 'ui-component/extended/Transitions';
import { useMenu } from 'contexts/MenuContext';

// assets
import { IconSearch, IconX, IconChevronRight } from '@tabler/icons-react';

function HeaderAvatar({ children, ref, ...others }) {
  const theme = useTheme();

  return (
    <Avatar
      ref={ref}
      variant="rounded"
      sx={{
        ...theme.typography.commonAvatar,
        ...theme.typography.mediumAvatar,
        color: theme.vars.palette.secondary.dark,
        background: theme.vars.palette.secondary.light,
        '&:hover': {
          color: theme.vars.palette.secondary.light,
          background: theme.vars.palette.secondary.dark
        },

        ...theme.applyStyles('dark', {
          color: theme.vars.palette.secondary.main,
          background: theme.vars.palette.dark.main,
          '&:hover': {
            color: theme.vars.palette.secondary.light,
            background: theme.vars.palette.secondary.main
          }
        })
      }}
      {...others}
    >
      {children}
    </Avatar>
  );
}

function MobileSearch({ value, setValue, popupState, onChange, onFocus, onKeyDown }) {
  const theme = useTheme();

  return (
    <OutlinedInput
      id="input-search-header-mobile"
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
      placeholder="메뉴 검색"
      startAdornment={
        <InputAdornment position="start">
          <IconSearch stroke={1.5} size="16px" />
        </InputAdornment>
      }
      endAdornment={
        <InputAdornment position="end">
          <Box sx={{ ml: 2 }}>
            <Avatar
              variant="rounded"
              sx={{
                ...theme.typography.commonAvatar,
                ...theme.typography.mediumAvatar,
                bgcolor: 'orange.light',
                color: 'orange.dark',
                '&:hover': { bgcolor: 'orange.dark', color: 'orange.light' },

                ...theme.applyStyles('dark', { bgcolor: theme.vars.palette.dark.main })
              }}
              {...bindToggle(popupState)}
            >
              <IconX stroke={1.5} size="20px" />
            </Avatar>
          </Box>
        </InputAdornment>
      }
      aria-describedby="search-helper-text"
      slotProps={{ input: { 'aria-label': 'weight', sx: { bgcolor: 'transparent', pl: 0.5 } } }}
      sx={{ width: '100%', ml: 0.5, px: 2, bgcolor: 'background.paper' }}
    />
  );
}

export default function SearchSection() {
  const [value, setValue] = useState('');
  const [openResults, setOpenResults] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const anchorRef = useRef(null)
  const listRef = useRef(null);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  const { searchableItems, loading } = useMenu();
console.log(searchableItems);
  // ====== 추가: 제목에서 검색어와 일치하는 부분만 하이라이트해서 렌더하는 함수 ======
  const getHighlightedText = (text, query) => {
    if (!query) return text;
    // 검색어에 정규식 특수문자가 있으면 이스케이프
    const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const q = escapeRegExp(query);
    const regex = new RegExp(`(${q})`, 'ig');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <Box
          key={i}
          component="span"
          sx={{ color: 'secondary.main', fontWeight: 600, whiteSpace: 'nowrap' }}
        >
          {part}
        </Box>
      ) : (
        <Box key={i} component="span" sx={{ whiteSpace: 'nowrap' }}>
          {part}
        </Box>
      )
    );
  };

  // 검색 가능한 메뉴 리스트 필터링
  const filteredResults = useMemo(() => {
    if (loading || !searchableItems) {
      return [];
    }
    // 검색어가 없으면 전체 목록 반환
    if (!value) {
      return searchableItems;
    }
    const lowerCaseValue = value.toLowerCase();
    return searchableItems.filter(
      (item) =>
        item.title.toLowerCase().includes(lowerCaseValue) ||
        (item.breadcrumbs && item.breadcrumbs.toLowerCase().includes(lowerCaseValue))
    );
  }, [value, searchableItems, loading]);

  // 검색어 변경 핸들러
  const handleSearchChange = (event) => {
    setValue(event.target.value);
    setHighlightedIndex(-1); // 검색어 변경 시 하이라이트 초기화
    if (!openResults) {
      setOpenResults(true);
    }
  };

  // 검색창 포커스 핸들러
  const handleSearchFocus = () => {
    setOpenResults(true);
  };

  // 외부 클릭 시 결과창 닫기 및 검색어 초기화
  const handleCloseResults = (event) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target) &&
      (!searchInputRef.current || !searchInputRef.current.contains(event.target))
    ) {
      return;
    }
    setOpenResults(false);
    setValue(''); // 검색어 초기화 추가
  };

  // 결과 항목 클릭 (라우트 이동)
  const handleResultClick = (path) => {
    navigate(path);
    setOpenResults(false);
    setValue(''); // 선택 후 검색어 초기화
  };

  // 키보드 네비게이션
  const handleKeyDown = (event) => {
    if (!openResults || filteredResults.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlightedIndex((prev) => (prev < filteredResults.length - 1 ? prev + 1 : prev));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredResults.length) {
        handleResultClick(filteredResults[highlightedIndex].path);
      }
    } else if (event.key === 'Escape') {
      setOpenResults(false);
    }
  };

  // 키보드 선택 시 스크롤 위치 조정
  useEffect(() => {
    if (listRef.current && highlightedIndex >= 0) {
      const item = listRef.current.children[highlightedIndex];
      if (item) {
        item.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  // 검색 결과 변경 시 하이라이트 초기화
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [filteredResults]);

  // 데스크탑 검색창 너비를 상태로 관리 (Popper 너비 동기화용)
  const [searchInputWidth, setSearchInputWidth] = useState(0);

  // 검색창 너비 측정 및 리사이즈 이벤트 처리
  useEffect(() => {
    if (searchInputRef.current) {
      setSearchInputWidth(searchInputRef.current.offsetWidth);
    }
    const handleResize = () => {
      if (searchInputRef.current) {
        setSearchInputWidth(searchInputRef.current.offsetWidth);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [searchInputRef.current]);


  return (
    <ClickAwayListener onClickAway={handleCloseResults}>
      <Box ref={anchorRef} sx={{ position: 'relative' }}>
        {/* 모바일 검색 */}
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
          <PopupState variant="popper" popupId="demo-popup-popper">
            {(popupState) => (
              <>
                <Box sx={{ ml: 2 }}>
                  <HeaderAvatar {...bindToggle(popupState)}>
                    <IconSearch stroke={1.5} size="19.2px" />
                  </HeaderAvatar>
                </Box>
                <Popper
                  {...bindPopper(popupState)}
                  transition
                  sx={{
                    zIndex: 1100,
                    width: '99%',
                    top: '-55px !important',
                    px: { xs: 1.25, sm: 1.5 }
                  }}
                >
                  {({ TransitionProps }) => (
                    <Transitions type="zoom" {...TransitionProps} sx={{ transformOrigin: 'center left' }}>
                      <Card sx={{ bgcolor: 'background.default', border: 0, boxShadow: 'none' }}>
                        <Box sx={{ p: 2 }}>
                          <Grid container sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                            <Grid item sx={{ flexGrow: 1 }}>
                              <MobileSearch
                                value={value}
                                setValue={setValue}
                                onChange={handleSearchChange}
                                onFocus={handleSearchFocus}
                                onKeyDown={handleKeyDown}
                                popupState={popupState}
                              />
                            </Grid>
                          </Grid>
                        </Box>
                      </Card>
                    </Transitions>
                  )}
                </Popper>
              </>
            )}
          </PopupState>
        </Box>

        {/* 데스크탑 검색 */}
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <OutlinedInput
            ref={searchInputRef}
            id="input-search-header-desktop"
            value={value}
            onChange={handleSearchChange}
            onFocus={handleSearchFocus}
            onKeyDown={handleKeyDown}
            placeholder="메뉴 검색"
            startAdornment={
              <InputAdornment position="start">
                <IconSearch stroke={1.5} size="16px" />
              </InputAdornment>
            }
            aria-describedby="search-helper-text"
            slotProps={{ input: { 'aria-label': 'weight', sx: { bgcolor: 'transparent', pl: 0.5 } } }}
            sx={{ width: { md: 250, lg: 434 }, ml: 2, px: 2 }}
          />
        </Box>

        {/* 검색 결과 Popper */}
        <Popper
          open={openResults && (value !== '' || filteredResults.length > 0)}
          anchorEl={searchInputRef.current || anchorRef.current}
          placement="bottom-start"
          transition
          sx={{
            zIndex: 1200,
            width: searchInputWidth, // 검색창 너비와 동기화
            mt: 0.5,
            ml: 0,
            ...(searchInputRef.current === null && {
              width: 'calc(100% - 32px)',
              left: 16
            })
          }}
        >
          {({ TransitionProps }) => (
            <Transitions type="fade" {...TransitionProps}>
              <Paper
                sx={{
                  maxHeight: '50vh',
                  overflowY: 'auto',
                  border: '1px solid',
                  borderColor: (theme) => theme.palette.divider
                }}
              >
                <List ref={listRef}>
                  {loading && <ListItemText primary="불러오는 중..." sx={{ px: 2, py: 1 }} />}
                  {!loading && filteredResults.length === 0 && value && (
                    <ListItemText primary="검색 결과가 없습니다." sx={{ px: 2, py: 1 }} />
                  )}
                  {!loading && filteredResults.length === 0 && !value && (
                    <ListItemText primary="전체 메뉴 (검색어를 입력하세요)" sx={{ px: 2, py: 1 }} />
                  )}

                  {filteredResults.map((item, index) => (
                    <ListItemButton
                      key={item.path}
                      selected={index === highlightedIndex}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      onClick={() => handleResultClick(item.path)}
                      sx={{ py: 0.5 }} // 상하 패딩
                    >
                      <ListItemIcon
                        sx={{ minWidth: 'auto', mr: 1 }}
                      >
                        <IconChevronRight size="20px" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              width: '100%',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              typography: 'body1',
                              color: 'text.primary',
                              fontSize: '0.8rem',
                            }}
                          >
                            <HomeIcon
                              color="secondary"
                              sx={{ fontSize: '1rem', mr: 0.5, flexShrink: 0 }}
                            />
                            <Box
                              component="span"
                              sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {item.breadcrumbs ? `> ${item.breadcrumbs}` : ''}
                            </Box>
                          </Box>
                        }
                        secondary={
                          <Box
                            component="span"
                            sx={{
                              display: 'inline-block',
                              maxWidth: '100%',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              typography: 'body2',
                              color: 'text.primary',
                              fontSize: '0.95rem',
                            }}
                          >
                            {getHighlightedText(item.title, value)}
                          </Box>
                        }
                        secondaryTypographyProps={{
                          noWrap: true,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      />
                    </ListItemButton>
                  ))}
                </List>
              </Paper>
            </Transitions>
          )}
        </Popper>
      </Box>
    </ClickAwayListener>
  );
}

HeaderAvatar.propTypes = { children: PropTypes.node, ref: PropTypes.any, others: PropTypes.any };

MobileSearch.propTypes = {
  value: PropTypes.string,
  setValue: PropTypes.func,
  popupState: PropTypes.any,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onKeyDown: PropTypes.func
};