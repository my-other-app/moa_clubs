"use client";

import { useState, useEffect, useCallback } from "react";
import Sidebar from "@/app/components/sidebar";
import { fetchEvents } from "@/app/utils/listEvents";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Link from "next/link";
import { Search, Edit, Trash2, ExternalLink } from "lucide-react";
import Image from "next/image";
import { useNavigate } from "@/app/utils/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { storage } from "@/app/services/auth.service";
import DeleteConfirmationModal from "@/app/components/DeleteConfirmationModal";

interface Event {
  id: number;
  name: string;
  slug: string;
  poster: {
    thumbnail?: string;
  } | null;
  registration_count: number;
  attended_count: number;
  is_past: boolean;
}

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [activeTab, setActiveTab] = useState("live");
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  const { navigateTo } = useNavigate();

  const getEvents = useCallback(async () => {
    setLoading(true);
    const isEnded = activeTab === "past";
    const fetchedEvents = await fetchEvents({ limit, isEnded });
    setEvents(fetchedEvents);
    setLoading(false);
  }, [limit, activeTab]);

  useEffect(() => {
    getEvents();
  }, [getEvents]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setLimit(10);
  };

  const handleShowMore = () => {
    setLimit((prev) => prev + 10);
  };

  const handleShare = async (event: Event, e: React.MouseEvent) => {
    e.stopPropagation();
    const urlToShare = `https://events.myotherapp.com/${event.slug}`;
    try {
      await navigator.clipboard.writeText(urlToShare);
      toast.success("Event URL copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy event URL.");
    }
  };

  const openDeleteModal = (eventId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEventId(eventId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (selectedEventId == null) return;

    const token = storage.getAccessToken();
    if (!token) {
      toast.error("No access token found");
      return;
    }

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await fetch(
        `${API_BASE_URL}/api/v1/events/delete/${selectedEventId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        toast.success("Event deleted successfully");
        getEvents();
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

  const handleEditEvent = (eventId: number, slug: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigateTo(`/dashboard/eventEachEdit/editCreateEvent?event_id=${eventId}&slug=${slug}`);
  };

  // Filter events based on search query
  const filteredEvents = events.filter((event) =>
    event.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#2C333D]">
      <Sidebar />
      <div className="flex-1 p-6 md:p-8">
        <div className="bg-white rounded-2xl p-6 md:p-10 min-h-[calc(100vh-4rem)]">
          {/* Page Title */}
          <h1 className="bebas text-[32px] md:text-[40px] tracking-wide text-black mb-4">
            EVENTS
          </h1>

          {/* Header Row: Tabs + Search + Create Button */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            {/* Left: Tabs and Search */}
            <div className="space-y-4">
              {/* Tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleTabChange("live")}
                  className={`px-4 py-2 text-[14px] rounded border transition-colors ${activeTab === "live"
                    ? "border-gray-800 text-gray-800 bg-white"
                    : "border-gray-300 text-gray-400 hover:border-gray-400"
                    }`}
                >
                  Live Events
                </button>
                <button
                  onClick={() => handleTabChange("past")}
                  className={`px-4 py-2 text-[14px] rounded border transition-colors ${activeTab === "past"
                    ? "border-gray-800 text-gray-800 bg-white"
                    : "border-gray-300 text-gray-400 hover:border-gray-400"
                    }`}
                >
                  Past Events
                </button>
              </div>

              {/* Search */}
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for events"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-[40px] pl-10 pr-4 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Right: Create Button */}
            <Link href="/dashboard/event/createEvent">
              <button className="h-[44px] px-6 bg-[#2C333D] hover:bg-[#1F2937] text-white bebas text-[16px] tracking-wide rounded transition-colors">
                CREATE NEW EVENT
              </button>
            </Link>
          </div>

          {/* Events List */}
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} height={80} className="rounded-lg" />
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500 text-[14px]">
                No {activeTab === "past" ? "past" : "live"} events found
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  onClick={() => navigateTo(`/dashboard/dashScreen?event_id=${event.id}`)}
                  className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] items-center gap-4 p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition-colors bg-white"
                >
                  {/* Left: Image + Event Info */}
                  <div className="flex items-center gap-4 min-w-0">
                    <Image
                      src={event.poster?.thumbnail || "/default-thumbnail.png"}
                      alt={event.name}
                      width={64}
                      height={64}
                      className="rounded-lg object-cover w-16 h-16 flex-shrink-0 bg-gray-100"
                    />
                    <div className="min-w-0">
                      <h3 className="text-[16px] font-semibold text-gray-900 truncate pr-4" title={event.name}>
                        {event.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${event.is_past ? "bg-gray-100 text-gray-600" : "bg-green-50 text-green-700"
                          }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${event.is_past ? "bg-gray-500" : "bg-green-500"}`} />
                          {event.is_past ? "Completed" : "Live"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Center: Stats */}
                  <div className="flex items-center gap-8 md:gap-12 w-full md:w-[300px] justify-start md:justify-center pl-[80px] md:pl-0 border-t md:border-t-0 pt-4 md:pt-0 border-gray-100 md:border-gray-0">
                    <div className="text-left md:text-center min-w-[80px]">
                      <p className="text-[20px] font-bold text-gray-900">{event.registration_count || 0}</p>
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Registrations</p>
                    </div>
                    <div className="text-left md:text-center min-w-[80px]">
                      <p className="text-[20px] font-bold text-gray-900">{event.attended_count || 0}</p>
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Checked In</p>
                    </div>
                  </div>

                  {/* Right: Action Buttons */}
                  <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-4 md:pt-0 border-gray-100 md:border-gray-0">
                    <button
                      onClick={(e) => handleEditEvent(event.id, event.slug, e)}
                      className="w-9 h-9 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 hover:text-blue-600 transition-colors"
                      title="Edit Event"
                    >
                      <Edit className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={(e) => openDeleteModal(event.id, e)}
                      className="w-9 h-9 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-red-50 hover:border-red-100 hover:text-red-600 transition-colors group"
                      title="Delete Event"
                    >
                      <Trash2 className="w-4 h-4 text-gray-500 group-hover:text-red-600" />
                    </button>
                    <button
                      onClick={(e) => handleShare(event, e)}
                      className="w-9 h-9 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 hover:text-gray-900 transition-colors"
                      title="Share Event"
                    >
                      <ExternalLink className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Show More Button */}
          {filteredEvents.length > 0 && (
            <div className="flex justify-center mt-8">
              <button
                onClick={handleShowMore}
                disabled={loading}
                className="h-[42px] px-12 bebas text-[18px] tracking-wide border border-[#2C333D] text-[#2C333D] rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {loading ? "LOADING..." : "SHOW MORE"}
              </button>
            </div>
          )}
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

