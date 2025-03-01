import { useState } from "react";
import Link from "next/link";
import { FaTicketAlt, FaPen, FaBell, FaBuilding, FaBars, FaTimes } from "react-icons/fa";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

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
        className={`fixed top-0 left-0 h-screen bg-gray-900 text-white w-20 flex flex-col items-center justify-center py-4 space-y-6
          transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:flex`}
      >
        <Link href="/dashboard/events">
          <div className="cursor-pointer p-3 rounded-full bg-gray-800 hover:bg-gray-700">
            <FaTicketAlt size={24} />
          </div>
        </Link>
        <Link href="/events">
          <div className="cursor-pointer p-3 rounded-full bg-gray-800 hover:bg-gray-700">
            <FaPen size={24} />
          </div>
        </Link>
        <Link href="/notifications">
          <div className="cursor-pointer p-3 rounded-full bg-gray-800 hover:bg-gray-700">
            <FaBell size={24} />
          </div>
        </Link>
        <Link href="/company">
          <div className="cursor-pointer p-3 rounded-full bg-gray-800 hover:bg-gray-700">
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
