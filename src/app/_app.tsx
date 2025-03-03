// pages/_app.tsx
import { EventProvider } from '@/app/context/eventContext';

import { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <EventProvider>
      <Component {...pageProps} />
    </EventProvider>
  );
}