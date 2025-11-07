// assets
import {
  IconClipboardList,
  IconMail,
  IconKey,
  IconReceipt2,
  IconBug,
  IconBellRinging,
  IconPhoneCall,
  IconQuestionMark,
  IconShieldLock,
  IconFileCheck,
  IconClipboardCheck,
  IconCalendar
} from '@tabler/icons-react';

import IconBadge from '@mui/icons-material/Badge';

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
  IconClipboardList,
  IconFileCheck,
  IconClipboardCheck,
  IconCalendar,
  IconBadge
};

// ==============================|| EXTRA PAGES MENU ITEMS ||============================== //

const pages = {
  id: 'pages',
  title: '메뉴',
  icon: icons.IconKey,
  type: 'group',
  children: [
    {
      id: 'organization',
      title: '인사관리',
      type: 'item',
      icon: icons.IconBadge,
      url: '/organization'
    },
    {
      id: 'gntaegwanry',
      title: '근태관리',
      type: 'item',
      icon: icons.IconBadge,
      url: '/attendance'
    },
    {
      id: 'calendar',
      title: '캘린더',
      type: 'item',
      icon: icons.IconCalendar,
      url: '/schedule'
    },
    {
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
    },
    {
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
    },
    {
      id: 'approval',
      title: '전자결재',
      type: 'collapse',
      icon: icons.IconClipboardCheck,
      children: [
        {
          id: 'insert',
          title: '결재 작성',
          type: 'item',
          url: '/approval/form',
          target: false
        },
        {
          id: 'approval-list-pending',
          title: '결재 대기 목록',
          type: 'item',
          url: '/approval/list/pending',
          target: false
        },
        {
          id: 'approval-list-draft',
          title: '결재 기안 목록',
          type: 'item',
          url: '/approval/list/draft',
          target: false
        },
        {
          id: 'approval-list-completed',
          title: '결재 완료 목록',
          type: 'item',
          url: '/approval/list/completed',
          target: false
        },
        {
          id: 'approval-list-reference',
          title: '결재 참조 목록',
          type: 'item',
          url: '/approval/list/reference',
          target: false
        }
      ]
    },
    {
      id: 'gaesipan',
      title: '게시판',
      type: 'collapse',
      icon: icons.IconBug,
      children: [
        {
          id: 'isNotification',
          title: '공지사항',
          type: 'item',
          url: '/pages/error',
          target: true
        },
        {
          id: 'freeBoard',
          title: '자유게시판',
          type: 'item',
          url: '/pages/500',
          target: true
        }
      ]
    }
  ]
};

export default pages;
