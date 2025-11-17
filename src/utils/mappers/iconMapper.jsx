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
  IconCode,
  CoPresentIcon
};

/**
 * DB에서 받은 아이콘 문자열을 실제 아이콘 컴포넌트로 매핑.
 * @param {string} iconName - DB (value1)에 저장된 아이콘 이름 (예: "IconCode")
 * @returns {React.ComponentType | null} - 매핑된 아이콘 컴포넌트
 */
export const getIcon = (iconName) => {
  if (!iconName) {
    return null;
  }
  return icons[iconName] || null;
};

// 전체 아이콘 맵 (필요시 사용)
export const iconMapper = icons;