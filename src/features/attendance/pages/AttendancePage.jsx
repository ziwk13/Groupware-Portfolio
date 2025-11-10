import { useEffect, useState } from 'react';

// material-ui
import Grid from '@mui/material/Grid';

// project imports
import AttendanceBasicCard from '../components/chart-data/AttendanceBasicCard';
import AttendanceSummaryCard from '../components/AttendanceSummaryCard';

import { gridSpacing } from 'store/constant';

// ==============================|| DEFAULT DASHBOARD ||============================== //

export default function Dashboard() {
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <Grid container spacing={gridSpacing}>
      <Grid size={12}>
        <Grid container spacing={gridSpacing}>
          <Grid size={{ xs: 12, md: 12 }}>
            <AttendanceBasicCard isLoading={isLoading} />
            <AttendanceSummaryCard />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}></Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
