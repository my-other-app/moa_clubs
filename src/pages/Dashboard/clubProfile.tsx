"use client"; // Remove if not needed for your routing setup

import React, { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import {
  FaInstagram,
  FaYoutube,
  FaLinkedin,
  FaGlobe,
  FaUniversity,
  FaMapMarkerAlt,
} from "react-icons/fa";
import Sidebar from "@/components/sidebar";
import Link from "next/link";

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
  socials: any;
  id: number;
  name: string;
  description?: string;
  location_name: string;
  logo: ClubLogo;
  interests?: Interest[];
  instagram?: string;
  youtube?: string;
  linkedin?: string;
  website?: string;
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
      <p className="text-gray-700 leading-relaxed">{displayText}</p>
      {isLongText && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 text-blue-600 hover:underline text-sm"
        >
          {isExpanded ? "Show Less" : "Read More"}
        </button>
      )}
    </div>
  );
};

export default function ClubProfile() {
  const [club, setClub] = useState<Club | null>(null);
  const [token, setToken] = useState<string>("");
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const colors = [
        "bg-red-400",
        "bg-blue-400",
        "bg-green-400",
        "bg-yellow-400",
        "bg-purple-400",
        "bg-pink-400",
      ];
      

  // Set token after component mounts (client-side only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("accessToken") || "";
      setToken(storedToken);
    }
  }, []);

  // Fetch club data once token is available
  useEffect(() => {
    if (!token) return; // Wait until token is available

    const fetchClub = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/v1/clubs/info`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Directly setting club data assuming the API returns a single club object.
        setClub(response.data);
      } catch (error) {
        console.error("Error fetching club:", error);
      }
    };

    fetchClub();
  }, [token, API_BASE_URL]);

  // Fallback description if club data is missing or description is not provided
  const clubDescription =
    club?.description ||
    `Innovation, Entrepreneurship, Disruption. That's what we stand for
    at IEDC CET – the Innovation & Entrepreneurship Development Centre of College of Engineering Trivandrum. 
    We are a thriving community of tinkerers, doers, and explorers who believe in turning ideas into impact.
    Lorem ipsum dolor sit amet, consectetur adipiscing elit...`;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Sidebar />
      <h1 className="text-3xl font-bold mb-4">CLUB PROFILE</h1>
      {club ? (
        <>
          {/* Top Row: Logo, Club Name/Tags, and Buttons */}
          <div className="flex flex-col sm:flex-row justify-between border bg-white rounded-lg p-4 items-start sm:items-center mb-4">
            {/* Left: Logo + Club Name + Tags */}
            <div className="flex items-start gap-4">
              {/* Club Logo */}
              <div className="w-24 h-24 relative rounded-full overflow-hidden bg-gray-100">
                <Image
                  src={club.logo.thumbnail}
                  alt={`${club.name} Logo`}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
              {/* Club Name and Interests */}
              <div>
                <h2 className="text-xl font-semibold">
                  {club.name}
                </h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  {club.interests &&
                    club.interests.map((intr) => {
                      const colorClass = colors[intr.id % colors.length];
                      return (
                        <span
                          key={intr.id}
                          className={`px-3 py-1 text-sm ${colorClass} rounded-full`}
                        >
                          {intr.name}
                        </span>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Right: Buttons */}
            <div className="mt-4 sm:mt-0 flex gap-2">
              <Link href="/dashboard/clubEdit">
              <button className="border bg-gray-700 rounded px-8 py-1 text-sm text-amber-50 font-medium hover:bg-gray-800">
                EDIT PROFILE
              </button>
              </Link>
              <button className="border border-gray-700 rounded px-4 py-1 text-sm font-medium hover:bg-gray-100">
                CHANGE PASSWORD
              </button>
            </div>
          </div>

          {/* Content Row: Description on left, Info on right */}
          <div className="flex flex-col md:flex-row gap-3">
            {/* Left: Club Description with Read More */}
            <div className="border rounded-lg p-4 bg-white flex-3/5">
              <ReadMore text={clubDescription} wordLimit={75} />
            </div>

            {/* Right: College, Location, Socials */}
            <div className="flex flex-col gap-3 flex-2/5">
              {/* College & Location */}
              <div className="flex flex-col sm:flex-row gap-3 flex-1/2">
                <div className="p-4 border rounded-lg bg-white">
                  <div className="flex items-center gap-2 mb-1">
                    <FaUniversity className="text-xl text-gray-700" />
                    <p className="font-semibold">College</p>
                  </div>
                  <p className="text-gray-700">
                    COLLEGE OF ENGINEERING TRIVANDRUM
                  </p>
                </div>
                <div className="p-4 border rounded-lg bg-white flex-1/2">
                  <div className="flex items-center gap-2 mb-1">
                    <FaMapMarkerAlt className="text-xl text-gray-700" />
                    <p className="font-semibold">Location</p>
                  </div>
                  <p className="text-gray-700">{club.location_name}</p>
                </div>
              </div>
              {/* Social Links */}
              <div className="p-4 border rounded-lg bg-white space-y-2">
                {club.socials.instagram && (
                  <div className="flex items-center gap-2">
                    <FaInstagram className="text-xl text-pink-500" />
                    <span className="font-semibold">Instagram:</span>
                    <a
                      href={club.socials.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {club.socials.instagram}
                    </a>
                  </div>
                )}
                {club.socials.youtube && (
                  <div className="flex items-center gap-2">
                    <FaYoutube className="text-xl text-red-500" />
                    <span className="font-semibold">Youtube:</span>
                    <a
                      href={club.socials.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {club.socials.youtube}
                    </a>
                  </div>
                )}
                {club.socials.linkedin && (
                  <div className="flex items-center gap-2">
                    <FaLinkedin className="text-xl text-blue-700" />
                    <span className="font-semibold">LinkedIn:</span>
                    <a
                      href={club.socials.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {club.socials.linkedin}
                    </a>
                  </div>
                )}
                {club.socials.website && (
                  <div className="flex items-center gap-2">
                    <FaGlobe className="text-xl text-green-600" />
                    <span className="font-semibold">Website:</span>
                    <a
                      href={club.socials.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {club.socials.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <p>Loading club data...</p>
      )}
    </div>
  );
}
