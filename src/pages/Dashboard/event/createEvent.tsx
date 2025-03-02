// pages/create-event.tsx
"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import axios from "axios";
import Image from "next/image";
import Sidebar from "@/components/sidebar"; // adjust path if needed
import { useRouter } from "next/router";
import { useEvent, EventData } from "@/context/eventContext";

type Category = {
  id: string;
  name: string;
};

export default function CreateEvent() {
  const router = useRouter();
  const { setEventData } = useEvent();

  const [eventPoster, setEventPoster] = useState<File | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [eventTitle, setEventTitle] = useState<string>("");
  const [eventSeats, setEventSeats] = useState<string>("");
  const [eventDescription, setEventDescription] = useState<string>("");
  const [eventDate, setEventDate] = useState<string>("");
  const [eventStartTime, setEventStartTime] = useState<string>("");
  const [eventDuration, setEventDuration] = useState<number>(0);
  const [eventRegistrationClosingDate, setEventRegistrationClosingDate] = useState<string>("");
  const [eventRegistrationClosingTime, setEventRegistrationClosingTime] = useState<string>("");
  const [eventMode, setEventMode] = useState<boolean>(false);
  const [eventLocation, setEventLocation] = useState<string>("");
  const [eventMeetLink, setEventMeetLink] = useState<string>("");
  const [eventFee, setEventFee] = useState<number>(0);
  const [eventPerks, setEventPerks] = useState<string>("");
  const [eventGuidelines, setEventGuidelines] = useState<string>("");

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(`${API_BASE_URL}/api/v1/events/categories/list`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        window.alert("Failed to fetch categories. Please try again later.");
      }
    };
    fetchCategories();
  }, [API_BASE_URL]);

  const handlePosterUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEventPoster(file);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (
      !eventTitle ||
      !eventPoster ||
      !selectedCategory ||
      !eventSeats ||
      !eventDescription ||
      !eventDate ||
      !eventStartTime ||
      !eventDuration ||
      !eventRegistrationClosingDate ||
      !eventRegistrationClosingTime
    ) {
      window.alert("Please fill in all required fields.");
      return;
    }

    const eventDatetime = `${eventRegistrationClosingDate}T${eventRegistrationClosingTime}:00`;

    const eventDataToPass: EventData = {
      name: eventTitle,
      category_id: selectedCategory,
      max_participants: parseInt(eventSeats, 10),
      about: eventDescription,
      duration: eventDuration,
      event_datetime: eventDatetime,
      is_online: eventMode,
      location_name: eventLocation,
      url: eventMeetLink,
      reg_fee: eventFee,
      prize_amount: parseInt(eventPerks, 10),
      event_guidelines: eventGuidelines,
      poster: eventPoster,
      has_fee: true,
      has_prize: true,
      reg_enddate: eventRegistrationClosingDate,
    
    };

    // Save event data in context
    setEventData(eventDataToPass);
    // Navigate to the edit event page (which adds registration questions)
    router.push("/dashboard/event/editEvent");
  };

  return (
    <>
      <Sidebar />
      <div className="max-w-4xl mx-auto p-6 rounded-lg font-sans">
        <h1 className="text-3xl font-bold mb-6">CREATE NEW EVENT</h1>
        <form onSubmit={handleSubmit}>
          <h2 className="text-lg font-semibold">BASIC INFORMATION</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex flex-col">
                <h3>Event Title</h3>
                <input
                  type="text"
                  placeholder="Enter Your Event Title"
                  className="p-2 border rounded"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                />
              </div>
              <div className="flex flex-col">
                <h3>Event Category</h3>
                <select
                  className="p-2 border rounded"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">Choose Event Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <h3>Event Seats</h3>
                <input
                  type="text"
                  placeholder="Enter the available seats for the event"
                  className="p-2 border rounded"
                  value={eventSeats}
                  onChange={(e) => setEventSeats(e.target.value)}
                />
              </div>
            </div>
            <div>
              <div className="flex flex-col">
                <h3>Event Description</h3>
                <textarea
                  placeholder="Enter Event Description"
                  className="p-2 border rounded"
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                ></textarea>
              </div>
              <div className="flex flex-col items-center">
                <label htmlFor="eventPoster" className="p-2 rounded cursor-pointer flex items-center justify-center">
                  {eventPoster ? (
                    <Image
                      src={URL.createObjectURL(eventPoster)}
                      width={100}
                      height={100}
                      alt="Event Poster"
                      className="w-50 aspect-square h-50 object-cover rounded"
                    />
                  ) : (
                    <div>
                      {/* SVG placeholder */}
                      <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="0.25" y="0.25" width="99.5" height="99.5" rx="49.75" fill="#F3F3F3" />
                        <rect x="0.25" y="0.25" width="99.5" height="99.5" rx="49.75" stroke="#979797" strokeWidth="0.5" />
                        <path
                          d="M51 32H41.6C38.2397 32 36.5595 32 35.2761 32.654C34.1471 33.2292 33.2292 34.1471 32.654 35.2761C32 36.5595 32 38.2397 32 41.6V58.4C32 61.7603 32 63.4405 32.654 64.7239C33.2292 65.8529 34.1471 66.7708 35.2761 67.346C36.5595 68 38.2397 68 41.6 68H60C61.8599 68 62.7899 68 63.5529 67.7956C65.6235 67.2408 67.2408 65.6235 67.7956 63.5529C68 62.7899 68 61.8599 68 60M64 42V30M58 36H70M47 43C47 45.2091 45.2091 47 43 47C40.7909 47 39 45.2091 39 43C39 40.7909 40.7909 39 43 39C45.2091 39 47 40.7909 47 43ZM55.9801 49.8363L39.0623 65.2161C38.1107 66.0812 37.6349 66.5137 37.5929 66.8884C37.5564 67.2132 37.6809 67.5353 37.9264 67.7511C38.2096 68 38.8526 68 40.1386 68H58.912C61.7903 68 63.2295 68 64.3598 67.5164C65.7789 66.9094 66.9094 65.7789 67.5164 64.3598C68 63.2295 68 61.7903 68 58.912C68 57.9435 68 57.4593 67.8941 57.0083C67.7611 56.4416 67.5059 55.9107 67.1465 55.4528C66.8605 55.0884 66.4824 54.7859 65.7261 54.1809L60.1317 49.7053C59.3748 49.0998 58.9963 48.7971 58.5796 48.6902C58.2123 48.596 57.8257 48.6082 57.4651 48.7254C57.0559 48.8583 56.6973 49.1843 55.9801 49.8363Z"
                          stroke="#979797"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  )}
                  <input id="eventPoster" type="file" accept="image/*" className="hidden" onChange={handlePosterUpload} />
                </label>
                <h3>Add Event Poster</h3>
              </div>
            </div>
          </div>
          <h2 className="text-lg font-semibold mt-6">DATE AND TIME</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col">
              <h3>Event date</h3>
              <input type="date" className="p-2 border rounded" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
            </div>
            <div className="flex flex-col">
              <h3>Event Start Time</h3>
              <input type="time" className="p-2 border rounded" value={eventStartTime} onChange={(e) => setEventStartTime(e.target.value)} />
            </div>
            <div className="flex flex-col">
              <h3>Event Duration</h3>
              <input type="number" placeholder="Choose Event Duration Hours" className="p-2 border rounded" value={eventDuration} onChange={(e) => setEventDuration(parseInt(e.target.value, 10))} />
            </div>
            <div className="flex flex-col">
              <h3>Event Registration Closing Date</h3>
              <input type="date" className="p-2 border rounded" value={eventRegistrationClosingDate} onChange={(e) => setEventRegistrationClosingDate(e.target.value)} />
            </div>
            <div className="flex flex-col">
              <h3>Event Registration Closing Time</h3>
              <input type="time" className="p-2 border rounded" value={eventRegistrationClosingTime} onChange={(e) => setEventRegistrationClosingTime(e.target.value)} />
            </div>
          </div>
          <h2 className="text-lg font-semibold mt-6">LOCATION AND MODE</h2>
          <div className="grid grid-cols-3 gap-4">
            <select className="p-2 border rounded" value={eventMode.toString()} onChange={(e) => setEventMode(e.target.value === "true")}>
              <option value="">Online/Offline</option>
              <option value="true">Online</option>
              <option value="false">Offline</option>
            </select>
            <input type="text" placeholder="Choose Event Location" className="p-2 border rounded" value={eventLocation} onChange={(e) => setEventLocation(e.target.value)} />
            <input type="url" placeholder="Enter Meet Link" className="p-2 border rounded" value={eventMeetLink} onChange={(e) => setEventMeetLink(e.target.value)} />
          </div>
          <h2 className="text-lg font-semibold mt-6">PERKS AND FEE</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3>Event Registration Fee</h3>
              <input type="number" placeholder="Enter The Fee" className="p-2 border rounded w-full" value={eventFee} onChange={(e) => setEventFee(parseInt(e.target.value, 10))} />
            </div>
            <div>
              <h3>Prize Worth</h3>
              <input type="text" placeholder="Enter The Prize Worth" className="p-2 border rounded w-full" value={eventPerks} onChange={(e) => setEventPerks(e.target.value)} />
            </div>
          </div>
          <textarea placeholder="Enter Event Guidelines" className="w-full p-2 border rounded mt-4" value={eventGuidelines} onChange={(e) => setEventGuidelines(e.target.value)}></textarea>
          <button type="submit" className="mt-4 w-full py-2 bg-black text-white rounded">
            CONTINUE
          </button>
        </form>
      </div>
    </>
  );
}
