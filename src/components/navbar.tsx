import Link from "next/link";
import { FaTicketAlt, FaPen, FaBell, FaBuilding } from "react-icons/fa";

const Sidebar = () => {
  return (
    <aside className="bg-gray-900 text-white w-20 h-screen fixed top-0 left-0 flex flex-col items-center justify-center py-4 space-y-6">
      <Link href="/">
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
  );
};

export default Sidebar;
