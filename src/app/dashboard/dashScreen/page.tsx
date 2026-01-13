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
    : registrations; // Show all registrations, not just paid

  // Calculate unique institutions count
  const uniqueInstitutions = new Set(
    registrations.map((reg) => reg.institution).filter(Boolean)
  ).size;

  const isPast = isEventPast();
  const totalRegistrations = registrations.length; // Count all registrations
  const pageViews = currentEvent?.page_views || 0;

  return (
    <div className="flex min-h-screen md:px-12">
      <Sidebar />
      <div className="flex-1 p-6">
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="bg-white rounded-tl-2xl rounded-bl-2xl p-8 min-h-[calc(100vh-3rem)]">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <h1 className="text-5xl font-['Bebas_Neue'] tracking-wide">
              {loadingEvent ? "Loading..." : currentEvent?.name || "Event Not Found"}
            </h1>
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={handleEditClick}
                className="w-12 h-12 p-3 bg-[#f3f3f3] rounded flex justify-center items-center"
              >
                <Edit className="w-6 h-6 text-[#979797]" />
              </button>
              <button
                onClick={() => openDeleteModal(parsedEventId)}
                className="w-12 h-12 p-3 bg-[#f3f3f3] rounded flex justify-center items-center"
              >
                <Trash className="w-6 h-6 text-[#979797]" />
              </button>
              <button
                onClick={handleShare}
                aria-label="Share this page"
                className="w-12 h-12 p-3 bg-[#f3f3f3] rounded flex justify-center items-center"
              >
                <FaExternalLinkAlt className="text-[#979797]" />
              </button>
              <Popup
                trigger={
                  <button className="p-3 flex items-center gap-2 bg-[#2c333d] text-white rounded-xl">
                    <Plus className="w-5 h-5" />
                    <span className="text-base font-medium font-['DM_Sans']">
                      Add Volunteers
                    </span>
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
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Event Image */}
            <div className="flex-shrink-0 w-full lg:w-auto">
              <Image
                src={
                  currentEvent?.poster?.medium ||
                  "https://dummyimage.com/600x400/000/fff"
                }
                alt="Event poster"
                width={600}
                height={600}
                className="rounded-lg w-full lg:w-[600px] h-auto object-cover"
              />
            </div>

            {/* Right Column - Dynamic Stats */}
            <div className="flex-1">
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {/* Status Card */}
                <div className={`h-[151px] px-4 sm:px-[60px] py-[29px] rounded-lg flex flex-col justify-center items-center ${isPast ? "bg-[#f3aba7]" : "bg-[#b4e5bc]"
                  }`}>
                  <div className="flex flex-col justify-start items-center gap-2">
                    <div className="inline-flex justify-start items-center gap-2">
                      <div className={`w-4 h-4 rounded-full ${isPast ? "bg-[#cc0000]" : "bg-[#096b5b]"}`} />
                      <div className={`text-[32px] font-medium font-['DM_Sans'] ${isPast ? "text-[#cc0000]" : "text-[#096b5b]"}`}>
                        {isPast ? "Ended" : "Live"}
                      </div>
                    </div>
                    <div className={`text-center text-base font-light font-['DM_Sans'] ${isPast ? "text-[#cc0000]" : "text-[#096b5b]"}`}>
                      {isPast ? "This event has ended" : "The event is live and registrations are open"}
                    </div>
                  </div>
                </div>

                {/* Registration Count */}
                <div className="h-[151px] px-4 sm:px-[60px] py-[27px] bg-[#ccc1f0] rounded-lg flex flex-col justify-center items-center">
                  <div className="flex flex-col justify-start items-center gap-2">
                    <div className="text-[#9747ff] text-4xl font-bold font-['DM_Sans']">
                      {totalRegistrations}
                    </div>
                    <div className="text-center text-[#9747ff] text-base font-light font-['DM_Sans']">
                      Total Registrations
                    </div>
                  </div>
                </div>

                {/* Page Views */}
                <div className="h-[151px] px-4 sm:px-[60px] py-10 bg-[#b8dff2] rounded-lg flex flex-col justify-center items-center">
                  <div className="flex flex-col justify-start items-center gap-2">
                    <div className="text-center text-[#0a4e6f] text-[32px] font-bold font-['DM_Sans']">
                      {pageViews}
                    </div>
                    <div className="text-center text-[#0a4e6f] text-base font-light font-['DM_Sans']">
                      Event Visitors
                    </div>
                  </div>
                </div>

                {/* Institutions */}
                <div className="h-[151px] px-4 sm:px-[60px] py-10 bg-[#f3aba7] rounded-lg flex flex-col justify-center items-center">
                  <div className="flex flex-col justify-between items-center">
                    <div className="text-[#cc0000] text-[32px] font-bold font-['DM_Sans']">
                      {uniqueInstitutions}
                    </div>
                    <div className="text-center text-[#cc0000] text-base font-light font-['DM_Sans']">
                      Institutions
                    </div>
                  </div>
                </div>
              </div>

              {/* Announcements Section */}
              <div className="w-full flex flex-col justify-start items-start gap-1 mb-8">
                <div className="text-black text-2xl font-normal font-['Bebas_Neue']">
                  Make Announcements
                </div>
                <div className="self-stretch flex flex-col justify-start items-start gap-1 w-full">
                  <div className="text-[#2c333d] text-xs font-normal font-['DM_Sans']">
                    Send message to the registered participants as notifications
                  </div>
                  <Textarea
                    placeholder="Enter the message send"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="self-stretch min-h-[160px] pl-2 pr-3.5 py-1.5 bg-white rounded-lg border border-[#2c333d] text-base font-medium w-full"
                  />
                </div>
                <Button
                  variant="outline"
                  className="w-60 h-[60px] px-[50px] py-[15px] bg-white rounded-lg border border-[#2c333d] mt-4"
                  onClick={handleSendMessage}
                >
                  <span className="text-center text-[#2c333d] text-2xl font-normal font-['Bebas_Neue']">
                    Send Message
                  </span>
                </Button>
              </div>
            </div>
          </div>

          {/* Registration / Attendance Table */}
          <div className="mt-12">
            <div className="w-full flex flex-col justify-start items-start gap-4">
              <div className="self-stretch flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex justify-start items-start gap-9">
                  <div
                    onClick={() => setActiveTab("registration")}
                    className="w-[145px] inline-flex flex-col justify-start items-center gap-1 cursor-pointer"
                  >
                    <div
                      className={`self-stretch text-center text-xl font-medium font-['DM_Sans'] ${activeTab === "registration" ? "text-[#2c333d]" : "text-[#b4b4b4]"
                        }`}
                    >
                      Registration
                    </div>
                    {activeTab === "registration" && (
                      <div className="w-[145px] h-0 border-b-[3px] border-[#2c333d]" />
                    )}
                  </div>
                  <div
                    onClick={() => setActiveTab("attendance")}
                    className="w-[145px] inline-flex flex-col justify-start items-center gap-1 cursor-pointer"
                  >
                    <div
                      className={`self-stretch text-center text-xl font-medium font-['DM_Sans'] ${activeTab === "attendance" ? "text-[#2c333d]" : "text-[#b4b4b4]"
                        }`}
                    >
                      Attendance
                    </div>
                    {activeTab === "attendance" && (
                      <div className="w-[145px] h-0 border-b-[3px] border-[#2c333d]" />
                    )}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-start items-center gap-[18px] w-full md:w-auto">
                  <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-3 w-6 h-6 text-[#979797]" />
                    <Input
                      placeholder="Search for participants"
                      className="w-full sm:w-[401px] h-12 pl-12 bg-white rounded-lg border border-[#979797] text-base font-light"
                    />
                  </div>
                  <Button
                    variant="default"
                    className="h-12 px-4 py-2 bg-[#2c333d] rounded-lg flex items-center gap-4 w-full sm:w-auto"
                    onClick={handleDownloadCSV}
                  >
                    <Download className="w-4 h-5 text-white" />
                    <span className="text-white text-xs font-normal">
                      Download file
                    </span>
                  </Button>
                </div>
              </div>

              <div className="w-full overflow-x-auto border border-[#979797] rounded-lg">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#b4e5bc]">
                      <th className="py-3 px-4 text-left text-[#2c333d] text-xl font-light font-['DM_Sans']">
                        Registration ID
                      </th>
                      <th className="py-3 px-4 text-left text-[#2c333d] text-xl font-light font-['DM_Sans']">
                        Participant Name
                      </th>
                      <th className="py-3 px-4 text-left text-[#2c333d] text-xl font-light font-['DM_Sans']">
                        Email
                      </th>
                      <th className="py-3 px-4 text-left text-[#2c333d] text-xl font-light font-['DM_Sans']">
                        Number
                      </th>
                      <th className="py-3 px-4 text-left text-[#2c333d] text-xl font-light font-['DM_Sans']">
                        Organization
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRegistrations.length > 0 ? (
                      filteredRegistrations.map((reg, index) => (
                        <tr
                          key={reg.id || index}
                          className={
                            index !== filteredRegistrations.length - 1
                              ? "border-b border-[#979797]"
                              : ""
                          }
                        >
                          <td className="py-4 px-4 text-[#979797] text-xl font-light font-['DM_Sans']">
                            {reg.id}
                          </td>
                          <td className="py-4 px-4 text-[#979797] text-xl font-light font-['DM_Sans']">
                            {reg.full_name}
                          </td>
                          <td className="py-4 px-4 text-[#979797] text-xl font-light font-['DM_Sans']">
                            {reg.email}
                          </td>
                          <td className="py-4 px-4 text-[#979797] text-xl font-light font-['DM_Sans']">
                            {reg.phone}
                          </td>
                          <td className="py-4 px-4 text-[#979797] text-xl font-light font-['DM_Sans']">
                            {reg.institution || reg.profile || "-"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-4 px-4 text-center text-[#979797]">
                          {loadingRegistrations ? "Loading..." : "No registrations found"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Show More Registrations Button */}
              <div className="flex justify-center w-full mt-4">
                <Button
                  variant="outline"
                  onClick={handleShowMoreRegistrations}
                  disabled={loadingRegistrations}
                  className="w-60 h-[60px] px-[50px] py-[15px] bg-white rounded-lg border border-[#2c333d]"
                >
                  <span className="text-center text-[#2c333d] text-2xl font-normal font-['Bebas_Neue']">
                    {loadingRegistrations ? "Loading..." : "Show More"}
                  </span>
                </Button>
              </div>
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
