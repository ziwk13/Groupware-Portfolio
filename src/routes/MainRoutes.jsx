import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';
import AuthGuard from 'utils/route-guard/AuthGuard';

// sample page routing
const AddApprovalPage = Loadable(lazy(() => import('features/approval/pages/AddApprovalPage')));
const ApprovalListPage = Loadable(lazy(() => import('features/approval/pages/ApprovalListPage')));
const MyPage = Loadable(lazy(() => import('features/mypage/pages/MyInfoPage')));
const SchedulePage = Loadable(lazy(() => import('features/schedule/pages/SchedulePage')));
const AttendancePage = Loadable(lazy(() => import('features/attendance/pages/AttendancePage')));

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
      path: '/approval',
      children: [
        {
          path: 'form',
          element: <AddApprovalPage />
        },
        {
          path: 'list/:status',
          element: <ApprovalListPage />
        },
        {
          path: 'detail'
          // element: <ApprovalDetail />
        }
      ]
    },
    {
      path: '/mypage',
      element: <MyPage />
    },
    {
      path: '/schedule',
      element: <SchedulePage />
    },
    {
      path: '/attendance',
      element: <AttendancePage />
    }
  ]
};

export default MainRoutes;
