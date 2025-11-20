import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { useMemo } from 'react';

// routing
import LoginRoutes from 'routes/LoginRoutes';
import AuthenticationRoutes from 'routes/AuthenticationRoutes';

// project imports
import Locales from 'ui-component/Locales';
import NavigationScroll from 'layout/NavigationScroll';
import Snackbar from 'ui-component/extended/Snackbar';
import Notistack from 'ui-component/third-party/Notistack';
import ThemeCustomization from 'themes';
import Loader from 'ui-component/Loader';

// auth provider
import { JWTProvider as AuthProvider } from 'contexts/JWTContext';
import { ChatProvider } from 'contexts/ChatContext';
import { StompProvider } from './contexts/StompProvider';
// import { FirebaseProvider as AuthProvider } from 'contexts/FirebaseContext';
// import { Auth0Provider as AuthProvider } from 'contexts/Auth0Context';
// import { AWSCognitoProvider as AuthProvider } from 'contexts/AWSCognitoContext';
// import { SupabseProvider as AuthProvider } from 'contexts/SupabaseContext';
// Menu Provider
import { MenuProvider, useMenu } from 'contexts/MenuContext';

// ==============================|| APP ROUTER ||============================== //

/**
 * MenuContext로부터 동적 라우트(dynamicMainRoutes)를 받아
 * 라우터(createBrowserRouter)를 생성하고 RouterProvider를 반환하는 컴포넌트
 */
const AppRouter = () => {
  const { dynamicMainRoutes, loading } = useMenu();

  const router = useMemo(() => {
    // 로딩 중이거나 데이터가 없으면 기본 라우트만 설정
    if (!dynamicMainRoutes) {
      return createBrowserRouter([LoginRoutes, AuthenticationRoutes], {
        basename: import.meta.env.VITE_APP_BASE_NAME
      });
    }

    // 데이터 로드 완료 시 MainRoutes를 포함하여 전체 라우터 생성
    return createBrowserRouter([LoginRoutes, dynamicMainRoutes, AuthenticationRoutes], {
      basename: import.meta.env.VITE_APP_BASE_NAME
    });
  }, [dynamicMainRoutes]); // dynamicMainRoutes가 준비되면 재실행

  // 메뉴 및 라우트 API가 로드될 때까지 전체 화면 로더 표시
  if (loading) {
    return <Loader />;
  }

  // 로드가 완료되면 생성된 라우터로 앱을 렌더링
  return <RouterProvider router={router} />;
};

// ==============================|| APP ||============================== //

export default function App() {
  return (
    <>
      <ThemeCustomization>
        <Locales>
          <NavigationScroll>
            <AuthProvider>
              <StompProvider>
                <ChatProvider>
                  <MenuProvider>
                    <>
                      <Notistack>
                        <AppRouter />
                        <Snackbar />
                      </Notistack>
                    </>
                  </MenuProvider>
                </ChatProvider>
              </StompProvider>
            </AuthProvider>
          </NavigationScroll>
        </Locales>
      </ThemeCustomization >
    </>
  );
}