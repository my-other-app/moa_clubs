// src/context/eventContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";

export interface EventData {
  name: string;
  category_id: string;
  max_participants: number;
  about: string;
  duration: number;
  event_datetime: string;
  reg_enddate: string;
  is_online: boolean;
  location_name: string;
  url: string;
  reg_fee: number;
  prize_amount: number;
  event_guidelines: string;
  poster: File;
  has_fee: boolean;
  has_prize: boolean;
}

interface EventContextType {
  eventData: EventData | null;
  setEventData: (data: EventData) => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider = ({ children }: { children: ReactNode }) => {
  const [eventData, setEventData] = useState<EventData | null>(null);
  return (
    <EventContext.Provider value={{ eventData, setEventData }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvent = (): EventContextType => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error("useEvent must be used within an EventProvider");
  }
  return context;
};
