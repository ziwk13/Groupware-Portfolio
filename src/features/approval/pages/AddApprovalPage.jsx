// material-ui

// project imports
import AddApproval from '../components/AddApproval';

// ==============================|| ADD NEW BLOG PAGE ||============================== //

export default function AddApprovalPage({ readOnly = false, initialData = null }) {
  return <AddApproval readOnly={readOnly} initialData={initialData} />;
}
