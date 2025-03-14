import Image from "next/image";
import { FaTrash, FaExternalLinkAlt, FaEllipsisV } from "react-icons/fa";
import { useNavigate } from "@/app/utils/navigation";
import { StaticImport } from "next/dist/shared/lib/get-img-props";
import { Key, ReactNode, useState } from "react";

// Define Props Type – note the added is_past property
interface Event {
  category: {
    name: string;
  } | null;
  poster: {
    thumbnail?: string;
  } | null;
  name: ReactNode;
  id: number; // Change Key to number
  image: string | StaticImport;
  title: string;
  status: string;
  registrationCount: number;
  is_past: boolean;
}

interface EventsListProps {
  events: Event[];
  activeTab: string;
}

export default function EventsList({ events, activeTab }: EventsListProps) {
  const { navigateTo } = useNavigate();
  const [openMenuId, setOpenMenuId] = useState<Key | null>(null);



  const handleShare = (eventId: Key) => {
    console.log(`Sharing event with ID: ${eventId}`);
    setOpenMenuId(null);
  };

  const handleDelete = async (eventId: number) => {
    const confirmed = window.confirm("Are you sure you want to delete this event?");
    if (!confirmed) return;

    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("Access token not found");
      return;
    }

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await fetch(
        `${API_BASE_URL}/api/v1/events/delete/${eventId}`,
        {
          method: "DELETE",
          headers: {
        Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        console.log("Event deleted successfully");
        window.location.reload();
      } else {
        const data = await response.json();
        alert(data.message || "Failed to delete the event");
      }
    } catch (error) {
      console.error("Error deleting the event:", error);
    }
  };


  const toggleMenu = (eventId: Key, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuId(prev => (prev === eventId ? null : eventId));
  };

  // Filter events based on activeTab: if "past", show events with is_past true;
  // otherwise, show live events (is_past false)
  const filteredEvents = events.filter(event => {
    return activeTab === "past" ? event.is_past === true : event.is_past !== true;
  });

  return (
    <div className="p-6">
      {/* Events List: 2 events per row */}
      <div className="grid grid-cols-2 gap-4">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <div
              key={event.id}
              className="relative flex items-center justify-between border-2 border-gray-300 rounded-lg p-4 cursor-pointer"
              onClick={() => navigateTo(`/dashboard/dashScreen?event_id=${event.id}`)}
            >
              {/* Left: Event Details */}
              <div className="flex items-center">
                <Image
                  src={event.poster?.thumbnail || "/default-thumbnail.png"}
                  alt={typeof event.name === "string" ? event.name : ""}
                  width={50}
                  height={50}
                  className="rounded-md"
                />
                <div className="ml-4">
                  <h2 className="text-lg font-semibold">{event.name}</h2>
                  <h2 className="text-md font-semibold">{event.category?.name}</h2>
                  <span className="text-green-600 text-sm">{event.status}</span>
                </div>
              </div>

              {/* Right: Registration Count & Three Dots */}
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <h3 className="text-xl font-bold">{event.registrationCount}</h3>
                  <p className="text-gray-500 text-sm">Registration Count</p>
                </div>
                <button
                  onClick={(e) => toggleMenu(event.id, e)}
                  className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none active:translate-x-0 transition-none"
                  aria-label="Actions"
                >
                  <FaEllipsisV />
                </button>

                {/* Popup Menu */}
                {openMenuId === event.id && (
                  <div
                    className="absolute right-6 top-14 mt-2 w-40 bg-white border border-gray-200 rounded shadow-lg z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare(event.id);
                      }}
                      className="flex items-center w-full px-4 py-2 hover:bg-gray-100"
                    >
                      <FaExternalLinkAlt className="mr-2" />
                      Share
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(event.id);
                        setOpenMenuId(null);
                      }}
                      className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-gray-100"
                    >
                      <FaTrash className="mr-2" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center col-span-2">No events found</p>
        )}
      </div>
    </div>
  );
}
