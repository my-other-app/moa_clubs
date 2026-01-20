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
  // State for event coordinator details
  const [eventCoordinatorName, setEventCoordinatorName] = useState("");
  const [eventCoordinatorPhone, setEventCoordinatorPhone] = useState("");
  const [eventCoordinatorEmail, setEventCoordinatorEmail] = useState("");

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

  // Other event state variables
  const [eventPoster, setEventPoster] = useState<File | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [eventTitle, setEventTitle] = useState("");
  const [eventSeats, setEventSeats] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventStartTime, setEventStartTime] = useState("");
  const [eventDuration, setEventDuration] = useState<number | null>(null);
  const [eventRegistrationClosingDate, setEventRegistrationClosingDate] = useState("");
  const [eventRegistrationClosingTime, setEventRegistrationClosingTime] = useState("");
  const [eventMode, setEventMode] = useState<boolean | "">("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventMeetLink, setEventMeetLink] = useState("");
  const [eventFee, setEventFee] = useState<number>(0);
  const [eventPerks, setEventPerks] = useState<number>(0);
  const [eventGuidelines, setEventGuidelines] = useState("");

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
      contact_phone: eventCoordinatorPhone,
      contact_email: eventCoordinatorEmail,
      interest_ids: null,
    };

    // Save event data in context and navigate to the next step
    setEventData(eventDataToPass);
    router.push("/dashboard/event/addEvent");
  };

  return (
    <div className="flex min-h-screen bg-[#2C333D]">
      <Sidebar />
      <div className="flex-1 p-6 md:p-8">
        <div className="bg-white rounded-2xl p-6 md:p-10 min-h-[calc(100vh-4rem)]">
          {/* Main Title */}
          <h1 className="text-[36px] font-normal mb-10 bebas tracking-wide">CREATE NEW EVENT</h1>

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* BASIC INFORMATION SECTION */}
            <div>
              <h2 className="text-[20px] bebas font-normal mb-5 tracking-wide">BASIC INFORMATION</h2>
              <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-8">
                {/* Column 1: Left Input Fields */}
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col">
                    <label className="font-sans text-gray-600 text-[13px] mb-1.5">
                      Event Title<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Your Event Title"
                      className="font-sans h-[42px] px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="font-sans text-gray-600 text-[13px] mb-1.5">
                      Event Type
                    </label>
                    <select className="font-sans h-[42px] px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                      <option>Choose Event Type</option>
                    </select>
                  </div>

                  <div className="flex flex-col">
                    <label className="font-sans text-gray-600 text-[13px] mb-1.5">
                      Tag
                    </label>
                    <select className="h-[42px] px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                      <option>Choose Event Tag</option>
                    </select>
                  </div>

                  <div className="flex flex-col">
                    <label className="font-sans text-gray-600 text-[13px] mb-1.5">
                      Event Seats<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter available seats for the event"
                      className="font-sans h-[42px] px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={eventSeats}
                      onChange={(e) => setEventSeats(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Column 2: Description and Category */}
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col flex-1">
                    <label className="font-sans text-gray-600 text-[13px] mb-1.5">
                      Event Description<span className="text-red-500">*</span>
                    </label>
                    <textarea
                      placeholder="Enter Event Description"
                      className="font-sans flex-1 px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      value={eventDescription}
                      required
                      onChange={(e) => setEventDescription(e.target.value)}
                    ></textarea>
                  </div>
                </div>

                {/* Column 3: Image Upload */}
                <div className="flex flex-col items-center justify-center gap-3">
                  <label htmlFor="eventPoster" className="cursor-pointer flex flex-col items-center">
                    {eventPoster ? (
                      <Image
                        src={URL.createObjectURL(eventPoster)}
                        width={100}
                        height={100}
                        alt="Event Poster"
                        className="w-[100px] h-[100px] object-cover rounded-full"
                      />
                    ) : (
                      <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
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
                    )}
                    <input
                      id="eventPoster"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePosterUpload}
                    />
                  </label>
                  <p className="font-sans text-[13px] text-gray-700">
                    Add Event Poster<span className="text-red-500">*</span>
                  </p>
                  <p className="font-sans text-[11px] text-gray-500">(16:9 ratio)</p>
                </div>
              </div>
            </div>

            {/* DATES AND TIME SECTION */}
            <div>
              <h2 className="text-[20px] bebas font-normal mb-5 tracking-wide">DATES AND TIME</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col">
                  <label className="font-sans text-gray-600 text-[13px] mb-1.5">
                    From Date<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    className="font-sans h-[42px] px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className="font-sans text-gray-600 text-[13px] mb-1.5">
                    From Start Time<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    className="h-[42px] px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={eventStartTime}
                    onChange={(e) => setEventStartTime(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className="font-sans text-gray-600 text-[13px] mb-1.5">
                    Event Duration<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Choose Event Duration (Hours)"
                    className="h-[42px] px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={eventDuration || ""}
                    onChange={(e) => setEventDuration(parseInt(e.target.value, 10))}
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className="font-sans text-gray-600 text-[13px] mb-1.5">
                    Event Registration closing date<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    className="h-[42px] px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={eventRegistrationClosingDate}
                    onChange={(e) => setEventRegistrationClosingDate(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className="font-sans text-gray-600 text-[13px] mb-1.5">
                    Event Registration closing time<span className="text-red-500">*</span>
                  </label>
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

            {/* LOCATION AND VENUE SECTION */}
            <div>
              <h2 className="text-[20px] bebas font-normal mb-5 tracking-wide">LOCATION AND VENUE</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col">
                  <label className="font-sans text-gray-600 text-[13px] mb-1.5">
                    Event Place
                  </label>
                  <select className="h-[42px] px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option>Choose/Offline</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="font-sans text-gray-600 text-[13px] mb-1.5">
                    Event Address
                  </label>
                  <input
                    type="text"
                    placeholder="Choose Event Location"
                    className="h-[42px] px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="font-sans text-gray-600 text-[13px] mb-1.5">
                    Map Link
                  </label>
                  <input
                    type="url"
                    placeholder="Enter Map Link"
                    className="h-[42px] px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* PERKS AND FEE SECTION */}
            <div>
              <h2 className="text-[20px] bebas font-normal mb-5 tracking-wide">PERKS AND FEE</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <label className="font-sans text-gray-600 text-[13px] mb-1.5">
                    Event Registration Fee
                  </label>
                  <input
                    type="number"
                    placeholder="Choose Event Location"
                    className="h-[42px] px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={eventFee}
                    onChange={(e) => setEventFee(parseInt(e.target.value, 10))}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="font-sans text-gray-600 text-[13px] mb-1.5">
                    Pass WORK
                  </label>
                  <input
                    type="number"
                    placeholder="Choose Event Location"
                    className="h-[42px] px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={eventPerks}
                    onChange={(e) => setEventPerks(parseInt(e.target.value, 10))}
                  />
                </div>
              </div>
            </div>

            {/* KEY FEATURES SECTION */}
            <div>
              <h2 className="text-[20px] bebas font-normal mb-5 tracking-wide">KEY FEATURES (SPEAKERS AND GUESTS)</h2>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-col">
                  <label className="font-sans text-gray-600 text-[13px] mb-1.5">
                    Add Guest
                  </label>
                  <div className="border border-dashed border-gray-300 rounded p-4 flex items-center justify-center min-h-[100px] bg-gray-50">
                    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                      <rect width="64" height="64" rx="32" fill="#F3F3F3" />
                      <path d="M32 24V40M24 32H40" stroke="#979797" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>
                <div>
                  <label className="font-sans text-gray-600 text-[13px] mb-1.5">Name</label>
                  <input
                    type="text"
                    placeholder="Enter Name / Name"
                    className="font-sans h-[42px] w-full px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="font-sans text-gray-600 text-[13px] mb-1.5">Guests Photo</label>
                  <input
                    type="text"
                    placeholder="Choose file designation"
                    className="h-[42px] w-full px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Guest Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg p-4 flex items-center gap-3 text-white">
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-teal-400"></div>
                      </div>
                      <div className="flex-1">
                        <p className="font-sans text-[14px] font-semibold">Mr. Roshan Vijayan</p>
                        <p className="font-sans text-[12px] opacity-90">Chief Mentor Student</p>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="bebas mt-4 h-[42px] px-6 border border-gray-300 rounded text-[14px] hover:bg-gray-50 transition-colors">
                  ADD SPEAKER
                </button>
              </div>
            </div>

            {/* GUIDELINES SECTION */}
            <div>
              <h2 className="text-[20px] bebas font-normal mb-5 tracking-wide">GUIDELINES</h2>
              <div className="flex flex-col">
                <label className="font-sans text-gray-600 text-[13px] mb-1.5">
                  Event Guidelines
                </label>
                <textarea
                  placeholder="Enter Event Guidelines"
                  className="font-sans min-h-[200px] px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                  value={eventGuidelines}
                  onChange={(e) => setEventGuidelines(e.target.value)}
                ></textarea>
              </div>
            </div>

            {/* SELECT AREAS SECTION */}
            <div>
              <h2 className="text-[20px] bebas font-normal mb-5 tracking-wide">SELECT AREAS RELATED TO THE EVENT</h2>
              <div className="space-y-6 bg-gray-100 p-6 rounded-lg">
                {interestCategories.map(({ title, options }) => (
                  <div key={title}>
                    <h3 className="font-sans text-[14px] font-semibold text-gray-700 mb-3">{title}</h3>
                    <div className="flex flex-wrap gap-3">
                      {options.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => toggleSelection(option)}
                          disabled={selected.length >= 5 && !selected.some((item) => item.id === option.id)}
                          className={`font-sans px-4 py-1.5 text-[14px] rounded-full transition-all ${selected.some((item) => item.id === option.id)
                            ? "bg-white border-2 border-green-600 text-gray-800"
                            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                            } ${selected.length >= 5 && !selected.some((item) => item.id === option.id)
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
            </div>

            {/* SUBMIT BUTTON */}
            <div className="flex justify-end pt-6">
              <button
                type="submit"
                className="bg-[#2C333D] hover:bg-[#1F2937] text-white bebas text-[22px] px-10 py-2.5 rounded tracking-wide transition-colors"
              >
                CONTRIBUTE
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}