import { useState } from "react";
import Link from "next/link";
import { FaTicketAlt, FaPen, FaBell, FaBuilding, FaBars, FaTimes } from "react-icons/fa";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeLink, setActiveLink] = useState<string | null>(null);
  

  // Handle Link Click
  const handleLinkClick = (path: string) => {
    setActiveLink(path);
    setIsOpen(false); // Close sidebar on mobile after clicking
  };

  return (
    <>
      {/* Sidebar Toggle Button - Only visible on small screens */}
      <button 
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-gray-800 text-white rounded-full"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-gray-700 text-white w-20 flex flex-col items-center justify-center py-4 space-y-6
          transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:flex`}
      >
        <Link href="/dashboard/events">
          <div
            className={`cursor-pointer p-3 rounded-full ${
              activeLink === "/dashboard/events" ? "bg-[#F9FFA1] text-black" : "bg-gray-400 hover:bg-gray-500"
            }`}
            onClick={() => handleLinkClick("/dashboard/events")}
          >
            <FaTicketAlt size={24} />
          </div>
        </Link>

        <Link href="/events">
          <div
            className={`cursor-pointer p-3 rounded-full ${
              activeLink === "/events" ? "bg-[#F9FFA1] text-black" : "bg-gray-400 hover:bg-gray-500"
            }`}
            onClick={() => handleLinkClick("/events")}
          >
            <FaPen size={24} />
          </div>
        </Link>

        <Link href="/notifications">
          <div
            className={`cursor-pointer p-3 rounded-full ${
              activeLink === "/notifications" ? "bg-[#F9FFA1] text-black" : "bg-gray-400 hover:bg-gray-500"
            }`}
            onClick={() => handleLinkClick("/notifications")}
          >
            <FaBell size={24} />
          </div>
        </Link>

        <Link href="/company">
          <div
            className={`cursor-pointer p-3 rounded-full ${
              activeLink === "/company" ? "bg-[#F9FFA1] text-black" : "bg-gray-400 hover:bg-gray-500"
            }`}
            onClick={() => handleLinkClick("/company")}
          >
            <FaBuilding size={24} />
          </div>
        </Link>
      </aside>

      {/* Overlay (for closing sidebar on mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 lg:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Sidebar;
