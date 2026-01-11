"use client";

import { useState, useEffect, useCallback } from "react";
import EventsHeader from "@/app/components/Events/Header";
import EventsList from "@/app/components/Events/List";
import Sidebar from "@/app/components/sidebar";
import { fetchEvents } from "@/app/utils/listEvents";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Button } from "@/components/ui/button";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState("live");
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);

  // Memoized fetch function to fix React hooks warning
  const getEvents = useCallback(async () => {
    setLoading(true);
    const fetchedEvents = await fetchEvents(limit);
    setEvents(fetchedEvents);
    setLoading(false);
  }, [limit]);

  // Re-fetch events whenever the limit changes
  useEffect(() => {
    getEvents();
  }, [getEvents]);

  // Increase the limit by 10 on "Show More" click
  const handleShowMore = () => {
    setLimit(prev => prev + 10);
  };

  return (
    <div className="pl-20">
      <Sidebar />
      <EventsHeader activeTab={activeTab} onTabChange={setActiveTab} />
      {events.length === 0 && !loading ? (
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
      <div className="flex justify-center mt-8">
        <Button
          variant="outline"
          onClick={handleShowMore}
          className="w-60 h-[60px] px-[50px] py-[15px] bg-white rounded-lg border border-[#2c333d]"
        >
          <span className="text-center text-[#2c333d] text-2xl font-normal font-['Bebas_Neue']">
            {loading ? "Loading..." : "Show More"}
          </span>
        </Button>
      </div>
    </div>
  );
}
