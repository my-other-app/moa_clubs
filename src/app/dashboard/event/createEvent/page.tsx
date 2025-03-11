"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import Image from "next/image";
import Sidebar from "@/app/components/sidebar";
import { useRouter } from "next/navigation";
import { useEvent, EventData } from "@/app/context/eventContext";
import axios from "axios";

type Category = {
  id: number;
  name: string;
};

// Renamed interests constant to avoid shadowing the fetched categories state
const interestCategories = [
  {
    title: "Academic",
    options: [
      { id: 6, name: "💻 Coding" },
      { id: 7, name: "🎨 UI/UX" },
      { id: 8, name: "📊 Data Science" },
      { id: 9, name: "👨‍💼 Entrepreneurship" },
      { id: 10, name: "🏷️ Marketing" },
      { id: 11, name: "💰 Finance" },
      { id: 2, name: "🦾 AI/ML" },
      { id: 12, name: "📈 Analytics" },
      { id: 13, name: "🔒 Cybersecurity" },
      { id: 14, name: "🏭 Product Management" },
    ],
  },
  {
    title: "Creative",
    options: [
      { id: 15, name: "📸 Photography" },
      { id: 16, name: "🎵 Music" },
      { id: 17, name: "🎬 Film" },
      { id: 18, name: "🐰 Animation" },
      { id: 19, name: "✏️ Writing" },
      { id: 20, name: "👗 Fashion" },
      { id: 21, name: "🎮 Gaming" },
    ],
  },
  {
    title: "Emerging Trends",
    options: [
      { id: 22, name: "🔗 Blockchain" },
      { id: 23, name: "🥽 VR/AR" },
      { id: 24, name: "🎭 Memes & Internet Culture" },
      { id: 25, name: "🎥 Content Creation" },
      { id: 26, name: "🎮 E-Sports" },
      { id: 27, name: "🚀 Space Exploration" },
    ],
  },
];

export default function CreateEvent() {
  // State for interests selection
  const [selected, setSelected] = useState<{ id: number; name: string }[]>([]);


  // Toggle selection with a max limit of 5 interests
  const toggleSelection = (option: { id: number; name: string }) => {
    setSelected((prev) => {
      if (prev.some((item) => item.id === option.id)) {
        return prev.filter((item) => item.id !== option.id);
      } else if (prev.length < 5) {
        return [...prev, option];
      }
      return prev;
    });
  };

  const router = useRouter();
  const { setEventData } = useEvent();

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

  // eventMode is either true (online), false (offline) or an empty string (not selected)
  const [eventMode, setEventMode] = useState<boolean | "">("");
  const [eventLocation, setEventLocation] = useState<string>("");
  const [eventMeetLink, setEventMeetLink] = useState<string>("");
  const [eventFee, setEventFee] = useState<number>(0);
  const [eventPerks, setEventPerks] = useState<number>(0);
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
    // Validate required fields
    if (
      !eventPoster ||
      !eventDuration ||
      !eventRegistrationClosingTime ||
      !eventRegistrationClosingDate ||
      !eventStartTime
    ) {
      window.alert("All fields required!");
      return;
    }

    const eventDatetime = `${eventDate}T${eventStartTime}`;
    const eventCloseDatetime = `${eventRegistrationClosingDate}T${eventRegistrationClosingTime}`;

    const eventDataToPass: EventData = {
      name: eventTitle,
      category_id: selectedCategory ?? 0,
      max_participants: parseInt(eventSeats, 10),
      about: eventDescription,
      duration: eventDuration ?? 0,
      event_datetime: eventDatetime,
      is_online: eventMode === true,
      location_name: eventLocation,
      url: eventMeetLink,
      reg_fee: eventFee,
      prize_amount: eventPerks,
      event_guidelines: eventGuidelines,
      poster: eventPoster,
      has_fee: eventFee !== 0,
      has_prize: eventPerks !== 0,
      reg_enddate: eventCloseDatetime,
      additional_details: [],
      reg_startdate: "",
      contact_phone: null,
      contact_email: null,
      interest_ids: null,
      // club_id: null
    };

    // Save event data in context and navigate to the next step
    setEventData(eventDataToPass);
    router.push("/dashboard/event/addEvent");
  };

  return (
    <>
      <Sidebar />
      <div className="max-w-6xl mx-auto my-12 p-6 rounded-lg font-sans">
        <h1 className="text-4xl font-bold mb-18 bebas">CREATE NEW EVENT</h1>
        <form onSubmit={handleSubmit}>
          <h2 className="text-2xl bebas font-semibold mb-6">BASIC INFORMATION</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="space-y-4 flex flex-col gap-5">
              <div className="flex flex-col">
                <h3 className="text-gray-700 text-sm mb-1">
                  Event Title<span className="text-red-500">*</span>
                </h3>
                <input
                  type="text"
                  placeholder="Enter Your Event Title"
                  className="p-2 border border-gray-400 rounded"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col">
                <h3 className="text-gray-700 text-sm mb-1">
                  Event Category<span className="text-red-500">*</span>
                </h3>
                <select
                  className="p-2 border border-gray-400 rounded"
                  value={selectedCategory ?? ""}
                  required
                  onChange={(e) => setSelectedCategory(parseInt(e.target.value, 10))}
                >
                  <option value="" className="text-gray-700">
                    Choose Event Category
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={parseInt(category.id.toString(), 10)}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <h3 className="text-gray-700 text-sm mb-1">
                  Event Seats<span className="text-red-500">*</span>
                </h3>
                <input
                  type="text"
                  required
                  placeholder="Enter available seats for the event"
                  className="p-2 border border-gray-400 rounded"
                  value={eventSeats}
                  onChange={(e) => setEventSeats(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-col min-h-1/1">
              <div className="flex flex-col flex-1 w-1/1">
                <h3 className="text-gray-700 text-sm mb-1">
                  Event Description<span className="text-red-500">*</span>
                </h3>
                <textarea
                  placeholder="Enter Event Description"
                  className="p-2 border border-gray-400 rounded h-1/1"
                  value={eventDescription}
                  required
                  onChange={(e) => setEventDescription(e.target.value)}
                ></textarea>
              </div>
            </div>
            <div className="flex flex-col items-center my-auto">
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
                  <input
                    id="eventPoster"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePosterUpload}
                  />
                </label>
                <h3>
                  Add Event Poster<span className="text-red-500">*</span>
                </h3>
              </div>
          </div>
          <h2 className="font-semibold mt-6 text-2xl bebas mb-6">DATE AND TIME</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="flex flex-col">
              <h3 className="text-gray-700 text-sm mb-1">
                Event date<span className="text-red-500">*</span>
              </h3>
              <input
                type="date"
                className="p-2 border border-gray-400 rounded"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <h3 className="text-gray-700 text-sm mb-1">
                Event Start Time<span className="text-red-500">*</span>
              </h3>
              <input
                required
                type="time"
                className="p-2 border border-gray-400 rounded"
                value={eventStartTime}
                onChange={(e) => setEventStartTime(e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <h3 className="text-gray-700 text-sm mb-1">
                Event Duration<span className="text-red-500">*</span>
              </h3>
              <input
                type="number"
                placeholder="Enter Event Duration Hours"
                className="p-2 border border-gray-400 rounded"
                value={eventDuration || ""}
                onChange={(e) => setEventDuration(parseInt(e.target.value, 10))}
                required
              />
            </div>
            <div className="flex flex-col">
              <h3 className="text-gray-700 text-sm mb-1">
                Event Registration Closing Date<span className="text-red-500">*</span>
              </h3>
              <input
                required
                type="date"
                className="p-2 border border-gray-400 rounded"
                value={eventRegistrationClosingDate}
                onChange={(e) => setEventRegistrationClosingDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <h3 className="text-gray-700 text-sm mb-1">
                Event Registration Closing Time<span className="text-red-500">*</span>
              </h3>
              <input
                required
                type="time"
                className="p-2 border border-gray-400 rounded"
                value={eventRegistrationClosingTime}
                onChange={(e) => setEventRegistrationClosingTime(e.target.value)}
              />
            </div>
          </div>
          <h2 className="font-semibold mt-6 text-2xl bebas mb-6">
            LOCATION AND MODE<span className="text-red-500">*</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <select
              className="p-2 border border-gray-400 rounded"
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
                  required
                  type="text"
                  placeholder="Enter Event Platform"
                  className="p-2 border border-gray-400 rounded"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                />
                <input
                  required
                  type="url"
                  placeholder="Enter Meet Link"
                  className="p-2 border border-gray-400 rounded"
                  value={eventMeetLink}
                  onChange={(e) => setEventMeetLink(e.target.value)}
                />
              </>
            ) : eventMode === false ? (
              <>
                <input
                  required
                  type="text"
                  placeholder="Enter Event Location"
                  className="p-2 border border-gray-400 rounded"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                />
                <input
                  type="url"
                  placeholder="Google Map Link"
                  className="p-2 border border-gray-400 rounded"
                  value={eventMeetLink}
                  onChange={(e) => setEventMeetLink(e.target.value)}
                />
              </>
            ) : (
              <>
                <input
                  required
                  type="text"
                  placeholder="Choose Event Mode"
                  className="p-2 border border-gray-400 rounded"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  disabled
                />
                <input
                  required
                  type="url"
                  placeholder="Choose Event Mode"
                  className="p-2 border border-gray-400 rounded"
                  value={eventMeetLink}
                  onChange={(e) => setEventMeetLink(e.target.value)}
                  disabled
                />
              </>
            )}
          </div>
          <h2 className="font-semibold mt-6 text-2xl bebas mb-6">PERKS AND FEE</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div>
              <h3 className="text-gray-700 text-sm mb-1">Event Registration Fee</h3>
              <input
                type="number"
                placeholder="Enter The Fee"
                className="p-2 border border-gray-400 rounded w-full"
                value={eventFee}
                onChange={(e) => setEventFee(parseInt(e.target.value, 10))}
              />
            </div>
            <div>
              <h3 className="text-gray-700 text-sm mb-1">Prize Worth</h3>
              <input
                type="number"
                placeholder="Enter The Prize Worth"
                className="p-2 border border-gray-400 rounded w-full"
                value={eventPerks}
                onChange={(e) => setEventPerks(parseInt(e.target.value, 10))}
              />
            </div>
          </div>
          <h2 className="font-semibold mt-6 text-2xl bebas mb-6">GUIDELINES</h2>
          <h3 className="text-gray-700 text-sm mb-1">Event Guidelines</h3>
          <textarea
            placeholder="Enter Event Guidelines"
            className="w-full p-2 border border-gray-400 rounded min-h-50"
            value={eventGuidelines}
            onChange={(e) => setEventGuidelines(e.target.value)}
          ></textarea>
<h2 className="font-semibold mt-6 text-2xl bebas">SELECT AREA RELATED TO THE EVENT</h2>
          <div className="space-y-4 bg-gray-100 p-5 rounded-xl">
            {interestCategories.map(({ title, options }) => (
              <div key={title}>
                <h3 className="font-semibold text-gray-700 mb-2">{title}</h3>
                <div className="flex flex-wrap gap-4">
                  {options.map((option) => (
                    <button
                      key={option.id}
                      onClick={(e) => {
                        e.preventDefault();
                        toggleSelection(option);
                      }}
                      aria-pressed={selected.some((item) => item.id === option.id)}
                      disabled={
                        selected.length >= 5 && !selected.some((item) => item.id === option.id)
                      }
                      className={`px-3 py-1 rounded-full transition ${
                        selected.some((item) => item.id === option.id)
                          ? "border-green-600 border-2"
                          : "bg-white hover:bg-gray-300"
                      } ${
                        selected.length >= 5 && !selected.some((item) => item.id === option.id)
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      {option.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="w-full mt-4 flex justify-end">
  <button type="submit" className="bg-[#2C333D] bebas text-2xl p-2 px-8 text-white rounded">
    CONTINUE
  </button>
</div>

        </form>
      </div>
    </>
  );
}
