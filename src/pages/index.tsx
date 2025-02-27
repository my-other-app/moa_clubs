'use client';

import Link from 'next/link'
import Welcome from './Register/socialMediaDetails'; 

export default function Home() {
  return (
    <ul>
      <li>
      <Welcome />
      </li>
    </ul>
  );
}
