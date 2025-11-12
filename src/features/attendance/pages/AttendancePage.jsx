import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import AttendanceBasicCard from '../components/chart-data/AttendanceBasicCard';
import AttendanceScheduleCard from '../components/AttendanceScheduleCard';
import AttendanceWeekViewCard from '../components/AttendanceWeekViewCard';
import AttendanceSummaryCard from '../components/AttendanceSummaryCard';

export default function Dashboard() {
  const [isLoading, setLoading] = useState(true);
  useEffect(() => setLoading(false), []);

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/*  근태 카드 + 일정 카드 */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: 2,
          alignItems: 'stretch'
        }}
      >
        {/* 왼쪽 근태 카드 */}
        <Box sx={{ flex: 7 }}>
          <AttendanceBasicCard isLoading={isLoading} />
        </Box>

        {/* 오른쪽 일정 카드 */}
        <Box sx={{ flex: 3 }}>
          <AttendanceScheduleCard />
        </Box>
      </Box>

      {/*  주간 근무 현황 */}
      <Box>
        <AttendanceWeekViewCard />
      </Box>

      {/* 전체 근무 내역 */}
      <Box>
        <AttendanceSummaryCard />
      </Box>
    </Box>
  );
}
