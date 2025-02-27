'use client';

import Navbar from '@/components/navbar'; 
import Events from './Dashboard/events';

export default function Home() {
  return (
    <ul>
      <li>
      <Navbar />
       <Events />
      </li>
    </ul>
  );
}
