import { createContext, useContext, useState, ReactNode } from "react";

export type EventData = {
  name: string;
  poster: File;
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
 // club_id: number | null;
  interest_ids: string | null;
  max_participants: number | null;
  additional_details: string | null;
  event_guidelines: string | null;
};

type EventContextType = {
  eventData: EventData | null;
  setEventData: (data: EventData) => void;
  submitEvent: () => Promise<any>;
};

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider = ({ children }: { children: ReactNode }) => {
  const [eventData, setEventData] = useState<EventData | null>(null);

  const submitEvent = async () => {
    if (!eventData) {
      throw new Error("No event data available");
    }
    const formData = new FormData();
    formData.append("name", eventData.name);
    formData.append("poster", eventData.poster);
    formData.append("event_datetime", eventData.event_datetime);
    formData.append("has_fee", eventData.has_fee.toString());
    formData.append("reg_fee", eventData.reg_fee !== null ? eventData.reg_fee.toString() : "");
    formData.append("duration", eventData.duration.toString());
    formData.append("location_name", eventData.location_name || "");
    formData.append("has_prize", eventData.has_prize.toString());
    formData.append("prize_amount", eventData.prize_amount !== null ? eventData.prize_amount.toString() : "");
    formData.append("is_online", eventData.is_online.toString());
    formData.append("reg_startdate", eventData.reg_startdate);
    formData.append("reg_enddate", eventData.reg_enddate || "");
    formData.append("about", eventData.about || "");
    formData.append("contact_phone", eventData.contact_phone || "");
    formData.append("contact_email", eventData.contact_email || "");
    formData.append("url", eventData.url || "");
    formData.append("category_id", eventData.category_id.toString());
   // formData.append("club_id", eventData.club_id !== null ? eventData.club_id.toString() : "");
    formData.append("interest_ids", eventData.interest_ids || "");
    formData.append("max_participants", eventData.max_participants !== null ? eventData.max_participants.toString() : "");
    formData.append("additional_details", eventData.additional_details || "");
    formData.append("event_guidelines", eventData.event_guidelines || "");

    const token = localStorage.getItem("accessToken");
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
    try {
      const response = await fetch(`${API_BASE}/api/v1/events/create`, {
        method: "POST",
        headers: {
          // Let the browser set the Content-Type when using FormData
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Failed to create event");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error creating event:", error);
      throw error;
    }
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
