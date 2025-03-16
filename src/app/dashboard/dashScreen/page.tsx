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

// Import your custom DeleteConfirmationModal
import DeleteConfirmationModal from "@/app/components/DeleteConfirmationModal";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const getAccessToken = () => localStorage.getItem("accessToken");

export default function DashScreen() {
  const [message, setMessage] = useState("");
  // State to track which tab is active: "registration" or "attendance"
  const [activeTab, setActiveTab] = useState("registration");

  // Updated interface: added slug property.
  interface Event {
    id: number;
    name: string;
    slug: string;
    poster?: {
      medium: string;
    };
  }

  // Registration type updated to include is_attended and is_paid.
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

  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  // Registration limit state, defaulting to 10
  const [regLimit, setRegLimit] = useState(10);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);

  // State for delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  const searchParams = useSearchParams();
  const event_id = searchParams.get("event_id");
  const parsedEventId = event_id ? Number.parseInt(event_id as string, 10) : 0;

  const { navigateTo } = useNavigate();

  // Fetch events from API
  const getEvents = useCallback(async () => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      console.warn("⚠️ No access token found! User might be logged out.");
      return;
    }
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/clubs/events/list`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setEvents(response.data.items);
    } catch (error) {
      console.error("❌ Error fetching events:", error);
    }
  }, []);

  // Fetch registrations from API using the current regLimit
  const getRegistrations = useCallback(async () => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      console.error("No access token found");
      return;
    }
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
      // Assuming the API returns an object with an "items" array
      setRegistrations(response.data.items);
    } catch (error) {
      console.error("Error fetching registrations:", error);
    } finally {
      setLoadingRegistrations(false);
    }
  }, [parsedEventId, regLimit]);

  // Fetch events and registrations on mount or when dependencies change.
  useEffect(() => {
    getEvents();
    if (parsedEventId) {
      getRegistrations();
    }
  }, [event_id, parsedEventId, getEvents, getRegistrations]);

  // Find the event matching the event_id
  const currentEvent = events.find((event) => event.id === parsedEventId);
  console.log(currentEvent);

  // Edit handler: navigate with both event_id and event slug.
  const handleEditClick = () => {
    if (currentEvent && currentEvent.slug) {
      navigateTo(
        `/dashboard/eventEachEdit/editCreateEvent?event_id=${parsedEventId}&slug=${currentEvent.slug}`
      );
    } else if (event_id) {
      // Fallback if slug is missing
      navigateTo(`/dashboard/eventEachEdit/editCreateEvent?event_id=${event_id}`);
    } else {
      console.error("Event ID not found in URL");
    }
  };

  // Share handler: share the URL using the event slug if available.
  const handleShare = async () => {
    let urlToShare = window.location.href;
    if (currentEvent && currentEvent.slug) {
      urlToShare = `https://events.myotherapp.com/${currentEvent.slug}`;
    }
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentEvent ? currentEvent.name : "Check out this event",
          url: urlToShare,
        });
        toast.success("Event URL shared successfully!");
      } catch (error) {
        toast.error("Error sharing the page.");
        console.error("Error sharing", error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(urlToShare);
        toast.info("URL copied to clipboard!");
      } catch (err) {
        toast.error("Failed to copy URL.");
        console.error("Failed to copy: ", err);
      }
    }
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    console.log("Sending message:", message);
    setMessage("");
  };

  const handleDownloadCSV = async () => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      console.error("No access token found");
      return;
    }
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/events/registration/${parsedEventId}/export`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
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

  // Increase registration limit by 10 on "Show More" click.
  const handleShowMoreRegistrations = () => {
    setRegLimit((prev) => prev + 10);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // CUSTOM DELETE MODAL LOGIC
  // ─────────────────────────────────────────────────────────────────────────────

  // Open the custom modal
  const openDeleteModal = (eventId: number) => {
    setSelectedEventId(eventId);
    setShowDeleteModal(true);
  };

  // Confirm the delete action
  const confirmDelete = async () => {
    if (selectedEventId == null) return;

    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("Access token not found");
      toast.error("Access token not found");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/events/delete/${selectedEventId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        toast.success("Event deleted successfully");
        window.location.reload();
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to delete the event");
      }
    } catch (error) {
      console.error("Error deleting the event:", error);
      toast.error("Error deleting the event");
    } finally {
      setShowDeleteModal(false);
      setSelectedEventId(null);
    }
  };

  // Filter registrations to show only those that are paid
  const paidRegistrations = registrations.filter((reg) => reg.is_paid);

  return (
    <div className="flex min-h-screen md:px-12">
      <Sidebar />
      <div className="flex-1 p-6">
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="bg-white rounded-tl-2xl rounded-bl-2xl p-8 min-h-[calc(100vh-3rem)]">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <h1 className="text-5xl font-['Bebas_Neue'] tracking-wide">
              {currentEvent ? currentEvent.name : "Loading....."}
            </h1>
            <div className="flex flex-wrap items-center gap-4">
              {/* Edit Button */}
              <button
                onClick={handleEditClick}
                className="w-12 h-12 p-3 bg-[#f3f3f3] rounded flex justify-center items-center"
              >
                <Edit className="w-6 h-6 text-[#979797]" />
              </button>
              {/* Delete Button - open modal instead of window.confirm */}
              <button
                onClick={() => openDeleteModal(parsedEventId)}
                className="w-12 h-12 p-3 bg-[#f3f3f3] rounded flex justify-center items-center"
              >
                <Trash className="w-6 h-6 text-[#979797]" />
              </button>
              {/* Share Button */}
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
                    <Volunteer
                      event_id={
                        Array.isArray(event_id)
                          ? parseInt(event_id[0], 10)
                          : parseInt(event_id as string, 10)
                      }
                    />
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

            {/* Right Column - Stats and Announcements */}
            <div className="flex-1">
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                <div className="h-[151px] px-4 sm:px-[60px] py-[29px] bg-[#b4e5bc] rounded-lg flex flex-col justify-center items-center">
                  <div className="flex flex-col justify-start items-center gap-2">
                    <div className="inline-flex justify-start items-center gap-2">
                      <div className="w-4 h-4 bg-[#096b5b] rounded-full" />
                      <div className="text-[#096b5b] text-[32px] font-medium font-['DM_Sans']">
                        Live
                      </div>
                    </div>
                    <div className="text-center text-[#096b5b] text-base font-light font-['DM_Sans']">
                      The event is live and registrations are open
                    </div>
                  </div>
                </div>
                <div className="h-[151px] px-4 sm:px-[60px] py-[27px] bg-[#ccc1f0] rounded-lg flex flex-col justify-center items-center">
                  <div className="flex flex-col justify-start items-center gap-2">
                    <div className="text-[#9747ff] text-4xl font-bold font-['DM_Sans']">
                      24
                    </div>
                    <div className="text-center text-[#9747ff] text-base font-light font-['DM_Sans']">
                      Total Registration Count
                    </div>
                  </div>
                </div>
                <div className="h-[151px] px-4 sm:px-[60px] py-10 bg-[#b8dff2] rounded-lg flex flex-col justify-center items-center">
                  <div className="flex flex-col justify-start items-center gap-2">
                    <div className="text-center text-[#0a4e6f] text-[32px] font-bold font-['DM_Sans']">
                      234
                    </div>
                    <div className="text-center text-[#0a4e6f] text-base font-light font-['DM_Sans']">
                      Event Visitors
                    </div>
                  </div>
                </div>
                <div className="h-[151px] px-4 sm:px-[60px] py-10 bg-[#f3aba7] rounded-lg flex flex-col justify-center items-center">
                  <div className="flex flex-col justify-between items-center">
                    <div className="text-[#cc0000] text-[32px] font-bold font-['DM_Sans']">
                      2
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
                  <div className="flex justify-start items-start gap-9">
                    <div
                      onClick={() => setActiveTab("registration")}
                      className="w-[145px] inline-flex flex-col justify-start items-center gap-1 cursor-pointer"
                    >
                      <div
                        className={`self-stretch text-center text-xl font-medium font-['DM_Sans'] ${
                          activeTab === "registration"
                            ? "text-[#2c333d]"
                            : "text-[#b4b4b4]"
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
                        className={`self-stretch text-center text-xl font-medium font-['DM_Sans'] ${
                          activeTab === "attendance"
                            ? "text-[#2c333d]"
                            : "text-[#b4b4b4]"
                        }`}
                      >
                        Attendance
                      </div>
                      {activeTab === "attendance" && (
                        <div className="w-[145px] h-0 border-b-[3px] border-[#2c333d]" />
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-start items-center gap-[18px] w-full md:w-auto">
                  <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-3 w-6 h-6 text-[#979797]" />
                    <Input
                      placeholder="Search for events"
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
                        Organization Name
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paidRegistrations.length > 0 ? (
                      paidRegistrations.map((reg, index) => (
                        <tr
                          key={index}
                          className={
                            index !== paidRegistrations.length - 1
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
                            {reg.profile}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-4 px-4 text-center text-[#979797]"
                        >
                          No registrations found
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
