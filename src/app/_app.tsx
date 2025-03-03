// pages/_app.tsx
import type { AppProps } from "next/app";
import { EventProvider } from "@/app/context/eventContext";
import "@/styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <EventProvider>
      <Component {...pageProps} />
    </EventProvider>
  );
}

export default MyApp;
