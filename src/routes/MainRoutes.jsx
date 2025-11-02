import { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';
import AuthGuard from 'utils/route-guard/AuthGuard';

// sample page routing
const SamplePage = Loadable(lazy(() => import('views/sample-page')));
const AddApprovalPage = Loadable(lazy(() => import('features/approval/pages/AddApprovalPage')));
const ApprovalListPage = Loadable(lazy(() => import('features/approval/pages/ApprovalListPage')));
const MyPage = Loadable(lazy(() => import('features/mypage/pages/MyInfoPage')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: (
    <AuthGuard>
      <MainLayout />
    </AuthGuard>
  ),
  children: [
    {
      path: '/sample-page',
      element: <SamplePage />
    },
    {
      path: '/approval',
      children: [
        {
          path: 'form',
          element: <AddApprovalPage />
        },{
          path: 'list/:status',
          element: <ApprovalListPage />
        },{
          path: 'detail',
          // element: <ApprovalDetail />
        },
      ]
    },{
      path: '/mypage',
      element: <MyPage />
    },

  ]
};

export default MainRoutes;
