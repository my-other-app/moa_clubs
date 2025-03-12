import Image from "next/image";
import { FaEdit, FaTrash, FaExternalLinkAlt } from "react-icons/fa";
import { useNavigate } from "@/app/utils/navigation";
import { StaticImport } from "next/dist/shared/lib/get-img-props";
import { Key, ReactNode } from "react";

// Define Props Type
interface Event {
  category: {
    name: string;
  } | null;
  poster: {
    thumbnail?: string;
    // ...any other poster properties you need
  } | null;
  name: ReactNode;
  id: Key;
  image: string | StaticImport;
  title: string;
  status: string;
  registrationCount: number;
}

interface EventsListProps {
  events: Event[];
}

export default function EventsList({ events }: EventsListProps) {
  const { navigateTo } = useNavigate();

  const handleDelete = async (eventId: Key) => {
    // Add a confirmation popup before deletion
    const confirmed = window.confirm("Are you sure you want to delete this event?");
    if (!confirmed) return;
  
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("Access token not found");
      return;
    }
  
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/events/delete/${eventId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
  
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
  
  

  return (
    <div className="p-6">
      {/* Events List */}
      <div className="space-y-4">
        {events.length > 0 ? (
          events.map((event) => (
            <div
              key={event.id}
              className="grid grid-cols-3 items-center p-4 rounded-lg border-2 border-gray-300"
            >
              {/* Left Column: Event Details */}
              <div className="flex items-center space-x-4">
                <Image
                  src={event.poster?.thumbnail || "/default-thumbnail.png"}
                  alt={typeof event.name === "string" ? event.name : ""}
                  width={50}
                  height={50}
                  className="rounded-md"
                />
                <div>
                  <h2 className="text-lg font-semibold">{event.name}</h2>
                  <h2 className="text-md font-semibold">{event.category?.name}</h2>
                  <span className="text-green-600 text-sm">{event.status}</span>
                </div>
              </div>

              {/* Center Column: Registration Count */}
              <div className="text-center">
                <h3 className="text-xl font-bold">{event.registrationCount}</h3>
                <p className="text-gray-500 text-sm">Registration Count</p>
              </div>

              {/* Right Column: Action Buttons */}
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() =>
                    navigateTo(
                      `/dashboard/eventEachEdit/editCreateEvent?event_id=${event.id}`
                    )
                  }
                  className="p-3 bg-gray-200 text-gray-400 rounded hover:bg-gray-300"
                  aria-label="Edit Event"
                >
                  <FaEdit />
                </button>

                <button
                  onClick={() => handleDelete(event.id)}
                  className="p-3 bg-gray-200 text-gray-400 rounded hover:bg-gray-300"
                  aria-label="Delete Event"
                >
                  <FaTrash />
                </button>

                <button
                  onClick={() =>
                    navigateTo(`/dashboard/dashScreen?event_id=${event.id}`)
                  }
                  className="p-3 bg-gray-200 text-gray-400 rounded hover:bg-gray-300"
                  aria-label="View Event Details"
                >
                  <FaExternalLinkAlt />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center">No events found</p>
        )}
      </div>
    </div>
  );
}
