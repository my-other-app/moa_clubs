import Image from "next/image";
import { FaEdit, FaTrash, FaExternalLinkAlt } from "react-icons/fa";
import { useNavigate } from "@/utils/navigation";
import { StaticImport } from "next/dist/shared/lib/get-img-props";
import { Key, ReactNode } from "react";

// Define Props Type
interface Event {
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

  return (
    <div className="p-6">
      {/* Events List */}
      <div className="space-y-4">
        {events.length > 0 ? (
          events.map((event) => (
            <div
              key={event.id}
              className="grid grid-cols-3 items-center p-4 rounded-lg border border-gray-300"
              onClick={() => navigateTo("/dashboard/dashScreen")}
            >
              {/* Left Column: Event Details */}
              <div className="flex items-center space-x-4">
                <Image
                  src={event.poster?.thumbnail || "/default-image.png"}
                  alt={event.title}
                  width={50}
                  height={50}
                  className="rounded-md"
                />
                <div>
                  <h2 className="text-lg font-semibold">{event.name}</h2>
                  <span className="text-green-600 text-sm">● Live</span>
                </div>
              </div>

              {/* Center Column: Registration Count */}
              <div className="text-center">
                <h3 className="text-xl font-bold">{event.registrationCount}</h3>
                <p className="text-gray-500 text-sm">Registration Count</p>
              </div>

              {/* Right Column: Action Buttons */}
              <div className="flex justify-end space-x-2">
                <button className="p-3 bg-gray-200 text-gray-400 rounded hover:bg-gray-300">
                  <FaEdit />
                </button>
                <button className="p-3 bg-gray-200 text-gray-400 rounded hover:bg-gray-300">
                  <FaTrash />
                </button>
                <button className="p-3 bg-gray-200 text-gray-400 rounded hover:bg-gray-300">
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
