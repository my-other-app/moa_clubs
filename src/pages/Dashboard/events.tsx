import EventsHeader from '@/components/Events/Header'
import EventsList from '@/components/Events/List'
import Sidebar from '@/components/sidebar'
import React from 'react'
import '@/styles/globals.css';



export default function Events() {

  
  return (
    <div className='pl-20'>
        <Sidebar />
        <EventsHeader />
        <EventsList />
    </div>
  )
}
