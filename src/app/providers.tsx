"use client"; // important so we can use client-side hooks/context

import { ReactNode } from "react";
import { EventProvider } from "@/app/context/eventContext";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <EventProvider>
      {children}
    </EventProvider>
  );
}
