import { createContext, useContext, useState, useEffect, useMemo, lazy } from 'react';
import { codeAPI } from 'features/code/api/codeAPI';
import { getIcon } from 'utils/mappers/iconMapper';
import { componentMapper } from 'utils/mappers/componentMapper';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';
import AuthGuard from 'utils/route-guard/AuthGuard';

const MenuContext = createContext(null);

// API 응답(플랫 리스트)을 React 컴포넌트에서 사용할 수 있는 중첩 트리 구조로 변환
const buildTree = (list, parentCode = null, isRoute = false) => {
  const children = [];

  for (const item of list) {
    if (item.parentCode === parentCode) {
      let config;
      try {
        // value1이 null이거나 비어있으면 파싱 시도 하지 않음
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
        continue; // 파싱 실패 시 건너뜀
      }

      const node = {
        ...config,
        id: config.id || item.code // id가 없으면 code로 대체
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
        // '단순 링크' (componentPath도, children도 없는 경우)는 무시
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

// 데이터 처리 헬퍼 함수
const processMenuData = (menuData, routeData) => {
  // API 응답 원본 가공
  const parseItem = (dto) => ({
    ...dto,
    parentCode: dto.value2, // 계층 구조를 위한 부모 코드
    sortOrder: dto.sortOrder || 0
  });

  const allMenus = menuData.map(parseItem).sort((a, b) => a.sortOrder - b.sortOrder);

  // 라우트 ID 중복 제거 로직
  const allItemsMap = new Map();
  allMenus.forEach((item) => allItemsMap.set(item.code, item));
  routeData.map(parseItem).forEach((item) => allItemsMap.set(item.code, item));
  const allRoutes = Array.from(allItemsMap.values()).sort((a, b) => a.sortOrder - b.sortOrder);

  // 메뉴 아이템 생성 (Breadcrumbs, MenuList용)
  const rootMenuDto = allMenus.find((item) => item.code === 'MN1');

  let menuItems;
  if (rootMenuDto) {
    let rootMenuNode;
    try {
      rootMenuNode = JSON.parse(rootMenuDto.value1);
    } catch (e) {
      console.error(`[MenuContext] 루트 메뉴('MN1') 파싱에 실패했습니다.`, e);
      rootMenuNode = {};
    }

    rootMenuNode.children = buildTree(allMenus, 'MN1', false);
    rootMenuNode.icon = getIcon(rootMenuNode.icon);
    menuItems = { items: [rootMenuNode] };
  } else {
    console.error(`[MenuContext] 루트 메뉴('MN1')를 찾을 수 없습니다.`);
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

  return { menuItems, dynamicMainRoutes };
};

// 3. MenuProvider 컴포넌트
export const MenuProvider = ({ children }) => {
  const [menuItems, setMenuItems] = useState(null);
  const [dynamicMainRoutes, setDynamicMainRoutes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        setLoading(true);
        const [menuData, routeData] = await Promise.all([codeAPI.getAllCodeWithoutRoot('MN'), codeAPI.getAllCodeWithoutRoot('RO')]);

        if (!menuData || !routeData) {
          throw new Error('메뉴 또는 라우트 데이터를 가져오는데 실패했습니다.');
        }

        const { menuItems, dynamicMainRoutes } = processMenuData(menuData, routeData);

        setMenuItems(menuItems);
        setDynamicMainRoutes(dynamicMainRoutes);
      } catch (err) {
        console.error('메뉴 데이터 로드 중 오류 발생:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();
  }, []);

  // useMemo로 컨텍스트 값 최적화
  const value = useMemo(
    () => ({
      menuItems,
      dynamicMainRoutes,
      loading,
      error
    }),
    [menuItems, dynamicMainRoutes, loading, error]
  );

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
};

// useMenu 커스텀 훅
export const useMenu = () => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenu는 MenuProvider 내에서 사용해야 합니다.');
  }
  return context;
};