"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { storage } from "@/app/services/auth.service";

// Additional detail type
export type AdditionalDetail = {
  question: string;
  answer: string;
};

// Speaker/Guest type
export type EventSpeaker = {
  name: string;
  designation: string;
  photo_url?: string;
};

// Event data type
export type EventData = {
  name: string;
  poster: File | string;
  event_datetime: string;
  has_fee: boolean;
  reg_fee: number | null;
  duration: number;
  location_name: string | null;
  has_prize: boolean;
  prize_amount: number | null;
  is_online: boolean;
  reg_startdate: string;
  reg_enddate: string | null;
  about: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  url: string | null;
  category_id: number;
  interest_ids: string | null;
  max_participants: number | null;
  additional_details: AdditionalDetail[];
  event_guidelines: string | null;
  event_tag: string | null;
  speakers: EventSpeaker[];
};

type EventContextType = {
  eventData: EventData | null;
  setEventData: (data: EventData) => void;
  submitEvent: (data?: EventData) => Promise<unknown>;
};

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider = ({ children }: { children: ReactNode }) => {
  const [eventData, setEventData] = useState<EventData | null>(null);

  const submitEvent = async (data?: EventData) => {
    const currentData = data || eventData;
    if (!currentData) {
      throw new Error("No event data available");
    }

    const formData = new FormData();
    formData.append("name", currentData.name);
    formData.append("poster", currentData.poster);
    formData.append("event_datetime", currentData.event_datetime);
    formData.append("has_fee", currentData.has_fee.toString());
    formData.append("reg_fee", currentData.reg_fee !== null ? currentData.reg_fee.toString() : "");
    formData.append("duration", currentData.duration.toString());
    formData.append("location_name", currentData.location_name || "");
    formData.append("has_prize", currentData.has_prize.toString());
    formData.append("prize_amount", currentData.prize_amount !== null ? currentData.prize_amount.toString() : "");
    formData.append("is_online", currentData.is_online.toString());
    formData.append("reg_startdate", currentData.reg_startdate);
    formData.append("reg_enddate", currentData.reg_enddate || "");
    formData.append("about", currentData.about || "");
    formData.append("contact_phone", currentData.contact_phone || "");
    formData.append("contact_email", currentData.contact_email || "");
    formData.append("url", currentData.url || "");
    formData.append("category_id", currentData.category_id.toString());
    formData.append("interest_ids", currentData.interest_ids || "");
    formData.append("max_participants", currentData.max_participants !== null ? currentData.max_participants.toString() : "");
    formData.append("additional_details", JSON.stringify(currentData.additional_details || []));
    formData.append("event_guidelines", currentData.event_guidelines || "");
    formData.append("event_tag", currentData.event_tag || "");
    formData.append("speakers", JSON.stringify(currentData.speakers || []));

    const token = storage.getAccessToken();
    if (!token) {
      throw new Error("No access token available");
    }

    const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!API_BASE) {
      throw new Error("API base URL is not defined");
    }

    const response = await fetch(`${API_BASE}/api/v1/events/create`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to create event");
    }

    return response.json();
  };

  return (
    <EventContext.Provider value={{ eventData, setEventData, submitEvent }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvent = () => {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error("useEvent must be used within an EventProvider");
  }
  return context;
};
