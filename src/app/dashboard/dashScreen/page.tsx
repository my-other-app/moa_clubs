"use client";

import axios from "axios";
import {
  MouseEventHandler,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import Image from "next/image";
import { Edit, Trash, Download, Search, Plus } from "lucide-react";
import Sidebar from "@/app/components/sidebar";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Popup from "reactjs-popup";
import Volunteer from "@/app/components/dashboard/volunteer";
import { useNavigate } from "@/app/utils/navigation";
import { FaExternalLinkAlt } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { storage } from "@/app/services/auth.service";
import { fetchEventById } from "@/app/utils/listEvents";

import DeleteConfirmationModal from "@/app/components/DeleteConfirmationModal";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface EventData {
  id: number;
  name: string;
  slug: string;
  poster?: {
    medium: string;
  };
  page_views: number;
  event_datetime: string;
  duration: number;
  is_online: boolean;
}

interface Registration {
  profile: ReactNode;
  ticket_id: ReactNode;
  full_name: ReactNode;
  id: number;
  name: string;
  email: string;
  phone: string;
  institution: string;
  is_attended: boolean;
  is_paid: boolean;
}

export default function DashScreen() {
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("registration");
  const [currentEvent, setCurrentEvent] = useState<EventData | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [regLimit, setRegLimit] = useState(10);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  const searchParams = useSearchParams();
  const event_id = searchParams.get("event_id");
  const parsedEventId = event_id ? Number.parseInt(event_id, 10) : 0;

  const { navigateTo } = useNavigate();

  // Fetch event details directly by ID
  const getEventDetails = useCallback(async () => {
    if (!parsedEventId) return;

    setLoadingEvent(true);
    const eventData = await fetchEventById(parsedEventId);
    setCurrentEvent(eventData);
    setLoadingEvent(false);
  }, [parsedEventId]);

  // Fetch registrations
  const getRegistrations = useCallback(async () => {
    const accessToken = storage.getAccessToken();
    if (!accessToken || !parsedEventId) return;

    setLoadingRegistrations(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/events/registration/${parsedEventId}/list?limit=${regLimit}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setRegistrations(response.data.items || []);
    } catch (error) {
      console.error("Error fetching registrations:", error);
    } finally {
      setLoadingRegistrations(false);
    }
  }, [parsedEventId, regLimit]);

  useEffect(() => {
    getEventDetails();
    getRegistrations();
  }, [getEventDetails, getRegistrations]);

  // Check if event is past based on datetime + duration
  const isEventPast = useCallback(() => {
    if (!currentEvent) return false;
    const eventEnd = new Date(currentEvent.event_datetime);
    eventEnd.setHours(eventEnd.getHours() + (currentEvent.duration || 0));
    return eventEnd < new Date();
  }, [currentEvent]);

  const handleEditClick = () => {
    if (currentEvent?.slug) {
      navigateTo(
        `/dashboard/eventEachEdit/editCreateEvent?event_id=${parsedEventId}&slug=${currentEvent.slug}`
      );
    } else if (event_id) {
      navigateTo(`/dashboard/eventEachEdit/editCreateEvent?event_id=${event_id}`);
    }
  };

  const handleShare = async () => {
    const urlToShare = currentEvent?.slug
      ? `https://events.myotherapp.com/${currentEvent.slug}`
      : window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: currentEvent?.name || "Check out this event",
          url: urlToShare,
        });
        toast.success("Event URL shared successfully!");
      } catch (error) {
        toast.error("Error sharing the page.");
      }
    } else {
      try {
        await navigator.clipboard.writeText(urlToShare);
        toast.info("URL copied to clipboard!");
      } catch (err) {
        toast.error("Failed to copy URL.");
      }
    }
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    console.log("Sending message:", message);
    setMessage("");
  };

  const handleDownloadCSV = async () => {
    const accessToken = storage.getAccessToken();
    if (!accessToken) return;

    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/events/registration/${parsedEventId}/export`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "registration.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading:", error);
    }
  };

  const handleShowMoreRegistrations = () => {
    setRegLimit((prev) => prev + 10);
  };

  const openDeleteModal = (eventId: number) => {
    setSelectedEventId(eventId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (selectedEventId == null) return;

    const token = storage.getAccessToken();
    if (!token) {
      toast.error("Access token not found");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/events/delete/${selectedEventId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        toast.success("Event deleted successfully");
        navigateTo("/dashboard/events");
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to delete the event");
      }
    } catch (error) {
      toast.error("Error deleting the event");
    } finally {
      setShowDeleteModal(false);
      setSelectedEventId(null);
    }
  };

  // Filter registrations based on tab
  const filteredRegistrations = activeTab === "attendance"
    ? registrations.filter((reg) => reg.is_attended)
    : registrations;

  // Calculate unique institutions count
  const uniqueInstitutions = new Set(
    registrations.map((reg) => reg.institution).filter(Boolean)
  ).size;

  const isPast = isEventPast();
  const totalRegistrations = registrations.length;
  const pageViews = currentEvent?.page_views || 0;

  return (
    <div className="flex min-h-screen bg-[#2C333D]">
      <Sidebar />
      <div className="flex-1 p-6 md:p-8">
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="bg-white rounded-2xl p-6 md:p-8 min-h-[calc(100vh-4rem)] shadow-sm">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <h1 className="bebas text-[32px] md:text-[40px] tracking-wide text-black">
              {loadingEvent ? "Loading..." : currentEvent?.name || "Event Not Found"}
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleEditClick}
                className="w-10 h-10 bg-[#f3f3f3] rounded-lg flex justify-center items-center hover:bg-gray-200 transition-colors"
              >
                <Edit className="w-5 h-5 text-[#979797]" />
              </button>
              <button
                onClick={() => openDeleteModal(parsedEventId)}
                className="w-10 h-10 bg-[#f3f3f3] rounded-lg flex justify-center items-center hover:bg-gray-200 transition-colors"
              >
                <Trash className="w-5 h-5 text-[#979797]" />
              </button>
              <button
                onClick={handleShare}
                aria-label="Share this page"
                className="w-10 h-10 bg-[#f3f3f3] rounded-lg flex justify-center items-center hover:bg-gray-200 transition-colors"
              >
                <FaExternalLinkAlt className="w-4 h-4 text-[#979797]" />
              </button>
              <Popup
                trigger={
                  <button className="h-10 px-4 flex items-center gap-2 bg-[#2c333d] text-white rounded-lg hover:bg-[#1f2937] transition-colors">
                    <Plus className="w-4 h-4" />
                    <span className="text-[14px] font-medium">Add Volunteers</span>
                  </button>
                }
                modal
                nested
                overlayStyle={{ background: "rgba(0, 0, 0, 0.5)" }}
                contentStyle={{ width: "900px", padding: "20px" }}
              >
                {((close: MouseEventHandler<HTMLButtonElement> | undefined) => (
                  <div className="p-4 bg-white rounded-2xl">
                    <button
                      onClick={close}
                      className="text-right w-full text-black mb-2"
                    >
                      X
                    </button>
                    <Volunteer event_id={parsedEventId} />
                  </div>
                )) as unknown as ReactNode}
              </Popup>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Column - Event Image */}
            <div className="flex-shrink-0 w-full lg:w-[400px]">
              <Image
                src={
                  currentEvent?.poster?.medium ||
                  "https://dummyimage.com/400x400/000/fff"
                }
                alt="Event poster"
                width={400}
                height={400}
                className="rounded-lg w-full h-auto object-cover"
              />
            </div>

            {/* Right Column - Stats & Announcements */}
            <div className="flex-1">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {/* Status Card - Live/Ended */}
                <div className={`h-[100px] rounded-lg flex flex-col justify-center items-center ${isPast ? "bg-[#fce8e6]" : "bg-[#d4edda]"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2.5 h-2.5 rounded-full ${isPast ? "bg-red-500" : "bg-[#096b5b]"}`} />
                    <span className={`text-[24px] font-medium ${isPast ? "text-red-500" : "text-[#096b5b]"}`}>
                      {isPast ? "Ended" : "Live"}
                    </span>
                  </div>
                  <p className={`text-[12px] text-center px-2 ${isPast ? "text-red-500" : "text-[#096b5b]"}`}>
                    {isPast ? "This event has ended" : "The event is live and registrations are open"}
                  </p>
                </div>

                {/* Registration Count */}
                <div className="h-[100px] bg-[#f3e8ff] rounded-lg flex flex-col justify-center items-center">
                  <span className="text-[28px] font-bold text-[#9333ea]">{totalRegistrations}</span>
                  <span className="text-[12px] text-[#9333ea]">Total Registration Count</span>
                </div>

                {/* Page Views */}
                <div className="h-[100px] bg-[#dbeafe] rounded-lg flex flex-col justify-center items-center">
                  <span className="text-[28px] font-bold text-[#1e40af]">{pageViews}</span>
                  <span className="text-[12px] text-[#1e40af]">Event Visitors</span>
                </div>

                {/* Institutions */}
                <div className="h-[100px] bg-[#fce8e6] rounded-lg flex flex-col justify-center items-center">
                  <span className="text-[28px] font-bold text-[#dc2626]">{uniqueInstitutions}</span>
                  <span className="text-[12px] text-[#dc2626]">Institutions</span>
                </div>
              </div>

              {/* Announcements Section */}
              <div className="w-full">
                <h2 className="bebas text-[18px] tracking-wide text-black mb-1">MAKE ANNOUNCEMENTS</h2>
                <p className="text-[11px] text-gray-600 mb-2">
                  Send message to the registered participants as notifications
                </p>
                <Textarea
                  placeholder="Enter the message send"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full min-h-[120px] px-3 py-2 text-[14px] border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button
                  variant="outline"
                  className="mt-3 h-[42px] px-8 bebas text-[18px] tracking-wide border-[#2c333d] text-[#2c333d] hover:bg-gray-50"
                  onClick={handleSendMessage}
                >
                  SEND MESSAGE
                </Button>
              </div>
            </div>
          </div>

          {/* Registration / Attendance Table */}
          <div className="mt-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              {/* Tabs */}
              <div className="flex items-center gap-6">
                <button
                  onClick={() => setActiveTab("registration")}
                  className={`pb-2 text-[16px] font-medium transition-colors ${activeTab === "registration"
                    ? "text-[#2c333d] border-b-2 border-[#2c333d]"
                    : "text-gray-400 hover:text-gray-600"
                    }`}
                >
                  Registration
                </button>
                <button
                  onClick={() => setActiveTab("attendance")}
                  className={`pb-2 text-[16px] font-medium transition-colors ${activeTab === "attendance"
                    ? "text-[#2c333d] border-b-2 border-[#2c333d]"
                    : "text-gray-400 hover:text-gray-600"
                    }`}
                >
                  Attendance
                </button>
              </div>

              {/* Search & Download */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                <div className="relative w-full sm:w-[280px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search for participants"
                    className="w-full h-10 pl-10 text-[14px] border-gray-300 rounded-lg"
                  />
                </div>
                <Button
                  variant="default"
                  className="h-10 px-4 bg-[#2c333d] rounded-lg flex items-center gap-2 hover:bg-[#1f2937] w-full sm:w-auto"
                  onClick={handleDownloadCSV}
                >
                  <Download className="w-4 h-4 text-white" />
                  <span className="text-white text-[13px]">Download CSV file</span>
                </Button>
              </div>
            </div>

            {/* Table */}
            <div className="w-full overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="bg-[#d4edda]">
                    <th className="py-3 px-4 text-left text-[14px] font-medium text-[#2c333d]">
                      Registration ID
                    </th>
                    <th className="py-3 px-4 text-left text-[14px] font-medium text-[#2c333d]">
                      Participant Name
                    </th>
                    <th className="py-3 px-4 text-left text-[14px] font-medium text-[#2c333d]">
                      Email
                    </th>
                    <th className="py-3 px-4 text-left text-[14px] font-medium text-[#2c333d]">
                      Number
                    </th>
                    <th className="py-3 px-4 text-left text-[14px] font-medium text-[#2c333d]">
                      College Name
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRegistrations.length > 0 ? (
                    filteredRegistrations.map((reg, index) => (
                      <tr
                        key={reg.id || index}
                        className={index !== filteredRegistrations.length - 1 ? "border-b border-gray-200" : ""}
                      >
                        <td className="py-3 px-4 text-[14px] text-gray-600">
                          {reg.ticket_id || `NEX${reg.id}AA001`}
                        </td>
                        <td className="py-3 px-4 text-[14px] text-gray-600">
                          {reg.full_name}
                        </td>
                        <td className="py-3 px-4 text-[14px] text-gray-600">
                          {reg.email}
                        </td>
                        <td className="py-3 px-4 text-[14px] text-gray-600">
                          {reg.phone}
                        </td>
                        <td className="py-3 px-4 text-[14px] text-gray-600">
                          {reg.institution || reg.profile || "-"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 px-4 text-center text-gray-500 text-[14px]">
                        {loadingRegistrations ? "Loading..." : "No registrations found"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Show All Button */}
            <div className="flex justify-center mt-6">
              <Button
                variant="outline"
                onClick={handleShowMoreRegistrations}
                disabled={loadingRegistrations}
                className="h-[42px] px-12 bebas text-[18px] tracking-wide border-[#2c333d] text-[#2c333d] hover:bg-gray-50"
              >
                {loadingRegistrations ? "LOADING..." : "SHOW ALL"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

