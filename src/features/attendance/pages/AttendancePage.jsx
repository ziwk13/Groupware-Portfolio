import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import AttendanceBasicCard from 'features/attendance/components/chart-data/AttendanceBasicCard';
import AttendanceScheduleCard from 'features/attendance/components/AttendanceScheduleCard';
import AttendanceWeekViewCard from 'features/attendance/components/AttendanceWeekViewCard';
import AttendanceSummaryCard from 'features/attendance/components/AttendanceSummaryCard';

export default function Dashboard() {
  const [isLoading, setLoading] = useState(true);
  useEffect(() => setLoading(false), []);

  return (
    // ✨ 모든 섹션(Box) 사이에 일정한 수직 간격(gap: 3)을 적용합니다.
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* 근태 카드 + 일정 카드 */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          // 왼쪽 근태 카드와 오른쪽 일정 카드 사이의 수평 간격입니다.
          gap: 2,
          alignItems: 'stretch'
        }}
      >
        {/* 왼쪽 근태 카드 */}
        <Box sx={{ flex: 7 }}>
          <AttendanceBasicCard isLoading={isLoading} />
        </Box>

        {/* 오른쪽 일정 카드 */}
        <Box sx={{ flex: 3, minHeight: 0 }}>
          <AttendanceScheduleCard />
        </Box>
      </Box>

      <Box>
        <AttendanceWeekViewCard />
      </Box>

      <Box>
        <AttendanceSummaryCard />
      </Box>
    </Box>
  );
}
