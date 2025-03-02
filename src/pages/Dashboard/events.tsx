import EventsHeader from "@/components/Events/Header";
import EventsList from "@/components/Events/List";
import Sidebar from "@/components/sidebar";
import React, { useEffect, useState } from "react";
import "@/styles/globals.css";
import { fetchEvents } from "@/utils/listEvents";

export default function Events() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const getEvents = async () => {
      const fetchedEvents = await fetchEvents();
      // If API returns an object with items, use:
      // setEvents(fetchedEvents.items);
      setEvents(fetchedEvents);
    };
    getEvents();
  }, []);

  return (
    <div className="pl-20">
      <Sidebar />
      <EventsHeader />
      <EventsList events={events} /> 
    </div>
  );
}
