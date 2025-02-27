import EventsHeader from '@/components/Events/Header'
import EventsList from '@/components/Events/List'
import React from 'react'
import { useNavigate } from '@/utils/navigation';


export default function Events() {

  
  return (
    <div className='pl-20'>
        <EventsHeader />
        <EventsList />
    </div>
  )
}
