import React from 'react'
import WorkLogWrite from '../components/WorkLogWrite'
import {useParams} from 'react-router';

function WorkLogWritePage() {
	const {worklogId} = useParams();
	return (
		<WorkLogWrite worklogId={worklogId}/>
	)
}

export default WorkLogWritePage