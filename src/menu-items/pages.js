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
  IconCalendar,
  IconCode
} from '@tabler/icons-react';

import IconBadge from '@mui/icons-material/Badge';
import CoPresentIcon from '@mui/icons-material/CoPresent';

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
  IconBadge,
  IconCode
};

// ==============================|| EXTRA PAGES MENU ITEMS ||============================== //

const pages = {
  id: 'pages',
  title: '메뉴',
  icon: icons.IconKey,
  type: 'group',
  children: [
    {
      id: 'code',
      title: '코드관리',
      type: 'item',
      icon: icons.IconCode,
      url: '/code',
      admin: true
    },
    {
      id: 'attendance',

      id: 'organization',
      title: '인사관리',
      type: 'item',
      icon: icons.IconBadge,
      url: '/organization',
      admin: true
    },
    {
      id: 'attendance',
      title: '근태관리',
      type: 'item',
      icon: CoPresentIcon,
      url: '/attendance'
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
          url: '/mail/list/INBOX',
          target: false
        },
        {
          id: 'mail-sent',
          title: '보낸메일함',
          type: 'item',
          url: '/mail/list/SENT',
          target: false
        },
        {
          id: 'mail-my',
          title: '개인보관함',
          type: 'item',
          url: '/mail/list/MYBOX',
          target: false
        },
        {
          id: 'mail-trash',
          title: '휴지통',
          type: 'item',
          url: '/mail/list/TRASH',
          target: false
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
          url: '/worklog/list/all',
          target: false
        },
        {
          id: 'worklog-department',
          title: '부서업무일지',
          type: 'item',
          url: '/worklog/list/dept',
          target: false
        },
        {
          id: 'worklog-personal',
          title: '나의업무일지',
          type: 'item',
          url: '/worklog/list/my',
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
