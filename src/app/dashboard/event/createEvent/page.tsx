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

// Guest/Speaker interface
interface Guest {
  id: string;
  name: string;
  designation: string;
  photo: File | null;
}

// Event type options
const eventTypeOptions = [
  { id: 1, name: "Workshop" },
  { id: 2, name: "Seminar" },
  { id: 3, name: "Competition" },
  { id: 4, name: "Hackathon" },
  { id: 5, name: "Cultural Event" },
  { id: 6, name: "Sports Event" },
  { id: 7, name: "Networking" },
  { id: 8, name: "Conference" },
];

// Event tag options
const eventTagOptions = [
  { id: 1, name: "Free" },
  { id: 2, name: "Paid" },
  { id: 3, name: "Online" },
  { id: 4, name: "Offline" },
  { id: 5, name: "Hybrid" },
  { id: 6, name: "Featured" },
  { id: 7, name: "Limited Seats" },
];

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

  // Event Type and Tag state
  const [eventType, setEventType] = useState<number | null>(null);
  const [eventTag, setEventTag] = useState<number | null>(null);

  // Speakers/Guests state
  const [guests, setGuests] = useState<Guest[]>([]);
  const [guestName, setGuestName] = useState("");
  const [guestDesignation, setGuestDesignation] = useState("");
  const [guestPhoto, setGuestPhoto] = useState<File | null>(null);

  // Add guest handler
  const handleAddGuest = () => {
    if (!guestName.trim()) {
      window.alert("Please enter guest name");
      return;
    }
    const newGuest: Guest = {
      id: Date.now().toString(),
      name: guestName.trim(),
      designation: guestDesignation.trim() || "Guest Speaker",
      photo: guestPhoto,
    };
    setGuests([...guests, newGuest]);
    setGuestName("");
    setGuestDesignation("");
    setGuestPhoto(null);
  };

  // Remove guest handler
  const handleRemoveGuest = (guestId: string) => {
    setGuests(guests.filter(g => g.id !== guestId));
  };

  // Handle guest photo upload
  const handleGuestPhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGuestPhoto(file);
    }
  };

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
      interest_ids: selected.length > 0 ? selected.map(s => s.id).join(",") : null,
      event_tag: eventTag ? eventTagOptions.find(t => t.id === eventTag)?.name || null : null,
      speakers: guests.map(g => ({
        name: g.name,
        designation: g.designation,
        photo: g.photo, // Pass the file object
        photo_url: undefined,
      })),
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
                    <select
                      className="font-sans h-[42px] px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      value={eventType ?? ""}
                      onChange={(e) => setEventType(e.target.value ? parseInt(e.target.value) : null)}
                    >
                      <option value="">Choose Event Type</option>
                      {eventTypeOptions.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col">
                    <label className="font-sans text-gray-600 text-[13px] mb-1.5">
                      Tag
                    </label>
                    <select
                      className="h-[42px] px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      value={eventTag ?? ""}
                      onChange={(e) => setEventTag(e.target.value ? parseInt(e.target.value) : null)}
                    >
                      <option value="">Choose Event Tag</option>
                      {eventTagOptions.map((tag) => (
                        <option key={tag.id} value={tag.id}>
                          {tag.name}
                        </option>
                      ))}
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

                  <div className="flex flex-col">
                    <label className="font-sans text-gray-600 text-[13px] mb-1.5">
                      Category<span className="text-red-500">*</span>
                    </label>
                    <select
                      className="font-sans h-[42px] px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      value={selectedCategory ?? ""}
                      onChange={(e) => setSelectedCategory(e.target.value ? parseInt(e.target.value) : null)}
                      required
                    >
                      <option value="">Choose Category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
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
                    Prize Worth
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Add Guest Form */}
                <div className="border border-gray-200 rounded-lg p-5 bg-gray-50">
                  <h3 className="font-sans text-[14px] font-semibold mb-4">Add New Speaker/Guest</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="font-sans text-gray-600 text-[13px] mb-1.5 block">
                        Guest Photo
                      </label>
                      <div className="flex items-center gap-4">
                        {guestPhoto ? (
                          <Image
                            src={URL.createObjectURL(guestPhoto)}
                            width={60}
                            height={60}
                            alt="Guest Photo"
                            className="w-[60px] h-[60px] object-cover rounded-full border-2 border-teal-500"
                          />
                        ) : (
                          <div className="w-[60px] h-[60px] rounded-full bg-gray-200 flex items-center justify-center">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                              <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="#9CA3AF" />
                            </svg>
                          </div>
                        )}
                        <label className="cursor-pointer px-4 py-2 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50">
                          Choose Photo
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleGuestPhotoUpload}
                          />
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="font-sans text-gray-600 text-[13px] mb-1.5 block">
                        Name<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter guest name"
                        className="font-sans h-[42px] w-full px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="font-sans text-gray-600 text-[13px] mb-1.5 block">
                        Designation
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Chief Guest, Speaker, Mentor"
                        className="h-[42px] w-full px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={guestDesignation}
                        onChange={(e) => setGuestDesignation(e.target.value)}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleAddGuest}
                      className="bebas w-full h-[42px] bg-[#2C333D] text-white rounded text-[16px] hover:bg-[#1F2937] transition-colors"
                    >
                      ADD SPEAKER
                    </button>
                  </div>
                </div>

                {/* Guest Cards List */}
                <div>
                  <h3 className="font-sans text-[14px] font-semibold mb-4">
                    Added Speakers/Guests ({guests.length})
                  </h3>

                  {guests.length === 0 ? (
                    <div className="border border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-gray-400">
                      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                        <path d="M24 24C28.42 24 32 20.42 32 16C32 11.58 28.42 8 24 8C19.58 8 16 11.58 16 16C16 20.42 19.58 24 24 24ZM24 28C18.66 28 8 30.68 8 36V40H40V36C40 30.68 29.34 28 24 28Z" fill="#D1D5DB" />
                      </svg>
                      <p className="mt-2 text-sm">No speakers added yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto">
                      {guests.map((guest) => (
                        <div
                          key={guest.id}
                          className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg p-4 flex items-center gap-3 text-white"
                        >
                          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {guest.photo ? (
                              <Image
                                src={URL.createObjectURL(guest.photo)}
                                width={48}
                                height={48}
                                alt={guest.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-teal-400"></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-sans text-[14px] font-semibold">{guest.name}</p>
                            <p className="font-sans text-[12px] opacity-90">{guest.designation}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveGuest(guest.id)}
                            className="p-2 hover:bg-white/20 rounded-full transition-colors"
                            title="Remove guest"
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                              <path d="M12.7 4.7L11.3 3.3L8 6.6L4.7 3.3L3.3 4.7L6.6 8L3.3 11.3L4.7 12.7L8 9.4L11.3 12.7L12.7 11.3L9.4 8L12.7 4.7Z" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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