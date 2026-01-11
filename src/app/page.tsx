"use client";

import Welcome from './components/welcome';

export default function Home() {
  // Note: Mobile redirect is handled by middleware.ts
  // No need for duplicate client-side redirect

  return (
    <main>
      <Welcome />
    </main>
  );
}
