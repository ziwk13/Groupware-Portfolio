import React from 'react'
import WorkLogDetail from '../components/WorkLogDetail'
import { useParams } from 'react-router-dom';

function WorkLogDetailPage() {
	const {worklogId} = useParams();
	return (
		<WorkLogDetail worklogId={worklogId}/>
	)
}

export default WorkLogDetailPage