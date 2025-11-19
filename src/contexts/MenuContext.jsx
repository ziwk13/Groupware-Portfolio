import { createContext, useContext, useState, useEffect, useMemo, lazy, useCallback } from 'react';
import { codeAPI } from 'features/code/api/codeAPI';
import { getIcon } from 'utils/mappers/iconMapper';
import { componentMapper } from 'utils/mappers/componentMapper';

import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';
import AuthGuard from 'utils/route-guard/AuthGuard';
import useAuth from 'hooks/useAuth';

const MenuContext = createContext(null);

// 이 컨텍스트가 갱신해야 하는 코드 접두사 목록
const RELEVANT_PREFIXES = ['MN', 'RO'];

// API 응답(플랫 리스트)을 React 컴포넌트에서 사용할 수 있는 중첩 트리 구조로 변환
const buildTree = (list, parentCode = null, isRoute = false) => {
  const children = [];

  for (const item of list) {
    if (item.parentCode === parentCode) {
      let config;
      try {
        if (!item.value1) {
          continue;
        }
        config = JSON.parse(item.value1);
        if (!config) throw new Error('빈 설정 값');
      } catch (e) {
        console.error(
          `[MenuContext] 코드(${item.code})에 대한 JSON 파싱에 실패했습니다. 값: "${item.value1}". 이 항목을 건너뜁니다.`,
          e.message
        );
        continue;
      }

      const node = {
        ...config,
        id: config.id || item.code
      };

      // 라우트(Route) 트리 빌드
      if (isRoute) {
        node.id = `${config.id || item.code}`;
        node.path = config.url;

        const childRoutes = buildTree(list, item.code, true);
        if (childRoutes.length > 0) {
          node.children = childRoutes;
        }

        if (config.componentPath) {
          // 유효한 '페이지' 라우트
          const LazyComponent = Loadable(lazy(componentMapper(config.componentPath)));
          node.element = <LazyComponent />;
          children.push(node);
        } else if (node.children) {
          //유효한 '레이아웃/그룹' 라우트 (자식만 있는 경우)
          children.push(node);
        }
      }
      // 메뉴 트리 빌드
      else {
        node.icon = getIcon(config.icon);
        const childMenus = buildTree(list, item.code, false);
        if (childMenus.length > 0) {
          node.children = childMenus;
        }
        children.push(node);
      }
    }
  }
  return children;
};

const processMenuData = (menuData, routeData, userRole) => {
  // API 응답 원본 가공
  const parseItem = (dto) => ({
    ...dto,
    parentCode: dto.value2,
    sortOrder: dto.sortOrder || 0
  });

  const allMenus = menuData.map(parseItem).sort((a, b) => a.sortOrder - b.sortOrder);

  // 라우트 ID 중복 제거 로직
  const allItemsMap = new Map();
  allMenus.forEach((item) => allItemsMap.set(item.code, item));
  routeData.map(parseItem).forEach((item) => allItemsMap.set(item.code, item));
  const allRoutes = Array.from(allItemsMap.values()).sort((a, b) => a.sortOrder - b.sortOrder);

  // 검색을 위해 모든 라우트 아이템을 Map으로 만듭니다.
  const itemMap = new Map(allRoutes.map((item) => [item.code, item]));

  // 메뉴 아이템 생성 (Breadcrumbs, MenuList용) - value2(부모)가 없는 경우 최상위 부모
  const rootMenuDto = allMenus.find((item) => !item.value2);

  let menuItems;
  if (rootMenuDto) {
    let rootMenuNode;
    try {
      rootMenuNode = JSON.parse(rootMenuDto.value1);
    } catch (e) {
      console.error(`[MenuContext] 루트 메뉴 파싱에 실패했습니다.`, e);
      rootMenuNode = {};
    }

    rootMenuNode.children = buildTree(allMenus, 'MN1', false);
    rootMenuNode.icon = getIcon(rootMenuNode.icon);
    menuItems = { items: [rootMenuNode] };
  } else {
    console.error(`[MenuContext] 루트 메뉴를 찾을 수 없습니다.`);
    menuItems = { items: [] };
  }

  // 동적 라우트 생성
  const allTopLevelRoutes = buildTree(allRoutes, null, true);

  const dynamicMainRoutes = {
    path: '/',
    element: (
      <AuthGuard>
        <MainLayout />
      </AuthGuard>
    ),
    children: allTopLevelRoutes
  };

  const searchableItems = [];
  for (const item of allRoutes) {
    let config;
    try {
      if (!item.value1) continue;
      config = JSON.parse(item.value1);
      if (!config) continue;
    } catch (e) {
      continue;
    }

    if (config.url && config.title) {
      if (config.admin === true && userRole !== 'ROLE_ADMIN') {
        continue;
      }

      let path = config.url;
      const title = config.title;

      if (path.includes(':')) {
        // 필수 파라미터가 있는지 확인
        if (/\/:[^?]+\//.test(path) || /\/:[^?]+$/.test(path)) {
          continue;
        }

        // 선택적 파라미터가 있는 경우, 해당 부분을 제거
        path = path.split('/:')[0];
      }

      // Breadcrumbs 생성
      const breadcrumbs = [];
      let current = item;
      while (current && current.parentCode) {
        const parent = itemMap.get(current.parentCode);
        if (parent) {
          try {
            const parentConfig = JSON.parse(parent.value1);
            if (parentConfig && parentConfig.title) {
              breadcrumbs.unshift(parentConfig.title);
            }
          } catch (e) {
            // 부모 파싱 오류는 무시
          }
          current = parent;
        } else {
          current = null;
        }
      }

      searchableItems.push({
        title,
        path,
        breadcrumbs: breadcrumbs.join(' > ')
      });
    }
  }

  // breadcrumbs 및 title로 정렬
  searchableItems.sort((a, b) => {
    const breadcrumbCompare = a.breadcrumbs.localeCompare(b.breadcrumbs);
    if (breadcrumbCompare !== 0) {
      return breadcrumbCompare;
    }
    return a.title.localeCompare(b.title);
  });

  return { menuItems, dynamicMainRoutes, searchableItems };
};

export const MenuProvider = ({ children }) => {
  const { user } = useAuth();
  const [menuItems, setMenuItems] = useState(null);
  const [dynamicMainRoutes, setDynamicMainRoutes] = useState(null);
  const [searchableItems, setSearchableItems] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 데이터 페칭 로직을 useCallback으로 추출
  const fetchMenuData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null); // 새로고침 시 에러 초기화
      const [menuData, routeData] = await Promise.all([codeAPI.getAllCodeWithoutRoot('MN'), codeAPI.getAllCodeWithoutRoot('RO')]);

      if (!menuData || !routeData) {
        throw new Error('메뉴 또는 라우트 데이터를 가져오는데 실패했습니다.');
      }

      const { menuItems, dynamicMainRoutes, searchableItems } = processMenuData(menuData, routeData, user?.role);

      setMenuItems(menuItems);
      setDynamicMainRoutes(dynamicMainRoutes);
      setSearchableItems(searchableItems);
    } catch (err) {
      console.error('메뉴 데이터 로드 중 오류 발생:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [user]); // user 정보가 바뀔 때 함수가 재생성되어야 함

  // 마운트 시 및 fetchMenuData 함수가 변경될 때 데이터 로드
  useEffect(() => {
    fetchMenuData();
  }, [fetchMenuData]); // fetchMenuData는 user에 의존함

  const value = useMemo(
    () => ({
      menuItems,
      dynamicMainRoutes,
      searchableItems,
      loading,
      error,
      refreshMenuData: fetchMenuData,
      relevantMenuPrefixes: RELEVANT_PREFIXES
    }),
    [menuItems, dynamicMainRoutes, searchableItems, loading, error, fetchMenuData]
  );

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
};

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenu는 MenuProvider 내에서 사용해야 합니다.');
  }
  return context;
};