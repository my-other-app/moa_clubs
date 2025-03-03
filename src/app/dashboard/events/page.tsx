"use client"
import EventsHeader from "@/app/components/Events/Header";
import EventsList from "@/app/components/Events/List";
import Sidebar from "@/app/components/sidebar";
import React, { useEffect, useState } from "react";
import { fetchEvents } from "@/app/utils/listEvents";

export default function Events() {
  const [events, setEvents] = useState([]);
  

  useEffect(() => {
    const getEvents = async () => {
      const fetchedEvents = await fetchEvents();
      // If API returns an object with items, use:
       setEvents(fetchedEvents);
    };
    getEvents();
  }, []);

  return (
    <div className="pl-20">
      <Sidebar />
      <EventsHeader  />
      <EventsList events={events} /> 
    </div>
  );
}
