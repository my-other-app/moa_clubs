"use client";

import { MouseEventHandler, ReactNode, useEffect, useState } from "react";
import Image from "next/image";
import { FaEdit, FaTrash, FaCog, FaDownload, FaClipboardList } from "react-icons/fa";
import Sidebar from "@/components/sidebar";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import Volunteer from "@/components/dashboard/volunteer";
import { fetchEvents } from "@/utils/listEvents";
import { useRouter } from "next/router";

const registrations = Array(7).fill({
  id: "NEX25AA001",
  name: "Edwin Emmanuel Roy",
  email: "emmanuelroy162@gmail.com",
  phone: "8113859251",
  institution: "College of Engineering Tr",
});

export default function DashScreen() {
  const [message, setMessage] = useState("");
  interface Event {
    id: number;
    name: string;
    poster?: {
      original: string;
    };
  }

  const [events, setEvents] = useState<Event[]>([]);
  const router = useRouter();
  const { event_id } = router.query;

  // Fetch events once the component mounts
  useEffect(() => {
    const getEvents = async () => {
  const currentEvent: Event | undefined = events.find(
    (event) => event.id === (Array.isArray(event_id) ? parseInt(event_id[0], 10) : parseInt(event_id as string, 10))
  );
    await getEvents();
  };
  getEvents();
  }, [event_id]);

  // Find the event matching the event_id
  // Convert event_id to a number if needed; also handle when event_id is undefined
  const currentEvent = events.find(
    (event) => event.id === (Array.isArray(event_id) ? parseInt(event_id[0], 10) : parseInt(event_id as string, 10))
  );

  return (
    <>
      <Sidebar />
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="p-4 sm:p-6 w-full max-w-5xl space-y-6 bg-white rounded-lg">
          {/* Header */}
          <div className="flex flex-wrap justify-between items-center">
            <h1 className="text-2xl font-bold text-center sm:text-left w-full sm:w-auto">
              {currentEvent ? currentEvent.name : "Event Details"}
            </h1>
            <div className="flex gap-2 mt-2 sm:mt-0">
              <button className="p-2 bg-gray-200 rounded-full">
                <FaEdit />
              </button>
              <button className="p-2 bg-gray-200 rounded-full">
                <FaTrash />
              </button>
              <button className="p-2 bg-gray-200 rounded-full">
                <FaCog />
              </button>
            </div>
          </div>

          {/* Event Info */}
          <div className="flex flex-wrap lg:flex-nowrap gap-4 items-center justify-center text-center">
            <Image
              src={currentEvent?.poster?.original || "/placeholder.png"}
              alt="Event poster"
              width={300}
              height={300}
              className="rounded-lg"
            />
            <div className="mt-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full text-center">
                <div className="p-4 bg-green-200 text-green-800 rounded flex flex-col items-center justify-center">
                  🔵 Live
                  <span className="font-semibold">
                    The event is live and registrations are open
                  </span>
                </div>
                <div className="p-4 bg-purple-200 text-purple-800 rounded flex flex-col items-center justify-center">
                  <span className="text-xl font-bold">24</span>
                  <span>Total Registration Count</span>
                </div>
                <div className="p-4 bg-blue-200 text-blue-800 rounded flex flex-col items-center justify-center">
                  <span className="text-xl font-bold">234</span>
                  <span>Event Visitors</span>
                </div>
                <div className="p-4 bg-red-200 text-red-800 rounded flex flex-col items-center justify-center">
                  <span className="text-xl font-bold">2</span>
                  <span>Institutions</span>
                </div>
              </div>

              {/* Announcement Section */}
              <div className="text-center space-y-2 mt-4">
                <h2 className="text-lg font-semibold">Make Announcements</h2>
                <textarea
                  placeholder="Enter the message to send"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-2 border rounded text-center"
                />
                <button className="mt-2 p-2 border-black border-2 text-black rounded">
                  Send Message
                </button>
              </div>
            </div>
          </div>

          {/* Registration Table */}
          <div>
            <h2 className="text-lg font-semibold text-center">Registration</h2>

            {/* Buttons (Attendance, Download CSV, Add Volunteers) */}
            <div className="flex flex-wrap gap-4 justify-center mt-2">
              <button className="p-2 flex items-center gap-2 bg-gray-300 rounded">
                <FaClipboardList /> Attendance
              </button>

              <button className="p-2 flex items-center gap-2 bg-gray-300 rounded">
                <FaDownload /> Download CSV File
              </button>

              {/* Popup for Volunteers */}
              <Popup
                trigger={
                  <button className="p-2 flex items-center gap-2 bg-gray-300 rounded">
                    <FaClipboardList /> Add Volunteers
                  </button>
                }
                modal
                nested
              >
                {((close: MouseEventHandler<HTMLButtonElement> | undefined) => (
                  <div className="p-4">
                    <button
                      onClick={close}
                      className="text-right w-full text-gray-500 mb-2"
                    >
                      X
                    </button>
                    {/* Volunteer component with the relevant eventId */}
                    <Volunteer
                      eventId={
                        Array.isArray(event_id)
                          ? parseInt(event_id[0], 10)
                          : parseInt(event_id as string, 10)
                      }
                    />
                  </div>
                )) as unknown as ReactNode}
              </Popup>
            </div>

            {/* Table with Scroll Support */}
            <div className="overflow-x-auto text-gray-600 mt-4">
              <table className="min-w-full border rounded text-center">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="p-2">ID</th>
                    <th className="p-2">Name</th>
                    <th className="p-2">Email</th>
                    <th className="p-2">Phone</th>
                    <th className="p-2">Institution</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((reg, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">{reg.id}</td>
                      <td className="p-2">{reg.name}</td>
                      <td className="p-2">{reg.email}</td>
                      <td className="p-2">{reg.phone}</td>
                      <td className="p-2">{reg.institution}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-center">
              <button className="mt-2 p-2 border-black border-2 text-black rounded">
                Show All
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
