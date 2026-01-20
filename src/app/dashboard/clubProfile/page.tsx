"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import Sidebar from "@/app/components/sidebar";
import Link from "next/link";
import { Instagram, Youtube, Linkedin, Globe, GraduationCap, MapPin } from "lucide-react";

interface ClubLogo {
  thumbnail: string;
  medium: string;
  large: string;
  original: string;
}

interface Interest {
  id: number;
  name: string;
  icon: string;
  icon_type: string;
}

interface Club {
  socials: {
    instagram?: string;
    youtube?: string;
    linkedin?: string;
    website?: string;
  };
  id: number;
  name: string;
  description?: string;
  location_name: string;
  logo: ClubLogo;
  interests?: Interest[];
  org_name?: string;
}

interface ReadMoreProps {
  text: string;
  wordLimit?: number;
}

const ReadMore: React.FC<ReadMoreProps> = ({ text, wordLimit = 200 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const words = text.split(" ").filter(Boolean);
  const isLongText = words.length > wordLimit;
  const displayText =
    isExpanded || !isLongText ? text : words.slice(0, wordLimit).join(" ") + "...";

  return (
    <div>
      <p className="text-[14px] text-gray-700 leading-relaxed">{displayText}</p>
      {isLongText && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 text-blue-600 hover:underline text-[13px]"
        >
          {isExpanded ? "Show Less" : "Read More"}
        </button>
      )}
    </div>
  );
};

// Tag color map
const tagColors: Record<string, string> = {
  Programming: "bg-blue-100 text-blue-800",
  "App Development": "bg-purple-100 text-purple-800",
  UI_UX: "bg-pink-100 text-pink-800",
  "Web Designing": "bg-cyan-100 text-cyan-800",
  "AI/ML": "bg-amber-100 text-amber-800",
  DSA: "bg-green-100 text-green-800",
  "Competitive Coding": "bg-red-100 text-red-800",
};

export default function ClubProfile() {
  const [club, setClub] = useState<Club | null>(null);
  const [token, setToken] = useState<string>("");
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("accessToken") || "";
      setToken(storedToken);
    }
  }, []);

  useEffect(() => {
    if (!token) return;

    const fetchClub = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/v1/clubs/info`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClub(response.data);
      } catch (error) {
        console.error("Error fetching club:", error);
      }
    };

    fetchClub();
  }, [token, API_BASE_URL]);

  const clubDescription =
    club?.description ||
    `Innovation, Entrepreneurship, Disruption. That's what we stand for at IEDC CET – the Innovation & Entrepreneurship Development Centre of College of Engineering Trivandrum. ✨✨

We are a thriving community of dreamers, doers, and disruptors who believe in turning ideas into impact. Whether it's startup bootcamps, hackathons, investor meetups, or mentorship programs, we create the perfect launchpad for students to explore entrepreneurship, technology, and innovation.

At IEDC CET, you'll find like-minded innovators, real-world learning experiences, and the right support to take your startup ideas from zero to one. 🚀

So, if you're ready to build, break, and innovate, this is where you belong!`;

  return (
    <div className="flex min-h-screen bg-[#2C333D]">
      <Sidebar />
      <div className="flex-1 p-6 md:p-8">
        <div className="bg-white rounded-2xl p-6 md:p-10 min-h-[calc(100vh-4rem)]">
          {/* Page Title */}
          <h1 className="bebas text-[32px] md:text-[40px] tracking-wide text-black mb-6">
            CLUB PROFILE
          </h1>

          {club ? (
            <>
              {/* Top Card: Logo, Club Name/Tags, and Buttons */}
              <div className="border border-gray-300 rounded-lg p-5 mb-4">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  {/* Left: Logo + Club Name + Tags */}
                  <div className="flex items-start gap-4">
                    {/* Club Logo */}
                    <div className="w-20 h-20 relative rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex-shrink-0">
                      <Image
                        src={club.logo.thumbnail}
                        alt={`${club.name} Logo`}
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                    {/* Club Name and Interests */}
                    <div>
                      <h2 className="text-[18px] font-semibold text-black mb-2">
                        {club.name}
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {club.interests &&
                          club.interests.map((intr) => {
                            const colorClass = tagColors[intr.name] || "bg-gray-100 text-gray-800";
                            return (
                              <span
                                key={intr.id}
                                className={`px-3 py-1 text-[12px] rounded-full ${colorClass}`}
                              >
                                {intr.name}
                              </span>
                            );
                          })}
                      </div>
                    </div>
                  </div>

                  {/* Right: Buttons */}
                  <div className="flex gap-3 w-full lg:w-auto">
                    <Link href="/dashboard/clubEdit" className="flex-1 lg:flex-none">
                      <button className="w-full lg:w-[160px] h-[42px] bg-[#2C333D] hover:bg-[#1F2937] text-white bebas text-[16px] tracking-wide rounded transition-colors">
                        EDIT PROFILE
                      </button>
                    </Link>
                    <button className="flex-1 lg:flex-none w-full lg:w-[180px] h-[42px] border border-gray-300 text-gray-700 bebas text-[16px] tracking-wide rounded hover:bg-gray-50 transition-colors">
                      CHANGE PASSWORD
                    </button>
                  </div>
                </div>
              </div>

              {/* Content Row: Description on left, Info on right */}
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Left: Club Description with Read More */}
                <div className="border border-gray-300 rounded-lg p-5 flex-1 lg:flex-[3]">
                  <ReadMore text={clubDescription} wordLimit={75} />
                </div>

                {/* Right: College, Location, Socials */}
                <div className="flex flex-col gap-4 flex-1 lg:flex-[2]">
                  {/* College & Location */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 border border-gray-300 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <GraduationCap className="w-5 h-5 text-gray-500" />
                        <span className="text-[12px] text-gray-500">College</span>
                      </div>
                      <p className="bebas text-[14px] text-black tracking-wide leading-tight">
                        {club.org_name || "COLLEGE OF ENGINEERING TRIV..."}
                      </p>
                    </div>
                    <div className="p-4 border border-gray-300 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-5 h-5 text-orange-500" />
                        <span className="text-[12px] text-gray-500">Location</span>
                      </div>
                      <p className="bebas text-[14px] text-black tracking-wide leading-tight">
                        {club.location_name || "SREEKARYAM, TRIVANDRUM"}
                      </p>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="p-4 border border-gray-300 rounded-lg">
                    <h3 className="bebas text-[16px] tracking-wide text-black mb-3">LINKS</h3>
                    <div className="space-y-3">
                      {club.socials.instagram && (
                        <div className="flex items-center gap-3">
                          <Instagram className="w-5 h-5 text-pink-500" />
                          <span className="text-[13px] text-gray-600 w-20">Instagram</span>
                          <a
                            href={club.socials.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[13px] text-gray-800 hover:underline"
                          >
                            {club.socials.instagram.replace("https://", "")}
                          </a>
                        </div>
                      )}
                      {club.socials.youtube && (
                        <div className="flex items-center gap-3">
                          <Youtube className="w-5 h-5 text-red-500" />
                          <span className="text-[13px] text-gray-600 w-20">Youtube</span>
                          <a
                            href={club.socials.youtube}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[13px] text-gray-800 hover:underline"
                          >
                            {club.socials.youtube.replace("https://", "")}
                          </a>
                        </div>
                      )}
                      {club.socials.linkedin && (
                        <div className="flex items-center gap-3">
                          <Linkedin className="w-5 h-5 text-blue-600" />
                          <span className="text-[13px] text-gray-600 w-20">LinkedIn</span>
                          <a
                            href={club.socials.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[13px] text-gray-800 hover:underline"
                          >
                            {club.socials.linkedin.replace("https://", "")}
                          </a>
                        </div>
                      )}
                      {club.socials.website && (
                        <div className="flex items-center gap-3">
                          <Globe className="w-5 h-5 text-green-500" />
                          <span className="text-[13px] text-gray-600 w-20">Website</span>
                          <a
                            href={club.socials.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[13px] text-gray-800 hover:underline"
                          >
                            {club.socials.website.replace("https://", "")}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500 text-[14px]">Loading club data...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

