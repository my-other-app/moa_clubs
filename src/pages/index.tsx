'use client';

import Link from 'next/link'
import Welcome from '@/components/navbar'; 

export default function Home() {
  return (
    <ul>
      <li>
      <Welcome />
      </li>
    </ul>
  );
}
