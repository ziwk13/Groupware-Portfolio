import React from 'react'
import { useParams } from 'react-router'
import MailList from '../components/WorkLogList'


function WorkLogListPage() {
	const {type} = useParams();
	return (
		<MailList mailboxType={type}/>
	)
}

export default WorkLogListPage