import { useState } from "react";
import { FiSearch } from "react-icons/fi";

export default function EventsHeader() {
  const [activeTab, setActiveTab] = useState("live");

  return (
    <div className="flex justify-between items-start p-6">
      {/* Left Section */}
      <div>
        <h1 className="text-2xl font-bold">EVENTS</h1>
        <div className="mt-4 flex space-x-2">
          <button
            className={`px-4 py-2 border rounded-md ${
              activeTab === "live" ? "bg-gray-900 text-white" : "bg-white"
            }`}
            onClick={() => setActiveTab("live")}
          >
            Live Events
          </button>
          <button
            className={`px-4 py-2 border rounded-md ${
              activeTab === "past" ? "bg-gray-900 text-white" : "bg-white"
            }`}
            onClick={() => setActiveTab("past")}
          >
            Past Events
          </button>
        </div>
        <div className="relative mt-4">
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search for events"
            className="pl-10 pr-4 py-2 border rounded-md w-full"
          />
        </div>
      </div>

      {/* Right Section */}
      <button className="bg-gray-900 text-white px-6 py-3 rounded-md">
        CREATE NEW EVENT
      </button>
    </div>
  );
}
