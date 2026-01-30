"use client";

import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Bell, Send, Eye, TrendingUp, Calendar, Search, ExternalLink } from "lucide-react";
import Sidebar from "@/app/components/sidebar";
import { Input } from "@/components/ui/input";
import { storage } from "@/app/services/auth.service";
import { useNavigate } from "@/app/utils/navigation";
import { formatDistanceToNow } from "date-fns";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface NotificationHistoryItem {
    id: string;
    title: string;
    description: string;
    event_id: number;
    event_name: string;
    event_poster: { medium?: string } | null;
    sent_count: number;
    read_count: number;
    read_percentage: number;
    created_at: string;
}

interface NotificationHistoryResponse {
    items: NotificationHistoryItem[];
    total: number;
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<NotificationHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");

    const { navigateTo } = useNavigate();

    // Fetch notification history
    const fetchNotifications = useCallback(async () => {
        const accessToken = storage.getAccessToken();
        if (!accessToken) return;

        setLoading(true);
        try {
            const response = await axios.get<NotificationHistoryResponse>(
                `${API_BASE_URL}/api/v1/clubs/notifications/history?limit=50&offset=0`,
                {
                    headers: { Authorization: `Bearer ${accessToken}` },
                }
            );
            setNotifications(response.data.items);
            setTotal(response.data.total);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Filter notifications by search
    const filteredNotifications = notifications.filter((n) =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.event_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Calculate totals
    const totalSent = notifications.reduce((acc, n) => acc + n.sent_count, 0);
    const totalRead = notifications.reduce((acc, n) => acc + n.read_count, 0);
    const overallReadRate = totalSent > 0 ? Math.round((totalRead / totalSent) * 100) : 0;

    return (
        <div className="flex min-h-screen bg-[#2C333D]">
            <Sidebar />
            <div className="flex-1 p-6 md:p-8">
                <div className="bg-white rounded-2xl p-6 md:p-8 min-h-[calc(100vh-4rem)] shadow-sm">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                        <div>
                            <h1 className="bebas text-[32px] md:text-[40px] tracking-wide text-black">
                                NOTIFICATIONS
                            </h1>
                            <p className="text-gray-500 text-sm">
                                Track all announcements sent to your event participants
                            </p>
                        </div>
                    </div>

                    {/* Analytics Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-5 rounded-xl border border-indigo-100">
                            <div className="flex items-center gap-2 mb-2">
                                <Bell className="w-5 h-5 text-indigo-600" />
                                <span className="text-sm font-medium text-indigo-700">Total Campaigns</span>
                            </div>
                            <p className="text-3xl font-bold text-indigo-900">{total}</p>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-100">
                            <div className="flex items-center gap-2 mb-2">
                                <Send className="w-5 h-5 text-blue-600" />
                                <span className="text-sm font-medium text-blue-700">Total Sent</span>
                            </div>
                            <p className="text-3xl font-bold text-blue-900">{totalSent.toLocaleString()}</p>
                        </div>

                        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-5 rounded-xl border border-emerald-100">
                            <div className="flex items-center gap-2 mb-2">
                                <Eye className="w-5 h-5 text-emerald-600" />
                                <span className="text-sm font-medium text-emerald-700">Total Read</span>
                            </div>
                            <p className="text-3xl font-bold text-emerald-900">{totalRead.toLocaleString()}</p>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl border border-purple-100">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-5 h-5 text-purple-600" />
                                <span className="text-sm font-medium text-purple-700">Avg. Open Rate</span>
                            </div>
                            <p className="text-3xl font-bold text-purple-900">{overallReadRate}%</p>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="mb-6">
                        <div className="relative w-full md:w-[400px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                                placeholder="Search notifications..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-11 pl-10 text-[14px] border-gray-200 rounded-xl"
                            />
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="space-y-4">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : filteredNotifications.length === 0 ? (
                            <div className="text-center py-20">
                                <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-600 mb-2">No notifications yet</h3>
                                <p className="text-gray-400">
                                    Send your first announcement from an event dashboard
                                </p>
                            </div>
                        ) : (
                            filteredNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex flex-col lg:flex-row gap-4">
                                        {/* Event Poster */}
                                        <div className="flex-shrink-0">
                                            <Image
                                                src={notification.event_poster?.medium || "/placeholder-event.png"}
                                                alt={notification.event_name}
                                                width={80}
                                                height={80}
                                                className="rounded-lg object-cover w-20 h-20"
                                            />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4 mb-2">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                                                        {notification.title}
                                                    </h3>
                                                    <p className="text-sm text-indigo-600 font-medium">
                                                        {notification.event_name}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => navigateTo(`/dashboard/dashScreen?event_id=${notification.event_id}`)}
                                                    className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                    title="View Event"
                                                >
                                                    <ExternalLink className="w-4 h-4 text-gray-400" />
                                                </button>
                                            </div>

                                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                                {notification.description}
                                            </p>

                                            {/* Stats Row */}
                                            <div className="flex flex-wrap items-center gap-4 text-sm">
                                                <div className="flex items-center gap-1.5 text-blue-600">
                                                    <Send className="w-3.5 h-3.5" />
                                                    <span className="font-medium">{notification.sent_count}</span>
                                                    <span className="text-gray-400">sent</span>
                                                </div>

                                                <div className="flex items-center gap-1.5 text-emerald-600">
                                                    <Eye className="w-3.5 h-3.5" />
                                                    <span className="font-medium">{notification.read_count}</span>
                                                    <span className="text-gray-400">read</span>
                                                </div>

                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                                                            style={{ width: `${notification.read_percentage}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-purple-600 font-medium">
                                                        {notification.read_percentage}%
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-1.5 text-gray-400 ml-auto">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    <span>
                                                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
