// assets
import { IconClipboardList, IconMail, IconKey, IconReceipt2, IconBug, IconBellRinging, IconPhoneCall, IconQuestionMark, IconShieldLock } from '@tabler/icons-react';

// constant
const icons = {
  IconKey,
  IconReceipt2,
  IconBug,
  IconBellRinging,
  IconPhoneCall,
  IconQuestionMark,
  IconShieldLock,
  IconMail,
  IconClipboardList
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
      id: 'mail',
      title: '메일함',
      type: 'collapse',
      icon: icons.IconMail,
      children: [
        {
          id: 'mail-inbox',
          title: '받은메일함',
          type: 'item',
          url: '/pages/error',
          target: true
        },
        {
          id: 'mail-sent',
          title: '보낸메일함',
          type: 'item',
          url: '/pages/500',
          target: true
        },
        {
          id: 'mail-my',
          title: '개인보관함',
          type: 'item',
          url: '/pages/500',
          target: true
        },
        {
          id: 'mail-trash',
          title: '휴지통',
          type: 'item',
          url: '/pages/500',
          target: true
        }
      ]
    }, {
      id: 'worklog',
      title: '업무일지',
      type: 'collapse',
      icon: icons.IconClipboardList,
      children: [
        {
          id: 'worklog-all',
          title: '전체업무일지',
          type: 'item',
          url: '/worklog/list',
          target: false
        },
        {
          id: 'worklog-department',
          title: '부서업무일지',
          type: 'item',
          url: '/worklog/list?type=department',
          target: false
        },
        {
          id: 'worklog-personal',
          title: '나의업무일지',
          type: 'item',
          url: '/worklog/list?type=personal',
          target: false
        }
      ]
    }

  ]
};

export default pages;
