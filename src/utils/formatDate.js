import { formatDistanceToNow, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

/**
 * ISO 8601 형식의 날짜 문자열을 "N분 전", "N시간 전" 등으로 변환합니다.
 * @param {string} isoDate - ISO 8601 형식의 날짜 문자열
 * @returns {string} - 변환된 상대 시간 문자열 (e.g., "5분 전")
 */
export const formatRelativeTime = (isoDate) => {
  // isoDate 값이 유효하지 않은 경우 빈 문자열 반환
  if (!isoDate) {
    return '';
  }

  try {
    const date = parseISO(isoDate);
    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: ko
    });
  } catch (error) {
    console.error('Invalid date string provided:', isoDate, error);
    return isoDate; // 오류 발생 시 원본 문자열 반환
  }
};