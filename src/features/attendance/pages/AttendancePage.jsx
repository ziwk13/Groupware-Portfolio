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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: 2,
          alignItems: 'stretch'
        }}
      >
        {/* 근태 카드 */}
        <Box sx={{ flex: 7 }}>
          <AttendanceBasicCard isLoading={isLoading} />
        </Box>

        {/* 일정 카드 */}
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
