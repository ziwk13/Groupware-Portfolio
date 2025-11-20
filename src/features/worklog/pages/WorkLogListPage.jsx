import React from 'react'
import { useParams } from 'react-router'
import WorkLogList from '../components/WorkLogList';


function WorkLogListPage() {
	const {type} = useParams();
	return (
		<WorkLogList workLogListType={type}/>
	)
}

export default WorkLogListPage