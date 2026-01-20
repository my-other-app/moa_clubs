"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import Image from "next/image";
import Sidebar from "@/app/components/sidebar";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

type Category = {
  id: string;
  name: string;
};

export default function CreateEvent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("event_id");


  // State for event details
  const [eventPoster, setEventPoster] = useState<File | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [eventTitle, setEventTitle] = useState<string>("");
  const [eventSeats, setEventSeats] = useState<string>("");
  const [eventDescription, setEventDescription] = useState<string>("");
  const [eventDate, setEventDate] = useState<string>("");
  const [eventStartTime, setEventStartTime] = useState<string>("");
  const [eventDuration, setEventDuration] = useState<number | null>(null);
  const [eventRegistrationClosingDate, setEventRegistrationClosingDate] = useState<string>("");
  const [eventRegistrationClosingTime, setEventRegistrationClosingTime] = useState<string>("");

  // Change eventMode type to boolean or empty string to handle not-selected state.
  const [eventMode, setEventMode] = useState<boolean | "">("");
  const [eventLocation, setEventLocation] = useState<string>("");
  const [eventMeetLink, setEventMeetLink] = useState<string>("");
  const [eventFee, setEventFee] = useState<number>(0);
  const [eventPerks, setEventPerks] = useState<number>(0);
  const [eventGuidelines, setEventGuidelines] = useState<string>("");

  // State for warning message
  const [warningMessage, setWarningMessage] = useState<string>("");

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Fetch categories for the dropdown
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

  // Fetch event details and prepopulate the form if eventId exists
  useEffect(() => {
    if (!eventId) return;
    const fetchEventDetails = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          console.error("Access token not found");
          return;
        }
        const response = await axios.get(`${API_BASE_URL}/api/v1/events/info/${eventId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = response.data;
        setEventTitle(data.name || "");
        setEventDescription(data.about || "");
        setSelectedCategory(data.category ? parseInt(data.category.id, 10) : null);
        setEventSeats(data.max_participants ? data.max_participants.toString() : "");
        if (data.event_datetime) {
          const [datePart, timePart] = data.event_datetime.split("T");
          setEventDate(datePart);
          setEventStartTime(timePart.substring(0, 5));
        }
        setEventDuration(data.duration || null);
        if (data.reg_enddate) {
          const [regDate, regTime] = data.reg_enddate.split("T");
          setEventRegistrationClosingDate(regDate);
          setEventRegistrationClosingTime(regTime.substring(0, 5));
        }
        setEventMode(data.is_online);
        setEventLocation(data.location_name || "");
        setEventMeetLink(data.location_link || data.url || "");
        setEventFee(data.reg_fee || 0);
        setEventPerks(data.prize_amount || 0);
        setEventGuidelines(data.event_guidelines || "");
      } catch (error) {
        console.error("Error fetching event details:", error);
        window.alert("Failed to fetch event details. Please try again later.");
      }
    };
    fetchEventDetails();
  }, [API_BASE_URL, eventId]);

  const handlePosterUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEventPoster(file);
    }
  };

  // Define eventIntrestIds variable

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // Validate required fields (all except eventFee, eventPerks, and eventGuidelines)


    // Compose datetimes from separate date and time values
    const eventDatetime = `${eventDate}T${eventStartTime}:00`;
    const regEndDatetime = `${eventRegistrationClosingDate}T${eventRegistrationClosingTime}:00`;

    // Build FormData for multipart/form-data submission
    const formData = new FormData();







    const interest = [1, 2, 3] //replace this











    formData.append("name", eventTitle);
    if (selectedCategory !== null) {
      formData.append("category_id", selectedCategory.toString());
    } else {
      setWarningMessage("Please select a category.");
      return;
    }
    formData.append("max_participants", eventSeats);
    formData.append("about", eventDescription);
    if (eventDuration !== null) {
      formData.append("duration", eventDuration.toString());
    } else {
      setWarningMessage("Event duration is required.");
      return;
    }
    formData.append("event_datetime", eventDatetime);
    formData.append("is_online", (eventMode === true).toString());
    formData.append("location_name", eventLocation);
    formData.append("url", eventMeetLink);
    formData.append("reg_fee", eventFee.toString());
    formData.append("prize_amount", eventPerks.toString());
    formData.append("event_guidelines", eventGuidelines);
    formData.append("reg_enddate", regEndDatetime);
    formData.append("interest_ids", interest.join(","));
    // Append the poster file
    if (eventPoster) {
      formData.append("poster", eventPoster);
    }

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        window.alert("Access token not found. Please log in.");
        return;
      }
      // Send PUT request to update event details
      await axios.put(
        `${API_BASE_URL}/api/v1/events/update/${eventId}`,
        formData,
        {
          headers: {
            // Remove "Content-Type" header to allow Axios to set the correct boundaries
            Authorization: `Bearer ${token}`,
          },
        }
      );


      router.push(`/dashboard/events`);
    } catch (error) {
      console.error("Error updating event:", error);
      window.alert("Failed to update the event. Please try again later.");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#2C333D]">
      <Sidebar />
      <div className="flex-1 p-6 md:p-8">
        <div className="bg-white rounded-2xl p-6 md:p-10 min-h-[calc(100vh-4rem)]">
          <h1 className="bebas text-[32px] md:text-[40px] tracking-wide text-black mb-6">EDIT EVENT</h1>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <h2 className="bebas text-[18px] tracking-wide text-black mb-4">BASIC INFORMATION</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <label className="text-[12px] text-gray-600 mb-1.5">
                      Event Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Your Event Title"
                      className="h-[42px] px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[12px] text-gray-600 mb-1.5">
                      Event Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="h-[42px] px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      value={selectedCategory ?? ""}
                      onChange={(e) => setSelectedCategory(parseInt(e.target.value, 10))}
                      required
                    >
                      <option value="">Choose Event Category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={parseInt(category.id, 10)}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[12px] text-gray-600 mb-1.5">
                      Event Seats <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter available seats for the event"
                      className="h-[42px] px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={eventSeats}
                      onChange={(e) => setEventSeats(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <label className="text-[12px] text-gray-600 mb-1.5">
                      Event Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      placeholder="Enter Event Description"
                      className="min-h-[120px] px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      value={eventDescription}
                      onChange={(e) => setEventDescription(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col items-center">
                    <label
                      htmlFor="eventPoster"
                      className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer flex items-center justify-center hover:border-gray-400 transition-colors"
                    >
                      {eventPoster ? (
                        <Image
                          src={URL.createObjectURL(eventPoster)}
                          width={96}
                          height={96}
                          alt="Event Poster"
                          className="rounded-lg object-cover"
                        />
                      ) : (
                        <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M51 32H41.6C38.2397 32 36.5595 32 35.2761 32.654C34.1471 33.2292 33.2292 34.1471 32.654 35.2761C32 36.5595 32 38.2397 32 41.6V58.4C32 61.7603 32 63.4405 32.654 64.7239C33.2292 65.8529 34.1471 66.7708 35.2761 67.346C36.5595 68 38.2397 68 41.6 68H60C61.8599 68 62.7899 68 63.5529 67.7956C65.6235 67.2408 67.2408 65.6235 67.7956 63.5529C68 62.7899 68 61.8599 68 60M64 42V30M58 36H70" stroke="#979797" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </label>
                    <input
                      id="eventPoster"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePosterUpload}
                    />
                    <p className="text-[12px] text-gray-600 mt-2">Add Event Poster</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="bebas text-[18px] tracking-wide text-black mb-4">DATE AND TIME</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <label className="text-[12px] text-gray-600 mb-1.5">Event Date <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    className="h-[42px] px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[12px] text-gray-600 mb-1.5">Start Time <span className="text-red-500">*</span></label>
                  <input
                    type="time"
                    className="h-[42px] px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={eventStartTime}
                    onChange={(e) => setEventStartTime(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[12px] text-gray-600 mb-1.5">Duration (Hours) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    placeholder="Duration in hours"
                    className="h-[42px] px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={eventDuration || ""}
                    onChange={(e) => setEventDuration(parseInt(e.target.value, 10))}
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[12px] text-gray-600 mb-1.5">Registration Closing Date <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    className="h-[42px] px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={eventRegistrationClosingDate}
                    onChange={(e) => setEventRegistrationClosingDate(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[12px] text-gray-600 mb-1.5">Registration Closing Time <span className="text-red-500">*</span></label>
                  <input
                    type="time"
                    className="h-[42px] px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={eventRegistrationClosingTime}
                    onChange={(e) => setEventRegistrationClosingTime(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="bebas text-[18px] tracking-wide text-black mb-4">LOCATION AND MODE</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <label className="text-[12px] text-gray-600 mb-1.5">Event Mode <span className="text-red-500">*</span></label>
                  <select
                    className="h-[42px] px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={eventMode === true ? "true" : eventMode === false ? "false" : ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "true") setEventMode(true);
                      else if (value === "false") setEventMode(false);
                      else setEventMode("");
                    }}
                    required
                  >
                    <option value="">Select Mode</option>
                    <option value="true">Online</option>
                    <option value="false">Offline</option>
                  </select>
                </div>
                {eventMode === true && (
                  <>
                    <div className="flex flex-col">
                      <label className="text-[12px] text-gray-600 mb-1.5">Platform <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        placeholder="Enter Event Platform"
                        className="h-[42px] px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={eventLocation}
                        onChange={(e) => setEventLocation(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[12px] text-gray-600 mb-1.5">Meet Link <span className="text-red-500">*</span></label>
                      <input
                        type="url"
                        placeholder="Enter Meet Link"
                        className="h-[42px] px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={eventMeetLink}
                        onChange={(e) => setEventMeetLink(e.target.value)}
                        required
                      />
                    </div>
                  </>
                )}
                {eventMode === false && (
                  <>
                    <div className="flex flex-col">
                      <label className="text-[12px] text-gray-600 mb-1.5">Location <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        placeholder="Enter Event Location"
                        className="h-[42px] px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={eventLocation}
                        onChange={(e) => setEventLocation(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[12px] text-gray-600 mb-1.5">Google Map Link</label>
                      <input
                        type="url"
                        placeholder="Google Map Link"
                        className="h-[42px] px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={eventMeetLink}
                        onChange={(e) => setEventMeetLink(e.target.value)}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            <div>
              <h2 className="bebas text-[18px] tracking-wide text-black mb-4">PERKS AND FEE</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                <div className="flex flex-col">
                  <label className="text-[12px] text-gray-600 mb-1.5">Registration Fee</label>
                  <input
                    type="number"
                    placeholder="Enter The Fee"
                    className="h-[42px] px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={eventFee}
                    onChange={(e) => setEventFee(parseInt(e.target.value, 10))}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[12px] text-gray-600 mb-1.5">Prize Worth</label>
                  <input
                    type="number"
                    placeholder="Enter The Prize Worth"
                    className="h-[42px] px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={eventPerks}
                    onChange={(e) => setEventPerks(parseInt(e.target.value, 10))}
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="text-[12px] text-gray-600 mb-1.5 block">Event Guidelines</label>
                <textarea
                  placeholder="Enter Event Guidelines"
                  className="w-full min-h-[100px] px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  value={eventGuidelines}
                  onChange={(e) => setEventGuidelines(e.target.value)}
                />
              </div>
            </div>

            {warningMessage && (
              <div className="text-red-500 text-[14px] text-center">{warningMessage}</div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                className="h-[48px] px-12 bg-[#2C333D] hover:bg-[#1F2937] text-white bebas text-[18px] tracking-wide rounded transition-colors"
              >
                UPDATE EVENT
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
