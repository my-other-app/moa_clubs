'use client';

import Navbar from '@/components/navbar'; 
import Events from './Dashboard/events';
import HackathonDashboard from './Dashboard/dashScreen';

export default function Home() {
  return (
    <ul>
      <li>
      <Navbar />
       <HackathonDashboard />
      </li>
    </ul>
  );
}
