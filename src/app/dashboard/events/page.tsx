"use client";
import { useState, useEffect } from "react";
import EventsHeader from "@/app/components/Events/Header";
import EventsList from "@/app/components/Events/List";
import Sidebar from "@/app/components/sidebar";
import { fetchEvents } from "@/app/utils/listEvents";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState("live");

  useEffect(() => {
    const getEvents = async () => {
      const fetchedEvents = await fetchEvents();
      setEvents(fetchedEvents);
    };
    getEvents();
  }, []);

  return (
    <div className="pl-20">
      <Sidebar />
      <EventsHeader activeTab={activeTab} onTabChange={setActiveTab} />
      {events.length === 0 ? (
        <div className="space-y-2 mx-6">
          <Skeleton width="80%" height={80} />
          <Skeleton width="95%" height={30} />
          <Skeleton width="90%" height={80} />
          <Skeleton width="85%" height={40} />
          <Skeleton width="70%" height={50} />
          <Skeleton width="90%" height={60} />
          <Skeleton width="60%" height={40} />
          <Skeleton width="40%" height={80} />
        </div>
      ) : (
        <EventsList events={events} activeTab={activeTab} />
      )}
    </div>
  );
}
