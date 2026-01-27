"use client";

import axios from "axios";
import {
  MouseEventHandler,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import Image from "next/image";
import { Edit, Trash, Download, Search, Plus, TrendingUp, Users, DollarSign, MousePointerClick, UserCheck, ChevronLeft, ChevronRight, Star } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import Sidebar from "@/app/components/sidebar";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Popup from "reactjs-popup";
import Volunteer from "@/app/components/dashboard/volunteer";
import { useNavigate } from "@/app/utils/navigation";
import { FaExternalLinkAlt } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { storage } from "@/app/services/auth.service";
import { fetchEventById } from "@/app/utils/listEvents";

import DeleteConfirmationModal from "@/app/components/DeleteConfirmationModal";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface EventData {
  id: number;
  name: string;
  slug: string;
  poster?: {
    medium: string;
  };
  page_views: number;
  event_datetime: string;
  duration: number;
  is_online: boolean;
  reg_fee: number;
}

interface Registration {
  profile: ReactNode;
  ticket_id: ReactNode;
  full_name: ReactNode;
  id: number;
  name: string;
  email: string;
  phone: string;
  institution: string;
  is_attended: boolean;
  is_paid: boolean;
}

interface AnalyticsData {
  total_registrations: number;
  total_revenue: number;
  attendance_rate: number;
  conversion_rate: number;
  payment_status: { paid: number; unpaid: number };
  attendance_status: { attended: number; absent: number };
  top_institutions: { name: string; value: number }[];
  registration_time: {
    morning: number;
    afternoon: number;
    evening: number;
    night: number;
  };
  attendance_over_time: { time: string; count: number }[];
}

interface Review {
  id: string;
  rating: number;
  review: string | null;
  user: {
    id: number;
    full_name: string;
    profile: {
      avatar: {
        medium: string;
      } | null;
    } | null;
  };
  created_at: string;
}

export default function DashScreen() {
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementBody, setAnnouncementBody] = useState("");
  const [announcementImage, setAnnouncementImage] = useState("");
  const [audience, setAudience] = useState("all");
  const [sendingAnnouncement, setSendingAnnouncement] = useState(false);
  const [activeTab, setActiveTab] = useState("registration");
  const [currentEvent, setCurrentEvent] = useState<EventData | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  const searchParams = useSearchParams();
  const event_id = searchParams.get("event_id");
  const parsedEventId = event_id ? Number.parseInt(event_id, 10) : 0;

  const { navigateTo } = useNavigate();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1); // Reset to first page on search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch event details directly by ID
  const getEventDetails = useCallback(async () => {
    if (!parsedEventId) return;

    setLoadingEvent(true);
    const eventData = await fetchEventById(parsedEventId);
    setCurrentEvent(eventData);
    setLoadingEvent(false);
  }, [parsedEventId]);

  // Fetch registrations
  const getRegistrations = useCallback(async () => {
    const accessToken = storage.getAccessToken();
    if (!accessToken || !parsedEventId) return;

    setLoadingRegistrations(true);
    try {
      const offset = (currentPage - 1) * itemsPerPage;
      let url = `${API_BASE_URL}/api/v1/events/registration/${parsedEventId}/list?limit=${itemsPerPage}&offset=${offset}`;

      if (debouncedSearchQuery) {
        url += `&search=${encodeURIComponent(debouncedSearchQuery)}`;
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const items = response.data.items || [];
      const total = response.data.total || 0;

      setRegistrations(items);
      setTotalCount(total);

      // Improved hasNextPage logic using total count if available
      if (response.data.total !== undefined) {
        setHasNextPage(offset + items.length < response.data.total);
      } else {
        // Fallback for legacy API
        setHasNextPage(items.length === itemsPerPage);
      }

    } catch (error) {
      console.error("Error fetching registrations:", error);
    } finally {
      setLoadingRegistrations(false);
    }
  }, [parsedEventId, currentPage, itemsPerPage, debouncedSearchQuery]);

  // Fetch analytics
  const getAnalytics = useCallback(async () => {
    const accessToken = storage.getAccessToken();
    if (!accessToken || !parsedEventId) return;

    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/events/registration/${parsedEventId}/analytics`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      setAnalytics(response.data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  }, [parsedEventId]);

  // Fetch reviews
  const getReviews = useCallback(async () => {
    const accessToken = storage.getAccessToken();
    if (!accessToken || !parsedEventId) return;

    setLoadingReviews(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/events/ratings/${parsedEventId}?limit=100`, // Fetching up to 100 reviews for now
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      setReviews(response.data.items || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoadingReviews(false);
    }
  }, [parsedEventId]);

  useEffect(() => {
    getEventDetails();
    getRegistrations();
    getAnalytics();
    getReviews();
  }, [getEventDetails, getRegistrations, getAnalytics, getReviews]);

  // Check if event is past based on datetime + duration
  const isEventPast = useCallback(() => {
    if (!currentEvent) return false;
    const eventEnd = new Date(currentEvent.event_datetime);
    eventEnd.setHours(eventEnd.getHours() + (currentEvent.duration || 0));
    return eventEnd < new Date();
  }, [currentEvent]);

  const handleEditClick = () => {
    if (currentEvent?.slug) {
      navigateTo(
        `/dashboard/eventEachEdit/editCreateEvent?event_id=${parsedEventId}&slug=${currentEvent.slug}`
      );
    } else if (event_id) {
      navigateTo(`/dashboard/eventEachEdit/editCreateEvent?event_id=${event_id}`);
    }
  };

  const handleShare = async () => {
    const urlToShare = currentEvent?.slug
      ? `https://events.myotherapp.com/${currentEvent.slug}`
      : window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: currentEvent?.name || "Check out this event",
          url: urlToShare,
        });
        toast.success("Event URL shared successfully!");
      } catch (error) {
        toast.error("Error sharing the page.");
      }
    } else {
      try {
        await navigator.clipboard.writeText(urlToShare);
        toast.info("URL copied to clipboard!");
      } catch (err) {
        toast.error("Failed to copy URL.");
      }
    }
  };

  const handleSendMessage = async () => {
    if (!announcementTitle.trim() || !announcementBody.trim()) {
      toast.error("Please enter both title and message");
      return;
    }

    const accessToken = storage.getAccessToken();
    if (!accessToken || !parsedEventId) return;

    setSendingAnnouncement(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/clubs/notifications/events/${parsedEventId}/send`,
        {
          title: announcementTitle,
          body: announcementBody,
          image_url: announcementImage || null,
          audience: audience,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message || "Announcement sent successfully!");
      } else {
        toast.warning(response.data.message || "Announcement sent but no recipients found");
      }
      setAnnouncementTitle("");
      setAnnouncementBody("");
      setAnnouncementImage("");
      setAudience("all");
    } catch (error) {
      console.error("Error sending announcement:", error);
      toast.error("Failed to send announcement");
    } finally {
      setSendingAnnouncement(false);
    }
  };

  const handleDownloadCSV = async () => {
    const accessToken = storage.getAccessToken();
    if (!accessToken) return;

    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/events/registration/${parsedEventId}/export`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "registration.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading:", error);
    }
  };

  const handleNextPage = () => {
    if (hasNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const openDeleteModal = (eventId: number) => {
    setSelectedEventId(eventId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (selectedEventId == null) return;

    const token = storage.getAccessToken();
    if (!token) {
      toast.error("Access token not found");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/events/delete/${selectedEventId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        toast.success("Event deleted successfully");
        navigateTo("/dashboard/events");
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to delete the event");
      }
    } catch (error) {
      toast.error("Error deleting the event");
    } finally {
      setShowDeleteModal(false);
      setSelectedEventId(null);
    }
  };

  const toggleAttendance = async (registrationId: number, currentStatus: boolean) => {
    const accessToken = storage.getAccessToken();
    if (!accessToken || !parsedEventId) return;

    // Optimistic update
    setRegistrations((prev) =>
      prev.map((reg) =>
        reg.id === registrationId ? { ...reg, is_attended: !currentStatus } : reg
      )
    );

    try {
      await axios.post(
        `${API_BASE_URL}/api/v1/events/registration/${parsedEventId}/attendance/${registrationId}`,
        { is_attended: !currentStatus },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      toast.success(`Attendance marked as ${!currentStatus ? "Attended" : "Pending"}`);
      // Refresh analytics to update charts
      getAnalytics();
    } catch (error) {
      console.error("Error updating attendance:", error);
      toast.error("Failed to update attendance");
      // Revert optimistic update
      setRegistrations((prev) =>
        prev.map((reg) =>
          reg.id === registrationId ? { ...reg, is_attended: currentStatus } : reg
        )
      );
    }
  };

  // Filter registrations based on tab
  const filteredRegistrations = activeTab === "attendance"
    ? registrations.filter((reg) => reg.is_attended)
    : registrations;

  // Calculate unique institutions count
  const uniqueInstitutions = new Set(
    registrations.map((reg) => reg.institution).filter(Boolean)
  ).size;

  const isPast = isEventPast();
  const totalRegistrations = analytics?.total_registrations || 0;
  const pageViews = currentEvent?.page_views || 0;
  const revenue = analytics?.total_revenue || 0;
  const conversionRate = analytics?.conversion_rate || 0;
  const attendanceRate = analytics?.attendance_rate || 0;
  const attendedCount = analytics?.attendance_status.attended || 0;

  // Prepare data for charts
  const paymentData = [
    { name: 'Paid', value: analytics?.payment_status.paid || 0 },
    { name: 'Unpaid', value: analytics?.payment_status.unpaid || 0 },
  ];

  const attendanceData = [
    { name: 'Attended', value: analytics?.attendance_status.attended || 0 },
    { name: 'Absent', value: analytics?.attendance_status.absent || 0 },
  ];

  const institutionData = analytics?.top_institutions || [];

  const timeData = [
    { name: 'Morning', value: analytics?.registration_time.morning || 0, color: '#FFBB28' },   // Yellow/Sun
    { name: 'Afternoon', value: analytics?.registration_time.afternoon || 0, color: '#FF8042' }, // Orange
    { name: 'Evening', value: analytics?.registration_time.evening || 0, color: '#8884d8' },   // Purple/Twilight
    { name: 'Night', value: analytics?.registration_time.night || 0, color: '#0088FE' },     // Blue/Night
  ];

  const attendanceTrendData = analytics?.attendance_over_time || [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="flex min-h-screen bg-[#2C333D]">
      <Sidebar />
      <div className="flex-1 p-6 md:p-8">
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="bg-white rounded-2xl p-6 md:p-8 min-h-[calc(100vh-4rem)] shadow-sm">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <h1 className="bebas text-[32px] md:text-[40px] tracking-wide text-black">
              {loadingEvent ? "Loading..." : currentEvent?.name || "Event Not Found"}
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleEditClick}
                className="w-10 h-10 bg-[#f3f3f3] rounded-lg flex justify-center items-center hover:bg-gray-200 transition-colors"
              >
                <Edit className="w-5 h-5 text-[#979797]" />
              </button>
              <button
                onClick={() => openDeleteModal(parsedEventId)}
                className="w-10 h-10 bg-[#f3f3f3] rounded-lg flex justify-center items-center hover:bg-gray-200 transition-colors"
              >
                <Trash className="w-5 h-5 text-[#979797]" />
              </button>
              <button
                onClick={handleShare}
                aria-label="Share this page"
                className="w-10 h-10 bg-[#f3f3f3] rounded-lg flex justify-center items-center hover:bg-gray-200 transition-colors"
              >
                <FaExternalLinkAlt className="w-4 h-4 text-[#979797]" />
              </button>
              <Popup
                trigger={
                  <button className="h-10 px-4 flex items-center gap-2 bg-[#2c333d] text-white rounded-lg hover:bg-[#1f2937] transition-colors">
                    <Plus className="w-4 h-4" />
                    <span className="text-[14px] font-medium">Add Volunteers</span>
                  </button>
                }
                modal
                nested
                overlayStyle={{ background: "rgba(0, 0, 0, 0.5)" }}
                contentStyle={{ width: "900px", padding: "20px" }}
              >
                {((close: MouseEventHandler<HTMLButtonElement> | undefined) => (
                  <div className="p-4 bg-white rounded-2xl">
                    <button
                      onClick={close}
                      className="text-right w-full text-black mb-2"
                    >
                      X
                    </button>
                    <Volunteer event_id={parsedEventId} />
                  </div>
                )) as unknown as ReactNode}
              </Popup>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Column - Event Image */}
            <div className="flex-shrink-0 w-full lg:w-[400px]">
              <Image
                src={
                  currentEvent?.poster?.medium ||
                  "https://dummyimage.com/400x400/000/fff"
                }
                alt="Event poster"
                width={400}
                height={400}
                className="rounded-lg w-full h-auto object-cover"
              />
            </div>

            {/* Right Column - Stats & Announcements */}
            <div className="flex-1">
              {/* Stats Grid */}
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Status Card */}
                <div className={`p-4 rounded-xl flex flex-col justify-between h-[110px] ${isPast ? "bg-red-50" : "bg-emerald-50"}`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isPast ? "bg-red-500" : "bg-emerald-500"}`} />
                    <span className={`text-sm font-medium ${isPast ? "text-red-700" : "text-emerald-700"}`}>
                      {isPast ? "Event Ended" : "Live Event"}
                    </span>
                  </div>
                  <div>
                    <p className={`text-2xl font-bold ${isPast ? "text-red-900" : "text-emerald-900"}`}>
                      {isPast ? "Closed" : "Active"}
                    </p>
                    <p className={`text-xs ${isPast ? "text-red-600" : "text-emerald-600"}`}>
                      {isPast ? "Registrations closed" : "Accepting registrations"}
                    </p>
                  </div>
                </div>

                {/* Total Registrations */}
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-[110px]">
                  <div className="flex items-center gap-2 text-blue-600">
                    <Users className="w-4 h-4" />
                    <span className="text-sm font-medium">Registrations</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{totalRegistrations}</p>
                    <p className="text-xs text-gray-500">Total participants</p>
                  </div>
                </div>

                {/* Revenue - Only show if there is a registration fee */}
                {(currentEvent?.reg_fee || 0) > 0 && (
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-[110px]">
                    <div className="flex items-center gap-2 text-green-600">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-sm font-medium">Revenue</span>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">₹{revenue.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Total earnings</p>
                    </div>
                  </div>
                )}

                {/* Attendance Rate - Only show for past events */}
                {isPast && (
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-[110px]">
                    <div className="flex items-center gap-2 text-indigo-600">
                      <UserCheck className="w-4 h-4" />
                      <span className="text-sm font-medium">Attendance</span>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{attendanceRate}%</p>
                      <p className="text-xs text-gray-500">{attendedCount} attended</p>
                    </div>
                  </div>
                )}

                {/* Conversion Rate - Show for live events or if we have space (e.g. free past event) */}
                {(!isPast || (currentEvent?.reg_fee || 0) === 0) && (
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-[110px]">
                    <div className="flex items-center gap-2 text-purple-600">
                      <MousePointerClick className="w-4 h-4" />
                      <span className="text-sm font-medium">Conversion</span>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{conversionRate}%</p>
                      <p className="text-xs text-gray-500">{pageViews} page views</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Institution Distribution */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">Top Institutions</h3>
                  <div className="h-[200px] w-full">
                    {institutionData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={institutionData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {institutionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                        No data available
                      </div>
                    )}
                  </div>
                  <div className="mt-4 space-y-2">
                    {institutionData.map((entry, index) => (
                      <div key={index} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <span className="text-gray-600 truncate max-w-[150px]">{entry.name}</span>
                        </div>
                        <span className="font-medium text-gray-900">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Second Chart: Attendance (Past) or Payment (Live/Paid) */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">
                    {isPast ? "Attendance Overview" : "Payment Status"}
                  </h3>
                  <div className="h-[250px] w-full">
                    {isPast ? (
                      // Attendance Chart for Past Events
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={attendanceData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} />
                          <YAxis axisLine={false} tickLine={false} />
                          <Tooltip cursor={{ fill: 'transparent' }} />
                          <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                            {attendanceData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={index === 0 ? '#22c55e' : '#94a3b8'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      // Payment Chart for Live Events
                      paymentData.some(d => d.value > 0) ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={paymentData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip cursor={{ fill: 'transparent' }} />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                              {paymentData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index === 0 ? '#22c55e' : '#ef4444'} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                          No data available
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Attendance Trends (Only show if there is data) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {attendanceTrendData.length > 0 && (
                  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">Attendance Trends (Check-ins per Hour)</h3>
                    <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={attendanceTrendData}>
                          <defs>
                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="time" axisLine={false} tickLine={false} />
                          <YAxis axisLine={false} tickLine={false} />
                          <Tooltip
                            cursor={{ stroke: '#8884d8', strokeWidth: 1 }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          />
                          <Area type="monotone" dataKey="count" stroke="#8884d8" fillOpacity={1} fill="url(#colorCount)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Registration Time Analysis */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">Registration Time Analysis</h3>
                  <div className="h-[250px] w-full">
                    {timeData.some(d => d.value > 0) ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={timeData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} />
                          <YAxis axisLine={false} tickLine={false} />
                          <Tooltip cursor={{ fill: 'transparent' }} />
                          <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                            {timeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                        No data available
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="w-full space-y-4">
                <div>
                  <h2 className="bebas text-[18px] tracking-wide text-black mb-1">MAKE ANNOUNCEMENTS</h2>
                  <p className="text-[11px] text-gray-600 mb-4">
                    Send message to the registered participants as notifications
                  </p>
                </div>

                <div className="space-y-3">
                  <Input
                    placeholder="Announcement Title"
                    value={announcementTitle}
                    onChange={(e) => setAnnouncementTitle(e.target.value)}
                    className="w-full h-10 text-[14px] border-gray-300 rounded-lg"
                  />

                  <Textarea
                    placeholder="Enter the message to send"
                    value={announcementBody}
                    onChange={(e) => setAnnouncementBody(e.target.value)}
                    className="w-full min-h-[100px] px-3 py-2 text-[14px] border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <Input
                    placeholder="Image URL (Optional)"
                    value={announcementImage}
                    onChange={(e) => setAnnouncementImage(e.target.value)}
                    className="w-full h-10 text-[14px] border-gray-300 rounded-lg"
                  />

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-medium text-gray-700">Target Audience</label>
                    <select
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                      className="w-full h-10 px-3 text-[14px] border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Registrants</option>
                      <option value="attendees">Attendees Only</option>
                      <option value="non_attendees">Non-Attendees Only</option>
                    </select>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="mt-2 h-[42px] px-8 bebas text-[18px] tracking-wide border-[#2c333d] text-[#2c333d] hover:bg-gray-50 w-full md:w-auto"
                  onClick={handleSendMessage}
                  disabled={sendingAnnouncement}
                >
                  {sendingAnnouncement ? "SENDING..." : "SEND ANNOUNCEMENT"}
                </Button>
              </div>
            </div>
          </div>

          {/* Registration / Attendance Table */}
          <div className="mt-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              {/* Tabs */}
              <div className="flex items-center gap-6">
                <button
                  onClick={() => setActiveTab("registration")}
                  className={`pb-2 text-[16px] font-medium transition-colors ${activeTab === "registration"
                    ? "text-[#2c333d] border-b-2 border-[#2c333d]"
                    : "text-gray-400 hover:text-gray-600"
                    }`}
                >
                  Registration
                </button>
                <button
                  onClick={() => setActiveTab("attendance")}
                  className={`pb-2 text-[16px] font-medium transition-colors ${activeTab === "attendance"
                    ? "text-[#2c333d] border-b-2 border-[#2c333d]"
                    : "text-gray-400 hover:text-gray-600"
                    }`}
                >
                  Attendance
                </button>
                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`pb-2 text-[16px] font-medium transition-colors ${activeTab === "reviews"
                    ? "text-[#2c333d] border-b-2 border-[#2c333d]"
                    : "text-gray-400 hover:text-gray-600"
                    }`}
                >
                  Reviews
                </button>

              </div>

              {/* Search & Download */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                <div className="relative w-full sm:w-[280px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search for participants"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 pl-10 text-[14px] border-gray-300 rounded-lg"
                  />
                </div>
                <Button
                  variant="default"
                  className="h-10 px-4 bg-[#2c333d] rounded-lg flex items-center gap-2 hover:bg-[#1f2937] w-full sm:w-auto"
                  onClick={handleDownloadCSV}
                >
                  <Download className="w-4 h-4 text-white" />
                  <span className="text-white text-[13px]">Download CSV file</span>
                </Button>
              </div>
            </div>

            {activeTab !== "reviews" && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
                      <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Institution</th>
                      <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Attendance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredRegistrations.length > 0 ? (
                      filteredRegistrations.map((reg) => (
                        <tr key={reg.id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4 text-sm font-medium text-gray-900">{reg.name}</td>
                          <td className="p-4 text-sm text-gray-600">{reg.email}</td>
                          <td className="p-4 text-sm text-gray-600">{reg.phone}</td>
                          <td className="p-4 text-sm text-gray-600">{reg.institution}</td>
                          <td className="p-4 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${reg.is_paid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                              {reg.is_paid ? "Paid" : "Unpaid"}
                            </span>
                          </td>
                          <td className="p-4 text-sm">
                            <button
                              onClick={() => toggleAttendance(reg.id, reg.is_attended)}
                              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${reg.is_attended
                                ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                            >
                              {reg.is_attended ? "Attended" : "Mark Present"}
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-500">
                          No registrations found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                {loadingReviews ? (
                  <div className="p-8 text-center text-gray-500">Loading reviews...</div>
                ) : reviews.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">No reviews yet.</div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {reviews.map((review) => (
                      <div key={review.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-4">
                          {/* User Avatar */}
                          <div className="flex-shrink-0">
                            {review.user.profile?.avatar?.medium ? (
                              <Image
                                src={review.user.profile.avatar.medium}
                                alt={review.user.full_name}
                                width={40}
                                height={40}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                                {review.user.full_name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>

                          {/* Review Content */}
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-sm font-bold text-gray-900">{review.user.full_name}</h4>
                                <div className="flex items-center gap-1 mt-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-3 h-3 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                                    />
                                  ))}
                                  <span className="text-xs text-gray-500 ml-2">
                                    {new Date(review.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            {review.review && (
                              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                                {review.review}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Pagination Controls */}
            <div className="flex justify-center items-center gap-4 mt-6">
              <Button
                variant="outline"
                onClick={handlePrevPage}
                disabled={currentPage === 1 || loadingRegistrations}
                className="h-[40px] px-4 border-[#2c333d] text-[#2c333d] hover:bg-gray-50 flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              <span className="text-[14px] font-medium text-gray-700">
                Page {currentPage}
              </span>

              <Button
                variant="outline"
                onClick={handleNextPage}
                disabled={!hasNextPage || loadingRegistrations}
                className="h-[40px] px-4 border-[#2c333d] text-[#2c333d] hover:bg-gray-50 flex items-center gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div >
      </div >

      {/* Delete Confirmation Modal */}
      < DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)
        }
        onConfirm={confirmDelete}
      />
    </div >
  );
}

