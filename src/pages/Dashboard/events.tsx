import EventsHeader from '@/components/Events/Header'
import EventsList from '@/components/Events/List'
import Sidebar from '@/components/sidebar'
import React from 'react'



export default function Events() {

  
  return (
    <div className='pl-20'>
        <Sidebar />
        <EventsHeader />
        <EventsList />
    </div>
  )
}
