import React from 'react'
import MailWrite from '../components/MailWrite'
import { useParams } from 'react-router'

function MailWritePage() {
  const {mailId} = useParams();
  return (
    <MailWrite mailId={mailId}/>
  )
}

export default MailWritePage