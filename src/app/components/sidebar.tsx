import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  FaTicketAlt,
  FaPen,
  FaBell,
  FaBuilding,
  FaBars,
  FaTimes,
  FaSignOutAlt,
} from "react-icons/fa";

const Sidebar = () => {
  const router = useRouter();
  const { color } = router.query; // Read URL query parameter "color"
  const currentPath = router.pathname; // Current path

  const [isOpen, setIsOpen] = useState(false);

  // Define active background based on the URL parameter.
  // You can extend this mapping as needed.
  const activeBg =
    color === "red" ? "bg-red-500 text-white" : "bg-[#F9FFA1] text-black";

  // Handle Logout (replace with your actual logout logic)
  const handleLogout = () => {
    // localStorage.removeItem("userToken");
    // router.push("/");
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
          transition-transform duration-300 ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0`}
      >
        <Link href="/dashboard/events">
          <div
            className={`cursor-pointer p-3 rounded-full ${
              currentPath === "/dashboard/events"
                ? activeBg
                : "bg-gray-400 hover:bg-gray-500"
            }`}
          >
            <FaTicketAlt size={24} />
          </div>
        </Link>

        <Link href="/events">
          <div
            className={`cursor-pointer p-3 rounded-full ${
              currentPath === "/events"
                ? activeBg
                : "bg-gray-400 hover:bg-gray-500"
            }`}
          >
            <FaPen size={24} />
          </div>
        </Link>

        <Link href="/notifications">
          <div
            className={`cursor-pointer p-3 rounded-full ${
              currentPath === "/notifications"
                ? activeBg
                : "bg-gray-400 hover:bg-gray-500"
            }`}
          >
            <FaBell size={24} />
          </div>
        </Link>

        <Link href="/dashboard/clubProfile">
          <div
            className={`cursor-pointer p-3 rounded-full ${
              currentPath === "/dashboard/clubProfile"
                ? activeBg
                : "bg-gray-400 hover:bg-gray-500"
            }`}
          >
            <FaBuilding size={24} />
          </div>
        </Link>

        {/* Logout Button */}
        <div
          className="cursor-pointer p-3 rounded-full bg-gray-400 hover:bg-gray-500"
          onClick={handleLogout}
        >
          <FaSignOutAlt size={24} />
        </div>
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
