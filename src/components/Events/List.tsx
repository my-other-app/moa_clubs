import { useState } from "react";
import Image from "next/image"

import { FaEdit, FaTrash, FaExternalLinkAlt } from "react-icons/fa";
import { useNavigate } from "@/utils/navigation";

const dummyEvents = [
  {
    id: 1,
    title: "SF SEA Hackathon",
    status: "Live",
    registrationCount: 67776,
    image: "https://images.pexels.com/photos/3680219/pexels-photo-3680219.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
  },
  {
    id: 2,
    title: "Tech Conference 2025",
    status: "Live",
    registrationCount: 45892,
    image: "https://images.pexels.com/photos/3680219/pexels-photo-3680219.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
  },
  {
    id: 3,
    title: "AI & ML Summit",
    status: "Live",
    registrationCount: 32110,
    image: "https://images.pexels.com/photos/3680219/pexels-photo-3680219.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
  },
];

export default function EventsList() {
  const { navigateTo } = useNavigate();



  return (
    <div className="p-6">
      

      {/* Events List */}
      <div className="space-y-4"
         onClick={() => navigateTo('/dashboard/dashScreen')}
         >
        {dummyEvents.map((event) => (
          <div key={event.id} className="flex justify-between items-center border p-4 rounded-lg shadow-sm">
            <div className="flex items-center space-x-4">
              <Image src={event.image} alt={event.title} width={50} height={50} className=" rounded-md" />
              <div>
                <h2 className="text-lg font-semibold">{event.title}</h2>
                <span className="text-green-600 text-sm">● {event.status}</span>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold">{event.registrationCount}</h3>
              <p className="text-gray-500 text-sm">Registration Count</p>
            </div>
            <div className="flex space-x-2">
              <button className="p-2 bg-gray-200 rounded"><FaEdit /></button>
              <button className="p-2 bg-gray-200 rounded"><FaTrash /></button>
              <button
             
               className="p-2 bg-gray-200 rounded"><FaExternalLinkAlt /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
