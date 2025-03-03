import Image from "next/image";
import { FaEdit, FaTrash, FaExternalLinkAlt } from "react-icons/fa";
import { useNavigate } from "@/utils/navigation";
import { StaticImport } from "next/dist/shared/lib/get-img-props";
import { Key, ReactNode } from "react";

// Define Props Type
interface Event {
  category: any;
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
            >
              {/* Left Column: Event Details */}
              <div className="flex items-center space-x-4">
                <Image
                  src={event.poster?.thumbnail || "data:image/jpeg;base64,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"}
                  alt={event.title}
                  width={50}
                  height={50}
                  className="rounded-md"
                />
                <div>
                  <h2 className="text-lg font-semibold">{event.name}</h2>
                  <h2 className="text-md font-semibold">{event.category?.name}</h2>
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
              <button
                    className="p-3 bg-gray-200 text-gray-400 rounded hover:bg-gray-300"
                  >
                    <FaEdit />
                  </button>

                <button className="p-3 bg-gray-200 text-gray-400 rounded hover:bg-gray-300">
                  <FaTrash />
                </button>
                <button onClick={() => navigateTo(`/dashboard/dashScreen?event_id=${event.id}`)}className="p-3 bg-gray-200 text-gray-400 rounded hover:bg-gray-300">
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
