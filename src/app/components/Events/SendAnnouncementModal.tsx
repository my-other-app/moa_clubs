"use client";

import { useState } from "react";
import { storage } from "@/app/services/auth.service";
import { toast } from "react-toastify";
import { FaTimes, FaPaperPlane, FaImage } from "react-icons/fa";

interface SendAnnouncementModalProps {
    isOpen: boolean;
    onClose: () => void;
    eventId: number;
    eventName: string;
}

type AudienceType = "all" | "attendees" | "non_attendees";

export default function SendAnnouncementModal({
    isOpen,
    onClose,
    eventId,
    eventName,
}: SendAnnouncementModalProps) {
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [audience, setAudience] = useState<AudienceType>("all");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim() || !body.trim()) {
            toast.error("Title and message are required");
            return;
        }

        const token = storage.getAccessToken();
        if (!token) {
            toast.error("No access token found");
            return;
        }

        setIsLoading(true);

        try {
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
            const response = await fetch(
                `${API_BASE_URL}/api/v1/clubs/notifications/events/${eventId}/send`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        title: title.trim(),
                        body: body.trim(),
                        image_url: imageUrl.trim() || null,
                        audience,
                    }),
                }
            );

            const data = await response.json();

            if (response.ok && data.success) {
                toast.success(data.message || "Announcement sent successfully!");
                // Reset form
                setTitle("");
                setBody("");
                setImageUrl("");
                setAudience("all");
                onClose();
            } else {
                toast.error(data.message || "Failed to send announcement");
            }
        } catch (error) {
            console.error("Error sending announcement:", error);
            toast.error("Error sending announcement");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-full max-w-lg mx-4 overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="bg-[#2c333d] text-white px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold font-['Bebas_Neue'] tracking-wide">
                            SEND ANNOUNCEMENT
                        </h2>
                        <p className="text-sm text-gray-300 truncate">{eventName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Announcement title..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2c333d] focus:border-transparent outline-none transition-all"
                            maxLength={255}
                            required
                        />
                    </div>

                    {/* Message */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Message <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder="Type your announcement message..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2c333d] focus:border-transparent outline-none transition-all resize-none"
                            rows={4}
                            maxLength={1000}
                            required
                        />
                        <p className="text-xs text-gray-400 text-right mt-1">
                            {body.length}/1000
                        </p>
                    </div>

                    {/* Image URL */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <FaImage className="inline mr-1" /> Image URL (optional)
                        </label>
                        <input
                            type="url"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2c333d] focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    {/* Audience Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Send to
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                type="button"
                                onClick={() => setAudience("all")}
                                className={`py-3 px-4 rounded-lg border-2 font-medium text-sm transition-all ${audience === "all"
                                        ? "border-[#2c333d] bg-[#2c333d] text-white"
                                        : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                                    }`}
                            >
                                All Registrants
                            </button>
                            <button
                                type="button"
                                onClick={() => setAudience("attendees")}
                                className={`py-3 px-4 rounded-lg border-2 font-medium text-sm transition-all ${audience === "attendees"
                                        ? "border-green-600 bg-green-600 text-white"
                                        : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                                    }`}
                            >
                                Attendees
                            </button>
                            <button
                                type="button"
                                onClick={() => setAudience("non_attendees")}
                                className={`py-3 px-4 rounded-lg border-2 font-medium text-sm transition-all ${audience === "non_attendees"
                                        ? "border-orange-500 bg-orange-500 text-white"
                                        : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                                    }`}
                            >
                                Non-Attendees
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#2c333d] text-white py-4 rounded-lg font-['Bebas_Neue'] text-xl tracking-wider hover:bg-[#3a4350] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <span className="animate-spin">⏳</span> Sending...
                            </>
                        ) : (
                            <>
                                <FaPaperPlane /> SEND ANNOUNCEMENT
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
