"use client"
import type { NextPage } from 'next';
import Welcome from './components/welcome';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';


const Home: NextPage = () => {
  const router = useRouter();

  useEffect(() => {
    if (window.innerWidth <= 768) {
      router.replace("/unsupported");
    }
  }, [router]);

  return (
    <>
      <main>
    
        <Welcome/>
      </main>
    </>
  );
};

export default Home;
