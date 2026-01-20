"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import {
  LayoutGrid,
  Pencil,
  Bell,
  Building2,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const Sidebar = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const color = searchParams.get("color");
  const currentPath = usePathname();

  const [isOpen, setIsOpen] = useState(false);

  // Active state styling - yellow/gold background
  const getButtonClasses = (path: string | string[]) => {
    const isActive = Array.isArray(path)
      ? path.some((p) => currentPath.startsWith(p))
      : currentPath.startsWith(path);

    if (isActive) {
      return "bg-[#F9FFA1] text-[#2C333D]";
    }
    return "bg-[#4A5568] text-white hover:bg-[#5A6578]";
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    router.push("/");
  };

  return (
    <>
      {/* Sidebar Toggle Button - Only visible on small screens */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-[#2C333D] text-white rounded-full shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-[#2C333D] w-[72px] flex flex-col items-center py-8 z-40
          transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0`}
      >
        {/* Navigation Icons */}
        <nav className="flex flex-col items-center gap-4 flex-1">
          {/* Events / Dashboard */}
          <Link href="/dashboard/events">
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center cursor-pointer transition-colors ${getButtonClasses(
                "/dashboard/events"
              )}`}
            >
              <LayoutGrid size={20} />
            </div>
          </Link>

          {/* Create/Edit */}
          <Link href="/dashboard/event/createEvent">
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center cursor-pointer transition-colors ${getButtonClasses(
                ["/dashboard/event/createEvent", "/dashboard/eventEachEdit"]
              )}`}
            >
              <Pencil size={20} />
            </div>
          </Link>

          {/* Notifications */}
          <Link href="/dashboard/notifications">
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center cursor-pointer transition-colors ${getButtonClasses(
                "/dashboard/notifications"
              )}`}
            >
              <Bell size={20} />
            </div>
          </Link>

          {/* Club Profile */}
          <Link href="/dashboard/clubProfile">
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center cursor-pointer transition-colors ${getButtonClasses(
                "/dashboard/clubProfile"
              )}`}
            >
              <Building2 size={20} />
            </div>
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-11 h-11 rounded-full flex items-center justify-center cursor-pointer transition-colors bg-[#4A5568] text-white hover:bg-red-500"
          >
            <LogOut size={20} />
          </button>
        </nav>
      </aside>

      {/* Overlay (for closing sidebar on mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Spacer for content to account for sidebar width on desktop */}
      <div className="hidden lg:block w-[72px] flex-shrink-0" />
    </>
  );
};

export default Sidebar;
