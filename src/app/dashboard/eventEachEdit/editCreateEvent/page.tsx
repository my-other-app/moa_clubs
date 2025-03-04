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

type Interest = {
  id: number;
  icon: string;
  name: string;
};

type InterestGroup = {
  id: number;
  name: string;
  interests: Interest[];
};

export default function CreateEvent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("event_id");

  // State for event details
  const [eventPoster, setEventPoster] = useState<File | null>(null);
  const [existingPosterUrl, setExistingPosterUrl] = useState<string>("");

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

  // eventMode can be boolean or an empty string (to denote unselected)
  const [eventMode, setEventMode] = useState<boolean | "">("");
  const [eventLocation, setEventLocation] = useState<string>("");
  const [eventMeetLink, setEventMeetLink] = useState<string>("");
  const [eventFee, setEventFee] = useState<number>(0);
  const [eventPerks, setEventPerks] = useState<number>(0);
  const [eventGuidelines, setEventGuidelines] = useState<string>("");

  // Interests data typed as an array of InterestGroup
  const [interestsData, setInterestsData] = useState<InterestGroup[]>([]);
  // Store selected interest IDs in an array of numbers
  const [selectedInterestIds, setSelectedInterestIds] = useState<number[]>([]);

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

  // Fetch event details and prepopulate the form
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
        // Populate form fields with the fetched data
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
        // Prefer location_link if available; otherwise, use url
        setEventMeetLink(data.location_link || data.url || "");
        setEventFee(data.reg_fee || 0);
        setEventPerks(data.prize_amount || 0);
        setEventGuidelines(data.event_guidelines || "");
        // Optionally set an existing poster URL if provided in the data
        if (data.poster_url) {
          setExistingPosterUrl(data.poster_url);
        }
      } catch (error) {
        console.error("Error fetching event details:", error);
        window.alert("Failed to fetch event details. Please try again later.");
      }
    };
    fetchEventDetails();
  }, [API_BASE_URL, eventId]);

  // Fetch interests from the API
  useEffect(() => {
    const fetchInterests = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(`${API_BASE_URL}/api/v1/interests/list`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setInterestsData(response.data);
      } catch (error) {
        console.error("Error fetching interests:", error);
      }
    };
    fetchInterests();
  }, [API_BASE_URL]);

  const handlePosterUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEventPoster(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Combine date and time values for event_datetime and registration end date
    const eventDatetime = `${eventDate}T${eventStartTime}:00`;
    const regEndDateTime = `${eventRegistrationClosingDate}T${eventRegistrationClosingTime}:00`;

    // Create FormData and append fields
    const formData = new FormData();
    formData.append("name", eventTitle);
    if (selectedCategory !== null) {
      formData.append("category_id", selectedCategory.toString());
    }
    formData.append("max_participants", eventSeats);
    formData.append("about", eventDescription);
    formData.append("duration", (eventDuration ?? 0).toString());
    formData.append("event_datetime", eventDatetime);
    formData.append("reg_enddate", regEndDateTime);
    formData.append("is_online", eventMode.toString());
    formData.append("location_name", eventLocation);
    formData.append("url", eventMeetLink);
    formData.append("reg_fee", eventFee.toString());
    formData.append("prize_amount", eventPerks.toString());
    formData.append("event_guidelines", eventGuidelines);

    // Format selectedInterestIds as a comma-separated list of integers
    const formattedInterestIds = selectedInterestIds.join(",");
    if (formattedInterestIds) {
      formData.append("interest_ids", formattedInterestIds);
    }

    // Append poster (new file upload or existing URL)
    if (eventPoster) {
      formData.append("poster", eventPoster);
    } else if (existingPosterUrl) {
      formData.append("poster", existingPosterUrl);
    }

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        window.alert("Access token not found. Please log in again.");
        return;
      }
      // Send the update request with multipart/form-data
      await axios.put(`${API_BASE_URL}/api/v1/events/update/${eventId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      router.push(`/dashboard/eventEachEdit/editAddEvent?event_id=${eventId}`);
    } catch (error) {
      console.error("Error updating event:", error);
      window.alert("Error updating event. Please try again later.");
    }
  };

  return (
    <>
      <Sidebar />
      <div className="max-w-4xl mx-auto p-6 rounded-lg font-sans">
        <h1 className="text-3xl font-bold mb-6">Edit Form</h1>
        <form onSubmit={handleSubmit}>
          {/* BASIC INFORMATION */}
          <h2 className="text-lg font-semibold">BASIC INFORMATION</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex flex-col">
                <h3>
                  Event Title {eventId} <span className="text-red-500">*</span>
                </h3>
                <input
                  type="text"
                  placeholder="Enter Your Event Title"
                  className="p-2 border rounded"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col">
                <h3>
                  Event Category <span className="text-red-500">*</span>
                </h3>
                <select
                  className="p-2 border rounded"
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
                <h3>
                  Event Seats <span className="text-red-500">*</span>
                </h3>
                <input
                  type="text"
                  placeholder="Enter available seats for the event"
                  className="p-2 border rounded"
                  value={eventSeats}
                  onChange={(e) => setEventSeats(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <div className="flex flex-col">
                <h3>
                  Event Description <span className="text-red-500">*</span>
                </h3>
                <textarea
                  placeholder="Enter Event Description"
                  className="p-2 border rounded"
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  required
                ></textarea>
              </div>
              <div className="flex flex-col items-center">
                <label
                  htmlFor="eventPoster"
                  className="p-2 rounded cursor-pointer flex items-center justify-center"
                >
                  {eventPoster ? (
                    <Image
                      src={URL.createObjectURL(eventPoster)}
                      width={100}
                      height={100}
                      alt="Event Poster"
                      className="w-50 aspect-square h-50 object-cover rounded"
                    />
                  ) : existingPosterUrl ? (
                    <Image
                      src={existingPosterUrl}
                      width={100}
                      height={100}
                      alt="Existing Event Poster"
                      className="w-50 aspect-square h-50 object-cover rounded"
                    />
                  ) : (
                    <div>
                      <svg
                        width="100"
                        height="100"
                        viewBox="0 0 100 100"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect x="0.25" y="0.25" width="99.5" height="99.5" rx="49.75" fill="#F3F3F3" />
                        <rect
                          x="0.25"
                          y="0.25"
                          width="99.5"
                          height="99.5"
                          rx="49.75"
                          stroke="#979797"
                          strokeWidth="0.5"
                        />
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
                  <input
                    id="eventPoster"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePosterUpload}
                    required={!existingPosterUrl}
                  />
                </label>
                <h3>
                  Add Event Poster <span className="text-red-500">*</span>
                </h3>
              </div>
            </div>
          </div>

          {/* DATE AND TIME */}
          <h2 className="text-lg font-semibold mt-6">DATE AND TIME</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col">
              <h3>
                Event Date <span className="text-red-500">*</span>
              </h3>
              <input
                type="date"
                className="p-2 border rounded"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col">
              <h3>
                Event Start Time <span className="text-red-500">*</span>
              </h3>
              <input
                type="time"
                className="p-2 border rounded"
                value={eventStartTime}
                onChange={(e) => setEventStartTime(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col">
              <h3>
                Event Duration (Hours) <span className="text-red-500">*</span>
              </h3>
              <input
                type="number"
                placeholder="Choose Event Duration Hours"
                className="p-2 border rounded"
                value={eventDuration || ""}
                onChange={(e) => setEventDuration(parseInt(e.target.value, 10))}
                required
              />
            </div>
            <div className="flex flex-col">
              <h3>
                Registration Closing Date <span className="text-red-500">*</span>
              </h3>
              <input
                type="date"
                className="p-2 border rounded"
                value={eventRegistrationClosingDate}
                onChange={(e) => setEventRegistrationClosingDate(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col">
              <h3>
                Registration Closing Time <span className="text-red-500">*</span>
              </h3>
              <input
                type="time"
                className="p-2 border rounded"
                value={eventRegistrationClosingTime}
                onChange={(e) => setEventRegistrationClosingTime(e.target.value)}
                required
              />
            </div>
          </div>

          {/* LOCATION AND MODE */}
          <h2 className="text-lg font-semibold mt-6">LOCATION AND MODE</h2>
          <div className="grid grid-cols-3 gap-4">
            <select
              className="p-2 border rounded"
              value={eventMode === true ? "true" : eventMode === false ? "false" : ""}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "true") setEventMode(true);
                else if (value === "false") setEventMode(false);
                else setEventMode("");
              }}
            >
              <option value="">Online/Offline</option>
              <option value="true">Online</option>
              <option value="false">Offline</option>
            </select>
            {eventMode === true ? (
              <>
                <input
                  type="text"
                  placeholder="Enter Event Platform"
                  className="p-2 border rounded"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                />
                <input
                  type="url"
                  placeholder="Enter Meet Link"
                  className="p-2 border rounded"
                  value={eventMeetLink}
                  onChange={(e) => setEventMeetLink(e.target.value)}
                />
              </>
            ) : eventMode === false ? (
              <>
                <input
                  type="text"
                  placeholder="Enter Event Location"
                  className="p-2 border rounded"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                />
                <input
                  type="url"
                  placeholder="Google Map Link"
                  className="p-2 border rounded"
                  value={eventMeetLink}
                  onChange={(e) => setEventMeetLink(e.target.value)}
                />
              </>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Choose Event Mode"
                  className="p-2 border rounded"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  disabled
                />
                <input
                  type="url"
                  placeholder="Choose Event Mode"
                  className="p-2 border rounded"
                  value={eventMeetLink}
                  onChange={(e) => setEventMeetLink(e.target.value)}
                  disabled
                />
              </>
            )}
          </div>

          {/* PERKS AND FEE */}
          <h2 className="text-lg font-semibold mt-6">PERKS AND FEE</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3>Event Registration Fee</h3>
              <input
                type="number"
                placeholder="Enter The Fee"
                className="p-2 border rounded w-full"
                value={eventFee}
                onChange={(e) => setEventFee(parseInt(e.target.value, 10))}
              />
            </div>
            <div>
              <h3>Prize Worth</h3>
              <input
                type="number"
                placeholder="Enter The Prize Worth"
                className="p-2 border rounded w-full"
                value={eventPerks}
                onChange={(e) => setEventPerks(parseInt(e.target.value, 10))}
              />
            </div>
          </div>

          {/* INTERESTS */}
          <div className="mt-4">
            <h2 className="text-lg font-semibold">Select Interests</h2>
            {interestsData.map((group) => (
              <div key={group.id} className="mb-2">
                <h4 className="font-bold">{group.name}</h4>
                <div className="flex flex-wrap">
                  {group.interests.map((interest: Interest) => (
                    <label key={interest.id} className="mr-4">
                      <input
                        type="checkbox"
                        value={interest.id}
                        checked={selectedInterestIds.includes(interest.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedInterestIds([...selectedInterestIds, interest.id]);
                          } else {
                            setSelectedInterestIds(
                              selectedInterestIds.filter((id) => id !== interest.id)
                            );
                          }
                        }}
                      />{" "}
                      {interest.icon} {interest.name}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* EVENT GUIDELINES */}
          <textarea
            placeholder="Enter Event Guidelines"
            className="w-full p-2 border rounded mt-4"
            value={eventGuidelines}
            onChange={(e) => setEventGuidelines(e.target.value)}
          ></textarea>

          <button onClick={handleSubmit} type="submit" className="mt-4 w-full py-2 bg-black text-white rounded">
            Edit
          </button>
        </form>
      </div>
    </>
  );
}
