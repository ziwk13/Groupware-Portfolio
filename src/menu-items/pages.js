// assets
import { IconKey, IconReceipt2, IconBug, IconBellRinging, IconPhoneCall, IconQuestionMark, IconShieldLock } from '@tabler/icons-react';

// constant
const icons = {
  IconKey,
  IconReceipt2,
  IconBug,
  IconBellRinging,
  IconPhoneCall,
  IconQuestionMark,
  IconShieldLock
};

// ==============================|| EXTRA PAGES MENU ITEMS ||============================== //

const pages = {
  id: 'pages',
  title: '메뉴',
  icon: icons.IconKey,
  type: 'group',
  children: [
    {
      id: 'gntaegwanry',
      title: '근태관리',
      type: 'collapse',
      icon: icons.IconBug,
      children: [
        {
          id: 'error',
          title: 'error-404',
          type: 'item',
          url: '/pages/error',
          target: true
        },
        {
          id: '500',
          title: 'error-500',
          type: 'item',
          url: '/pages/500',
          target: true
        }
      ]
    },{
      id: 'calendar',
      title: '캘린더',
      type: 'collapse',
      icon: icons.IconBug,
      children: [
        {
          id: 'error',
          title: 'error-404',
          type: 'item',
          url: '/pages/error',
          target: true
        },
        {
          id: '500',
          title: 'error-500',
          type: 'item',
          url: '/pages/500',
          target: true
        }
      ]
    }, {
      id: 'mailham',
      title: '메일함',
      type: 'collapse',
      icon: icons.IconBug,
      children: [
        {
          id: 'error',
          title: 'error-404',
          type: 'item',
          url: '/pages/error',
          target: true
        },
        {
          id: '500',
          title: 'error-500',
          type: 'item',
          url: '/pages/500',
          target: true
        }
      ]
    }, {
      id: 'upmoo1g',
      title: '업무일지',
      type: 'collapse',
      icon: icons.IconBug,
      children: [
        {
          id: 'error',
          title: 'error-404',
          type: 'item',
          url: '/pages/error',
          target: true
        },
        {
          id: '500',
          title: 'error-500',
          type: 'item',
          url: '/pages/500',
          target: true
        }
      ]
    }, {
      id: 'approval',
      title: '전자결재',
      type: 'collapse',
      icon: icons.IconBug,
      children: [
        {
          id: 'insert',
          title: '결재 작성',
          type: 'item',
          url: '/pages/error',
          target: true
        },{
          id: 'view1',
          title: '결재 대기',
          type: 'item',
          url: '/pages/error',
          target: true
        },{
          id: 'view2',
          title: '결재 기안',
          type: 'item',
          url: '/pages/error',
          target: true
        },{
          id: 'view3',
          title: '결재 완료',
          type: 'item',
          url: '/pages/error',
          target: true
        },{
          id: 'view4',
          title: '결재 참조',
          type: 'item',
          url: '/pages/error',
          target: true
        },

      ]
    }

  ]
};

export default pages;
