import React from 'react'
import { useParams } from 'react-router'
import MailList from '../components/MailList'

function MailListPage() {
	const {type} = useParams();
	return (
		<MailList mailboxType={type}/>
	)
}

export default MailListPage