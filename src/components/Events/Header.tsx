import { ReactNode, useState } from "react";
import Link from "next/link";
import { FiSearch } from "react-icons/fi";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import Volunteer from "@/components/dashboard/volunteer";

export default function EventsHeader() {
  const [activeTab, setActiveTab] = useState("live");

  return (
    <div className="flex justify-between items-start p-6 relative">
      {/* Left Section */}
      <div>
        <h1 className="text-4xl font-bold bebas">EVENTS</h1>
        <div className="mt-4 flex space-x-2">
          <button
            className={`px-4 py-2 border rounded-md ${
              activeTab === "live"
                ? "border-1 text-black border-black bg-[#F9FFA1]"
                : "border-1 text-gray-400"
            }`}
            onClick={() => setActiveTab("live")}
          >
            Live Events
          </button>
          <button
            className={`px-4 py-2 border rounded-md ${
              activeTab === "past"
                ? "border-1 text-black border-black bg-[#F9FFA1]"
                : "border-1 text-gray-400"
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
            className="pl-10 pr-4 py-2 border border-gray-400 rounded-md w-full"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex-col flex">
        {/* Add Volunteers Popup */}
        <Popup
          trigger={
            <button className="border-gray-700 border text-xl bebas text-black px-8 py-3 top-16 right-7 absolute rounded-md hover:bg-gray-200">
              Add Volunteers
            </button>
          }
          modal
          nested
        >
          {
            ((close: () => void) => (
              <>
                <div className="p-4">
                  <button
                    onClick={close}
                    className="text-right w-full text-gray-500 mb-2"
                  >
                    X
                  </button>
                  <Volunteer />
                </div>
              </>
            )) as unknown as ReactNode
          }
        </Popup>

        {/* Create New Event Button */}
        <Link href="/dashboard/event/createEvent">
          <button className="bg-gray-700 text-xl bebas text-white px-8 py-3 top-32 right-7 absolute rounded-md hover:bg-gray-800">
            CREATE NEW EVENT
          </button>
        </Link>
      </div>
    </div>
  );
}
