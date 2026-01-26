"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import Image from "next/image";
import Sidebar from "@/app/components/sidebar";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { ChevronLeft, ChevronDown, Circle, Trash2, Plus, X } from "lucide-react";

type Category = {
  id: string;
  name: string;
};

interface Guest {
  id: string;
  name: string;
  designation: string;
  photo: File | null;
  photoUrl?: string;
}

interface Question {
  id: string;
  type: string;
  text: string;
  options: string[];
  required: boolean;
}

interface InterestOption {
  id: number;
  name: string;
}

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

export default function EditEvent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("event_id");

  // State for event details
  const [eventPoster, setEventPoster] = useState<File | null>(null);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
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
  const [eventMode, setEventMode] = useState<boolean | "">("");
  const [eventLocation, setEventLocation] = useState<string>("");
  const [eventMeetLink, setEventMeetLink] = useState<string>("");
  const [eventFee, setEventFee] = useState<number>(0);
  const [eventPerks, setEventPerks] = useState<number>(0);
  const [eventGuidelines, setEventGuidelines] = useState<string>("");

  // Interests
  const [selectedInterests, setSelectedInterests] = useState<InterestOption[]>([]);

  // Speakers/Guests
  const [guests, setGuests] = useState<Guest[]>([]);
  const [guestName, setGuestName] = useState("");
  const [guestDesignation, setGuestDesignation] = useState("");
  const [guestPhoto, setGuestPhoto] = useState<File | null>(null);

  // Questions
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionType, setQuestionType] = useState<string>("");
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [questionRequired, setQuestionRequired] = useState<boolean>(true);
  const [options, setOptions] = useState<string[]>([""]);

  // Warning message
  const [warningMessage, setWarningMessage] = useState<string>("");

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Fetch categories
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
      }
    };
    fetchCategories();
  }, [API_BASE_URL]);

  // Fetch event details
  useEffect(() => {
    if (!eventId) return;
    const fetchEventDetails = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;
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

        if (data.poster?.thumbnail) {
          setPosterUrl(data.poster.thumbnail);
        }

        // Populate Interests
        if (data.interests) {
          setSelectedInterests(data.interests.map((i: any) => ({ id: i.id, name: i.name })));
        }

        // Populate Speakers
        if (data.speakers) {
          setGuests(data.speakers.map((s: any) => ({
            id: s.id.toString(),
            name: s.name,
            designation: s.designation,
            photo: null,
            photoUrl: s.photo?.thumbnail
          })));
        }

        // Populate Questions
        if (data.additional_details) {
          setQuestions(data.additional_details.map((d: any) => ({
            id: d.key,
            type: d.field_type === 'select' ? 'multipleChoice' : 'shortAnswer',
            text: d.label,
            options: d.options || [],
            required: d.required
          })));
        }

      } catch (error) {
        console.error("Error fetching event details:", error);
        window.alert("Failed to fetch event details.");
      }
    };
    fetchEventDetails();
  }, [API_BASE_URL, eventId]);

  const handlePosterUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEventPoster(file);
      setPosterUrl(URL.createObjectURL(file));
    }
  };

  // Interest Handlers
  const toggleSelection = (option: InterestOption) => {
    setSelectedInterests((prev) => {
      if (prev.some((item) => item.id === option.id)) {
        return prev.filter((item) => item.id !== option.id);
      } else if (prev.length < 5) {
        return [...prev, option];
      }
      return prev;
    });
  };

  // Guest Handlers
  const handleAddGuest = () => {
    if (!guestName.trim()) {
      window.alert("Please enter guest name");
      return;
    }
    const newGuest: Guest = {
      id: uuidv4(),
      name: guestName.trim(),
      designation: guestDesignation.trim() || "Guest Speaker",
      photo: guestPhoto,
    };
    setGuests([...guests, newGuest]);
    setGuestName("");
    setGuestDesignation("");
    setGuestPhoto(null);
  };

  const handleRemoveGuest = (guestId: string) => {
    setGuests(guests.filter(g => g.id !== guestId));
  };

  const handleGuestPhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGuestPhoto(file);
    }
  };

  // Question Handlers
  const handleQuestionTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedType = e.target.value;
    setQuestionType(selectedType);
    setCurrentQuestion("");
    setQuestionRequired(true);
    if (selectedType === "multipleChoice") {
      setOptions([""]);
    } else {
      setOptions([]);
    }
  };

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const handleAddQuestion = () => {
    if (currentQuestion.trim() === "") return;
    const newQuestion: Question = {
      id: uuidv4(),
      type: questionType,
      text: currentQuestion,
      options: questionType === "multipleChoice" ? options.filter(o => o.trim() !== "") : [],
      required: questionRequired,
    };
    setQuestions([...questions, newQuestion]);
    setCurrentQuestion("");
    setQuestionType("");
    setOptions([""]);
    setQuestionRequired(true);
  };

  const handleRemoveQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const eventDatetime = `${eventDate}T${eventStartTime}:00`;
    const regEndDatetime = `${eventRegistrationClosingDate}T${eventRegistrationClosingTime}:00`;

    const formData = new FormData();
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

    // Append Interests
    if (selectedInterests.length > 0) {
      formData.append("interest_ids", selectedInterests.map(i => i.id).join(","));
    }

    // Append Speakers
    const speakersData = guests.map((g, index) => {
      const speakerObj: any = {
        name: g.name,
        designation: g.designation,
        id: g.id, // Pass the ID (UUID for new, Int string for old)
      };

      if (g.photo) {
        // If there is a new photo file, we will append it to speaker_photos list
        // and set the index.
        // We need to calculate the index in the speaker_photos array.
        // But since we are iterating, we can just build the array.
        return { ...speakerObj, has_photo: true, photo_file: g.photo };
      } else {
        return { ...speakerObj, has_photo: false, photo_url: g.photoUrl };
      }
    });

    // We need to separate the file objects and the JSON data
    const finalSpeakers = [];
    let photoIndex = 0;

    for (const s of speakersData) {
      const speakerPayload: any = {
        name: s.name,
        designation: s.designation,
      };

      // If ID is numeric, it's an existing speaker. Pass it as integer.
      // If it's a UUID (string), it's a new speaker, don't pass ID (or pass as null if backend expects).
      // Backend schema expects id: int | None.
      if (!isNaN(Number(s.id))) {
        speakerPayload.id = Number(s.id);
      }

      if (s.has_photo) {
        formData.append("speaker_photos", s.photo_file);
        speakerPayload.photo_index = photoIndex;
        photoIndex++;
      } else {
        speakerPayload.photo_url = s.photo_url;
      }
      finalSpeakers.push(speakerPayload);
    }

    formData.append("speakers", JSON.stringify(finalSpeakers));

    // Append Questions (Additional Details)
    const additionalDetails = questions.map(q => ({
      key: q.id,
      label: q.text,
      field_type: q.type === "multipleChoice" ? "select" : "text",
      options: q.options,
      required: q.required,
      question: q.text,
      answer: ""
    }));
    formData.append("additional_details", JSON.stringify(additionalDetails));

    if (eventPoster) {
      formData.append("poster", eventPoster);
    }

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        window.alert("Access token not found. Please log in.");
        return;
      }
      await axios.put(
        `${API_BASE_URL}/api/v1/events/update/${eventId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      router.push(`/dashboard/events`);
    } catch (error) {
      console.error("Error updating event:", error);
      window.alert("Failed to update the event.");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#2C333D]">
      <Sidebar />
      <div className="flex-1 p-6 md:p-8">
        <div className="bg-white rounded-2xl p-6 md:p-10 min-h-[calc(100vh-4rem)]">
          <div className="flex items-center mb-6">
            <button onClick={() => router.back()} className="mr-4 p-2 hover:bg-gray-100 rounded-full">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="bebas text-[32px] md:text-[40px] tracking-wide text-black">EDIT EVENT</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* BASIC INFORMATION */}
            <div>
              <h2 className="bebas text-[20px] tracking-wide text-black mb-5">BASIC INFORMATION</h2>
              <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-8">
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col">
                    <label className="text-[13px] text-gray-600 mb-1.5">Event Title <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      className="h-[42px] px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[13px] text-gray-600 mb-1.5">Event Category <span className="text-red-500">*</span></label>
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
                    <label className="text-[13px] text-gray-600 mb-1.5">Event Seats <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      className="h-[42px] px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={eventSeats}
                      onChange={(e) => setEventSeats(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-5">
                  <div className="flex flex-col h-full">
                    <label className="text-[13px] text-gray-600 mb-1.5">Event Description <span className="text-red-500">*</span></label>
                    <textarea
                      className="flex-1 px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      value={eventDescription}
                      onChange={(e) => setEventDescription(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center gap-3">
                  <label htmlFor="eventPoster" className="cursor-pointer flex flex-col items-center">
                    {posterUrl ? (
                      <Image
                        src={posterUrl}
                        width={100}
                        height={100}
                        alt="Event Poster"
                        className="w-[100px] h-[100px] object-cover rounded-full"
                      />
                    ) : (
                      <div className="w-[100px] h-[100px] rounded-full bg-gray-100 flex items-center justify-center border border-gray-300">
                        <span className="text-gray-400 text-xs">No Image</span>
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
                  <p className="text-[13px] text-gray-700">Event Poster <span className="text-red-500">*</span></p>
                </div>
              </div>
            </div>

            {/* DATES AND TIME */}
            <div>
              <h2 className="bebas text-[20px] tracking-wide text-black mb-5">DATES AND TIME</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col">
                  <label className="text-[13px] text-gray-600 mb-1.5">Event Date <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    className="h-[42px] px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[13px] text-gray-600 mb-1.5">Start Time <span className="text-red-500">*</span></label>
                  <input
                    type="time"
                    className="h-[42px] px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={eventStartTime}
                    onChange={(e) => setEventStartTime(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[13px] text-gray-600 mb-1.5">Duration (Hours) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    className="h-[42px] px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={eventDuration || ""}
                    onChange={(e) => setEventDuration(parseInt(e.target.value, 10))}
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[13px] text-gray-600 mb-1.5">Reg. Closing Date <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    className="h-[42px] px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={eventRegistrationClosingDate}
                    onChange={(e) => setEventRegistrationClosingDate(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[13px] text-gray-600 mb-1.5">Reg. Closing Time <span className="text-red-500">*</span></label>
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

            {/* LOCATION AND MODE */}
            <div>
              <h2 className="bebas text-[20px] tracking-wide text-black mb-5">LOCATION AND MODE</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col">
                  <label className="text-[13px] text-gray-600 mb-1.5">Event Mode <span className="text-red-500">*</span></label>
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
                <div className="flex flex-col">
                  <label className="text-[13px] text-gray-600 mb-1.5">{eventMode === true ? "Platform" : "Location"} <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    className="h-[42px] px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[13px] text-gray-600 mb-1.5">{eventMode === true ? "Meet Link" : "Map Link"} <span className="text-red-500">*</span></label>
                  <input
                    type="url"
                    className="h-[42px] px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={eventMeetLink}
                    onChange={(e) => setEventMeetLink(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* PERKS AND FEE */}
            <div>
              <h2 className="bebas text-[20px] tracking-wide text-black mb-5">PERKS AND FEE</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <label className="text-[13px] text-gray-600 mb-1.5">Registration Fee</label>
                  <input
                    type="number"
                    className="h-[42px] px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={eventFee}
                    onChange={(e) => setEventFee(parseInt(e.target.value, 10))}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[13px] text-gray-600 mb-1.5">Prize Worth</label>
                  <input
                    type="number"
                    className="h-[42px] px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={eventPerks}
                    onChange={(e) => setEventPerks(parseInt(e.target.value, 10))}
                  />
                </div>
              </div>
            </div>

            {/* KEY FEATURES (SPEAKERS) */}
            <div>
              <h2 className="bebas text-[20px] tracking-wide text-black mb-5">KEY FEATURES (SPEAKERS AND GUESTS)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-5 bg-gray-50">
                  <h3 className="text-[14px] font-semibold mb-4">Add New Speaker/Guest</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[13px] text-gray-600 mb-1.5 block">Name <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        className="w-full h-[42px] px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-[13px] text-gray-600 mb-1.5 block">Designation</label>
                      <input
                        type="text"
                        className="w-full h-[42px] px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={guestDesignation}
                        onChange={(e) => setGuestDesignation(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-[13px] text-gray-600 mb-1.5 block">Photo</label>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                          {guestPhoto ? (
                            <Image src={URL.createObjectURL(guestPhoto)} width={40} height={40} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-gray-400 text-[10px]">No Img</span>
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="text-[13px] text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[12px] file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          onChange={handleGuestPhotoUpload}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddGuest}
                      className="w-full h-[42px] bg-[#2C333D] text-white bebas text-[16px] rounded hover:bg-[#1F2937] transition-colors"
                    >
                      ADD SPEAKER
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-[14px] font-semibold mb-4">Added Speakers ({guests.length})</h3>
                  {guests.length === 0 ? (
                    <div className="border border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-gray-400">
                      <p className="text-sm">No speakers added yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                      {guests.map((guest) => (
                        <div key={guest.id} className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                            {guest.photoUrl ? (
                              <Image src={guest.photoUrl} width={40} height={40} alt={guest.name} className="w-full h-full object-cover" />
                            ) : guest.photo ? (
                              <Image src={URL.createObjectURL(guest.photo)} width={40} height={40} alt={guest.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-teal-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-[14px] font-medium">{guest.name}</p>
                            <p className="text-[12px] text-gray-500">{guest.designation}</p>
                          </div>
                          <button type="button" onClick={() => handleRemoveGuest(guest.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-full">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* GUIDELINES */}
            <div>
              <h2 className="bebas text-[20px] tracking-wide text-black mb-5">GUIDELINES</h2>
              <textarea
                placeholder="Enter Event Guidelines"
                className="w-full min-h-[150px] px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                value={eventGuidelines}
                onChange={(e) => setEventGuidelines(e.target.value)}
              />
            </div>

            {/* SELECT AREAS (INTERESTS) */}
            <div>
              <h2 className="bebas text-[20px] tracking-wide text-black mb-5">SELECT AREAS RELATED TO THE EVENT</h2>
              <div className="bg-gray-50 p-6 rounded-lg space-y-6">
                {interestCategories.map(({ title, options }) => (
                  <div key={title}>
                    <h3 className="text-[14px] font-semibold text-gray-700 mb-3">{title}</h3>
                    <div className="flex flex-wrap gap-3">
                      {options.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => toggleSelection(option)}
                          disabled={selectedInterests.length >= 5 && !selectedInterests.some((item) => item.id === option.id)}
                          className={`px-4 py-1.5 text-[14px] rounded-full transition-all ${selectedInterests.some((item) => item.id === option.id)
                            ? "bg-white border-2 border-green-600 text-gray-800 shadow-sm"
                            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                            } ${selectedInterests.length >= 5 && !selectedInterests.some((item) => item.id === option.id)
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

            {/* REGISTRATION FORM QUESTIONS */}
            <div>
              <h2 className="bebas text-[20px] tracking-wide text-black mb-5">REGISTRATION FORM QUESTIONS</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-5 bg-gray-50">
                  <h3 className="text-[14px] font-semibold mb-4">Add New Question</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[13px] text-gray-600 mb-1.5 block">Question Type</label>
                      <select
                        value={questionType}
                        onChange={handleQuestionTypeChange}
                        className="w-full h-[42px] px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="">Choose Question Type</option>
                        <option value="multipleChoice">Multiple Choice</option>
                        <option value="shortAnswer">Short Answer</option>
                      </select>
                    </div>

                    {questionType && (
                      <>
                        <div>
                          <label className="text-[13px] text-gray-600 mb-1.5 block">Question</label>
                          <input
                            type="text"
                            value={currentQuestion}
                            onChange={(e) => setCurrentQuestion(e.target.value)}
                            className="w-full h-[42px] px-3 py-2.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={questionRequired}
                            onChange={(e) => setQuestionRequired(e.target.checked)}
                            id="req-check"
                          />
                          <label htmlFor="req-check" className="text-[13px] text-gray-700">Required?</label>
                        </div>

                        {questionType === "multipleChoice" && (
                          <div className="space-y-2">
                            <label className="text-[13px] text-gray-600 block">Options</label>
                            {options.map((option, index) => (
                              <div key={index} className="flex gap-2">
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) => {
                                    const newOptions = [...options];
                                    newOptions[index] = e.target.value;
                                    setOptions(newOptions);
                                  }}
                                  placeholder={`Option ${index + 1}`}
                                  className="flex-1 h-[36px] px-3 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                            ))}
                            <button type="button" onClick={addOption} className="text-[12px] text-blue-600 hover:underline flex items-center gap-1">
                              <Plus className="w-3 h-3" /> Add Option
                            </button>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={handleAddQuestion}
                          className="w-full h-[42px] bg-[#2C333D] text-white bebas text-[16px] rounded hover:bg-[#1F2937] transition-colors mt-2"
                        >
                          ADD QUESTION
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-[14px] font-semibold mb-4">Added Questions ({questions.length})</h3>
                  {questions.length === 0 ? (
                    <div className="border border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-gray-400">
                      <p className="text-sm">No questions added yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                      {questions.map((q) => (
                        <div key={q.id} className="bg-white border border-gray-200 rounded-lg p-3 relative group">
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(q.id)}
                            className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <p className="text-[14px] font-medium pr-6">{q.text}</p>
                          <div className="flex gap-3 mt-1 text-[12px] text-gray-500">
                            <span>{q.type === 'multipleChoice' ? 'Multiple Choice' : 'Short Answer'}</span>
                            <span>•</span>
                            <span>{q.required ? 'Required' : 'Optional'}</span>
                          </div>
                          {q.type === 'multipleChoice' && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {q.options.map((opt, i) => (
                                <span key={i} className="px-2 py-0.5 bg-gray-100 rounded text-[11px] text-gray-600">{opt}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {warningMessage && (
              <div className="p-3 bg-red-50 text-red-600 text-[14px] rounded-lg text-center">
                {warningMessage}
              </div>
            )}

            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                type="submit"
                className="h-[48px] px-12 bg-[#2C333D] hover:bg-[#1F2937] text-white bebas text-[20px] tracking-wide rounded transition-colors"
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
