import type { NextPage } from 'next';
import Head from 'next/head';
import Welcome from './register/welcome';


const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>MyOtherApp</title>
        <meta name="description" content="My Other App Description" />
      </Head>
      <main>
    
        <Welcome/>
      </main>
    </>
  );
};

export default Home;
